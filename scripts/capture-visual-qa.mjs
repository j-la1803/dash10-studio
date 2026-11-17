import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const base = process.env.QA_BASE_URL || 'http://localhost:3100'
const output = path.resolve('docs/qa')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: process.env.QA_BROWSER_CHANNEL || 'chrome' })
const report = { base, capturedAt: new Date().toISOString(), browserErrors: [], viewports: {} }
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1440, height: 1000 },
    mobile: { width: 390, height: 844 },
  })) {
    const page = await browser.newPage({ viewport })
    page.on('pageerror', (err) => report.browserErrors.push(`${name}: ${err.message}`))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(async () => {
      const images = Array.from(document.images)
      images.forEach((img) => {
        img.loading = 'eager'
      })
      await Promise.all(images.map((img) => img.decode().catch(() => {})))
    })
    await page.locator('video').evaluate(async (video) => {
      // Freeze the same original-video frame for reproducible image comparisons.
      video.pause()
      if (video.readyState >= 1) {
        await new Promise((resolve) => {
          video.addEventListener('seeked', resolve, { once: true })
          video.currentTime = Math.min(2, video.duration || 2)
        })
      }
    })
    const checks = await page.evaluate(() => ({
      missingImages: [...document.images]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src')),
      overflow: document.documentElement.scrollWidth > innerWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      paragraphLineHeight: getComputedStyle(document.querySelector('.hero-description')).lineHeight,
      scenePosition: getComputedStyle(document.querySelector('.story-stage')).position,
      video: document.querySelector('video source').getAttribute('src'),
      grayscale: getComputedStyle(document.querySelector('video')).filter,
      platformColumns: getComputedStyle(document.querySelector('.platform-grid'))
        .gridTemplateColumns,
      platformBorders: [...document.querySelectorAll('.platform-grid>div')].map(
        (el) => getComputedStyle(el).borderRightWidth,
      ),
      footerOpacity: getComputedStyle(document.querySelector('.footer-monogram')).opacity,
      logo: document.querySelector('.studio-header img').getAttribute('src'),
    }))
    report.viewports[name] = checks
    // Capture the full composition with reveal animations completed. Sticky behavior is
    // checked separately in the browser tests and in the in-viewport scene captures.
    const style = await page.addStyleTag({
      content:
        '.scene-copy,.studio-window,.systems-visual{animation:none!important;opacity:1!important;translate:none!important}',
    })
    await page.screenshot({ path: path.join(output, `homepage-${name}.png`), fullPage: true })
    if (name === 'desktop') {
      const overview = await page.addStyleTag({
        content: `
        .studio-scenes[data-pinned='true']{height:auto!important}
        .studio-scenes[data-pinned='true'] .story-stage{position:relative!important;height:auto!important;display:block!important}
        .studio-scenes[data-pinned='true'] .story-panel{opacity:1!important;visibility:visible!important;transform:none!important;transition:none!important}
        .studio-scenes[data-pinned='true'] .scene-sticky{height:auto!important;min-height:0!important;padding-block:6rem!important}
        .scene-progress{display:none!important}
      `,
      })
      await page.screenshot({
        path: path.join(output, 'homepage-desktop-overview.png'),
        fullPage: true,
      })
      await overview.evaluate((el) => el.remove())
    }
    await style.evaluate((el) => el.remove())
    await page
      .locator('.studio-footer')
      .screenshot({ path: path.join(output, `footer-${name}.png`) })
    if (name === 'desktop') {
      for (let i = 0; i < 4; i++) {
        await page.locator('.studio-scenes').evaluate((el, index) => {
          const bounds = el.getBoundingClientRect()
          const segment = (bounds.height - innerHeight) / 4
          scrollTo(0, bounds.top + scrollY + segment * (index + 0.25))
        }, i)
        await page.waitForTimeout(500)
        await page.screenshot({ path: path.join(output, `scene-0${i + 1}-desktop.png`) })
      }
    }
    await page.goto(`${base}/contact`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: path.join(output, `contact-${name}.png`), fullPage: true })
    if (name === 'desktop') {
      await page.goto(`${base}/posts`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: path.join(output, 'blog-desktop.png'), fullPage: true })
    }
    await page.close()
  }
  await writeFile(path.join(output, 'visual-checks.json'), JSON.stringify(report, null, 2) + '\n')
} finally {
  await browser.close()
}
