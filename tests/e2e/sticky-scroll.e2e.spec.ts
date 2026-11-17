import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3000'
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
]) {
  test(`normal sections and sticky rail at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport)
    await page.goto(base)
    await expect(page.locator('.studio-scenes')).toHaveAttribute('data-flow', 'true')
    const geometry = await page.locator('.studio-scenes').evaluate((el) => ({
      start: el.getBoundingClientRect().top + scrollY,
      end: el.getBoundingClientRect().bottom + scrollY,
    }))
    const samples: {
      scroll: number
      section: number
      rail: number
      progress: number
      active: number
    }[] = []
    const seen = new Set<number>()
    await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5)
    while ((await page.evaluate(() => scrollY)) < geometry.end - 100) {
      const before = await page.evaluate(() => scrollY)
      await page.mouse.wheel(0, 100)
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before)
      await page.waitForTimeout(20)
      const m = await page.evaluate(() => ({
        scroll: scrollY,
        section: document.querySelector('.studio-scene')!.getBoundingClientRect().top,
        rail: document.querySelector('.scene-progress')!.getBoundingClientRect().top,
        progress: Number(
          document.querySelector('[role=progressbar]')!.getAttribute('aria-valuenow'),
        ),
        active: Number(document.querySelector('.studio-scenes')!.getAttribute('data-active-scene')),
      }))
      expect(m.scroll - before).toBeLessThanOrEqual(102)
      if (m.scroll > geometry.start && m.scroll < geometry.end - viewport.height) {
        samples.push(m)
        seen.add(m.active)
      }
    }
    expect(samples.length).toBeGreaterThan(10)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i - 1].section - samples[i].section).toBeCloseTo(
        samples[i].scroll - samples[i - 1].scroll,
        0,
      )
      expect(Math.abs(samples[i].rail - samples[0].rail)).toBeLessThan(2)
      expect(samples[i].progress).toBeGreaterThanOrEqual(samples[i - 1].progress)
    }
    expect([...seen]).toEqual([1, 2, 3, 4])
    expect(new Set(samples.map((s) => s.progress)).size).toBeGreaterThan(12)
    expect(
      await page.locator('.scene-progress').evaluate((el) => el.getBoundingClientRect().top),
    ).toBeLessThan(samples[0].rail - 50)
    await expect(page.locator('.studio-capabilities')).toBeInViewport()
    const last = Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'))
    await page.mouse.wheel(0, -700)
    await expect
      .poll(async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow')))
      .toBeLessThan(last)
    while ((await page.evaluate(() => scrollY)) > geometry.start + 150) {
      const before = await page.evaluate(() => scrollY)
      await page.mouse.wheel(0, -300)
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before)
    }
    await expect(page.locator('.studio-scenes')).toHaveAttribute('data-active-scene', '1')
    await info.attach('normal-scroll-coordinates', {
      body: JSON.stringify(samples),
      contentType: 'application/json',
    })
  })
}
for (const mode of ['mobile', 'reduced'] as const) {
  test(`${mode} scrolling preserves accessible content`, async ({ page }) => {
    await page.setViewportSize(
      mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    )
    await page.emulateMedia({ reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' })
    await page.goto(base)
    await expect(page.locator('.studio-scene:visible')).toHaveCount(4)
    await page.locator('.studio-scene').first().scrollIntoViewIfNeeded()
    const before = await page.locator('.studio-scene').first().boundingBox()
    const y = await page.evaluate(() => scrollY)
    await page.mouse.wheel(0, 250)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y)
    const after = await page.locator('.studio-scene').first().boundingBox()
    expect(before!.y - after!.y).toBeCloseTo((await page.evaluate(() => scrollY)) - y, 0)
    if (mode === 'reduced')
      expect(
        await page
          .locator('[data-reveal]')
          .evaluateAll((els) => els.every((el) => getComputedStyle(el).animationName === 'none')),
      ).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
test('reveals run once and FAQ supports smooth reversal and keyboard', async ({ page }) => {
  await page.goto(base)
  await page.evaluate(() => {
    document.documentElement.dataset.revealCount = '0'
    document.addEventListener('animationstart', (e) => {
      if ((e as AnimationEvent).animationName === 'editorial-reveal')
        document.documentElement.dataset.revealCount = String(
          Number(document.documentElement.dataset.revealCount) + 1,
        )
    })
  })
  const title = page.locator('.studio-scene h2').first()
  await title.scrollIntoViewIfNeeded()
  await expect(title).toHaveAttribute('data-revealed', 'true')
  await expect(title).not.toHaveClass(/is-revealing/)
  const cta = page.locator('.studio-scene .studio-cta').first()
  await cta.hover()
  await expect(cta.locator('span')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 3, -3)')
  await cta.focus()
  expect(await cta.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
  const count = await page.evaluate(() => document.documentElement.dataset.revealCount)
  await page.locator('h1').scrollIntoViewIfNeeded()
  await title.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  expect(await page.evaluate(() => document.documentElement.dataset.revealCount)).toBe(count)
  const details = page.locator('.capabilities-list details').first(),
    summary = details.locator('summary')
  await summary.click()
  await page.waitForTimeout(100)
  await summary.click()
  await expect(details).not.toHaveAttribute('open', '')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(details).toHaveAttribute('open', '')
  await expect.poll(() => details.evaluate((el) => el.getAnimations().length)).toBe(0)
  await page.keyboard.press('Enter')
  await expect(details).not.toHaveAttribute('open', '')
})
test('without JavaScript content stays visible and FAQ works', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(base)
  await expect(page.locator('.studio-scene:visible')).toHaveCount(4)
  expect(
    await page
      .locator('[data-reveal]')
      .evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')),
  ).toBe(true)
  const details = page.locator('.capabilities-list details').first()
  await details.locator('summary').click()
  await expect(details).toHaveAttribute('open', '')
  await context.close()
})
