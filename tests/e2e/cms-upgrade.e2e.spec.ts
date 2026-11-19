import { expect, test } from '@playwright/test'
const base = process.env.QA_BASE_URL || 'http://localhost:3102'
type Node = { type: string; text?: string; tag?: string; children?: Node[] }
const flatten = (node: Node): Node[] => [node, ...(node.children?.flatMap(flatten) || [])]
const words = (value: string) => value.match(/[\p{L}\p{N}]+/gu)
for (const width of [1440, 390]) {
  test(`upgraded CMS preserves published article rendering at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const id of [2, 3, 4]) {
      const response = await page.request.get(`${base}/api/posts/${id}?depth=0`)
      expect(response.status()).toBe(200)
      const post = await response.json()
      expect(post._status).toBe('published')
      const nodes = flatten(post.content.root)
      await page.goto(`${base}/posts/${post.slug}`)
      await expect(page.locator('h1')).toHaveText(post.title)
      await expect(page).toHaveTitle(post.meta.title)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        post.meta.description,
      )
      await expect(page.locator('.studio-post-excerpt')).toHaveText(post.excerpt)
      const body = page.locator('.studio-post-reading')
      expect(words(await body.innerText())).toEqual(
        words(
          nodes
            .filter((node) => node.text !== undefined)
            .map((node) => node.text)
            .join(' '),
        ),
      )
      await expect(body.locator('table')).toHaveCount(
        nodes.filter((node) => node.type === 'table').length,
      )
      await expect(body.locator('h2, h3, h4')).toHaveCount(
        nodes.filter((node) => node.type === 'heading').length,
      )
      const schema = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').last().textContent()) || '{}',
      )
      expect(schema.datePublished).toBe(post.publishedAt)
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      )
    }
  })
}
