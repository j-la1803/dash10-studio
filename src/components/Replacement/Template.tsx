import React, { createElement, type ReactNode } from 'react'
import Link from 'next/link'
import templates from './templates.json'
import { DesignEffects } from './DesignEffects'
import { ReplacementContactForm } from './ContactForm'
import { PublishedPosts } from './PublishedPosts'

type Node =
  string | { tag?: string; props?: Record<string, unknown>; children?: Node[]; slot?: string }
export type DesignPageName = keyof typeof templates
function render(nodes: Node[], slots: Record<string, ReactNode>): ReactNode[] {
  return nodes.map((node, index) => {
    if (typeof node === 'string') return node
    if (node.slot) return <React.Fragment key={index}>{slots[node.slot]}</React.Fragment>
    const props = { ...node.props, key: index }
    const children = node.children ? render(node.children, slots) : []
    if (
      node.tag === 'a' &&
      typeof node.props?.href === 'string' &&
      node.props.href.startsWith('/')
    ) {
      return createElement(Link, { ...props, href: node.props.href }, ...children)
    }
    return createElement(node.tag!, props, ...children)
  })
}
export async function DesignPage({ page, legal }: { page: DesignPageName; legal?: ReactNode }) {
  const slots = {
    contact: <ReplacementContactForm />,
    posts: page === 'blog' ? await PublishedPosts() : null,
    legal: <div className="prose">{legal}</div>,
  }
  return (
    <div className="reference-page" data-design-page={page}>
      {render(templates[page] as Node[], slots)}
      <DesignEffects />
    </div>
  )
}

/** Article pages use the exact supplied blog header/menu/footer. */
export function ArticleShell({ children }: { children: ReactNode }) {
  const nodes = templates.blog as Node[]
  const header = nodes.filter(
    (n) => typeof n !== 'string' && n.tag !== 'main' && n.tag !== 'footer',
  )
  const footer = nodes.filter((n) => typeof n !== 'string' && n.tag === 'footer')
  return (
    <div className="reference-page" data-design-page="article">
      {render(header, {})}
      {children}
      {render(footer, {})}
      <DesignEffects />
    </div>
  )
}
