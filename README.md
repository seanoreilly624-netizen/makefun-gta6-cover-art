# Vice City Cover Maker

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/seanoreilly624-netizen/makefun-gta6-cover-art/rank.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/seanoreilly624-netizen/makefun-gta6-cover-art/reward.svg)](https://make.fun/competitions/gta6-cover-art-01)

Turn your photos into a multi-panel sunset poster in the classic nine-panel cover style — entirely offline, in your browser.

## What it does

- **Three panel layouts** — Nine Panel (3×3 grid with a big centre), Hero Left (one tall hero panel plus three stacked), and Sunset Strip (wide hero on top, three below).
- **Up to three photos** — upload your own or use the two bundled samples. One photo can fill several panels with a different crop each; several photos spread across the grid.
- **Drag to pan, slider to zoom** — click any panel to select it, drag inside it to reposition the photo, use the zoom slider to tighten the crop. A panel can also be switched to fully drawn art (sun, skyline, palms) instead of a photo.
- **Caption lettering** — type your own big cover title (for example “Sunset Heist”) with a small line underneath, drawn bold with a dark outline and a sunset gradient fill.
- **Three colour grades** — Sunset (orange / pink / purple), Neon (cyan / magenta night glow), and Noir (high-contrast black and white).
- **Three export sizes** — 1080×1080 square, 1080×1350 portrait, 1920×1080 landscape. Export downloads a PNG at the chosen size.

## How to use it

1. Serve the app folder any static way, for example `node serve.ts --port 8080`, then open http://localhost:8080.
2. Load a photo into a slot (upload a file or pick a sample), pick a layout, click panels to set their photo and crop, type a caption, pick a grade and an export size.
3. Press **Export PNG**.

## Screenshots

- `screenshots/1-cover.jpg` — landscape cover, 1920×1080, sunset grade, pier sample.
- `screenshots/2-editor.jpg` — the editor with a photo loaded.
- `screenshots/3-cover.jpg` — square cover, 1080×1080, neon grade, boulevard sample.
- `screenshots/4-cover.jpg` — portrait cover, 1080×1350, sunset grade, pier sample.

## Notes

- Everything is drawn by hand on a canvas: gradients, sun, skyline and palm silhouettes, gutters and lettering. No Rockstar art, logos or fonts are used, and the app never renders a “Grand Theft Auto VI” wordmark.
- Offline only: every script, image and font the app loads is a file under `app/` or a system font. No network requests.
- The two sample photos in `app/samples/` are free to use.
