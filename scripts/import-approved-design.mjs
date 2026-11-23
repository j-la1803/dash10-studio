// The owner-supplied HTML is the source of truth. Regenerate with:
// node scripts/import-approved-design.mjs
import { JSDOM } from 'jsdom'
import fs from 'node:fs/promises'
const base = new URL('../src/components/Replacement/', import.meta.url)
const pages = ['index', 'services', 'process', 'about', 'blog', 'contact', 'privacy', 'terms']
const routes = Object.fromEntries(pages.map((p) => [p + '.html', p === 'index' ? '/' : '/' + p]))
const attributes = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  autocomplete: 'autoComplete',
  viewbox: 'viewBox',
  preserveaspectratio: 'preserveAspectRatio',
  maxlength: 'maxLength',
  minlength: 'minLength',
  novalidate: 'noValidate',
  autoplay: 'autoPlay',
  playsinline: 'playsInline',
  crossorigin: 'crossOrigin',
  'xlink:href': 'xlinkHref',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
}
function convert(node) {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1 || ['script', 'style', 'link', 'meta', 'title'].includes(node.localName))
    return null
  const tag = node.localName
  if (node.id === 'contactForm') return { slot: 'contact' }
  if (node.id === 'sent') return null
  if (node.classList.contains('empty')) return { slot: 'posts' }
  if (['privacy', 'terms'].includes(current) && node.classList.contains('prose'))
    return { slot: 'legal' }
  const props = {}
  for (const { name, value } of node.attributes) {
    if (name === 'style') {
      props.style = Object.fromEntries(
        Array.from(node.style).map((k) => [
          k.startsWith('--')
            ? k
            : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^webkit/, 'Webkit'),
          node.style.getPropertyValue(k),
        ]),
      )
      // JSDOM's style parser silently drops properties it does not know (e.g. paint-order),
      // so restore any declaration from the raw attribute that it omitted.
      for (const decl of value.split(';')) {
        const i = decl.indexOf(':')
        if (i < 0) continue
        const k = decl.slice(0, i).trim().toLowerCase()
        const v = decl.slice(i + 1).trim()
        if (!k || !v || node.style.getPropertyValue(k)) continue
        const key = k.startsWith('--')
          ? k
          : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^webkit/, 'Webkit')
        if (!(key in props.style)) props.style[key] = v
      }
    } else {
      const key =
        attributes[name] ||
        (name.startsWith('aria-') || name.startsWith('data-')
          ? name
          : name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()))
      let v = value
      if (name === 'src' && v === 'assets/dash-10-video-bg-slowed.mp4')
        v = '/videos/dash-10-video-bg-slowed.mp4'
      if (name === 'href')
        for (const [file, route] of Object.entries(routes))
          if (v === file || v.startsWith(file + '#')) v = route + v.slice(file.length)
      props[key] = [
        'required',
        'disabled',
        'readOnly',
        'noValidate',
        'hidden',
        'muted',
        'autoPlay',
        'loop',
        'playsInline',
        'open',
        'controls',
      ].includes(key)
        ? true
        : v
    }
  }
  if (tag === 'main' && !node.parentElement.closest('main')) props.id = 'main-content'
  // The exported homepage contains a nested main. A div preserves its layout and fixes semantics.
  const actualTag = tag === 'main' && node.parentElement.closest('main') ? 'div' : tag
  if (node.classList.contains('glitch'))
    props['aria-label'] = node.textContent.replace(/\s+/g, ' ').trim()
  if (tag === 'a' && ['btn', 'cta', 'linkrow'].some((c) => node.classList.contains(c)))
    props['data-studio-cta'] = ''
  const children = Array.from(node.childNodes)
    .map(convert)
    .filter((n) => n !== null)
  if (node.id === 'web')
    children.unshift({
      tag: 'span',
      props: { id: 'web-development', style: { position: 'absolute', top: 0 } },
      children: [],
    })
  if (tag === 'nav' && node.closest('.legal'))
    children.push({ tag: 'span', props: { id: 'footer-analytics-preferences' }, children: [] })
  return { tag: actualTag, props, children }
}
const templates = {}
let current
for (current of pages) {
  const source = await fs.readFile(new URL('source/' + current + '.html', base), 'utf8')
  const document = new JSDOM(source).window.document
  if (current === 'blog') {
    const outline = document.querySelector('h1 .o')
    if (outline) outline.remove()
    const heading = document.querySelector('h1')
    heading.textContent = 'Field notes.'
    heading.setAttribute('data-text', 'Field notes.')
  }
  const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')
  if (current === 'index') await fs.writeFile(new URL('home-reference.css', base), css)
  if (current === 'blog') await fs.writeFile(new URL('approved.css', base), css)
  templates[current] = Array.from(document.body.childNodes)
    .map(convert)
    .filter((n) => n !== null)
}
// Index wrapper defaults are page-specific; all remaining CSS is byte-identical across pages.
await fs.writeFile(new URL('templates.json', base), JSON.stringify(templates))
console.log(
  'Generated eight faithful server-rendered templates; only functional slots, routes and approved empty-state copy differ.',
)
