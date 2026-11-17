'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { studioLinks } from './navigation'

export function StudioHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  return (
    <header className="studio-header" data-home={pathname === '/' || pathname === '/home'}>
      <Link href="/" aria-label="Dash 10 Studio home">
        <Image
          unoptimized
          src="/brand/logo/dash10-wordmark-white.svg"
          width={160}
          height={58}
          alt="Dash 10"
        />
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="studio-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <nav
        id="studio-nav"
        className={open ? 'is-open' : ''}
        aria-label="Main navigation"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()
          }
        }}
      >
        {studioLinks.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={pathname === href ? 'page' : undefined}
          >
            {label}
            {href === '/contact' && <span aria-hidden="true"> ↗</span>}
          </Link>
        ))}
      </nav>
    </header>
  )
}
