// Local-only QA uses this build's private Next draft-mode cookie. Never usable on production.
import { readFile, mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
const base = 'http://localhost:3100'
const directory = 'content/drafts/uploaded-2026-11-17'
const manifest = JSON.parse(await readFile('.next/prerender-manifest.json', 'utf8'))
const report = JSON.parse(await readFile(`${directory}/import-report.json`, 'utf8'))
await mkdir('/tmp/dash10-article-review', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addCookies([{ name: '__prerender_bypass', value: manifest.preview.previewModeId, url: base }])
    for (const [index, post] of report.records.entries()) {
      const page = await context.newPage()
      const response = await page.goto(`${base}/posts/${post.slug}`)
      if (response.status() !== 200) throw new Error(`Preview failed: ${post.id}`)
      await page.evaluate(() => document.fonts.ready)
      if (await page.locator('h1').count() !== 1 || await page.locator('h1').innerText() !== post.title) throw new Error('Incorrect H1')
      const source = await readFile(`${directory}/${['01-rebuild-or-fix.md', '02-website-systems-integration.md', '03-choosing-ecommerce-platform.md'][index]}`, 'utf8')
      const metadata = Object.fromEntries([...source.matchAll(/^(title|excerpt|seoTitle|metaDescription): (".*")$/gm)].map((match) => [match[1], JSON.parse(match[2])]))
      if (await page.title() !== metadata.seoTitle) throw new Error('SEO title changed')
      if (await page.locator('meta[name="description"]').getAttribute('content') !== metadata.metaDescription) throw new Error('SEO description changed')
      if (await page.locator('.studio-post-excerpt').innerText() !== metadata.excerpt) throw new Error('Excerpt changed')
      if (await page.locator('link[rel="canonical"]').getAttribute('href') !== post.canonical) throw new Error('Incorrect canonical')
      if (!(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex')) throw new Error('Preview is indexable')
      const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
      if (schema['@type'] !== 'BlogPosting' || schema.headline !== post.title || schema.author || schema.datePublished || schema.dateModified) throw new Error('Unverified structured data')
      const body = source.split(/^# .+$/m)[1].trim()
      const words = (value) => value.match(/[\p{L}\p{N}]+/gu)
      const expected = body.split('\n').filter((line) => !/^\|[\s:|-]+\|$/.test(line.trim()) && !/^---$/.test(line.trim())).map((line) => line.replace(/^\d+\. /, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')).join(' ')
      if (JSON.stringify(words(await page.locator('.studio-post-reading').innerText())) !== JSON.stringify(words(expected))) throw new Error('Rendered prose changed')
      const tables = await page.locator('.studio-post-reading table').count()
      if (tables !== [1, 0, 1][index]) throw new Error('Missing table')
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Page overflow')
      await page.screenshot({ path: `/tmp/dash10-article-review/post-${post.id}-${width}.png`, fullPage: true })
      console.log({ id: post.id, width, tables, exactRenderedWords: true, metadata: true, noindex: true })
      await page.close()
    }
    await context.close()
  }
} finally { await browser.close() }
