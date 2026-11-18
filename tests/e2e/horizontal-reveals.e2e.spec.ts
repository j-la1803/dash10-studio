import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3000'
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`continuous reversible horizontal reveals at ${viewport.width}`, async ({ page }, info) => {
    await page.setViewportSize(viewport)
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    const geometry = await page
      .locator('.studio-scene')
      .first()
      .evaluate((el) => ({
        start: el.getBoundingClientRect().top + scrollY,
        height: el.getBoundingClientRect().height,
      }))
    const title = page.locator('.studio-scene h2').first()
    const read = () =>
      title.evaluate((el) => {
        const s = getComputedStyle(el)
        const m = new DOMMatrix(s.transform)
        return { opacity: Number(s.opacity), x: m.m41, y: m.m42, animation: s.animationName }
      })
    const position = async (top: number) => {
      await page.evaluate((y) => scrollTo(0, y), geometry.start - top)
      await page.waitForTimeout(180)
      return read()
    }
    const samples = []
    for (const fraction of [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.2]) {
      const m = await position(viewport.height * fraction)
      samples.push(m)
      expect(m.y).toBe(0)
      expect(m.animation).toBe('none')
      expect(m.x).toBeLessThanOrEqual(0.01)
      expect(m.x).toBeGreaterThanOrEqual(viewport.width === 390 ? -16.01 : -24.01)
    }
    expect(samples[0].opacity).toBeLessThan(0.02)
    expect(samples.at(-1)!.opacity).toBe(1)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i].opacity).toBeGreaterThanOrEqual(samples[i - 1].opacity)
      expect(samples[i].x).toBeGreaterThanOrEqual(samples[i - 1].x)
    }
    expect(samples.filter((s) => s.opacity > 0.02 && s.opacity < 0.98).length).toBeGreaterThan(3)
    for (const fraction of [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
      const m = await position(viewport.height * fraction)
      const original = samples[[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.2].indexOf(fraction)]
      expect(m.opacity).toBeCloseTo(original.opacity, 2)
      expect(m.x).toBeCloseTo(original.x, 1)
    }
    // Reverse during an unfinished transition, without resetting opacity/transform.
    const initial = await position(viewport.height * 0.7)
    await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5)
    await page.mouse.wheel(0, 40)
    // Wheel delivery is asynchronous; sample after motion actually starts.
    await expect
      .poll(async () => (await read()).opacity, { intervals: [10] })
      .toBeGreaterThan(initial.opacity + 0.001)
    const middle = await read()
    expect(
      await title.evaluate((el) =>
        el.getAnimations().some((animation) => animation.playState === 'running'),
      ),
    ).toBe(true)
    await page.mouse.wheel(0, -40)
    await page.waitForTimeout(20)
    const reversing = await read()
    expect(Math.abs(reversing.opacity - middle.opacity)).toBeLessThan(0.15)
    expect(Math.abs(reversing.x - middle.x)).toBeLessThan(4)
    await expect
      .poll(async () => (await read()).opacity, { intervals: [20] })
      .toBeCloseTo(initial.opacity, 2)
    // All content stays readable across the central reading area, then fades at exit.
    expect((await position(viewport.height * 0.3)).opacity).toBe(1)
    const exit = await position(-geometry.height + viewport.height * 0.125)
    expect(exit.opacity).toBeCloseTo(0.5, 1)
    expect((await position(-geometry.height)).opacity).toBeLessThan(0.02)
    const returned = await position(-geometry.height + viewport.height * 0.125)
    expect(returned.opacity).toBeCloseTo(exit.opacity, 2)
    expect(
      await page
        .locator('.studio-scene')
        .first()
        .evaluate((el) => el.getBoundingClientRect().height),
    ).toBeCloseTo(geometry.height, 0)
    await info.attach('reveal-samples', {
      body: JSON.stringify(samples),
      contentType: 'application/json',
    })
  })
}
test('progress and Capabilities rules align; reduced motion and focus stay readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(base)
  const aligned = await page.evaluate(() => {
    const intro = document.querySelector('.capabilities-intro')!,
      rail = document.querySelector('.scene-progress-track')!
    const rule = getComputedStyle(intro, '::before')
    return {
      rail: rail.getBoundingClientRect().left,
      rule: intro.getBoundingClientRect().left + parseFloat(rule.left),
      width: rule.width,
      content: rule.content,
    }
  })
  expect(aligned.rule).toBeCloseTo(aligned.rail, 0)
  expect(aligned.width).toBe('2px')
  expect(aligned.content).not.toBe('none')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    await page.locator('[data-reveal]').evaluateAll((els) =>
      els.every((el) => {
        const s = getComputedStyle(el)
        return s.opacity === '1' && s.transform === 'none' && s.animationName === 'none'
      }),
    ),
  ).toBe(true)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const cta = page.locator('.studio-scene .studio-cta').first()
  await cta.focus()
  await expect(cta).toHaveCSS('opacity', '1')
})
