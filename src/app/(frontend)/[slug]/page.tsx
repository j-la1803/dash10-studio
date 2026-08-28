import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import { VideoHero } from '@/components/VideoHero'
import { FeatureGrid } from '@/components/FeatureGrid'
import { Accordion } from '@/components/Accordion'
import { SplitContent } from '@/components/SplitContent'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise

  if (slug === 'home') {
    return (
      <>
        <VideoHero
          eyebrow="LOREM IPSUM"
          lines={['Lorem', 'Ipsum', 'Dolor Sit', 'Amet.']}
          video="/videos/dash-10-video-bg-slowed.mp4"
          playbackRate={0.5}
        />

        <FeatureGrid
          eyebrow="LOREM IPSUM"
          heading="Dolor sit amet consectetur."
          features={[
            {
              title: 'Lorem Ipsum',
              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            },
            {
              title: 'Dolor Sit',
              text: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            },
            {
              title: 'Consectetur',
              text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
            },
          ]}
        />

        <Accordion
          eyebrow="LOREM IPSUM"
          heading="Consectetur adipiscing elit."
          items={[
            {
              title: 'Lorem ipsum dolor sit amet',
              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.',
            },
            {
              title: 'Consectetur adipiscing elit',
              text: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            },
            {
              title: 'Ut enim ad minim veniam',
              text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
            },
          ]}
        />
        <SplitContent
          eyebrow="LOREM IPSUM"
          heading="Dolor sit amet consectetur."
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          image="https://picsum.photos/800/500"
        />
        <SplitContent
          eyebrow="LOREM IPSUM"
          heading="Consectetur adipiscing elit."
          text="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          image="https://picsum.photos/800/500"
          reverse
        />
      </>
    )
  }

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
