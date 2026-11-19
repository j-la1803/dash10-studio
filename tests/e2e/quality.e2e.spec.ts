import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'
const paths = ['/', '/services', '/process', '/about', '/contact', '/posts']

test('canonical metadata, semantic server HTML, reflow and public policies', async ({
  page,
}) => {
  const titles = new Set<string>()
  for (const path of [...paths, '/privacy', '/terms', '/search']) {
    const response = await page.goto(`${base}${path}?audit=metadata`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await response!.text()).toContain('<h1')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://dash10studio.com${path === '/' ? '' : path}`,
    )
    const title = await page.title()
    expect(titles.has(title)).toBe(false)
    titles.add(title)
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy()
    if (path === '/search')
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    if (path === '/privacy' || path === '/terms') {
      await expect(page.getByText('OWNER REVIEW PENDING')).toHaveCount(0)
      expect(
        await page
          .locator('meta[name="robots"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') || '').join(' ')),
      ).not.toMatch(/noindex/)
    }
    await page.setViewportSize({ width: 320, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.addStyleTag({ content: 'html {font-size: 200% !important} ' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('native sitemap, redirects, robots and security headers', async ({ page, request }) => {
  const sitemap = await request.get(`${base}/sitemap.xml`)
  expect(sitemap.status()).toBe(200)
  const xml = await sitemap.text()
  await page.goto(base)
  const entries = await page.evaluate((text) => {
    const doc = new DOMParser().parseFromString(text, 'application/xml')
    return {
      invalid: Boolean(doc.querySelector('parsererror')),
      urls: [...doc.querySelectorAll('loc')].map((e) => e.textContent!),
    }
  }, xml)
  expect(entries.invalid).toBe(false)
  expect(new Set(entries.urls).size).toBe(entries.urls.length)
  for (const path of paths) expect(entries.urls).toContain(`https://dash10studio.com${path}`)
  for (const path of ['/privacy', '/terms'])
    expect(entries.urls).toContain(`https://dash10studio.com${path}`)
  const published = await (await request.get(`${base}/api/posts?limit=100`)).json()
  expect(entries.urls.filter((url) => url.includes('/posts/'))).toHaveLength(published.totalDocs)
  expect(xml).not.toMatch(/\/admin|\/next\/|\/search|\/posts\/page\/1</)
  const robots = await (await request.get(`${base}/robots.txt`)).text()
  expect(robots).toContain('Sitemap: https://dash10studio.com/sitemap.xml')
  expect(robots).not.toMatch(/Disallow:.*(_next|images|fonts)/)
  for (const [from, to] of [
    ['/home', '/'],
    ['/posts/page/1', '/posts'],
    ['/pages-sitemap.xml', '/sitemap.xml'],
    ['/posts-sitemap.xml', '/sitemap.xml'],
  ]) {
    const response = await request.get(base + from, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(new URL(response.headers().location, base).pathname).toBe(to)
  }
  const response = await request.get(base)
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect((await request.get(`${base}/admin`)).headers()['x-robots-tag']).toContain('noindex')
  expect((await request.get(`${base}/api/form-submissions`)).status()).toBe(403)
  const drafts = await (
    await request.get(`${base}/api/posts?where[_status][equals]=draft&draft=true`)
  ).json()
  expect(drafts.docs).toEqual([])
  expect((await request.get(`${base}/next/preview`)).status()).toBe(403)
})

for (const width of [1440, 390])
  test(`footer utilities, keyboard consent focus and persistent motion controls at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    await page.getByRole('button', { name: 'Decline analytics' }).click()
    const footer = page.locator('.footer-bottom')
    for (const name of ['Privacy', 'Terms', 'Sitemap'])
      await expect(footer.getByRole('link', { name, exact: true })).toBeVisible()
    const preference = footer.getByRole('button', { name: 'Analytics preferences', exact: true })
    expect((await preference.boundingBox())!.width).toBeLessThan(180)
    await preference.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Allow analytics' })).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(preference).toBeFocused()
    await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
    await page.mouse.move(0, 0)
    await expect(page.locator('.platform-track')).toHaveCSS('animation-play-state', 'paused')
    await page.getByRole('button', { name: 'Resume motion', exact: true }).click()
    await page.mouse.move(0, 0)
    // Focus also pauses; move focus off the marquee control to exercise resumed motion.
    await page.locator('.skip-link').focus()
    await expect(page.locator('.platform-track')).toHaveCSS('animation-play-state', 'running')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.getByRole('button', { name: 'Pause motion', exact: true })).toBeHidden()
  })
