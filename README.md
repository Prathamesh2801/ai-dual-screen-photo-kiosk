# AI Dual-Screen Photo Kiosk

A two-device event kiosk for Capgemini at ACAMS 2026, Las Vegas. A guest enters
their details on a **tablet**, picks a template and takes a photo. The server
cuts them out with AI, the guest positions the cutout over the template, and a
**portrait TV** shows the result with a QR code to download it.

React 19 · Vite 8 · Tailwind CSS v4 · react-router-dom v7

## Routes

| Route | Device | Purpose |
| --- | --- | --- |
| `/#/` | Tablet | Details form |
| `/#/template` | Tablet | Template picker |
| `/#/capture` | Tablet | Native camera → AI cutout |
| `/#/editor` | Tablet | Position the cutout, submit |
| `/#/sent` | Tablet | Confirmation |
| `/#/tv` | TV (1080 × 1920) | Idle art ↔ result + QR |

## Scripts

```bash
npm install
npm run dev      # dev server (exposed on the LAN)
npm run build    # production build → dist/, zipped to dist.zip
npm run lint     # eslint
npm run preview  # serve the built bundle
```

## Configuration

Server URL, per-feature mocks, templates and TV timings live in
[`src/config.js`](src/config.js). Architecture, API contracts and traps are in
[CLAUDE.md](CLAUDE.md).
