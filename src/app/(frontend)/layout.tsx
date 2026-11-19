import type { Metadata } from 'next'

import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Analytics } from '@/components/Integrations/Analytics'
import { gtmContainer } from '@/utilities/integrations/config'
import { StudioFooter } from '@/components/Studio/Footer'
import { StudioHeader } from '@/components/Studio/Header'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { siteStructuredData } from '@/utilities/siteMetadata'
import { serializeStructuredData } from '@/utilities/editorial/postMetadata'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link
          rel="preload"
          as="font"
          href="/fonts/inter-semibold.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {isEnabled && <meta name="robots" content="noindex, nofollow" />}
        <link href="/favicon-32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeStructuredData(siteStructuredData) }}
          />
          <StudioHeader />
          {children}
          <StudioFooter />
          <Analytics containerId={gtmContainer(process.env)} />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
