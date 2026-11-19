import type { MetadataRoute } from 'next'
import { productionOrigin } from './siteMetadata'
export const publicRoutes = ['/', '/services', '/process', '/about', '/contact', '/posts']
const reserved = new Set([
  'home',
  'admin',
  'api',
  'next',
  'search',
  'privacy',
  'terms',
  'posts',
  'services',
  'process',
  'about',
  'contact',
])
type Entry = { slug?: string | null; updatedAt?: string | null }
export function sitemapEntries(pages: Entry[], posts: Entry[]): MetadataRoute.Sitemap {
  const urls = new Map<string, MetadataRoute.Sitemap[number]>()
  const add = (path: string, updated?: string | null) => {
    const entry: MetadataRoute.Sitemap[number] = { url: new URL(path, productionOrigin).href }
    if (updated && Number.isFinite(Date.parse(updated))) entry.lastModified = updated
    urls.set(entry.url, entry)
  }
  publicRoutes.forEach((path) => add(path))
  pages
    .filter((p) => p.slug && /^[a-z0-9-]+$/.test(p.slug) && !reserved.has(p.slug))
    .forEach((p) => add(`/${p.slug}`, p.updatedAt))
  posts
    .filter((p) => p.slug && !p.slug.includes('/'))
    .forEach((p) => add(`/posts/${encodeURIComponent(p.slug!)}`, p.updatedAt))
  const latest = posts
    .map((p) => p.updatedAt)
    .filter((d): d is string => Boolean(d) && Number.isFinite(Date.parse(d!)))
    .sort()
    .at(-1)
  if (latest) add('/posts', latest)
  for (let page = 2; page <= Math.ceil(posts.length / 12); page++)
    add(`/posts/page/${page}`, latest)
  return [...urls.values()]
}
