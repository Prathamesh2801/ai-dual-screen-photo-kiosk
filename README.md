# AI Dual-Screen Photo Kiosk

A two-device event kiosk. A guest enters their details on a **tablet**, picks a
template, and takes a photo. A server generates the final image, and a **portrait
TV** listening on SSE displays it and offers a QR code to download.

React 19 · Vite 8 · Tailwind CSS v4 · react-router-dom v7

## Status

Early scaffold. The reusable core (camera, layout, UI kit, theme) is in place;
the screens are placeholders. See [CLAUDE.md](CLAUDE.md) for the open questions
on the server contract.

## The flow

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

Everything before submit is kept in **localStorage**, so a tablet reload
mid-flow doesn't lose the guest's work.

## Routes

| Route | Device | Purpose |
| --- | --- | --- |
| `/#/` | Tablet | Details form |
| `/#/template` | Tablet | Template picker |
| `/#/capture` | Tablet | Camera |
| `/#/sent` | Tablet | Confirmation |
| `/#/tv` | TV | SSE display |

## Quick start

```bash
npm install
npm run dev
```

Open `/#/` on the tablet and `/#/tv` on the TV.

> **The camera needs a secure context** — `localhost` or https. Over
> `http://192.168.x.x` the browser will not prompt for camera access at all.

## Configuration

Everything lives in [`src/config.js`](src/config.js).

```js
BASE_URL              // the generation server
SUBMIT_URL / SSE_URL  // TODO: confirm with the backend
USE_MOCK_SERVER       // true = no server needed; build and demo offline
CAMERA_*              // resolution, facing, countdown, capture ratio
RESULT_HOLD_MS        // how long the TV holds a finished result
GENERATION_TIMEOUT_MS // how long the TV waits before giving up
```

`USE_MOCK_SERVER` is on by default so the flow can be developed before the
backend is ready.

## Scripts

```bash
npm run dev      # dev server (exposed on the LAN)
npm run build    # production build → dist/, zipped to dist.zip
npm run lint     # eslint
npm run preview  # serve the built bundle
```

---

Derived from `magazine-kiosk-template`. Generic improvements should be ported
back to that repo.
