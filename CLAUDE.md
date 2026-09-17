# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

A **reusable kiosk photo-composer template**. A guest takes a photo, it is
composed onto layered artwork, and the result is exported as a full-resolution
PNG. Built for an offline vertical portrait touch TV driven by a laptop with a
USB webcam, but every deployment mode is a config flag away.

**This repo is the base, not an event.** Each event clones it and changes only
artwork, config, and copy. Never commit event-specific work here — port generic
improvements back instead.

Reference implementation: the "Maxter Today" Zeal event (tag `zeal-event-final`
in the `Magazine_Layout_Zeal` repo).

Stack: React 19 · Vite 8 · Tailwind v4 · react-router-dom v7 (`createHashRouter`).
Plain JSX, no TypeScript. axios, react-hot-toast, react-icons.

## Commands

```bash
npm install
npm run dev      # vite dev server, host: true
npm run build    # production build; postbuild zips dist/ into dist.zip
npm run lint     # eslint — must pass clean
npm run preview  # serve the built bundle
```

No test suite. Verify by running the app and walking the flow.

## Code style

**Comments are minimal by design.** The few that exist mark traps where code
would otherwise get silently broken — leave those. Do not reintroduce
explanatory prose; architectural "why" belongs in this file. Write code that
reads without narration.

Other conventions:

- **Config over constants over inline.** Operator-facing knobs go in
  `config.js`; designer-facing values in `constants.js`, `coverFont.js`, or the
  `@theme` block. Never inline a tunable in a component.
- **Tailwind utilities only.** The only hand-written CSS is `@theme` tokens and
  keyframes in `index.css`.
- **Pointer Events**, not mouse/touch — this runs on touch screens.
- **`react-hot-toast` is the only feedback channel.** Never `alert()`.
- **Failures are non-fatal.** Uploads never block the flow; a missing font falls
  back to serif. When adding a network call, decide what still works when it
  fails.
- Some files use semicolons, some don't. Follow the file you're editing.

## Architecture

```
src/
  config.js                 ALL operator knobs: flags, endpoints, camera, branding
  router.jsx                createHashRouter; /tv registered only when TV_ENABLED
  index.css                 @theme tokens + keyframes
  context/MagazineContext   useReducer store shared across routes
  pages/                    UploadPage · EditorPage · ResultPage · TvPage
  components/
    MagazineCanvas          the layered composition (interactive or static)
    MovableLayer            drag + resize via Pointer Events
    CameraCapture           live webcam view, countdown, shutter
    CoverFinale             full-screen finish + auto-reset
    ImageUploader           source chooser (camera / file, per flags)
    editor/                 LayerTab · RangeControl · TextControls
    ui/                     Button · Card · Spinner
    layout/                 AppLayout · Stepper
  hooks/
    useCamera               getUserMedia lifecycle — owns and always releases
    useCoverReel            accumulates SSE covers for the display wall
  services/                 removeBg · uploadImage · coverStream · apiOrigin
  utils/
    constants               cover dimensions, routes, defaults, palette
    compose                 canvas compositing for the export
    coverFont               font registry + letter-case
    download                shared blob/url download helpers
    image · filename
```

## The core invariant

Every layer transform is a **normalised fraction (0..1) of the cover**, stored in
`layout`. `x`/`y` are the layer's *centre*; `width` and `fontScale` are fractions
of cover *width*. This is what makes the DOM editor and the canvas export agree
at any screen size.

**Two renderers consume the same `layout`:**

- `components/MagazineCanvas.jsx` — DOM preview (`cqw` units)
- `utils/compose.js` — canvas export (`ctx.scale()`)

**Change one, change the other.** A preview that disagrees with the export is the
one failure this architecture exists to prevent. Shared logic belongs in
`utils/coverFont.js`.

## Feature flags

All in `config.js`. Runtime constants — flip and reload, no rebuild coupling.
**Every flag has two live branches; both must keep working.**

| Flag | `false` |
| --- | --- |
| `BG_REMOVAL_ENABLED` | Photo passes through untouched. Use when the remover is down. |
| `TEXT_ENABLED` | Headline gone end to end: no name field, no editor Name tab, no text layer in either renderer. |
| `UPLOAD_ENABLED` | Nothing POSTed to the gallery API. The offline-kiosk setting. |
| `TV_ENABLED` | `/tv` route not registered; no `EventSource` ever opens. |
| `CAMERA_ENABLED` | Webcam option hidden. |
| `FILE_UPLOAD_ENABLED` | File picker hidden. With camera on + this off, the page opens straight into the live preview (kiosk default). Both off would strand the page, so the picker is restored as a fallback. |
| `INSTANT_FINISH` | Uses the separate `/result` page instead of finishing in the editor. |

## Traps

These break silently. Each has a one-line comment in the code; this is the
longer version.

**Cover dimensions must match the overlay artwork.** `COVER_WIDTH`/
`COVER_HEIGHT` in `constants.js` must equal `overlay.png`'s aspect ratio —
`COVER_HEIGHT = round(COVER_WIDTH * overlayH / overlayW)`. Get it wrong and the
preview `object-cover`s (crops top/bottom) while the export stretches
(distorts), so the two disagree. `bg.jpeg` can be a hair off; the overlay cannot.

**The camera must be released, not hidden.** `useCamera` owns the `MediaStream`;
every exit path goes through `stop()`. A live stream holds the camera LED on and
locks the device. Any new exit path must *unmount* `CameraCapture`.

**`getUserMedia` needs a secure context.** `localhost` or https only. Over
`http://192.168.x.x` it does not prompt — it does not exist. Permission is
remembered per origin; a denied camera stays denied until cleared in site
settings. Device labels are empty until permission is granted once.

**The capture is cropped to what the preview showed.** A webcam gives a landscape
frame; the preview is a portrait box at `COVER_RATIO`. `capture()` applies the
same centred crop, or the guest frames a portrait and receives a wide shot.

**The capture is never mirrored.** Flipping the saved image reverses text in the
scene. `CAMERA_MIRROR_PREVIEW` defaults false so preview and photo agree.

**Canvas `fillText()` does not wait for fonts.** `compose.js` awaits
`ensureCoverFont()` before drawing. Keep that await.

**`TV_TRANSITION_MS` must match the CSS.** It mirrors `.tv-slide-in` /
`.tv-slide-out` durations in `index.css`.

**`createHashRouter` is deliberate.** URLs carry `#` because the build is dropped
on a static host with no rewrite rules. Don't switch to `createBrowserRouter`.

**In-memory state by design.** A hard refresh mid-flow loses everything;
`EditorPage`/`ResultPage` guard and redirect.

## Kiosk layout

Designed for 1080 × 1920 portrait first:

- **Centred on both axes, never scrolling.** `AppLayout`'s `main` is
  `flex-1 justify-center`.
- **`landscape:lg:` gates two-column layouts**, not `lg:` alone — a 1080×1920
  panel is *wider* than the `lg` breakpoint and would otherwise get a cramped
  desktop sidebar. Any new multi-column layout needs the same guard.
- **Sizing in `vmin`/`clamp()`** on attract and `/tv` screens — read from across
  a room, still sane in a laptop tab.
- **No header on the kiosk.** A guest needs the one thing they came to do.

**A session is one cover.** The camera only runs between *Start* and the finish,
so nothing streams to an empty room and the permission prompt lands on a real
user gesture. `CoverFinale` is deliberately non-interactive — a guest who walks
away must not strand the kiosk on a screen needing a tap.

## Starting a new event

1. Clone this repo, rename it.
2. `config.js` — `BASE_URL`, flags, `BRAND_*` / `ATTRACT_*` / `FOOTER_TEXT`.
3. Replace `src/assets/bg.jpeg` + `overlay.png`, then set `COVER_WIDTH`/
   `COVER_HEIGHT` from the new overlay's ratio (see Traps).
4. Fonts — drop into `src/assets/fonts/`, add an entry to `COVER_FONTS`, point
   `DEFAULT_COVER_FONT` at it. `weightRange` must match what the file holds.
5. Defaults/palette — `DEFAULT_PERSON`, `DEFAULT_TEXT`, `TEXT_COLORS`.
6. Theme — the `@theme` block in `index.css`.
7. `<title>` in `index.html`.

Flags don't shrink the bundle: `TvPage` and the fonts are static imports, so Vite
ships them regardless. That's the accepted cost of runtime flags.
