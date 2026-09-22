# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server, exposed on the LAN
npm run build    # production build → dist/, then postbuild zips it to dist.zip
npm run lint     # eslint .
npm run preview  # serve the built bundle
```

There is no test runner configured. Tablet is `/#/`, TV is `/#/tv`.

## What this is

A **two-device AI photo kiosk** for an event in the USA. A guest fills in their
details on a tablet, picks a template, and takes a photo. The server turns the
photo into an AI cutout with the background removed. The guest positions it over
the template, and the tablet flattens the result into one PNG and submits it. A
portrait TV listens on SSE and shows the result, then a QR code to download it.

```
TABLET                                   SERVER              TV (portrait)
 1. Form: name, email, company
 2. Pick template (id 1 / 2 / 3)
 3. Native camera → raw photo
 4. Process ────────────────────────►  AI gen + bg removal
    ◄──────────────────── cutout at template ratio
 5. Editor: template bg + cutout,
    drag / pinch-zoom / reset
 6. Flatten to one PNG (canvas)
 7. Final submit (data + PNG) ──────►  store
                                          │ SSE (heartbeat)
                                          └────────────────► idle image
                                                             → result + QR
                                                             → hold, back to idle
```

Everything before the final submit is held in **localStorage**, including the
editor placement (x/y/scale). A tablet reload mid-flow does not lose the guest's
work.

The composite is flattened **on the tablet** so the guest's preview and the
delivered image match exactly. There is one tablet, so the TV needs no queue: a
newest result replaces the current one. Consent is handled by the client outside
the app.

**Derived from** `magazine-kiosk-template` (remote `template`). Generic fixes
should be ported back there; event-specific work stays here.

Stack: React 19 · Vite 8 · Tailwind v4 · react-router-dom v7 (`createHashRouter`).
Plain JSX, no TypeScript. axios, react-hot-toast, react-icons (Feather `Fi*` set),
qrcode.react, @fontsource/ubuntu (self-hosted: the venue may have no internet,
and a Google Fonts `<link>` blocks first render until it answers).

## Status

The whole flow is built and runs end to end against the mock server. The event
is Capgemini at ACAMS 2026, Las Vegas. Source art (the `.ai` files, full-size
frames) is in `raw-docs/`. The app uses optimised copies in `src/assets/`.

**Open questions** (confirm with the backend owner). The guessed field names
live only in `services/api.js` and `services/stream.js`:

1. Process API — URL, fields, and how long it takes. Is the cutout returned as
   a URL or base64? Is the template id sent?
2. Final submit API — URL, field names, response.
3. SSE frame shape and its id field (for de-duping keep-alives).
4. The download URL behind the QR code — server-provided, or constructed?
5. Is the heartbeat a named event or an SSE `:` comment? See `SSE_STALE_MS`.
6. CORS: the editor draws the server's cutout onto a canvas, so the cutout URL
   must send `Access-Control-Allow-Origin`, or the canvas is tainted and export fails.

`USE_MOCK_SERVER` returns the raw photo as the "cutout", and delivers the final
image to a `/#/tv` tab **in the same browser** over BroadcastChannel.

## Code style

**Comments are minimal by design.** The few that exist mark traps where code
would otherwise break silently. Do not add explanatory prose — architectural
"why" belongs in this file. Write code that reads without narration.

- **Config over constants over inline.** Operator knobs in `config.js`; nothing
  tunable inlined in a component.
- **Tailwind utilities only.** The only hand-written CSS is `@theme` tokens and
  keyframes in `index.css`.
- **Pointer Events**, not mouse/touch — touch devices throughout.
- **`react-hot-toast` is the only feedback channel.** Never `alert()`.
- **Failures are non-fatal.** When adding a network call, decide what still
  works when it fails.
- Some files use semicolons, some don't. Follow the file you're editing.

## Layout

```
src/
  config.js                 server URLs, mock switch, TEMPLATES, camera, editor, TV timings
  routes/index.jsx          tablet routes under AppLayout; /tv standalone
  index.css                 @theme tokens (palette sampled from tv-idle.jpg) + keyframes
  assets/                   logo.svg · tv-idle.jpg · templates/frame_{1,2,3}.webp
  pages/
    FormPage                name / email / company; Clear drops the whole session
    TemplatePage            frame picker
    CapturePage             native camera → review → process (API #1)
    EditorPage              drag / pinch the cutout, flatten, submit (API #2)
    SentPage                confirmation, auto-reset after SENT_RESET_MS
    TvPage                  idle art ↔ result + QR, from the stream
  components/
    ui/                     Button · Heading · Spinner
    layout/AppLayout        tablet shell: home link, logo, step indicator, Toaster, --chrome
  services/
    api                     processPhoto · submitFinal (mock or real)
    stream                  subscribeResults — SSE + watchdog, or mock channel
    apiOrigin               rewrites server-internal URLs to a reachable origin
  utils/
    constants               ROUTES, STORAGE_KEY, MOCK_CHANNEL
    session                 localStorage session (quota errors swallowed)
    image                   load, shrink the photo, compose the final JPEG
    download                shared helpers
```

## Traps

**The camera is the device's own camera app, not the browser.** CapturePage uses
`<input type="file" accept="image/*" capture>`. That opens the native camera on
iPad and iPhone; on desktop it falls back to a file picker. There is no
`getUserMedia`, so no https requirement and no stream to release. The photo
comes back at full sensor size and is not cropped. `shrinkPhoto` scales it to
`PHOTO_MAX_EDGE` as a JPEG, because a raw 12MP data URL overflows localStorage.
The server makes the template's ratio; the editor covers the window with
whatever comes back. The input's value is cleared after each pick, or
re-choosing the same shot fires no change.

**Placement is in template pixels.** `placement {x, y, w}` is in the frame's
native pixel space. The editor renders it as percentages, and `composeFinal`
draws it 1:1, clipped to `template.window`. That shared space is why the preview
and the delivered image match. If a frame's artwork changes, re-measure its
`window` in `config.js`.

**Tablet pictures are sized from `--chrome`.** `AppLayout`'s `<main>` sets
`--chrome`: the height taken by everything except the page's main picture (logo,
steps, heading, buttons). It is smaller on phones and larger from `sm:`. Frames,
the camera slot, the review photo and the editor stage are all sized as
`(100dvh - var(--chrome))`, so they fit one screen on an iPad and on a phone. If
you add chrome to a page, raise `--chrome` rather than hard-coding a `dvh` value.
Button rows go full-width with `flex-1` on phones; secondary labels hide below `sm:`.

**Keep the session small.** Everything lives in one localStorage key, rewritten
on each save. Photos are JPEG data URLs for that reason. Placement is saved on
gesture end, never per pointermove.

**SSE is a state feed, not an event log** (true of the previous server; confirm
for this one). The same frame may be re-sent as a keep-alive, so consumers must
de-dupe on an id rather than treating every frame as news.

**Server URLs may echo an internal host.** `toReachableUrl()` in
`services/apiOrigin.js` re-points them at the origin actually reached. Every URL
coming from the server should pass through it.

**`createHashRouter` is deliberate.** URLs carry `#` because the build is
dropped on a static host with no rewrite rules. Don't switch to
`createBrowserRouter`.

## Devices

**Tablet** — the guest-facing flow on an iPad or iPhone, portrait, touch. It uses
the device's own camera app.

**TV** — 1080 × 1920 portrait, unattended. No tablet chrome; it sits outside
`AppLayout` for that reason. Size in `vmin`/`clamp()` so it reads from across a
room. Any two-column layout must be gated on `landscape:lg:`, not `lg:` alone —
a 1080×1920 panel is *wider* than the `lg` breakpoint and would otherwise get a
cramped desktop sidebar.
