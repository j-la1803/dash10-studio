import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3000'

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`approved dividers, unified navigation and Milwaukee footer at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto(base)
    await expect(page.locator('.scene-progress')).toHaveCount(1)
    await expect(page.locator('.scene-progress-track')).toHaveCount(1)
    await expect(page.locator('.scene-progress a')).toHaveCount(4)
    await expect(page.locator('.scene-rule')).toHaveCount(0)
    expect(
      await page
        .locator('.scene-copy')
        .evaluateAll((els) =>
          els.every(
            (el) =>
              getComputedStyle(el).borderLeftWidth === '0px' &&
              getComputedStyle(el, ':before').content === 'none' &&
              getComputedStyle(el, ':after').content === 'none',
          ),
        ),
    ).toBe(true)
    expect(
      await page
        .locator('.platform-section,.studio-capabilities')
        .evaluateAll((els) =>
          els.every(
            (el) =>
              getComputedStyle(el).borderTopWidth === '0px' &&
              getComputedStyle(el).borderBottomWidth === '0px',
          ),
        ),
    ).toBe(true)
    expect(
      await page
        .locator('.platform-grid>div')
        .evaluateAll((els) => els.every((el) => getComputedStyle(el).borderBottomWidth === '1px')),
    ).toBe(true)
    expect(
      await page
        .locator('.studio-window')
        .evaluateAll((els) => els.every((el) => getComputedStyle(el).borderTopWidth === '1px')),
    ).toBe(true)
    await expect(page.locator('.footer-bottom')).toHaveCSS('border-top-width', '1px')
    const location = page.locator('.footer-contact')
    await expect(location).toContainText('BASED IN')
    await expect(location).toContainText('MILWAUKEE, WI')
    await expect(location).toContainText('43.0389° N / 87.9065° W')
    await expect(location.locator('svg.lucide-beer')).toHaveCount(1)
    await expect(location.locator('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('.studio-footer a[href^="mailto:"]')).toHaveCount(0)
    await expect(page.locator('.footer-columns>div,.footer-columns>nav')).toHaveCount(4)
    await location.scrollIntoViewIfNeeded()
    const boxes = await location
      .locator('.footer-location,.footer-coordinates')
      .evaluateAll((els) =>
        els.map((el) => ({
          top: el.getBoundingClientRect().top,
          bottom: el.getBoundingClientRect().bottom,
          right: el.getBoundingClientRect().right,
        })),
      )
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom)
    expect(boxes[1].right).toBeLessThanOrEqual(viewport.width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('.footer-studio a[href="/contact"]').click()
    await expect(page.getByRole('button', { name: 'SEND PROJECT INQUIRY' })).toBeVisible()
  })
}

test('baked mountain loop matches at both turns and plays through the loop boundary', async ({
  page,
}, info) => {
  await page.goto(base)
  const video = page.locator('video')
  await expect(video.locator('source')).toHaveAttribute('src', '/videos/dash10-mountain-loop.mp4')
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).readyState))
    .toBeGreaterThanOrEqual(2)
  const metrics = await video.evaluate(async (node) => {
    const v = node as HTMLVideoElement
    v.pause()
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 86
    const context = canvas.getContext('2d')!
    async function frame(time: number) {
      await new Promise<void>((resolve) => {
        v.addEventListener('seeked', () => resolve(), { once: true })
        v.currentTime = time
      })
      context.drawImage(v, 0, 0, 160, 86)
      return Array.from(context.getImageData(0, 0, 160, 86).data)
    }
    const first = await frame(0.001),
      last = await frame(v.duration - 0.04)
    const beforeTurn = await frame(v.duration / 2 - 0.08),
      afterTurn = await frame(v.duration / 2 + 0.08)
    const forward = await frame(5),
      reverse = await frame(v.duration - 5)
    const difference = (a: number[], b: number[]) =>
      a.reduce((sum, n, i) => sum + Math.abs(n - b[i]), 0) / a.length
    return {
      duration: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
      seam: difference(first, last),
      turn: difference(beforeTurn, afterTurn),
      reverse: difference(forward, reverse),
    }
  })
  await info.attach('decoded-loop-frame-comparison', {
    body: JSON.stringify(metrics),
    contentType: 'application/json',
  })
  expect(metrics.width).toBe(1438)
  expect(metrics.height).toBe(768)
  expect(metrics.duration).toBeGreaterThan(58)
  expect(metrics.duration).toBeLessThan(59)
  expect(metrics.seam).toBeLessThan(2)
  expect(metrics.turn).toBeLessThan(2)
  expect(metrics.reverse).toBeLessThan(2)
  await video.evaluate(async (node) => {
    const v = node as HTMLVideoElement
    v.currentTime = v.duration - 0.2
    await v.play()
  })
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeLessThan(2)
  expect(await video.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(false)
  expect(await video.evaluate((v) => (v as HTMLVideoElement).playbackRate)).toBe(0.7)
})
