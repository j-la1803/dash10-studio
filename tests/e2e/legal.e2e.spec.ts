import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'

for (const width of [1440, 390, 320]) {
  test(`published legal policies are readable and discoverable at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const [path, title] of [
      ['/privacy', 'Privacy Policy'],
      ['/terms', 'Website Terms of Use'],
    ]) {
      const response = await page.goto(`${base}${path}`)
      const decline = page.getByRole('button', { name: 'Decline analytics', exact: true })
      if (await decline.isVisible()) await decline.click()
      expect(response?.status()).toBe(200)
      expect(response?.headers()['x-robots-tag'] || '').not.toMatch(/noindex/)
      await expect(page.locator('main h1')).toHaveText(title)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main article')).toHaveCount(1)
      await expect(page.locator('main time')).toHaveAttribute(
        'datetime',
        path === '/privacy' ? '2026-11-19' : '2026-11-18',
      )
      expect(await page.locator('main h2').count()).toBeGreaterThan(7)
      const email = path === '/terms' ? 'info@dash10studio.com' : 'justin@dash10.studio'
      await expect(page.locator(`main a[href="mailto:${email}"]`)).toHaveCount(1)
      expect(
        await page
          .locator('meta[name="robots"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') || '').join(' ')),
      ).not.toMatch(/noindex/)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://dash10studio.com${path}`,
      )
      expect(await page.locator('main').innerText()).not.toMatch(
        /OWNER REVIEW|\[OWNER|\[LEGAL|not been published/,
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const body = page.locator('.studio-post-reading')
      expect(
        await body.evaluate(
          (el) =>
            parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize),
        ),
      ).toBeGreaterThanOrEqual(1.7)
    }
    const footer = page.getByRole('navigation', { name: 'Footer utilities' })
    await footer.getByRole('link', { name: 'Privacy', exact: true }).click()
    await expect(page).toHaveURL(`${base}/privacy`)
    await footer.getByRole('link', { name: 'Terms', exact: true }).click()
    await expect(page).toHaveURL(`${base}/terms`)
    // Essential website features remain usable without optional tracking.
    const preferences = page.getByRole('button', { name: 'Analytics preferences', exact: true })
    await preferences.click()
    await expect(page.getByRole('button', { name: 'Allow analytics' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(preferences).toBeFocused()
  })
}

test('privacy facts match the current inactive integrations and stored-inquiry workflow', async ({
  page,
}) => {
  await page.goto(`${base}/privacy`)
  const text = await page.locator('main').innerText()
  for (const phrase of [
    'Payload',
    'Supabase',
    'Vercel',
    'Resend',
    'Google Analytics 4 is not active',
    'fixed automatic deletion period',
  ])
    expect(text.replace(/\s+/g, ' ')).toContain(phrase)
  await page.goto(`${base}/contact`)
  await expect(page.getByRole('form', { name: 'Project inquiry' })).toBeVisible()
  await expect(page.locator('.hs-form-frame')).toHaveCount(0)
  const xml = await (await page.request.get(`${base}/sitemap.xml`)).text()
  for (const path of ['/privacy', '/terms'])
    expect(xml).toContain(`https://dash10studio.com${path}</loc>`)
})
