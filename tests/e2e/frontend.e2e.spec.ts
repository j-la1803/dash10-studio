import { test, expect } from '@playwright/test'

test('homepage has the approved content and working service links', async ({ page }) => {
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await expect(page).toHaveTitle(/Dash 10 Studio/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'THE RIGHT TECHNOLOGY. BUILT THE RIGHT WAY.',
  )
  await expect(page.locator('.platform-grid:not([aria-hidden]) > div')).toHaveCount(8)
  await expect(page.locator('.studio-scene')).toHaveCount(4)
  await page.getByRole('link', { name: 'EXPLORE SERVICES' }).click()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.getByRole('heading', { name: 'Systems & integrations' })).toBeVisible()
})

test('mobile navigation opens, closes with Escape, and reaches the process page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  const menu = page.locator('.menu-toggle')
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Services' })
    .focus()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await menu.click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Process' })
    .click()
  await expect(page).toHaveURL(/\/process$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('reduced motion pauses the mountain video and disables sticky scenes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await expect(page.locator('video')).toBeHidden()
  await expect(page.locator('.scene-sticky').first()).toHaveCSS('position', 'relative')
})

test('all header, footer, and scene links reach their destinations', async ({ page }) => {
  const base = process.env.QA_BASE_URL || 'http://localhost:3000'
  await page.goto(base)
  const hrefs = await page
    .locator('.studio-header nav a, .studio-footer a, .studio-scene a')
    .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')!))])
  for (const href of hrefs) {
    if (href.startsWith('mailto:')) {
      expect(href).toBe('mailto:justin@dash10.studio')
      continue
    }
    const response = await page.request.get(`${base}${href}`)
    expect(response?.status(), href).toBe(200)
    if (href === '/sitemap.xml') {
      expect(response.headers()['content-type']).toContain('xml')
      continue
    }
    await page.goto(`${base}${href}`)
    await expect(page.locator('#main-content')).toHaveCount(1)
    if (href.includes('#')) await expect(page.locator(`#${href.split('#')[1]}`)).toBeInViewport()
  }
})

test('desktop exposes four normal-flow sections and native progress links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await expect(page.locator('.studio-scenes')).toHaveAttribute('data-flow', 'true')
  await expect(page.locator('.studio-scene:visible')).toHaveCount(4)
  await expect(page.locator('.story-panel[inert]')).toHaveCount(0)
  await page.getByRole('link', { name: '04: Build, fix, connect' }).click()
  await expect(page).toHaveURL(/#story-step-4$/)
  await expect(page.locator('.studio-scenes')).toHaveAttribute('data-active-scene', '4')
})

test('header and footer use the approved wordmark and the D10 has no frame', async ({ page }) => {
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await expect(page.locator('.studio-header img')).toHaveAttribute(
    'src',
    '/brand/logo/dash10-wordmark-white.svg',
  )
  await expect(page.locator('.footer-studio img')).toHaveAttribute(
    'src',
    '/brand/logo/dash10-wordmark-white.svg',
  )
  const src = await page.locator('.footer-monogram').getAttribute('src')
  const svg = await (await page.request.get(new URL(src!, page.url()).href)).text()
  expect(svg).not.toContain('<rect')
  expect(svg).toContain('D10 monogram')
})

test('contact validates, stores an inquiry, prevents bypass and protects private submissions', async ({
  page,
}) => {
  const base = process.env.QA_BASE_URL || 'http://localhost:3000'
  const marker = process.env.QA_INQUIRY_MARKER || `qa-${Date.now()}`
  await page.goto(`${base}/contact`)
  await expect(
    page.locator('main').getByRole('link', { name: 'justin@dash10.studio' }),
  ).toHaveAttribute('href', /mailto:justin@dash10.studio/)
  await page.getByLabel('Your name', { exact: true }).fill('Dash 10 QA')
  await page.getByLabel('Email address', { exact: true }).fill(`${marker}@example.com`)
  await page.getByLabel('Tell us about your project').fill('short')
  await page.locator('form').evaluate((form) => {
    form.setAttribute('novalidate', '')
  })
  await page.getByRole('button', { name: 'SEND PROJECT INQUIRY' }).click()
  await expect(page.locator('.inquiry-panel').getByRole('alert')).toContainText('20 and 5,000')
  await page.getByLabel('Your name', { exact: true }).fill('Dash 10 QA')
  await page.getByLabel('Email address', { exact: true }).fill(`${marker}@example.com`)
  await page
    .getByLabel('Tell us about your project')
    .fill(`QA verification only. Please ignore this test inquiry. Reference: ${marker}`)
  await page.getByRole('button', { name: 'SEND PROJECT INQUIRY' }).click()
  await expect(page.locator('.inquiry-panel').getByRole('status')).toContainText(
    'Your inquiry has been saved',
    {
      timeout: 20000,
    },
  )
  const privateResponse = await page.request.get(`${base}/api/form-submissions`)
  expect(privateResponse.status()).toBe(403)
  const forms = await (
    await page.request.get(
      `${base}/api/forms?where[title][equals]=Dash%2010%20Studio%20project%20inquiries&depth=0`,
    )
  ).json()
  expect(forms.docs).toHaveLength(1)
  const bypass = await page.request.post(`${base}/api/form-submissions`, {
    data: {
      form: forms.docs[0].id,
      submissionData: [{ field: 'email', value: 'bypass@example.com' }],
    },
  })
  expect(bypass.status()).toBe(403)
  await page.reload()
  await page.getByLabel('Your name', { exact: true }).fill('Dash 10 QA')
  await page.getByLabel('Email address', { exact: true }).fill(`${marker}@example.com`)
  await page
    .getByLabel('Tell us about your project')
    .fill(`QA duplicate check for ${marker}. No new inquiry should be saved.`)
  await page.getByRole('button', { name: 'SEND PROJECT INQUIRY' }).click()
  await expect(page.locator('.inquiry-panel').getByRole('alert')).toContainText('wait a minute')
})

test('contact shows a useful error when the server cannot be reached', async ({ page }) => {
  await page.goto(`${process.env.QA_BASE_URL || 'http://localhost:3000'}/contact`)
  await page.getByLabel('Your name', { exact: true }).fill('Dash 10 QA')
  await page.getByLabel('Email address', { exact: true }).fill('offline@example.com')
  await page
    .getByLabel('Tell us about your project')
    .fill('QA network failure test; this should never reach the server.')
  await page.route('**/contact', (route) =>
    route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
  )
  await page.getByRole('button', { name: 'SEND PROJECT INQUIRY' }).click()
  await expect(page.locator('.inquiry-panel').getByRole('alert')).toContainText(
    'couldn’t save your inquiry',
  )
})

test('mountain video plays normally and capability answers work with a keyboard', async ({
  page,
}) => {
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  const video = page.locator('video')
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).readyState))
    .toBeGreaterThanOrEqual(2)
  const initialTime = await video.evaluate((v) => (v as HTMLVideoElement).currentTime)
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeGreaterThan(initialTime + 0.2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => video.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true)
  const summary = page.locator('.capabilities-list summary').first()
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.capabilities-list details').first()).toHaveAttribute('open', '')
  await page.keyboard.press('Enter')
  await expect(page.locator('.capabilities-list details').first()).not.toHaveAttribute('open', '')
})
