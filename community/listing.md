# RatioResizer — Community Listing Copy

Paste these into the Figma publish flow. All fields ready to go.

---

## Step 1 — Describe your resource

**Name**
```
RatioResizer
```

**Tagline** *(83 / 100 chars)*
```
Resize any frame to a precise aspect ratio — lock a dimension, pick a preset, apply.
```

**Description**
```
RatioResizer makes it effortless to resize any frame, component, or shape to a precise aspect ratio.

Select an object, lock either the width or height as your anchor dimension, and choose from 12 built-in ratio presets — 1:1, 4:3, 3:2, 5:4, 16:9, 16:10, 21:9, 2.39:1, 9:16, 2:3, 2:1, and the Golden Ratio (φ). Or type any custom ratio in colon format (21:9) or as a decimal (2.333).

A ghost preview outline appears on the canvas before you commit, so you can verify dimensions and placement. Hit Apply and the layer is resized and automatically renamed to include the ratio and output dimensions — e.g. "Hero | 16:9 (1920×1080)".

Features:
• 12 built-in ratio presets
• Ghost preview on canvas before applying
• Lock width or height as the anchor dimension
• Custom ratio input — colon format or decimal
• Steal ratio from any selected object
• Create new shapes at any ratio from scratch
• Whole-pixel rounding to prevent blurry exports
• Auto-renames layers with ratio and final dimensions

Free. No network access. No data collected.
```

**Category**
```
Productivity
```

---

## Step 2 — Choose some images

**Icon** — 128×128px
→ Use `../icon.png` (already in plugin root)

**Thumbnail** — 1920×1080px recommended
→ Export the Cover frame from the Figma community file:
   https://www.figma.com/design/sggCSlKLdIGpaxJre3psch
   Frame is 1600×900 — export @2x and crop, or resize canvas to 1920×1080 first.

**Carousel** — up to 9 images
→ Take screenshots of the plugin in use showing:
   1. The resize screen with a selection active + ratio badge
   2. Hovering a preset pill (ghost preview on canvas)
   3. Custom ratio being typed
   4. After applying — layer renamed in the layers panel
   5. Create mode (New shape screen)

---

## Step 3 — Data security

Check: **"I agree to share this information."**

The plugin:
- Does NOT collect any user data
- Does NOT make any network requests (networkAccess: none)
- Only reads/writes to the current Figma document
- No external APIs, no tracking, no storage outside Figma

---

## Step 4 — Add the final details

**Plugin ID** *(already in manifest.json)*
```
"id": "1626778049636521367"
```

**Support contact**
```
matthew@beckerdesign.us
```

**Publish to:** Community — Public

**Author:** Matthew Becker — Individual creator

**Community handle suggestion:**
```
matthewbecker
```
or
```
beckerdesign
```

---

## Manifest checklist

manifest.json should contain:
- [x] `"id": "1626778049636521367"`
- [x] `"documentAccess": "dynamic-page"`
- [x] `"networkAccess": { "allowedDomains": ["none"] }`
- [x] `"icon": "icon.png"`
