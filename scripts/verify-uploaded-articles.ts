// Offline only: sanitize editor configuration and verify the supplied private files.
// Never connects to Payload/database or publishes article contents.
import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import config from '../src/payload.config'
import { convertArticle } from '../src/utilities/editorial/markdown'

const directory = process.argv[2] || 'content/drafts/uploaded-2026-11-17'
const files = [
  '01-rebuild-or-fix.md',
  '02-website-systems-integration.md',
  '03-choosing-ecommerce-platform.md',
]
const editor = await config
for (const file of files) {
  const article = convertArticle(await readFile(`${directory}/${file}`, 'utf8'), editor)
  const html = convertLexicalToHTML({ data: article.content })
  const sourceWords = article.body
    .split('\n')
    .filter((line) => !/^\|[\s:|-]+\|$/.test(line.trim()) && !/^---$/.test(line.trim()))
    .map((line) => line.replace(/^\d+\. /, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))
    .join(' ')
    .match(/[\p{L}\p{N}]+/gu)
  const text: string[] = []
  const types: Record<string, number> = {}
  function walk(node: { type: string; text?: string; children?: unknown[] }) {
    types[node.type] = (types[node.type] || 0) + 1
    if (node.text !== undefined) text.push(node.text)
    node.children?.forEach((child) => walk(child as Parameters<typeof walk>[0]))
  }
  walk(article.content.root)
  const convertedWords = text.join(' ').match(/[\p{L}\p{N}]+/gu)
  if (JSON.stringify(sourceWords) !== JSON.stringify(convertedWords)) {
    throw new Error(`Word-for-word conversion check failed: ${file}`)
  }
  if (/<h1\b/.test(html)) throw new Error('Body must not duplicate the post hero H1')
  await writeFile(`${directory}/${file}.html`, html)
  console.log(
    JSON.stringify({
      file,
      sourceHash: article.sourceHash,
      wordCount: convertedWords?.length,
      nodes: types,
      exactWordSequence: true,
    }),
  )
}
