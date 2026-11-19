import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'
for (const width of [1440, 390, 320]) {
  test(`agency form has six accessible fields and no extra sales fields at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${base}/contact`)
    await page.getByRole('button', { name: 'Decline analytics' }).click()
    const form = page.getByRole('form', { name: 'Project inquiry' })
    for (const label of [
      'Full name',
      'Email address',
      'Company / Agency (optional)',
      'Website URL (optional)',
      'Service needed',
      'Project details',
    ])
      await expect(form.getByLabel(label, { exact: true })).toBeVisible()
    const select = form.getByLabel('Service needed', { exact: true })
    await expect(select).toHaveAttribute('required', '')
    await expect(select.locator('option')).toHaveCount(7)
    await select.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    expect(await select.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
    const html = await page.content()
    for (const recipient of (process.env.CONTACT_NOTIFICATION_TO || '').split(',').filter(Boolean))
      expect(html).not.toContain(recipient)
    expect(await form.innerText()).not.toMatch(/phone|timeline|budget/i)
    await expect(form.locator('.inquiry-honeypot')).toHaveAttribute('aria-hidden', 'true')
    await expect(form.locator('.inquiry-honeypot')).toHaveCSS('clip-path', 'inset(50%)')
    await expect(form.locator('input[name="contact_check"]')).toHaveAttribute('tabindex', '-1')
    await expect(page.locator('.hs-form-frame')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
