"use strict";

const GHOST_LAYER_NAME = "__RatioResizer_Ghost__";
let ghostNode = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function roundTo(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function buildLayerName(originalName, ratioStr, w, h) {
  const c = ratioStr.trim().match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  const display = c ? `${c[1]}:${c[2]}` : ratioStr.trim();
  return `${originalName} | ${display} (${w}x${h})`;
}

// Returns canvas selection, excluding the ghost and connectors
function filteredSel() {
  return figma.currentPage.selection.filter(
    n => n.name !== GHOST_LAYER_NAME && n.type !== "CONNECTOR"
  );
}

// Sends the current single-node selection state to the UI
function sendSelectionMsg() {
  const sel = filteredSel();
  if (sel.length === 1) {
    const n = sel[0];
    figma.ui.postMessage({
      type: "selection",
      name: n.name,
      width: roundTo(n.width),
      height: roundTo(n.height),
      x: roundTo(n.x),
      y: roundTo(n.y),
    });
  } else {
    figma.ui.postMessage({ type: "no-selection" });
  }
}

// ── Ghost Preview ─────────────────────────────────────────────────────────────

function removeGhost() {
  if (!ghostNode) return;
  try { ghostNode.remove(); } catch (_) {}
  ghostNode = null;
}

// Full sweep — only used on plugin close to catch any orphans
function sweepGhosts() {
  removeGhost();
  for (const page of figma.root.children) {
    for (const n of page.findAll(n => n.name === GHOST_LAYER_NAME)) {
      n.remove();
    }
  }
}

function updateGhost(x, y, width, height) {
  if (!ghostNode) {
    ghostNode = figma.createRectangle();
    ghostNode.name = GHOST_LAYER_NAME;
    figma.currentPage.appendChild(ghostNode);
  } else if (ghostNode.parent !== figma.currentPage) {
    figma.currentPage.appendChild(ghostNode);
  }

  ghostNode.x = x;
  ghostNode.y = y;
  ghostNode.resize(Math.max(1, width), Math.max(1, height));
  ghostNode.fills  = [];
  ghostNode.strokes = [{ type: "SOLID", color: { r: 0.18, g: 0.54, b: 1 }, opacity: 0.9 }];
  ghostNode.strokeWeight = 2;
  ghostNode.strokeAlign = "OUTSIDE";
  ghostNode.dashPattern = [6, 4];
}

// ── Message Handler ───────────────────────────────────────────────────────────

figma.ui.onmessage = (msg) => {
  switch (msg.type) {

    case "init":
      sendSelectionMsg();
      break;

    case "preview":
    case "hover-preview": {
      const { x, y, width, height } = msg;
      if (width > 0 && height > 0) updateGhost(x, y, width, height);
      break;
    }

    case "clear-preview":
      removeGhost();
      break;

    case "apply": {
      const { width, height, ratioStr } = msg;
      if (!(width > 0 && height > 0)) break;
      removeGhost();

      const sel = filteredSel();
      if (sel.length === 0) {
        figma.ui.postMessage({ type: "error", message: "No object selected." });
        break;
      }

      const node = sel[0];
      const originalName = node.name.split(" | ")[0].trim();
      try {
        node.resize(width, height);
        node.name = buildLayerName(originalName, ratioStr, width, height);
        figma.ui.postMessage({ type: "applied", name: node.name });
      } catch (e) {
        figma.ui.postMessage({ type: "error", message: String(e) });
      }
      break;
    }

    case "create": {
      const { width, height, ratioStr } = msg;
      if (!(width > 0 && height > 0)) break;
      removeGhost();

      const rect = figma.createRectangle();
      rect.resize(width, height);
      rect.name = buildLayerName("Rectangle", ratioStr, width, height);
      rect.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];

      const sel = filteredSel();
      if (sel.length > 0) {
        rect.x = sel[0].x + 20;
        rect.y = sel[0].y + 20;
      } else {
        const vp = figma.viewport.center;
        rect.x = vp.x - width / 2;
        rect.y = vp.y - height / 2;
      }

      figma.currentPage.appendChild(rect);
      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);
      figma.ui.postMessage({ type: "created", name: rect.name });
      break;
    }

    case "sample": {
      const sel = filteredSel();
      if (sel.length === 0) {
        figma.ui.postMessage({ type: "error", message: "Select an object to sample." });
        break;
      }
      const node = sel[0];
      const w = roundTo(node.width);
      const h = roundTo(node.height);
      figma.ui.postMessage({ type: "sampled", ratio: String(roundTo(w / h, 4)), width: w, height: h });
      break;
    }

    case "close":
      sweepGhosts();
      figma.closePlugin();
      break;
  }
};

figma.on("close", sweepGhosts);
figma.on("selectionchange", sendSelectionMsg);

// Catch manual resizes on the canvas — selectionchange doesn't fire when the
// selected node's dimensions change, only documentchange does.
figma.on("documentchange", (event) => {
  const sel = filteredSel();
  if (sel.length !== 1) return;
  const node = sel[0];
  // Only re-send if a property change touched the selected node
  const affected = event.documentChanges.some(
    c => c.type === "PROPERTY_CHANGE" && c.node.id === node.id
  );
  if (affected) sendSelectionMsg();
});

figma.showUI(__html__, { width: 320, height: 520, title: "RatioResizer" });
sendSelectionMsg();
