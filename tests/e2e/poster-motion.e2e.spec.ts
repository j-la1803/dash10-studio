import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'

// Enable recording where Playwright's optional ffmpeg helper is installed.
test.use({ video: process.env.QA_MOTION_VIDEO === '1' ? 'on' : 'off' })
for (const width of [390, 430, 1440]) {
  test(`reference motion executes, retriggers and respects preferences at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
    await page.addInitScript(() => {
      const events: { name: string; scene: string | null; type: string; pseudo: string }[] = []
      Object.assign(window, { posterAnimationEvents: events })
      for (const type of ['animationstart', 'animationend'])
        document.addEventListener(
          type,
          (event) => {
            const e = event as AnimationEvent
            const section = (e.target as Element).closest('.studio-scene')
            if (section)
              events.push({
                name: e.animationName,
                scene: section.getAttribute('aria-labelledby'),
                type,
                pseudo: e.pseudoElement,
              })
          },
          true,
        )
    })
    await page.goto(base)
    await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    const scenes = page.locator('.studio-scene')
    const startsFor = (id: string) =>
      page.evaluate(
        (id) =>
          (
            window as unknown as {
              posterAnimationEvents: { name: string; scene: string; type: string }[]
            }
          ).posterAnimationEvents.filter(
            (e) => e.scene === id && e.type === 'animationstart' && e.name.includes('jit'),
          ).length,
        id,
      )
    const samples = []
    for (let i = 0; i < 4; i++) {
      const scene = scenes.nth(i)
      const start = await scene.evaluate((el) => el.getBoundingClientRect().top + scrollY)
      const before = await startsFor(`scene-${i}`)
      await page.evaluate((y) => scrollTo(0, y), start - 180)
      await expect(scene).toHaveAttribute('data-glitch', 'true')
      await expect.poll(() => startsFor(`scene-${i}`)).toBeGreaterThan(before)
      const motion = await scene.locator('h2 > span').evaluate((el) =>
        el.getAnimations({ subtree: true }).map((a) => ({
          name: (a as CSSAnimation).animationName,
          duration: a.effect?.getTiming().duration,
          time: a.currentTime,
        })),
      )
      expect(motion.some((a) => a.name.includes('jit') && a.duration === 400)).toBe(true)
      await expect
        .poll(() =>
          page.evaluate(
            (id) =>
              (
                window as unknown as {
                  posterAnimationEvents: { name: string; scene: string; type: string }[]
                }
              ).posterAnimationEvents.filter(
                (e) => e.type === 'animationend' && e.name.includes('jit') && e.scene === id,
              ).length,
            `scene-${i}`,
          ),
        )
        .toBeGreaterThan(0)
      const expectedDetail = ['spin', 'codeDrift', 'flow', 'statusPulse'][i]
      const clock = () =>
        scene.evaluate(
          (el, name) =>
            el
              .getAnimations({ subtree: true })
              .filter(
                (a) =>
                  (a as CSSAnimation).animationName?.includes(name) && a.playState === 'running',
              )
              .map((a) => Number(a.currentTime)),
          expectedDetail,
        )
      const ticks = await clock()
      expect(ticks.length).toBeGreaterThan(0)
      await expect.poll(async () => (await clock())[0]).toBeGreaterThan(ticks[0])
      const number = scene.locator('[data-poster-number]')
      await expect(number).toHaveText(`0${i + 1}`)
      await expect(number).toHaveAttribute('aria-hidden', 'true')
      const style = await number.evaluate((el) => {
        const s = getComputedStyle(el)
        return {
          opacity: s.opacity,
          stroke: s.webkitTextStrokeColor,
          width: s.webkitTextStrokeWidth,
          z: s.zIndex,
          x: el.getBoundingClientRect().x,
        }
      })
      expect(Number(style.opacity)).toBe(1)
      expect(style.z).toBe('0')
      expect(style.width).toBe('1px')
      expect(style.stroke).toMatch(/0\.14/)
      await expect(scene.locator('h2')).toHaveAccessibleName(
        [
          'BUILT FOR THE REAL WORLD.',
          'WEB DEVELOPMENT WITHOUT THE AGENCY BLOAT.',
          'YOUR SYSTEMS SHOULD TALK TO EACH OTHER.',
          'WE BUILD. WE FIX. WE CONNECT.',
        ][i],
      )
      const outline = scene.locator('h2 [data-outline]')
      await expect(outline).toHaveCSS('-webkit-text-stroke-width', '2px')
      const a = await scene.evaluate((el) => ({
        p: getComputedStyle(el).getPropertyValue('--p'),
        s: getComputedStyle(el).getPropertyValue('--s'),
        background: getComputedStyle(el.querySelector('[data-atmosphere]')!).transform,
      }))
      await page.mouse.wheel(0, 80)
      await expect
        .poll(() => scene.evaluate((el) => getComputedStyle(el).getPropertyValue('--s')))
        .not.toBe(a.s)
      samples.push({ scene: i + 1, style, motion, entrance: a })
      await scene.screenshot({ path: `/tmp/fidelity-${width}-scene-${i + 1}.png` })
      // Leave completely, then return: a fresh short glitch must execute.
      await page.evaluate((y) => scrollTo(0, y), start - (width < 768 ? 844 : 900) - 50)
      await expect(scene).toHaveAttribute('data-glitch', 'false')
      const count = await startsFor(`scene-${i}`)
      await page.evaluate((y) => scrollTo(0, y), start - 180)
      await expect.poll(() => startsFor(`scene-${i}`)).toBeGreaterThan(count)
    }
    await expect
      .poll(() =>
        scenes
          .first()
          .evaluate(
            (el) =>
              el
                .getAnimations({ subtree: true })
                .filter((a) => (a as CSSAnimation).animationName && a.playState === 'running')
                .length,
          ),
      )
      .toBe(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('.studio-scenes')).toHaveAttribute('data-motion', 'false')
    await expect
      .poll(() =>
        scenes.evaluateAll(
          (els) =>
            els
              .flatMap((el) => el.getAnimations({ subtree: true }))
              .filter((a) => a.playState === 'running').length,
        ),
      )
      .toBe(0)
    for (const number of await page.locator('[data-poster-number]').all()) {
      await expect(number).toHaveCSS('opacity', '1')
      await expect(number).toHaveCSS('transform', 'none')
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await info.attach('verified-motion-samples', {
      body: JSON.stringify(samples),
      contentType: 'application/json',
    })
  })
}
