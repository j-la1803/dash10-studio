import { createHash } from 'node:crypto'
import { convertMarkdownToLexical, type LexicalRichTextAdapter } from '@payloadcms/richtext-lexical'
import type { Field, SanitizedConfig } from 'payload'

export type ArticleMetadata = {
  title: string
  slug: string
  status: 'draft'
  category: string
  excerpt: string
  seoTitle: string
  metaDescription: string
  canonicalPath: string
  suggestedInternalLinks: string[]
  primaryTopic?: string
  searchIntent?: string
  editorialStatus?: string
}
export const serviceDestinations: Record<string, string> = {
  '/services/web-development': '/services#web-development',
  '/services/technical-support': '/services#support',
  '/services/integrations': '/services#integrations',
  '/services/ecommerce': '/services#ecommerce',
}

// Strictly parse the supplied YAML subset; refuse unsupported syntax or missing data.
// No article or metadata defaults: incomplete files require editorial approval.
export function parseArticle(source: string) {
  const normalized = source.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Expected YAML front matter')
  const metadata: Record<string, string | string[]> = {}
  let array: string | null = null
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue
    const item = line.match(/^  - (".*")$/)
    if (item && array) {
      ;(metadata[array] as string[]).push(JSON.parse(item[1]))
      continue
    }
    const field = line.match(/^([A-Za-z]+):(?: (.*))?$/)
    if (!field || field[1] in metadata)
      throw new Error('Unsupported or duplicate front matter field')
    array = field[2] ? null : field[1]
    metadata[field[1]] = array ? [] : field[2].startsWith('"') ? JSON.parse(field[2]) : field[2]
  }
  for (const key of [
    'title',
    'slug',
    'category',
    'excerpt',
    'seoTitle',
    'metaDescription',
    'canonicalPath',
  ]) {
    if (typeof metadata[key] !== 'string' || !metadata[key])
      throw new Error(`Missing metadata: ${key}`)
  }
  if (metadata.status !== 'draft' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(metadata.slug))) {
    throw new Error('Expected draft status and a valid supplied slug')
  }
  if (!Array.isArray(metadata.suggestedInternalLinks))
    throw new Error('Missing suggestedInternalLinks')
  const body = match[2].trim()
  const title = body.match(/^# (.+)\n/)
  if (!title || title[1] !== metadata.title) throw new Error('H1 must match the supplied title')
  // The existing post hero renders this exact H1, so store only the remaining body.
  return {
    metadata: metadata as ArticleMetadata,
    body: body.slice(title[0].length).trim(),
    sourceHash: createHash('sha256').update(source).digest('hex'),
  }
}

export function postEditorConfig(config: SanitizedConfig) {
  function find(fields: Field[]): LexicalRichTextAdapter | undefined {
    for (const field of fields) {
      if ('name' in field && field.name === 'content' && field.type === 'richText')
        return field.editor as LexicalRichTextAdapter
      if ('tabs' in field) {
        for (const tab of field.tabs) {
          const result = find(tab.fields)
          if (result) return result
        }
      }
    }
  }
  const editor = find(config.collections.find((collection) => collection.slug === 'posts')!.fields)
  if (!editor?.editorConfig) throw new Error('Posts must use the configured Lexical editor')
  return editor.editorConfig
}

export function convertArticle(
  source: string,
  config: SanitizedConfig,
  approvedRouteChanges = false,
) {
  const article = parseArticle(source)
  const body = approvedRouteChanges
    ? article.body.replace(
        /\]\((\/services\/[^)]+)\)/g,
        (match, href: string) => `](${serviceDestinations[href] || href})`,
      )
    : article.body
  // Refuse to silently discard unsupported fenced code in future inputs.
  if (/^```/m.test(body))
    throw new Error('Fenced code requires a supported Code block conversion before import')
  const content = convertMarkdownToLexical({
    editorConfig: postEditorConfig(config),
    markdown: body,
  })
  return { ...article, content }
}
