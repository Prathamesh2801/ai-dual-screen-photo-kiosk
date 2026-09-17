# Kiosk Cover Studio — template

A reusable photo-kiosk composer. A guest takes a photo with a webcam, it is
composed onto layered artwork, and the finished image downloads as a
full-resolution PNG.

Built for an **offline vertical portrait touch TV** (1080 × 1920) driven by a
laptop with a USB webcam — but the networked/tablet modes are one config flag
away.

React 19 · Vite 8 · Tailwind CSS v4 · react-router-dom v7

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

> The camera needs a **secure context**. Use `localhost` or https — over
> `http://192.168.x.x` the browser will not prompt for camera access at all.

## The flow

1. **Attract** — an idle screen. The camera is off until someone taps *Start*.
2. **Capture** — live webcam preview framed to the cover's own ratio, with a
   countdown and shutter.
3. **Compose** — drag and resize the subject (and the headline, if enabled) over
   the artwork.
4. **Finish** — the PNG downloads, the cover is held up full screen, then the
   kiosk resets for the next guest.

## Configuration

Everything an operator changes lives in [`src/config.js`](src/config.js).

### Feature flags

| Flag | Default | `false` behaviour |
| --- | --- | --- |
| `BG_REMOVAL_ENABLED` | `false` | Photo passes through untouched |
| `TEXT_ENABLED` | `false` | No headline anywhere in the flow |
| `UPLOAD_ENABLED` | `false` | Nothing sent to a server — pure offline |
| `TV_ENABLED` | `false` | `/tv` display wall not routed |
| `CAMERA_ENABLED` | `true` | Webcam option hidden |
| `FILE_UPLOAD_ENABLED` | `false` | File picker hidden |
| `INSTANT_FINISH` | `true` | Uses the separate `/result` page instead |

Defaults are the **offline kiosk** setup: camera only, no network, finish in
place.

### Other settings

```js
CAMERA_WIDTH / CAMERA_HEIGHT     // requested resolution (ideal, not exact)
CAMERA_COUNTDOWN_S               // 0 disables the countdown
CAMERA_MIRROR_PREVIEW            // leave false — see below
INSTANT_FINISH_HOLD_MS           // how long the finished cover is held
BRAND_TITLE / ATTRACT_HEADING …  // all on-screen copy
```

## Starting a new event

1. Clone and rename.
2. Set `BASE_URL`, the flags, and the branding strings in `config.js`.
3. Replace `src/assets/bg.jpeg` and `src/assets/overlay.png`.
4. **Set `COVER_WIDTH`/`COVER_HEIGHT` in `src/utils/constants.js` to match the
   new overlay's aspect ratio:**
   `COVER_HEIGHT = round(COVER_WIDTH * overlayHeight / overlayWidth)`.
   This one matters — see below.
5. Swap fonts in `src/utils/coverFont.js`, defaults in `constants.js`, colours
   in the `@theme` block of `index.css`, and the `<title>` in `index.html`.

## Things that break silently

- **Cover dimensions vs. overlay art.** If they disagree, the on-screen preview
  crops the overlay while the export stretches it — so what you position against
  is not what you get.
- **Mirroring the preview.** The saved photo is never mirrored (it would reverse
  text in the scene), so a mirrored preview disagrees with the result.
- **Camera release.** The stream must be *unmounted*, not hidden, or the webcam
  stays locked and its LED stays on.

Full notes in [CLAUDE.md](CLAUDE.md).

## Scripts

```bash
npm run dev      # dev server (exposed on the LAN)
npm run build    # production build → dist/, zipped to dist.zip
npm run lint     # eslint
npm run preview  # serve the built bundle
```
