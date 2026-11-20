import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3000'

for (const width of [320, 375, 390, 430, 768, 1280, 1440]) {
  test(`poster composition stays readable and in flow at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    const scenes = page.locator('.studio-scene')
    await expect(scenes).toHaveCount(4)
    const destinations = ['/services', '/process', '/services#integrations', '/contact']
    for (let i = 0; i < 4; i++) {
      const scene = scenes.nth(i)
      await scene.scrollIntoViewIfNeeded()
      await expect(scene.locator('h2')).toBeVisible()
      await expect(scene.locator('.studio-cta')).toHaveAttribute('href', destinations[i])
      const geometry = await scene.evaluate((el) => {
        const section = el.getBoundingClientRect()
        const heading = el.querySelector('h2')!.getBoundingClientRect()
        const cta = el.querySelector('a')!.getBoundingClientRect()
        const panel = el.querySelector('[data-reveal="visual"]')!.getBoundingClientRect()
        return {
          position: getComputedStyle(el).position,
          section: { left: section.left, right: section.right, bottom: section.bottom },
          heading: { right: heading.right },
          cta: { height: cta.height, right: cta.right },
          panel: { left: panel.left, right: panel.right, top: panel.top },
          headingBottom: heading.bottom,
        }
      })
      expect(geometry.position).not.toBe('sticky')
      expect(geometry.section.right).toBeLessThanOrEqual(width)
      expect(geometry.heading.right).toBeLessThanOrEqual(geometry.section.right)
      expect(geometry.cta.height).toBeGreaterThanOrEqual(44)
      expect(geometry.panel.right).toBeLessThanOrEqual(geometry.section.right)
      const before = await scene.evaluate((el) => el.getBoundingClientRect().top)
      const scrollBefore = await page.evaluate(() => scrollY)
      await page.mouse.wheel(0, 80)
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore)
      const delta = (await page.evaluate(() => scrollY)) - scrollBefore
      expect(before - (await scene.evaluate((el) => el.getBoundingClientRect().top))).toBeCloseTo(
        delta,
        0,
      )
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await scenes.first().scrollIntoViewIfNeeded()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(scenes.first().locator('h2')).toHaveCSS('opacity', '1')
    await info.attach(`poster-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
  })
}

test('interior titles, preserved destinations and no-JavaScript reading', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  for (const path of [
    '/services',
    '/process',
    '/about',
    '/posts',
    '/contact',
    '/privacy',
    '/terms',
  ]) {
    const response = await page.goto(`${base}${path}`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('main h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.goto(base)
  for (const title of await page.locator('.studio-scene h2').all())
    await expect(title).toHaveCSS('opacity', '1')
  await context.close()
})

test('all poster CTAs navigate and retain consent-safe measurement', async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort())
  await page.goto(base)
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click()
  const destinations = ['/services', '/process', '/services#integrations', '/contact']
  for (let i = 0; i < destinations.length; i++) {
    if (i) await page.goto(base)
    const track = await page.locator('.scene-progress-track').boundingBox()
    expect(track!.width).toBe(2)
    const cta = page.locator('.studio-scene .studio-cta').nth(i)
    await cta.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(base + destinations[i])
    const event = await page.evaluate(() =>
      (window.dataLayer || [])
        .filter(
          (e) =>
            e &&
            typeof e === 'object' &&
            'event' in e &&
            ['cta_click', 'project_inquiry'].includes(String(e.event)),
        )
        .at(-1),
    )
    expect(event).toMatchObject({
      event: i === 3 ? 'project_inquiry' : 'cta_click',
      cta_id: ['services', 'process', 'services', 'contact'][i],
      placement: 'content',
    })
  }
})

test('wide article tables remain keyboard-scrollable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${base}/posts/choosing-ecommerce-platform-for-growing-business`)
  const table = page.getByRole('region', { name: 'Article table' }).first()
  await expect(table).toHaveAttribute('tabindex', '0')
  await table.focus()
  await expect(table).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => table.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
})
