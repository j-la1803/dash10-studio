import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'
for (const width of [375, 390, 430, 1280, 1440]) {
  test(`native poster scrolling and bounded rail at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    const root = page.locator('[data-posters-80]')
    const rail = root.getByRole('navigation', { name: 'Section progress' })
    const geometry = await root.evaluate((el) => ({
      start: el.getBoundingClientRect().top + scrollY,
      end: el.getBoundingClientRect().bottom + scrollY,
    }))
    const seen = new Set<string>()
    let previous: { y: number; section: number; progress: number } | undefined
    await page.evaluate((y) => scrollTo(0, y), geometry.start + 10)
    await page.mouse.move(width * 0.8, 450)
    while ((await page.evaluate(() => scrollY)) < geometry.end - 1100) {
      const before = await page.evaluate(() => scrollY)
      await page.mouse.wheel(0, 180)
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before)
      await page.waitForTimeout(30)
      const value = await root.evaluate((el) => ({
        y: scrollY,
        section: el.querySelector('[data-poster]')!.getBoundingClientRect().top,
        progress: Number((el as HTMLElement).style.getPropertyValue('--prog')),
        label: el.querySelector('[data-rail-lbl]')!.textContent!,
      }))
      expect(value.y - before).toBeLessThanOrEqual(182)
      expect((await rail.boundingBox())!.y).toBeCloseTo(0, 0)
      seen.add(value.label)
      if (previous) {
        expect(previous.section - value.section).toBeCloseTo(value.y - previous.y, 0)
        expect(value.progress).toBeGreaterThanOrEqual(previous.progress)
      }
      previous = value
    }
    expect([...seen]).toEqual(['UI / 001', 'CODE / 002', 'SYS / 003', 'TERMINAL / 004'])
    await page.evaluate((y) => scrollTo(0, y), geometry.end - 500)
    await expect.poll(async () => (await rail.boundingBox())!.y).toBeLessThan(-350)
    await expect(page.locator('.studio-capabilities')).toBeInViewport()
    await page.mouse.wheel(0, -500)
    await expect
      .poll(() =>
        root.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--prog'))),
      )
      .toBeLessThan(1)
    await page.evaluate((y) => scrollTo(0, y), geometry.start + 10)
    await expect(root.locator('[data-rail-lbl]')).toHaveText('UI / 001')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('all poster CTAs resolve and preserve keyboard focus', async ({ page }) => {
  await page.goto(base)
  await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
  const destinations = ['/services', '/process', '/services#integrations', '/contact']
  for (let index = 0; index < 4; index++) {
    const cta = page.locator('[data-studio-cta]').nth(index)
    await expect(cta).toHaveAttribute('href', destinations[index])
    await page.keyboard.press('Tab')
    await cta.focus()
    await expect(cta).toBeFocused()
    expect(await cta.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid')
    const response = await page.request.get(base + destinations[index].split('#')[0])
    expect(response.status()).toBe(200)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(base + destinations[index])
    await page.goto(base)
  }
  await page.goto(base + '/services')
  await expect(page.locator('#integrations')).toHaveCount(1)
})

test('server-rendered poster content stays readable with JavaScript disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(base)
  await expect(page.locator('[data-poster]')).toHaveCount(4)
  for (const body of await page.locator('[data-poster] [class*="_body"]').all())
    await expect(body).toHaveCSS('opacity', '1')
  await context.close()
})

test('poster CTAs emit one existing safe event only after consent', async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort())
  await page.goto(base)
  await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
  await page.evaluate(() =>
    document.addEventListener(
      'click',
      (event) => {
        if ((event.target as Element).closest('[data-studio-cta]')) event.preventDefault()
      },
      { capture: true },
    ),
  )
  const events = () =>
    page.evaluate(() =>
      (window.dataLayer || []).filter(
        (e): e is Record<string, unknown> =>
          !!e &&
          typeof e === 'object' &&
          'event' in e &&
          ['cta_click', 'project_inquiry'].includes(String(e.event)),
      ),
    )
  await page.locator('[data-studio-cta]').first().click()
  expect(await events()).toHaveLength(0)
  await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click()
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click()
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-studio-cta]').nth(i).click()
    await expect.poll(async () => (await events()).length).toBe(i + 1)
  }
  expect((await events()).map((e) => [e.event, e.cta_id, e.placement])).toEqual([
    ['cta_click', 'services', 'content'],
    ['cta_click', 'process', 'content'],
    ['cta_click', 'services', 'content'],
    ['project_inquiry', 'contact', 'content'],
  ])
})
