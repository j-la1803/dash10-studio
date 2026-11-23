import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'
for (const width of [390, 1440]) {
  test(`approved navigation, CMS articles and form validation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.addInitScript(() => localStorage.setItem('dash10-analytics-consent-v1', 'deny'))
    await page.goto(base)
    await expect(page.locator('.poster')).toHaveCount(4)
    await expect(page.locator('.caps details').first()).toHaveAttribute('open', '')
    if (width < 900) {
      const menu = page.locator('#menuBtn')
      await menu.click()
      await expect(menu).toHaveAttribute('aria-expanded', 'true')
      await expect(menu).toHaveAccessibleName('Close menu')
      await expect(page.locator('#sheet')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(menu).toHaveAttribute('aria-expanded', 'false')
      await expect(menu).toBeFocused()
      await expect(page.locator('#sheet')).toBeHidden()
      await expect(page.locator('video')).toHaveCount(0)
      await menu.click()
      await page.locator('#sheet').getByRole('link', { name: 'Services', exact: true }).click()
    } else
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Services', exact: true })
        .click()
    await expect(page).toHaveURL(base + '/services')
    for (const id of ['ecommerce', 'integrations', 'support', 'web-development'])
      await expect(page.locator('#' + id)).toHaveCount(1)
    await page.locator('footer').getByRole('link', { name: 'Blog', exact: true }).click()
    await expect(page).toHaveURL(base + '/blog')
    const article = page.locator('.article-list-item h2 a').first()
    const title = await article.innerText(),
      href = await article.getAttribute('href')
    await article.click()
    await expect(page).toHaveURL(base + href)
    await expect(page.locator('h1')).toHaveText(title)
    await expect(page.locator('.article-reading p').first()).not.toBeEmpty()
    await expect(page.locator('.article-meta time')).toHaveAttribute('datetime', /.+/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://dash10studio.com' + href,
    )
    const structured = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(
      structured.some((s) => s.includes('BlogPosting') && s.includes(title.replaceAll('"', '\\"'))),
    ).toBe(true)
    await page.locator('footer').getByRole('link', { name: 'Contact', exact: true }).first().click()
    await page.locator('#cName').fill('Design QA')
    await page.locator('#cEmail').fill('qa@example.com')
    await page.locator('#cMsg').fill('short')
    expect(
      await page.locator('#cMsg').evaluate((e: HTMLTextAreaElement) => e.checkValidity()),
    ).toBe(false)
    await page.locator('#cMsg').fill('This synthetic validation check must not create an inquiry.')
    await page.locator('#contact-check').fill('bot', { force: true })
    await page.locator('#contactForm button[type="submit"]').click()
    await expect(page.locator('#contactForm').getByRole('alert')).toBeVisible()
    await expect(page.locator('#cName')).toHaveValue('Design QA')
    await expect(page.locator('#contactForm').getByRole('alert')).toBeFocused()
    expect(await page.locator('#dash-gtm').count()).toBe(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(errors).toEqual([])
  })
}
test('consent, Next.js page views and CTA events retain one pipeline', async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort())
  await page.goto(base)
  await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
  await expect(page.locator('#dash-gtm')).toHaveCount(0)
  await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click()
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click()
  await expect(page.locator('#dash-gtm')).toHaveCount(1)
  const count = () =>
    page.evaluate(
      () =>
        (window.dataLayer || []).filter(
          (x) => !!x && typeof x === 'object' && 'event' in x && x.event === 'page_view',
        ).length,
    )
  await expect.poll(count).toBe(1)
  await page.locator('footer').getByRole('link', { name: 'About', exact: true }).click()
  await expect.poll(count).toBe(2)
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: /Let's Talk/i })
    .click()
  await expect.poll(count).toBe(3)
  expect(
    await page.evaluate(() =>
      (window.dataLayer || []).some(
        (x) => !!x && typeof x === 'object' && 'event' in x && x.event === 'project_inquiry',
      ),
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click()
  await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
  await expect(page.locator('#dash-gtm')).toHaveCount(0)
})
