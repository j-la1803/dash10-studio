// Sequential fresh-browser lab samples. Read-only; no consent, CMS writes or account cookies.
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
const url = process.argv[2],
  output = process.argv[3],
  results = []
if (!url || !output)
  throw new Error('Usage: node scripts/measure-mobile.mjs <url> <private-output.json>')
for (let i = 0; i < 3; i++) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
  })
  const page = await context.newPage(),
    cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 196608,
    uploadThroughput: 73728,
    connectionType: 'cellular4g',
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.addInitScript(() => {
    window.__lcp = []
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        window.__lcp.push({
          time: e.startTime,
          url: e.url,
          tag: e.element?.tagName,
          className: e.element?.className,
        })
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(5000)
  const result = await page.evaluate(() => ({
    lcp: window.__lcp.at(-1),
    entries: window.__lcp,
    resources: performance
      .getEntriesByType('resource')
      .map((e) => ({
        name: e.name,
        size: e.transferSize,
        start: e.startTime,
        duration: e.duration,
        initiator: e.initiatorType,
      })),
    navigation: performance.getEntriesByType('navigation')[0].toJSON(),
  }))
  results.push(result)
  console.log(i + 1, result.lcp)
  await browser.close()
}
await fs.writeFile(
  output,
  JSON.stringify(
    {
      url,
      conditions: {
        viewport: '412x915',
        cpu: 4,
        latency: 150,
        downloadBytesPerSecond: 196608,
        freshContext: true,
      },
      results,
    },
    null,
    2,
  ),
)
