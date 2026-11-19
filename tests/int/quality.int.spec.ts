import { describe, expect, it } from 'vitest'
import { sitemapEntries } from '@/utilities/sitemap'
import { siteMetadata, siteStructuredData } from '@/utilities/siteMetadata'

describe('canonical public discovery', () => {
  it('excludes internal/reserved page slugs, deduplicates routes and omits invented dates', () => {
    const entries = sitemapEntries(
      [
        { slug: 'home', updatedAt: '2026-01-01T12:00:00Z' },
        { slug: 'search' },
        { slug: 'privacy' },
        { slug: 'admin' },
        { slug: 'next/preview' },
        { slug: 'services' },
        { slug: 'guide', updatedAt: '2026-11-04T18:00:00Z' },
      ],
      [{ slug: 'useful-article', updatedAt: '2026-11-18T18:00:00Z' }],
    )
    expect(entries.filter((e) => e.url === 'https://dash10studio.com/services')).toHaveLength(1)
    expect(entries.some((e) => /\/(search|admin|next)(\/|$)/.test(e.url))).toBe(false)
    for (const path of ['privacy', 'terms'])
      expect(entries.filter((e) => e.url === `https://dash10studio.com/${path}`)).toHaveLength(1)
    expect(entries.find((e) => e.url === 'https://dash10studio.com/')?.lastModified).toBeUndefined()
    expect(entries.find((e) => e.url.endsWith('/guide'))?.lastModified).toBe('2026-11-04T18:00:00Z')
    expect(entries.find((e) => e.url.endsWith('/posts'))?.lastModified).toBe('2026-11-18T18:00:00Z')
    expect(entries.some((e) => e.url.endsWith('/posts/page/1'))).toBe(false)
  })
  it('uses production canonicals independent of query strings or preview hosts', () => {
    const metadata = siteMetadata('/services', 'Services', 'Real services')
    expect(metadata.alternates?.canonical).toBe('https://dash10studio.com/services')
    expect(siteStructuredData['@graph'].map((e) => e['@type'])).toEqual(['Organization', 'WebSite'])
    expect(JSON.stringify(siteStructuredData)).not.toMatch(/rating|review|award/i)
  })
})
