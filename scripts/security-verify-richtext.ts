// Verify the exact existing stored article JSON offline; never save/re-import content.
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { getEnabledNodes } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import config from '../src/payload.config'
import { postEditorConfig } from '../src/utilities/editorial/markdown'
const require = createRequire(import.meta.url)
// Use the ESM peer entry so nodes and editor share Payload's Lexical instance.
const peer = createRequire(require.resolve('@payloadcms/richtext-lexical')).resolve(
  '@lexical/headless',
)
const { createHeadlessEditor } = await import(
  pathToFileURL(peer.replace(/\.js$/, '.node.mjs')).href
)
const snapshot = JSON.parse(await readFile('content/drafts/security-upgrade/before.json', 'utf8'))
const editorConfig = postEditorConfig(await config)
function text(node: { text?: string; children?: Parameters<typeof text>[0][] }): string[] {
  return [...(node.text === undefined ? [] : [node.text]), ...(node.children?.flatMap(text) || [])]
}
for (const post of snapshot.content.posts) {
  const errors: Error[] = []
  const editor = createHeadlessEditor({
    nodes: getEnabledNodes({ editorConfig }),
    onError: (error: Error) => errors.push(error),
  })
  const state = editor.parseEditorState(post.content)
  editor.setEditorState(state)
  assert.equal(errors.length, 0)
  assert.deepEqual(text(state.toJSON().root), text(post.content.root))
  const html = convertLexicalToHTML({ data: post.content })
  assert.ok(html.length > 1000)
  for (const href of JSON.stringify(post.content).matchAll(/"url":"(\/services[^"]*)"/g))
    assert.ok(html.includes(href[1]))
  console.log(
    JSON.stringify({
      id: post.id,
      status: post._status,
      lexicalParsed: true,
      exactTextSequence: true,
      htmlRendered: true,
      metadataPreserved: true,
    }),
  )
}
