import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3000'
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
]) {
  test(`brand grid and eight technology cells at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    const grid = page.locator('.platform-grid')
    await expect(grid.locator(':scope > div')).toHaveCount(8)
    await expect(grid).toContainText('Google Tag Manager')
    await expect(grid).toContainText('HubSpot')
    await expect(grid).toContainText('Payload CMS')
    const geometry = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const b = document.querySelector(selector)!.getBoundingClientRect()
        return { left: b.left, right: b.right }
      }
      return {
        hero: bounds('.dash-hero-content'),
        platform: bounds('.platform-grid'),
        stories: bounds('.studio-scene'),
        capabilities: bounds('.studio-capabilities'),
        valuesStart: bounds('.studio-values > div:first-child'),
        valuesEnd: bounds('.studio-values > div:last-child'),
        rail: bounds('.scene-progress-track'),
        footer: bounds('.footer-columns'),
        copy: bounds('.scene-copy'),
        intro: bounds('.capabilities-intro'),
        font: getComputedStyle(document.querySelector('h1')!).fontFamily,
        mono: getComputedStyle(document.querySelector('.footer-coordinates')!).fontFamily,
        cells: [...document.querySelectorAll('.platform-grid>div')].map(
          (el) => el.getBoundingClientRect().width,
        ),
      }
    })
    for (const part of [geometry.stories, geometry.capabilities, geometry.footer]) {
      expect(part.left).toBeCloseTo(geometry.hero.left, 0)
      expect(part.right).toBeCloseTo(geometry.hero.right, 0)
    }
    expect(geometry.platform.left).toBeCloseTo(0, 0)
    expect(geometry.platform.right).toBeCloseTo(
      await page.evaluate(() => document.documentElement.clientWidth),
      0,
    )
    expect(geometry.copy.left).toBeCloseTo(geometry.intro.left, 0)
    expect(Math.max(...geometry.cells) - Math.min(...geometry.cells)).toBeLessThan(1)
    expect(geometry.font).toContain('Inter')
    expect(geometry.mono).toContain('JetBrains Mono')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.locator('.studio-header img')).toHaveAttribute(
      'src',
      '/brand/logo/dash10-wordmark-white.svg',
    )
  })
}
test('unconfigured services stay inactive and drafts stay private', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (r) => requests.push(r.url()))
  await page.goto(`${base}/contact`)
  await expect(page.getByRole('button', { name: 'SEND PROJECT INQUIRY' })).toBeVisible()
  await expect(page.locator('.hs-form-frame')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Analytics preferences' })).toHaveCount(0)
  expect(
    requests.some((url) => /googletagmanager|google-analytics|hsforms|hubspot/.test(url)),
  ).toBe(false)
  for (const slug of [
    'when-to-rebuild-your-website-instead-of-fixing-it',
    'why-your-website-systems-need-to-connect',
    'ecommerce-platform-for-growing-businesses',
  ]) {
    const response = await page.request.get(
      `${base}/api/posts?where[slug][equals]=${slug}&draft=true`,
    )
    const result = await response.json()
    expect(result.docs).toEqual([])
    const route = await page.request.get(`${base}/posts/${slug}`)
    expect(route.status()).toBe(404)
  }
})
test('favicon uses the original unframed transparent black paths', async ({ page }) => {
  await page.goto(base)
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    '/favicon.svg',
  )
  const svg = await (await page.request.get(`${base}/favicon.svg`)).text()
  const original = await (
    await page.request.get(`${base}/brand/logo/dash10-monogram-black.svg`)
  ).text()
  expect(svg).not.toContain('<rect')
  expect(svg).not.toContain('<text')
  expect(svg).toContain('fill="#000000"')
  expect([...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])).toEqual(
    [...original.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
  )
  for (const asset of [
    'favicon.ico',
    'favicon-16.png',
    'favicon-32.png',
    'favicon-48.png',
    'apple-touch-icon.png',
  ])
    expect((await page.request.get(`${base}/${asset}`)).status()).toBe(200)
})
