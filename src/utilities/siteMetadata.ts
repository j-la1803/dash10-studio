import type { Metadata } from 'next'
export const productionOrigin = 'https://dash10studio.com'
export function siteMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, productionOrigin).href
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Dash 10 Studio',
      title,
      description,
      url,
      images: [
        {
          url: `${productionOrigin}/images/dash10-mountain.webp`,
          width: 1717,
          height: 916,
          alt: 'Mountain landscape from the Dash 10 Studio homepage',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${productionOrigin}/images/dash10-mountain.webp`],
    },
  }
}
export const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${productionOrigin}/#organization`,
      name: 'Dash 10 Studio',
      url: productionOrigin,
      logo: `${productionOrigin}/brand/logo/dash10-wordmark-white.svg`,
    },
    {
      '@type': 'WebSite',
      '@id': `${productionOrigin}/#website`,
      name: 'Dash 10 Studio',
      url: productionOrigin,
      publisher: { '@id': `${productionOrigin}/#organization` },
    },
  ],
}
