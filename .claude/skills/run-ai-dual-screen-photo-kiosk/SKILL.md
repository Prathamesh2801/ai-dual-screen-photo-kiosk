---
name: run-ai-dual-screen-photo-kiosk
description: Build, run, lint, and screenshot the dual-screen photo kiosk (tablet + portrait TV). Use when asked to start the dev server, run the app, take screenshots of the tablet or TV routes, or check the pages render without console errors.
---

Vite + React app, two screens: tablet at `/#/...`, TV at `/#/tv`. Start the dev
server, then drive it with `.claude/skills/run-ai-dual-screen-photo-kiosk/driver.mjs`
(Playwright + the installed Chrome). Paths are relative to the repo root.
Verified on Windows 11 in Git Bash. Pages are still placeholders, so the driver
is a render + console-error smoke test, not a flow test.

## Prerequisites

- Node + npm, Google Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`
  (override with `CHROME_PATH`).
- `playwright-core` is deliberately not in `package.json`:

```bash
npm i --no-save playwright-core
```

## Run (agent path)

```bash
(npm run dev >/dev/null 2>&1 &)
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
node .claude/skills/run-ai-dual-screen-photo-kiosk/driver.mjs
```

The driver visits form, template, capture, sent (820x1180) and tv (1080x1920),
prints `<name> ok` or `<name> ERRORS ...`, and exits 1 on any console or page
error. Screenshots go to `%TEMP%/kiosk-shots/<name>.png` (override with
`SHOTS`). `BASE_URL` overrides `http://localhost:5173`.

Stop the server (Windows; `$!` is only the npm wrapper):

```bash
taskkill //PID $(netstat -ano | grep ':5173 .*LISTENING' | awk '{print $5}' | head -1) //F //T
```

## Run (human path)

```bash
npm run dev   # Vite on the LAN; open http://localhost:5173/#/ and /#/tv
```

## Build and lint

```bash
npm run lint
npx vite build
```

`npm run build` also runs `postbuild` (`bestzip`), which is not a listed
dependency and was not run here.

## Gotchas

- **`npm i --no-save` is not permanent** - a later `npm install`/`npm ci`
  prunes `playwright-core`. Re-run it before the driver.
- **Camera needs a secure context** - `localhost` works; the driver passes
  `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` so
  `getUserMedia` succeeds without a prompt. Over `http://192.168.x.x` it won't.
- **Hash URLs** - navigate to `/#/tv`, not `/tv`.
- **No `chromium-cli` on this machine** - hence the Playwright driver.
