import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'
for (const width of [1440, 390]) {
  test(`consent and safe application measurement at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    // Test application behavior independently of Google's availability; no synthetic GA hits.
    await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort())
    await page.goto(base)
    expect(await page.locator('#dash-gtm').count()).toBe(0)
    await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
    await page.locator('footer a.studio-cta[href="/contact"]').click()
    expect(await page.locator('#dash-gtm').count()).toBe(0)
    await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click()
    await page.getByRole('button', { name: 'Allow analytics', exact: true }).click()
    await expect(page.locator('#dash-gtm')).toHaveCount(1)
    const events = () =>
      page.evaluate(() =>
        (window.dataLayer || []).filter(
          (x): x is Record<string, unknown> => !!x && typeof x === 'object' && 'event' in x,
        ),
      )
    expect((await events()).filter((e) => e.event === 'page_view')).toHaveLength(1)
    await page.locator('footer').getByRole('link', { name: 'About', exact: true }).click()
    await expect
      .poll(async () => (await events()).filter((e) => e.event === 'page_view').length)
      .toBe(2)
    await page.goBack()
    await expect
      .poll(async () => (await events()).filter((e) => e.event === 'page_view').length)
      .toBe(3)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect
      .poll(async () => (await events()).filter((e) => e.event === 'scroll').length)
      .toBeGreaterThanOrEqual(1)
    const scrollCount = (await events()).filter((e) => e.event === 'scroll').length
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    expect((await events()).filter((e) => e.event === 'scroll')).toHaveLength(scrollCount)
    await page.locator('footer').getByRole('link', { name: 'Privacy', exact: true }).click()
    await page.evaluate(() =>
      document.addEventListener('click', (e) => {
        if ((e.target as Element).closest('a[href^="https://policies.google.com"]'))
          e.preventDefault()
      }),
    )
    await page.locator('main a[href="https://policies.google.com/privacy"]').click()
    await expect
      .poll(async () => (await events()).filter((e) => e.event === 'outbound_click').length)
      .toBe(1)
    expect((await events()).find((e) => e.event === 'outbound_click')).toMatchObject({
      destination_id: 'google_privacy',
      form_provider: null,
    })
    await page.reload()
    await expect(page.locator('#dash-gtm')).toHaveCount(1)
    await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click()
    await page.getByRole('button', { name: 'Decline analytics', exact: true }).click()
    await expect(page.locator('#dash-gtm')).toHaveCount(0)
  })
  for (const signal of ['globalPrivacyControl', 'doNotTrack']) {
    test(`${signal} overrides saved acceptance at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript((signal) => {
        localStorage.setItem('dash10-analytics-consent-v1', 'allow')
        Object.defineProperty(navigator, signal, {
          value: signal === 'globalPrivacyControl' ? true : '1',
          configurable: true,
        })
      }, signal)
      const googleRequests: string[] = []
      page.on('request', (r) => {
        if (/googletagmanager\.com|google-analytics\.com/.test(r.url()))
          googleRequests.push(r.url())
      })
      await page.goto(`${base}/contact`)
      await page.getByRole('button', { name: 'Analytics preferences', exact: true }).click()
      await expect(
        page.getByText('Your browser’s privacy signal disables analytics.', { exact: false }),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Allow analytics', exact: true })).toHaveCount(
        0,
      )
      expect(googleRequests).toHaveLength(0)
      await expect(page.locator('#dash-gtm')).toHaveCount(0)
    })
  }
}
