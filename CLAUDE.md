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

**Process API — live and confirmed.** `POST {BASE_URL}/gpt.php`, multipart with
one file field, `source`, plus `size` from the template (2:3 portrait for frames 1–2, 3:2 for the group frame). It takes 15–25 s (`PROCESS_TYPICAL_S`) and returns
`{ success, id, generated_image_url, final_image_url, error? }`. The app uses
`final_image_url`, the RGBA cutout with its background removed.
`generated_image_url` still has its background and is unused. `id` is kept as
`session.processId` and passed to the final submit. The backend sends
`Access-Control-Allow-Origin: *` on `gpt.php` and on `Final/`; `Generated/` has
no CORS header.

**Submit + stream API — live and confirmed.** One endpoint, `{BASE_URL}/api.php`.
`POST` multipart: `image` (the flattened JPEG) and `data` (a JSON string with the
form, `template_id` and `process_id`). It returns `{ success, record }`, where
`record` is `{ event, id, image, image_url, view_url, data, uploaded_at }`. `GET`
is the TV's SSE stream: `event: upload` frames carry the same `record`;
`event: downloaded` frames carry `{ id, file, view_url, downloaded_at }` once a
guest downloads from `view.php` → `download.php`. `: ping` comments keep it alive.
The QR code points at `view_url`. The TV leaves a result on the first of: the
`RESULT_HOLD_MS` countdown ends, a newer upload arrives, or a `downloaded`
frame with the same `id`. `api.php` sends `Access-Control-Allow-Origin: *`.

**Mocks are per feature** (`MOCK` in `config.js`). The API mocks are off. `form`
prefills a unique fake guest on each mount, on the dev server only
(`import.meta.env.DEV`), so it never reaches a build. `submit` and
`stream` must be switched together: the mock submit delivers to a `/#/tv` tab **in
the same browser** over BroadcastChannel.

**Any image drawn on the editor canvas needs CORS.** Without
`Access-Control-Allow-Origin` the image either fails to load (`crossOrigin` is
set) or taints the canvas, and Submit fails. `processPhoto` preloads the cutout
before opening the editor, so this shows up as a retryable toast on the capture
page rather than a blank editor.

## Code style

**Comments are minimal by design.** The few that exist mark traps where code
would otherwise break silently. Do not add explanatory prose — architectural
"why" belongs in this file. Write code that reads without narration.

- **Config over constants over inline.** Operator knobs in `config.js`; nothing
  tunable inlined in a component.
- **Tailwind utilities only.** The only hand-written CSS is `@theme` tokens and
  keyframes in `index.css`.
- **Pointer Events**, not mouse/touch — touch devices throughout.
- **`react-hot-toast` is the feedback channel.** Never `alert()`. One exception:
  a failed generation replaces the 15–25 s wait with an inline `ProcessingError`
  panel (Retake / Try again), because the guest's next step lives there.
- **Request failures carry a `kind`.** `services/http.js` throws `RequestError`
  with `network` · `timeout` · `server` · `image` · `canceled`. UI chooses copy by
  kind and shows `message` as-is. Never retry generation automatically: the
  server may have finished and spent AI credits.
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
    CapturePage             native camera → review → process (API #1), cancellable
    EditorPage              drag / pinch the cutout, flatten, submit (API #2)
    SentPage                confirmation, auto-reset after SENT_RESET_MS
    TvPage                  idle art ↔ result + QR, from the stream
  components/
    ProcessingStatus        paced progress bar + stage messages for the 15–25 s wait
    ProcessingError         inline failure panel per error kind: Retake / Try again
    ui/                     Button · Heading · Spinner
    layout/AppLayout        tablet shell: home link, logo, step indicator, Toaster, --chrome
  services/
    http                    postForm — axios + one friendly error per failure
    processApi              processPhoto → { id, cutout }, abortable, preloads cutout
    submitApi               submitFinal (mock or real)
    stream                  subscribeResults — SSE + watchdog, or mock channel
    apiOrigin               rewrites server-internal URLs to a reachable origin
  utils/
    constants               ROUTES, STORAGE_KEY, MOCK_CHANNEL
    session                 localStorage session (quota errors swallowed)
    image                   load, shrink the photo, compose the final JPEG
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

**SSE is a state feed, not an event log.** Every connect replays the latest
upload, however old. The TV drops frames older than `SSE_FRESH_MS` (by
`uploaded_at`, so the TV and server clocks must roughly agree) and de-dupes on
`id`. The `: ping` keep-alives never reach JS, so the TV's status dot (green =
live, red = reconnecting) comes from EventSource open/error only.

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
