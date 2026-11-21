import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'

for (const width of [375, 390, 430, 1440]) {
  test(`reference horizontal entry reverses without resets at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    const poster = page.locator('[data-poster]').nth(1)
    const start = await poster.evaluate((el) => el.getBoundingClientRect().top + scrollY)
    const sample = async (fraction: number) => {
      await page.evaluate((y) => scrollTo(0, y), start - 900 * fraction)
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      )
      return poster.evaluate((el) => {
        const body = el.querySelector('[class*="_body"]')!
        const spec = el.querySelector('[class*="_spec"]')!
        return {
          top: el.getBoundingClientRect().top,
          p: Number((el as HTMLElement).style.getPropertyValue('--p')),
          opacity: Number(getComputedStyle(body).opacity),
          x: new DOMMatrix(getComputedStyle(body).transform).m41,
          panelX: new DOMMatrix(getComputedStyle(spec).transform).m41,
        }
      })
    }
    const samples = []
    for (const fraction of [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]) {
      const value = await sample(fraction)
      expect(value.top).toBeCloseTo(900 * fraction, 0)
      expect(value.opacity).toBeCloseTo(0.2 + value.p * 0.8, 2)
      expect(value.x).toBeCloseTo((1 - value.p) * -32, 1)
      expect(value.panelX).toBeCloseTo((1 - value.p) * 32, 1)
      samples.push(value)
    }
    expect(samples[0].opacity).toBe(0.2)
    expect(samples.at(-1)!.opacity).toBe(1)
    for (const fraction of [0.3, 0.5, 0.7, 0.9]) {
      const value = await sample(fraction)
      const earlier = samples[[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2].indexOf(fraction)]
      expect(value.x).toBeCloseTo(earlier.x, 1)
      expect(value.opacity).toBeCloseTo(earlier.opacity, 2)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('reference glitch and technical animations execute; reduced motion disables them', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(base)
  await page.evaluate(() => {
    ;(window as typeof window & { posterAnimations: string[] }).posterAnimations = []
    document.addEventListener('animationstart', (event) => {
      if (event.target instanceof Element && event.target.closest('[data-posters-80]'))
        (window as typeof window & { posterAnimations: string[] }).posterAnimations.push(
          event.animationName,
        )
    })
  })
  for (const poster of await page.locator('[data-poster]').all()) {
    await poster.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY))
    await page.waitForTimeout(500)
  }
  const names = await page.evaluate(
    () => (window as typeof window & { posterAnimations: string[] }).posterAnimations,
  )
  for (const name of ['jit', 'g1', 'g2']) expect(names.some((n) => n.endsWith(name))).toBe(true)
  const animations = await page
    .locator('[data-posters-80]')
    .evaluate((el) =>
      el.getAnimations({ subtree: true }).map((a) => (a as CSSAnimation).animationName),
    )
  for (const name of ['spin', 'up', 'flow', 'pulse', 'sweep', 'blink'])
    expect(animations.some((n) => n.endsWith(name))).toBe(true)
  // Observe live values changing over time, rather than only checking declarations.
  for (const [index, selector, property] of [
    [0, '[class*="_ring"]', 'transform'],
    [1, '[class*="_codefall"] pre', 'transform'],
    [2, '[class*="_lattice"] path', 'stroke-dashoffset'],
    [3, '[class*="_sweep"]', 'transform'],
  ] as const) {
    const poster = page.locator('[data-poster]').nth(index)
    await poster.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY))
    const animated = poster.locator(selector)
    const before = await animated.evaluate(
      (el, name) => getComputedStyle(el).getPropertyValue(name),
      property,
    )
    await expect
      .poll(() =>
        animated.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property),
      )
      .not.toBe(before)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() =>
      page
        .locator('[data-posters-80]')
        .evaluate(
          (el) =>
            el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length,
        ),
    )
    .toBe(0)
  for (const poster of await page.locator('[data-poster]').all()) {
    await expect(poster.locator('[class*="_body"]')).toHaveCSS('opacity', '1')
    await expect(poster.locator('[class*="_body"]')).toHaveCSS('transform', 'none')
  }
})
