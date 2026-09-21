import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = process.env.SHOTS ?? `${tmpdir()}/kiosk-shots`
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

// route, viewport — TV is 1080x1920 portrait, tablet is portrait touch.
const SCREENS = [
  ['form', '/#/', { width: 820, height: 1180 }],
  ['template', '/#/template', { width: 820, height: 1180 }],
  ['capture', '/#/capture', { width: 820, height: 1180 }],
  ['sent', '/#/sent', { width: 820, height: 1180 }],
  ['tv', '/#/tv', { width: 1080, height: 1920 }],
]

mkdirSync(OUT, { recursive: true })
console.log('shots ->', OUT)
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
})
let failed = false
for (const [name, path, viewport] of SCREENS) {
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE + path)
  await page.waitForSelector('#root > *')
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name, errors.length ? `ERRORS ${errors.join(' | ')}` : 'ok')
  failed ||= errors.length > 0
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
