import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sitemapEntries } from '@/utilities/sitemap'
const publicContent = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const options = {
      overrideAccess: false,
      draft: false,
      depth: 0,
      pagination: false,
      limit: 1000,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    } as const
    const [pages, posts] = await Promise.all([
      payload.find({ collection: 'pages', ...options }),
      payload.find({ collection: 'posts', ...options }),
    ])
    return sitemapEntries(pages.docs, posts.docs)
  },
  ['canonical-public-sitemap-v2'],
  { tags: ['pages-sitemap', 'posts-sitemap'], revalidate: 600 },
)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return publicContent()
}
