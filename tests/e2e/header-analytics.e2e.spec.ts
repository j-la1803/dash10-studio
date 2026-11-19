import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3100'

for (const width of [1440, 1280, 390]) {
  test(`header contrast, gradient and interaction geometry at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    await page.getByRole('button', { name: 'Decline analytics' }).click()
    const header = page.locator('.studio-header')
    const gradient = await header.evaluate((el) => {
      const style = getComputedStyle(el, '::before')
      return { height: style.height, image: style.backgroundImage, pointer: style.pointerEvents }
    })
    expect(gradient.height).toBe('150px')
    expect(Number(gradient.image.match(/rgba\(0, 0, 0, ([\d.]+)\)/)?.[1])).toBeCloseTo(0.864, 2)
    expect(gradient.pointer).toBe('none')
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(header).toHaveCSS('border-bottom-width', '0px')
    if (width < 700) await page.getByRole('button', { name: 'Menu' }).click()
    const cta = header.locator('a[href="/contact"]')
    const arrow = cta.locator('.header-cta-arrow')
    const textBox = await cta.locator('.nav-link-label').boundingBox()
    const arrowBox = await arrow.boundingBox()
    expect(arrowBox!.x - (textBox!.x + textBox!.width)).toBeCloseTo(11, 0)
    const before = await cta.boundingBox()
    await cta.hover()
    await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 3, -3)')
    await expect(cta).toHaveCSS('box-shadow', 'none')
    await expect(cta).toHaveCSS('border-width', '1px')
    await expect
      .poll(() =>
        cta.locator('.nav-link-label').evaluate((el) => getComputedStyle(el, '::after').transform),
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)')
    expect(await cta.boundingBox()).toEqual(before)
    await page.mouse.move(0, 0)
    await cta.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 3, -3)')
    expect(await cta.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(arrow).toHaveCSS('transform', 'none')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const services = header.getByRole('link', { name: 'Services', exact: true })
    await services.hover()
    await expect(services).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect
      .poll(() => services.evaluate((el) => getComputedStyle(el, '::after').transform))
      .toBe('matrix(1, 0, 0, 1, 0, 0)')
    await services.focus()
    await expect(services).toHaveCSS('color', 'rgb(255, 255, 255)')
    expect(await services.evaluate((el) => getComputedStyle(el, '::after').backgroundColor)).toBe(
      'rgb(255, 255, 255)',
    )
    await services.click()
    await expect(page).toHaveURL(`${base}/services`)
  })
}

test('only confirmed GTM loads after consent; client routes emit one safe page view each', async ({
  page,
}) => {
  const containers: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/gtm.js?'))
      containers.push(new URL(request.url()).searchParams.get('id')!)
  })
  await page.goto(`${base}/?email=private@example.com`)
  await expect(page.getByRole('button', { name: 'Allow analytics' })).toBeVisible()
  expect(containers).toEqual([])
  const response = page.waitForResponse(
    (r) => r.url().includes('/gtm.js?id=GTM-MZ6ZN2NH') && r.status() === 200,
  )
  await page.getByRole('button', { name: 'Allow analytics' }).click()
  await response
  await expect(page.locator('script#dash-gtm')).toHaveCount(1)
  await expect(page.locator('script#dash-gtm')).toHaveAttribute(
    'src',
    'https://www.googletagmanager.com/gtm.js?id=GTM-MZ6ZN2NH',
  )
  const views = () =>
    page.evaluate(() =>
      (window.dataLayer || []).filter(
        (event) =>
          event && typeof event === 'object' && 'event' in event && event.event === 'page_view',
      ),
    )
  await expect.poll(async () => (await views()).length).toBe(1)
  await page.locator('.studio-header').getByRole('link', { name: 'Services', exact: true }).click()
  await expect(page).toHaveURL(`${base}/services`)
  await expect.poll(async () => (await views()).length).toBe(2)
  await page.goBack()
  await expect.poll(async () => (await views()).length).toBe(3)
  expect(containers).toEqual(['GTM-MZ6ZN2NH'])
  expect(JSON.stringify(await views())).not.toContain('private@example.com')
  // No independent GA4 installation in application HTML.
  const html = await (await page.request.get(base)).text()
  expect(html).not.toMatch(/<script[^>]+src=["'][^"']*\/gtag\/js/i)
})

test('blocked tracking does not interrupt navigation, FAQ or the contact form', async ({
  page,
}) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort())
  await page.goto(base)
  await page.getByRole('button', { name: 'Allow analytics' }).click()
  await page.locator('.capabilities-list summary').first().click()
  await expect(page.locator('.capabilities-list details').first()).toHaveAttribute('open', '')
  await page.getByRole('link', { name: 'HAVE A PROJECT IN MIND?' }).click()
  await expect(page.getByRole('button', { name: 'SEND PROJECT INQUIRY' })).toBeVisible()
})

test('homepage overlay follows rendered content across navigation and an incorrect route flag', async ({
  page,
}) => {
  await page.goto(base)
  const header = page.locator('.studio-header')
  const verify = async () => {
    const positions = await page.evaluate(() => {
      const h = document.querySelector('.studio-header')!.getBoundingClientRect()
      const hero = document.querySelector('.dash-hero')!.getBoundingClientRect()
      const video = document.querySelector('video')!.getBoundingClientRect()
      return { header: h.top, hero: hero.top, video: video.top }
    })
    expect(positions.hero).toBe(positions.header)
    expect(positions.video).toBe(positions.header)
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  }
  // Actual affected production tab had this flag despite rendering the homepage.
  await header.evaluate((el) => el.setAttribute('data-home', 'false'))
  await verify()
  await header.getByRole('link', { name: 'Services', exact: true }).click()
  await expect(page).toHaveURL(`${base}/services`)
  await expect(header).toHaveCSS('position', 'relative')
  await expect(header).toHaveCSS('background-color', 'rgb(11, 11, 11)')
  await header.getByRole('link', { name: 'Dash 10 Studio home' }).click()
  await expect(page).toHaveURL(`${base}/`)
  await verify()
})

for (const width of [1440, 390]) {
  test(`contact prioritizes the unchanged form without the email CTA at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${base}/contact`)
    await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0)
    await expect(page.getByRole('form', { name: 'Project inquiry' })).toBeVisible()
    for (const label of ['Full name', 'Email address', 'Project details'])
      await expect(page.getByLabel(label, { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'SEND PROJECT INQUIRY' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
