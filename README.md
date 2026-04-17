# RatioResizer

**Resize any frame to a precise aspect ratio — lock a dimension, pick a preset, apply.**

A Figma plugin for designers who care about precision. Select any frame, component, or shape — RatioResizer shows you its current ratio and lets you resize it to any aspect ratio in one click.

[Install on Figma Community →](https://www.figma.com/community/plugin/1626778049636521367)

---

## Features

- **12 built-in presets** — 1:1, 4:3, 3:2, 5:4, 16:9, 16:10, 21:9, 2.39:1, 9:16, 2:3, 2:1, φ (Golden Ratio)
- **Ghost preview** — a canvas outline shows the new dimensions before you commit
- **Anchor control** — lock width or height; the other dimension computes automatically
- **Custom ratios** — type any ratio as `16:9` or a decimal like `1.778`
- **Steal** — sample the exact ratio from any selected object
- **Create mode** — generate new shapes at any ratio from scratch
- **Whole-pixel rounding** — eliminates sub-pixel values before applying
- **Auto-rename** — layers are renamed with the ratio and output dimensions, e.g. `Hero | 16:9 (1920×1080)`

---

## Usage

1. Select any frame, component, or shape on the canvas
2. Open RatioResizer — current dimensions and ratio appear instantly
3. Click **W** or **H** to choose which dimension to lock
4. Pick a preset or type a custom ratio
5. Review the ghost preview outline on the canvas
6. Hit **Apply**

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org)
- [Figma desktop app](https://figma.com/downloads)

### Setup

```bash
git clone https://github.com/matthew-becker1/RatioResizer.git
cd RatioResizer
npm install
```

### Build

```bash
npm run build
```

Compiles `code.ts` → `code.js` via TypeScript.

### Load in Figma

1. Open Figma desktop
2. **Plugins → Development → Import plugin from manifest**
3. Select `manifest.json` from this repo

---

## Project Structure

```
RatioResizer/
├── code.ts          # Plugin sandbox logic (TypeScript source)
├── code.js          # Compiled sandbox code (loaded by Figma)
├── ui.html          # Plugin UI — self-contained HTML/CSS/JS
├── manifest.json    # Figma plugin manifest
├── icon.png         # Plugin icon (128×128)
├── tsconfig.json
├── package.json
└── community/       # Figma Community submission assets
    ├── listing.md   # Copy for the community publish form
    └── *.png        # Publish flow reference screenshots
```

---

## Privacy & Security

- No network requests — `networkAccess` is set to `none`
- No data collection, tracking, or external APIs
- All operations are local to the open Figma document

---

## Author

**Matthew Becker** — [beckerdesign.us](https://beckerdesign.us)  
Support: matthew@beckerdesign.us
