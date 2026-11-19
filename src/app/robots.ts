import type { MetadataRoute } from 'next'
import { productionOrigin } from '@/utilities/siteMetadata'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/media/file/'],
      disallow: ['/admin', '/api/', '/next/', '/search'],
    },
    sitemap: `${productionOrigin}/sitemap.xml`,
  }
}
