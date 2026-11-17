import { test, expect } from '@playwright/test'

const base = process.env.QA_BASE_URL || 'http://localhost:3000'

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  // Browser chrome can make an ordinary desktop window shorter than 750 CSS pixels.
  { width: 1440, height: 720 },
  { width: 1280, height: 650 },
]) {
  test(`normal wheel scrolling pins and releases the stage at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    const track = page.locator('.studio-scenes')
    await expect(track).toHaveAttribute('data-pinned', 'true')
    const geometry = await track.evaluate((el) => {
      const stage = el.querySelector('.story-stage')!
      return {
        start: el.getBoundingClientRect().top + scrollY + el.clientTop,
        range: el.clientHeight - stage.getBoundingClientRect().height,
      }
    })
    const samples: { distance: number; top: number; progressTop: number; scene: number }[] = []
    const seen = new Set<number>()
    await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5)
    while (
      (await page.evaluate(() => scrollY)) <
      geometry.start + geometry.range + viewport.height * 0.35
    ) {
      const before = await page.evaluate(() => scrollY)
      // Real wheel input only: no scrollTo, scrollIntoView, or clicking scene controls.
      await page.mouse.wheel(0, 80)
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before)
      const scroll = await page.evaluate(() => scrollY)
      expect(scroll - before).toBeLessThanOrEqual(82)
      const distance = scroll - geometry.start
      if (distance < 2 || distance > geometry.range - 2) continue
      const scene = Math.min(4, Math.floor(distance / (geometry.range / 4)) + 1)
      await expect(track).toHaveAttribute('data-active-scene', String(scene))
      await expect(page.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        String(scene * 25),
      )
      const metrics = await page.evaluate(() => {
        const stage = document.querySelector('.story-stage')!.getBoundingClientRect()
        const progress = document.querySelector('.scene-progress')!.getBoundingClientRect()
        return {
          top: stage.top,
          height: stage.height,
          progressTop: progress.top,
          progressBottom: progress.bottom,
        }
      })
      expect(Math.abs(metrics.top)).toBeLessThan(2)
      expect(metrics.height).toBeCloseTo(viewport.height, 0)
      expect(metrics.progressTop).toBeGreaterThan(0)
      expect(metrics.progressBottom).toBeLessThan(viewport.height)
      samples.push({ distance, top: metrics.top, progressTop: metrics.progressTop, scene })
      seen.add(scene)
    }
    expect([...seen]).toEqual([1, 2, 3, 4])
    for (const scene of seen)
      expect(samples.filter((sample) => sample.scene === scene).length).toBeGreaterThan(2)
    expect(
      Math.max(...samples.map((sample) => sample.progressTop)) -
        Math.min(...samples.map((sample) => sample.progressTop)),
    ).toBeLessThan(2)
    const release = await page.evaluate(() => ({
      stageTop: document.querySelector('.story-stage')!.getBoundingClientRect().top,
      faqTop: document.querySelector('.studio-capabilities')!.getBoundingClientRect().top,
    }))
    expect(release.stageTop).toBeLessThan(-80)
    expect(release.faqTop).toBeGreaterThan(0)
    expect(release.faqTop).toBeLessThan(viewport.height)
    await expect(track).toHaveAttribute('data-active-scene', '4')
    await testInfo.attach('native-scroll-coordinates', {
      body: JSON.stringify({ viewport, geometry, samples, release }, null, 2),
      contentType: 'application/json',
    })
  })
}

for (const mode of ['mobile', 'reduced-motion'] as const) {
  test(`${mode} keeps normal document scrolling and all four scenes accessible`, async ({
    page,
  }) => {
    await page.setViewportSize(
      mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    )
    await page.emulateMedia({
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
    })
    await page.goto(base)
    await expect(page.locator('.studio-scenes')).toHaveAttribute('data-pinned', 'false')
    await expect(page.locator('.studio-scene:visible')).toHaveCount(4)
    await expect(page.locator('.story-panel[inert]')).toHaveCount(0)
    await expect(page.getByRole('progressbar')).toHaveCount(0)
    const initial = await page.locator('.story-stage').boundingBox()
    await page.mouse.move(300, 400)
    await page.mouse.wheel(0, 300)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
    const scroll = await page.evaluate(() => scrollY)
    const moved = await page.locator('.story-stage').boundingBox()
    expect(initial!.y - moved!.y).toBeCloseTo(scroll, 0)
  })
}
