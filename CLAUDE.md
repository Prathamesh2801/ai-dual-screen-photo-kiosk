# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

A **two-device AI photo kiosk**. A guest fills in their details on a tablet,
picks a template, and takes a photo. That goes to a server which generates the
final image; a portrait TV listens on SSE and shows the result, then a QR code
to download it.

```
TABLET                              SERVER                 TV (portrait)
 1. Form: name, email, company
 2. Pick template (3–4 presets)
 3. Camera → photo
 4. Submit ──────────────────────►  generate
                                       │
                                    SSE │
                                       └──────────────────► 5. Show result
                                                            6. Hold N seconds
                                                            7. QR to download
                                                            8. Back to idle
```

Everything before submit is held in **localStorage**, so a tablet reload mid-flow
does not lose the guest's work.

**Derived from** `magazine-kiosk-template` (remote `template`). Generic fixes
should be ported back there; event-specific work stays here.

Stack: React 19 · Vite 8 · Tailwind v4 · react-router-dom v7 (`createHashRouter`).
Plain JSX, no TypeScript. axios, react-hot-toast, react-icons.

## Status — early scaffold

Cleaned down to reusable parts. The page components are **placeholders**; the
flow has not been built yet.

**Open questions blocking real work** (confirm with the backend owner):

1. `POST` submit — exact URL, field names, and what comes back. Is there a job
   id returned immediately?
2. SSE frame shape. **Critically: does a result frame carry back an identifier
   tying it to the submission that caused it?** Without one, two overlapping
   guests will see each other's photos.
3. How long generation takes — decides whether the TV needs a progress state.
4. The download URL behind the QR code — server-provided, or constructed?
5. What the TV shows when idle, and on failure/timeout.
6. Template presets — artwork and how the server identifies them.

`USE_MOCK_SERVER` in `config.js` exists so the whole flow can be built and
demoed before any of this is settled.

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
  config.js                 server URLs, mock switch, camera, TV timings, branding
  router.jsx                tablet routes under AppLayout; /tv standalone
  index.css                 @theme tokens + keyframes
  pages/
    FormPage                name / email / company          ← placeholder
    TemplatePage            preset picker                    ← placeholder
    CapturePage             camera                           ← placeholder
    SentPage                tablet confirmation              ← placeholder
    TvPage                  SSE display                      ← placeholder
  components/
    CameraCapture           live camera view, countdown, shutter
    ui/                     Button · Card · Spinner
    layout/AppLayout        tablet shell (Toaster, centred main)
  hooks/useCamera           getUserMedia lifecycle — owns and always releases
  services/apiOrigin        rewrites server-internal URLs to a reachable origin
  utils/
    constants               ROUTES, STORAGE_KEY
    download · image        shared helpers
```

## Traps

**The camera must be released, not hidden.** `useCamera` owns the `MediaStream`;
every exit path goes through `stop()`. A live stream holds the camera LED on and
locks the device. Any new exit path must *unmount* `CameraCapture`.

**`getUserMedia` needs a secure context.** `localhost` or https only. Over
`http://192.168.x.x` it does not prompt — it does not exist. This matters here:
the tablet talks to a LAN server, so plan for https or a localhost tunnel.
Permission is remembered per origin; a denied camera stays denied until cleared
in site settings.

**The capture is cropped to what the preview showed.** The camera gives a
landscape frame; the preview is a box at `CAPTURE_RATIO`. `capture()` applies the
same centred crop, or the guest frames one shot and receives another.

**The capture is never mirrored.** Flipping the saved image reverses text in the
scene. `CAMERA_MIRROR_PREVIEW` defaults false so preview and photo agree.

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

**Tablet** — the guest-facing flow, portrait, touch. Native camera via
`getUserMedia`.

**TV** — 1080 × 1920 portrait, unattended. No tablet chrome; it sits outside
`AppLayout` for that reason. Size in `vmin`/`clamp()` so it reads from across a
room. Any two-column layout must be gated on `landscape:lg:`, not `lg:` alone —
a 1080×1920 panel is *wider* than the `lg` breakpoint and would otherwise get a
cramped desktop sidebar.
