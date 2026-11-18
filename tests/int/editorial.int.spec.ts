import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { render, cleanup } from '@testing-library/react'
import { Card } from '@/components/Card'
vi.mock('@/utilities/useClickableCard', () => ({
  default: () => ({ card: { ref: { current: null } }, link: { ref: { current: null } } }),
}))
import config from '@/payload.config'
import { convertArticle, parseArticle } from '@/utilities/editorial/markdown'
import {
  postMetadata,
  postStructuredData,
  serializeStructuredData,
} from '@/utilities/editorial/postMetadata'
import type { Post } from '@/payload-types'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
const source = `---
title: "Example article"
slug: "example-article"
status: draft
category: "Web Development"
excerpt: "A supplied editorial excerpt."
seoTitle: "A supplied SEO title"
metaDescription: "A supplied SEO description."
canonicalPath: "/blog/example-article"
suggestedInternalLinks:
  - "/services/web-development"
---
# Example article

**Direct answer:** Keep the *provided* words and an inline \`identifier\`.

## Compare options

1. First option
2. Second option

- A supporting point
- Another supporting point

| Option | Result |
| --- | --- |
| Repair | Retain |

[Read the service](/services/web-development).
`

describe('editorial import', () => {
  it('requires supplied metadata and refuses duplicate fields or changed H1', () => {
    expect(parseArticle(source).metadata.excerpt).toBe('A supplied editorial excerpt.')
    expect(() => parseArticle(source.replace('seoTitle:', 'missing:'))).toThrow(
      'Missing metadata: seoTitle',
    )
    expect(() => parseArticle(source.replace('status: draft', 'status: published'))).toThrow(
      'Expected draft',
    )
    expect(() => parseArticle(source.replace('# Example article', '# Changed title'))).toThrow(
      'H1 must match',
    )
  })
  it('preserves real rich-text nodes and changes only approved link destinations', async () => {
    const sanitized = await config
    const original = convertArticle(source, sanitized)
    const approved = convertArticle(source, sanitized, true)
    expect(JSON.stringify(original.content)).toContain('/services/web-development')
    expect(JSON.stringify(approved.content)).toContain('/services#web-development')
    const types: string[] = []
    function walk(node: { type: string; children?: unknown[] }) {
      types.push(node.type)
      node.children?.forEach((child) => walk(child as Parameters<typeof walk>[0]))
    }
    walk(approved.content.root)
    const html = convertLexicalToHTML({ data: approved.content })
    expect(html).toContain('<strong>Direct answer:</strong>')
    expect(html).toContain('<em>provided</em>')
    expect(html).toContain('<code>identifier</code>')
    expect(types).toEqual(
      expect.arrayContaining([
        'heading',
        'paragraph',
        'list',
        'listitem',
        'table',
        'tablerow',
        'tablecell',
        'link',
      ]),
    )
    expect(JSON.stringify(approved.content)).toContain('"tag":"h2"')
    expect(JSON.stringify(approved.content)).not.toContain('"tag":"h1"')
    expect(() => convertArticle(source + '\n```js\nconst x = 1\n```', sanitized)).toThrow(
      'Fenced code',
    )
  })
  it('uses exact SEO copy, canonical production URLs and no invented author or date', () => {
    const post = {
      title: 'Example article',
      slug: 'example-article',
      excerpt: 'Excerpt',
      meta: { title: 'Exact SEO | Dash 10', description: 'Exact description' },
      _status: 'draft',
      updatedAt: '2026-11-17T00:00:00Z',
    } as Post
    const metadata = postMetadata(post, true)
    expect(metadata.title).toEqual({ absolute: 'Exact SEO | Dash 10' })
    expect(metadata.alternates?.canonical).toBe('https://dash10studio.com/posts/example-article')
    expect(metadata.robots).toEqual({ index: false, follow: false })
    const schema = postStructuredData(post)
    expect(schema['@type']).toBe('BlogPosting')
    expect(schema).not.toHaveProperty('author')
    expect(schema).not.toHaveProperty('datePublished')
    expect(schema).not.toHaveProperty('dateModified')
    expect(serializeStructuredData({ headline: '</script>' })).not.toContain('</script>')
  })
})

it('blog cards render the supplied title, category and excerpt rather than the SEO description', () => {
  const view = render(
    createElement(Card, {
      relationTo: 'posts',
      showCategories: true,
      doc: {
        title: 'An article title',
        slug: 'an-article',
        excerpt: 'The editorial excerpt.',
        categories: [
          {
            id: 1,
            title: 'Web Development',
            slug: 'web-development',
            updatedAt: '',
            createdAt: '',
          },
        ],
        meta: { description: 'A different SEO description.' },
      },
    }),
  )
  expect(view.getByRole('link', { name: 'An article title' }).getAttribute('href')).toBe(
    '/posts/an-article',
  )
  expect(view.getByText('Web Development')).toBeTruthy()
  expect(view.getByText('The editorial excerpt.')).toBeTruthy()
  expect(view.queryByText('A different SEO description.')).toBeNull()
  expect(view.queryByText('No image')).toBeNull()
  cleanup()
})
