import { test, expect } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3100'
const slugs = [
  'rebuild-website-or-fix-existing-site',
  'why-business-website-integrations-matter',
  'choosing-ecommerce-platform-for-growing-business',
]

test('approved published articles are discoverable while unpublished records remain private', async ({
  page,
}) => {
  const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text()
  await page.goto(`${base}/posts`)
  for (const slug of slugs) {
    expect((await page.request.get(`${base}/posts/${slug}`)).status()).toBe(200)
    const response = await page.request.get(
      `${base}/api/posts?where[slug][equals]=${slug}&draft=true`,
    )
    const result = await response.json()
    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]._status).toBe('published')
    expect(sitemap).toContain(slug)
    await expect(page.locator(`a[href="/posts/${slug}"]`).first()).toBeVisible()
  }
  const unpublished = await page.request.get(
    `${base}/api/posts?where[_status][equals]=draft&draft=true`,
  )
  expect((await unpublished.json()).docs).toEqual([])
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
