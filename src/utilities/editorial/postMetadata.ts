import type { Metadata } from 'next'
import type { Post } from '@/payload-types'

export const postCanonical = (slug: string) =>
  `https://dash10studio.com/posts/${encodeURIComponent(slug)}`

export function postMetadata(post: Post, preview = false): Metadata {
  const canonical = postCanonical(post.slug)
  const image = post.meta?.image
  const imageURL =
    image && typeof image === 'object' && image.url
      ? new URL(image.url, 'https://dash10studio.com').href
      : undefined
  return {
    title: { absolute: post.meta?.title || post.title },
    description: post.meta?.description,
    alternates: { canonical },
    ...(preview ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'article',
      title: post.meta?.title || post.title,
      description: post.meta?.description || undefined,
      url: canonical,
      ...(imageURL ? { images: [{ url: imageURL }] } : {}),
    },
  }
}

export function postStructuredData(post: Post) {
  const authors = post.populatedAuthors?.filter((author) => Boolean(author.name))
  const categories = post.categories?.flatMap((category) =>
    typeof category === 'object' && category?.title ? [category.title] : [],
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || post.excerpt || undefined,
    url: postCanonical(post.slug),
    mainEntityOfPage: postCanonical(post.slug),
    ...(categories?.length ? { articleSection: categories } : {}),
    ...(authors?.length
      ? { author: authors.map((author) => ({ '@type': 'Person', name: author.name })) }
      : {}),
    ...(post._status === 'published' && post.publishedAt
      ? { datePublished: post.publishedAt }
      : {}),
    ...(post._status === 'published' && post.updatedAt ? { dateModified: post.updatedAt } : {}),
  }
}
export const serializeStructuredData = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c')
