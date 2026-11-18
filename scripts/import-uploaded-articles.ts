// Private input files/reports stay in Git-ignored content/drafts. Never publishes.
// Run NODE_ENV=production node --import=tsx scripts/import-uploaded-articles.ts [--apply].
import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { convertArticle } from '../src/utilities/editorial/markdown'
import { postCanonical } from '../src/utilities/editorial/postMetadata'
import type { Post } from '../src/payload-types'

if (process.env.NODE_ENV !== 'production')
  throw new Error('Production mode is required; automatic schema push is forbidden')
// Compare JSON values, not parser prototypes or PostgreSQL JSONB key ordering.
const jsonValue = (value: unknown) =>
  JSON.parse(
    JSON.stringify(value, function (key, item) {
      // Lexical assigns a fresh editor-only ID to each converted link. It is not article data.
      return key === 'id' && this?.type === 'link' ? undefined : item
    }),
  )
const equivalent = (a: unknown, b: unknown) => isDeepStrictEqual(jsonValue(a), jsonValue(b))
const directory = 'content/drafts/uploaded-2026-11-17'
const entries = [
  {
    id: 2,
    file: '01-rebuild-or-fix.md',
    oldSlug: 'when-to-rebuild-your-website-instead-of-fixing-it',
  },
  {
    id: 3,
    file: '02-website-systems-integration.md',
    oldSlug: 'why-your-website-systems-need-to-connect',
  },
  {
    id: 4,
    file: '03-choosing-ecommerce-platform.md',
    oldSlug: 'ecommerce-platform-for-growing-businesses',
  },
]
const backup: Post[] = JSON.parse(await readFile(`${directory}/before-import.json`, 'utf8'))
const sanitized = await config
const payload = await getPayload({ config: sanitized })
const report: unknown[] = []
try {
  const publishedBefore = await payload.find({
    collection: 'posts',
    draft: false,
    depth: 0,
    pagination: false,
    where: { _status: { equals: 'published' } },
  })
  const beforeCount = await payload.count({ collection: 'posts' })
  const prepared = []
  for (const entry of entries) {
    const article = convertArticle(
      await readFile(`${directory}/${entry.file}`, 'utf8'),
      sanitized,
      true,
    )
    const metadata = article.metadata
    const existing = await payload.findByID({
      collection: 'posts',
      id: entry.id,
      draft: true,
      depth: 0,
    })
    const original = backup.find((post) => post.id === entry.id)
    if (
      !original ||
      original._status !== 'draft' ||
      original.slug !== entry.oldSlug ||
      existing._status !== 'draft' ||
      ![entry.oldSlug, metadata.slug].includes(existing.slug)
    ) {
      throw new Error(`Draft identity/status guard failed: ${entry.id}`)
    }
    const collision = await payload.find({
      collection: 'posts',
      draft: true,
      depth: 0,
      where: { slug: { equals: metadata.slug } },
    })
    if (collision.docs.some((post) => post.id !== entry.id))
      throw new Error(`Slug collision: ${metadata.slug}`)
    const category = (
      await payload.find({
        collection: 'categories',
        depth: 0,
        where: { title: { equals: metadata.category } },
      })
    ).docs
    if (category.length !== 1)
      throw new Error(`Expected one existing category: ${metadata.category}`)
    const data = {
      title: metadata.title,
      slug: metadata.slug,
      generateSlug: false,
      excerpt: metadata.excerpt,
      content: article.content as Post['content'],
      categories: [category[0].id],
      meta: { ...existing.meta, title: metadata.seoTitle, description: metadata.metaDescription },
      publishedAt: null,
      _status: 'draft' as const,
    }
    const current = {
      title: existing.title,
      slug: existing.slug,
      generateSlug: existing.generateSlug,
      excerpt: existing.excerpt,
      content: existing.content,
      categories: existing.categories,
      meta: existing.meta,
      publishedAt: existing.publishedAt,
      _status: existing._status,
    }
    const changed = !equivalent(current, data)
    prepared.push({ entry, article, data, changed })
  }
  const apply = process.argv.includes('--apply')
  if (apply) {
    const transaction = await payload.db.beginTransaction()
    if (!transaction) throw new Error('A database transaction is required')
    const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)
    req.transactionID = transaction
    try {
      for (const { entry, data, changed } of prepared) {
        if (changed)
          await payload.update({ collection: 'posts', id: entry.id, draft: true, data, req })
        const saved = await payload.findByID({
          collection: 'posts',
          id: entry.id,
          draft: true,
          depth: 0,
          req,
        })
        if (
          saved._status !== 'draft' ||
          saved.slug !== data.slug ||
          saved.excerpt !== data.excerpt ||
          !equivalent(saved.content, data.content) ||
          saved.meta?.title !== data.meta.title ||
          saved.meta?.description !== data.meta.description
        ) {
          throw new Error(`Read-back verification failed: ${entry.id}`)
        }
      }
      await payload.db.commitTransaction(transaction)
    } catch (error) {
      await payload.db.rollbackTransaction(transaction)
      throw error
    }
  }
  for (const { entry, article, changed } of prepared) {
    report.push({
      id: entry.id,
      title: article.metadata.title,
      slug: article.metadata.slug,
      category: article.metadata.category,
      status: 'draft',
      action: apply
        ? changed
          ? 'updated existing draft'
          : 'unchanged'
        : changed
          ? 'would update'
          : 'unchanged',
      sourceHash: article.sourceHash,
      canonical: postCanonical(article.metadata.slug),
      originalCanonicalPath: article.metadata.canonicalPath,
      suggestedInternalLinks: article.metadata.suggestedInternalLinks,
      editor: `https://dash10studio.com/admin/collections/posts/${entry.id}`,
    })
  }
  const publishedAfter = await payload.find({
    collection: 'posts',
    draft: false,
    depth: 0,
    pagination: false,
    where: { _status: { equals: 'published' } },
  })
  if (!equivalent(publishedBefore.docs, publishedAfter.docs))
    throw new Error('Published post changed unexpectedly')
  if ((await payload.count({ collection: 'posts' })).totalDocs !== beforeCount.totalDocs)
    throw new Error('Post count changed unexpectedly')
  await writeFile(
    `${directory}/import-report.json`,
    JSON.stringify(
      {
        applied: apply,
        created: 0,
        updated: apply ? prepared.filter((item) => item.changed).length : 0,
        publishedUnchanged: true,
        records: report,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  )
  console.log(
    JSON.stringify(
      {
        applied: apply,
        created: 0,
        updated: apply ? prepared.filter((item) => item.changed).length : 0,
        publishedUnchanged: true,
        records: report,
      },
      null,
      2,
    ),
  )
} finally {
  await payload.destroy()
}
process.exit(0)
