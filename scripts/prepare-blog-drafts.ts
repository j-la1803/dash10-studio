// Requires private local content/drafts/ inputs, intentionally excluded from the public repository.
// Explicit, idempotent draft creation. Never publishes, updates existing posts, or migrates.
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import type { Post } from '../src/payload-types'

const entries: {
  file: string
  slug: string
  category: string
  metaTitle: string
  description: string
}[] = JSON.parse(await readFile('content/drafts/articles.json', 'utf8'))
const text = (value: string) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
})
function inline(value: string) {
  const children: unknown[] = []
  let previous = 0
  for (const match of value.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)) {
    if (match.index! > previous) children.push(text(value.slice(previous, match.index)))
    children.push({
      type: 'link',
      version: 3,
      format: '',
      indent: 0,
      direction: 'ltr',
      fields: { linkType: 'custom', url: match[2], newTab: false },
      children: [text(match[1])],
    })
    previous = match.index! + match[0].length
  }
  if (previous < value.length) children.push(text(value.slice(previous)))
  return children
}
const payload = await getPayload({ config })
try {
  for (const entry of entries) {
    const existing = await payload.find({
      collection: 'posts',
      draft: true,
      where: { slug: { equals: entry.slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length) {
      console.log(`Preserved existing post: ${entry.slug} (${existing.docs[0]._status})`)
      continue
    }
    const markdown = await readFile(`content/drafts/${entry.file}`, 'utf8')
    const [title, ...paragraphs] = markdown.trim().split(/\n\n+/)
    const content = {
      root: {
        type: 'root',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children: paragraphs.map((value) => ({
          type: value.startsWith('## ') ? 'heading' : 'paragraph',
          ...(value.startsWith('## ') ? { tag: 'h2' } : {}),
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          children: inline(value.replace(/^## /, '')),
        })),
      },
    } as Post['content']
    let category = (
      await payload.find({
        collection: 'categories',
        where: { title: { equals: entry.category } },
        limit: 1,
      })
    ).docs[0]
    if (!category)
      category = await payload.create({
        collection: 'categories',
        data: {
          title: entry.category,
          slug: entry.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      })
    const post = await payload.create({
      collection: 'posts',
      draft: true,
      context: { disableRevalidate: true },
      data: {
        title: title.replace(/^# /, ''),
        slug: entry.slug,
        content,
        categories: [category.id],
        meta: { title: entry.metaTitle, description: entry.description },
        _status: 'draft',
      },
    })
    const verified = await payload.findByID({
      collection: 'posts',
      id: post.id,
      draft: true,
      depth: 0,
    })
    if (verified._status !== 'draft') throw new Error(`Unexpected status: ${entry.slug}`)
    console.log(`Saved draft ${post.id}: ${entry.slug}`)
  }
} finally {
  await payload.destroy()
}
process.exit(0)
