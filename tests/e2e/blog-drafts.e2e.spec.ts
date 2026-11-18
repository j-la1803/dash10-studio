import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3100'
const slugs = [
  'rebuild-website-or-fix-existing-site',
  'why-business-website-integrations-matter',
  'choosing-ecommerce-platform-for-growing-business',
]

test('imported drafts stay out of public posts, APIs, search and sitemap', async ({ page }) => {
  const sitemap = await (await page.request.get(`${base}/posts-sitemap.xml`)).text()
  const search = await (await page.request.get(`${base}/api/search?limit=100`)).text()
  await page.goto(`${base}/posts`)
  for (const slug of slugs) {
    expect((await page.request.get(`${base}/posts/${slug}`)).status()).toBe(404)
    const response = await page.request.get(
      `${base}/api/posts?where[slug][equals]=${slug}&draft=true`,
    )
    expect((await response.json()).docs).toEqual([])
    expect(sitemap).not.toContain(slug)
    expect(search).not.toContain(slug)
    await expect(page.locator(`a[href="/posts/${slug}"]`)).toHaveCount(0)
  }
  for (const id of [2, 3, 4])
    expect((await page.request.get(`${base}/api/posts/${id}?draft=true`)).status()).toBe(404)
  const preview = await page.request.get(`${base}/next/preview?path=/posts/${slugs[0]}`, {
    maxRedirects: 0,
  })
  expect(preview.status()).toBe(403)
})

test('article service destinations exist without adding duplicate routes', async ({ page }) => {
  await page.goto(`${base}/services`)
  for (const anchor of ['web-development', 'support', 'integrations', 'ecommerce'])
    await expect(page.locator(`#${anchor}`)).toHaveCount(1)
  expect((await page.request.get(`${base}/contact`)).status()).toBe(200)
})
