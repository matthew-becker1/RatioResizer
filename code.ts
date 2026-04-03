// RatioResizer - Figma Plugin Main Code (Sandbox)
// Handles all canvas operations, ghost preview, and layer manipulation

const GHOST_LAYER_NAME = "__RatioResizer_Ghost__";

let ghostNode: RectangleNode | null = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseRatio(input: string): number | null {
  const trimmed = input.trim();

  // Colon format: "16:9", "4:3", "1:1"
  const colonMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (colonMatch) {
    const a = parseFloat(colonMatch[1]);
    const b = parseFloat(colonMatch[2]);
    if (b === 0) return null;
    return a / b;
  }

  // Decimal / integer format: "1.618", "1.333"
  const decimal = parseFloat(trimmed);
  if (!isNaN(decimal) && decimal > 0) return decimal;

  return null;
}

function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function calcDimensions(
  anchor: "width" | "height",
  anchorValue: number,
  ratio: number
): { width: number; height: number } {
  if (anchor === "width") {
    return {
      width: roundTo(anchorValue),
      height: roundTo(anchorValue / ratio),
    };
  } else {
    return {
      width: roundTo(anchorValue * ratio),
      height: roundTo(anchorValue),
    };
  }
}

function buildLayerName(originalName: string, ratioStr: string, w: number, h: number): string {
  // Normalise the ratio string to "W:H" canonical form
  const colonMatch = ratioStr.trim().match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  const displayRatio = colonMatch ? `${colonMatch[1]}:${colonMatch[2]}` : ratioStr.trim();
  return `${originalName} | ${displayRatio} (${w}x${h})`;
}

// ── Ghost Preview ─────────────────────────────────────────────────────────────

function removeGhost(): void {
  if (ghostNode) {
    try {
      ghostNode.remove();
    } catch (_) {
      // Already removed
    }
    ghostNode = null;
  }

  // Belt-and-suspenders: sweep entire document for orphaned ghosts
  const allPages = figma.root.children;
  for (const page of allPages) {
    const found = page.findAll((n) => n.name === GHOST_LAYER_NAME);
    for (const n of found) n.remove();
  }
}

function updateGhost(x: number, y: number, width: number, height: number): void {
  if (!ghostNode) {
    ghostNode = figma.createRectangle();
    ghostNode.name = GHOST_LAYER_NAME;
  }

  ghostNode.x = x;
  ghostNode.y = y;
  ghostNode.resize(Math.max(1, width), Math.max(1, height));

  // Semi-transparent blue stroke, no fill
  ghostNode.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.54, b: 1 }, opacity: 0.12 }];
  ghostNode.strokes = [{ type: "SOLID", color: { r: 0.18, g: 0.54, b: 1 }, opacity: 0.8 }];
  ghostNode.strokeWeight = 2;
  ghostNode.strokeAlign = "OUTSIDE";

  // Ensure it's on the current page and not locked
  if (ghostNode.parent !== figma.currentPage) {
    figma.currentPage.appendChild(ghostNode);
  }
}

// ── Message Handler ───────────────────────────────────────────────────────────

figma.ui.onmessage = (msg: Record<string, unknown>) => {
  switch (msg.type) {

    // ── INIT: send current selection info to UI ──
    case "init": {
      const sel = figma.currentPage.selection.filter(
        (n) => n.type !== "CONNECTOR" && n.name !== GHOST_LAYER_NAME
      );
      if (sel.length === 1) {
        const node = sel[0] as SceneNode & { width: number; height: number };
        figma.ui.postMessage({
          type: "selection",
          name: node.name,
          width: roundTo(node.width),
          height: roundTo(node.height),
        });
      } else {
        figma.ui.postMessage({ type: "no-selection" });
      }
      break;
    }

    // ── PREVIEW: draw or update ghost ──
    case "preview": {
      const { x, y, width, height } = msg as {
        type: string; x: number; y: number; width: number; height: number;
      };
      updateGhost(x, y, width, height);
      break;
    }

    // ── CLEAR-PREVIEW: remove ghost ──
    case "clear-preview": {
      removeGhost();
      break;
    }

    // ── APPLY: resize selected node ──
    case "apply": {
      const { width, height, ratioStr } = msg as {
        type: string; width: number; height: number; ratioStr: string;
      };

      removeGhost();

      const sel = figma.currentPage.selection.filter(
        (n) => n.name !== GHOST_LAYER_NAME
      );

      if (sel.length === 0) {
        figma.ui.postMessage({ type: "error", message: "No object selected." });
        break;
      }

      const node = sel[0] as SceneNode & { width: number; height: number };
      const originalName = node.name.split(" | ")[0].trim(); // strip old suffix

      try {
        (node as FrameNode | RectangleNode).resize(
          Math.max(0.01, width),
          Math.max(0.01, height)
        );
        node.name = buildLayerName(originalName, ratioStr, width, height);
        figma.ui.postMessage({ type: "applied", name: node.name });
      } catch (e) {
        figma.ui.postMessage({ type: "error", message: String(e) });
      }
      break;
    }

    // ── CREATE NEW ──
    case "create": {
      const { width, height, ratioStr } = msg as {
        type: string; width: number; height: number; ratioStr: string;
      };

      removeGhost();

      const rect = figma.createRectangle();
      rect.resize(Math.max(0.01, width), Math.max(0.01, height));
      rect.name = buildLayerName("Rectangle", ratioStr, width, height);

      // Positioning
      const sel = figma.currentPage.selection.filter(
        (n) => n.name !== GHOST_LAYER_NAME
      );

      if (sel.length > 0) {
        const ref = sel[0] as SceneNode & { x: number; y: number };
        rect.x = ref.x + 20;
        rect.y = ref.y + 20;
      } else {
        const vp = figma.viewport.center;
        rect.x = vp.x - width / 2;
        rect.y = vp.y - height / 2;
      }

      // Default fill
      rect.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];

      figma.currentPage.appendChild(rect);
      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);

      figma.ui.postMessage({ type: "created", name: rect.name });
      break;
    }

    // ── SAMPLE: steal ratio from selection ──
    case "sample": {
      const sel = figma.currentPage.selection.filter(
        (n) => n.name !== GHOST_LAYER_NAME
      );
      if (sel.length === 0) {
        figma.ui.postMessage({ type: "error", message: "Select an object to sample." });
        break;
      }
      const node = sel[0] as SceneNode & { width: number; height: number };
      const w = roundTo(node.width);
      const h = roundTo(node.height);
      const ratio = roundTo(w / h, 4);
      figma.ui.postMessage({ type: "sampled", ratio: `${ratio}`, width: w, height: h });
      break;
    }

    // ── CLOSE ──
    case "close": {
      removeGhost();
      figma.closePlugin();
      break;
    }
  }
};

// Clean up on plugin close (catches window X button)
figma.on("close", () => {
  removeGhost();
});

// Keep UI in sync whenever the user changes selection on the canvas
figma.on("selectionchange", () => {
  const sel = figma.currentPage.selection.filter(
    (n) => n.name !== GHOST_LAYER_NAME
  );
  if (sel.length === 1) {
    const node = sel[0] as SceneNode & { width: number; height: number; x: number; y: number };
    figma.ui.postMessage({
      type: "selection",
      name: node.name,
      width: roundTo(node.width),
      height: roundTo(node.height),
      x: roundTo(node.x),
      y: roundTo(node.y),
    });
  } else {
    figma.ui.postMessage({ type: "no-selection" });
  }
});

// Open UI
figma.showUI(__html__, { width: 320, height: 520, title: "RatioResizer" });

// Send initial selection state
const initialSel = figma.currentPage.selection.filter(
  (n) => n.name !== GHOST_LAYER_NAME
);
if (initialSel.length === 1) {
  const node = initialSel[0] as SceneNode & { width: number; height: number; x: number; y: number };
  figma.ui.postMessage({
    type: "selection",
    name: node.name,
    width: roundTo(node.width),
    height: roundTo(node.height),
    x: roundTo(node.x),
    y: roundTo(node.y),
  });
}
