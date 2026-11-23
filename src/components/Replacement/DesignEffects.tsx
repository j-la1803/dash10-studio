'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** The supplied interaction logic, with lifecycle cleanup and an accessible menu. */
export function DesignEffects() {
  const path = usePathname()
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-design-page]')
    if (!root) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
    const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)
    const $$ = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s))
    const cleanups: (() => void)[] = []
    const listen = (
      el: EventTarget,
      event: string,
      fn: EventListener,
      options?: AddEventListenerOptions,
    ) => {
      el.addEventListener(event, fn, options)
      cleanups.push(() => el.removeEventListener(event, fn, options))
    }
    const sheet = $('#sheet'),
      menu = $('#menuBtn')
    const toggle = (open: boolean) => {
      if (!sheet || !menu) return
      sheet.classList.toggle('open', open)
      root.classList.toggle('menu-open', open)
      document.documentElement.style.overflow = open ? 'hidden' : ''
      menu.setAttribute('aria-expanded', String(open))
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    }
    if (sheet && menu) {
      sheet.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href') || ''
        if (href === path || (href !== '/' && path.startsWith(href + '/')))
          a.setAttribute('aria-current', 'page')
        listen(a, 'click', () => toggle(false))
      })
      listen(menu, 'click', () => toggle(!sheet.classList.contains('open')))
      const desktop = matchMedia('(min-width: 900px)')
      listen(desktop, 'change', () => desktop.matches && toggle(false))
      cleanups.push(() => toggle(false))
      listen(window, 'keydown', ((e: KeyboardEvent) => {
        if (!sheet.classList.contains('open')) return
        if (e.key === 'Escape') {
          toggle(false)
          menu.focus()
        }
        if (e.key === 'Tab') {
          const controls = [menu, ...Array.from(sheet.querySelectorAll<HTMLElement>('a'))]
          const first = controls[0],
            last = controls.at(-1)
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }) as EventListener)
    }
    const steps = $$('.step'),
      posters = $$('.poster'),
      rail = $('.rail'),
      stack = $('#stack'),
      section = $('#steps')
    const ticks = $$('.tick'),
      pct = $('#pct'),
      label = $('#lbl')
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          const step = el.closest('.step')
          if (entry.isIntersecting) {
            el.classList.remove('in')
            void el.offsetWidth
            el.classList.add('in')
            step?.classList.add('seen')
          } else el.classList.remove('in')
        }),
      { threshold: 0.4 },
    )
    $$('.glitch').forEach((el) => observer.observe(el))
    const pause = $('#pauseBtn')
    if (pause)
      listen(pause, 'click', () => {
        const still = document.documentElement.classList.toggle('still')
        pause.textContent = still ? 'Resume motion' : 'Pause motion'
        pause.setAttribute('aria-pressed', String(still))
      })
    let frameId = 0
    const frame = () => {
      frameId = 0
      const vh = innerHeight
      if (stack && rail && posters.length) {
        const sr = stack.getBoundingClientRect()
        rail.classList.toggle('on', sr.top < vh * 0.5 && sr.bottom > vh * 0.5)
        const progress = clamp((scrollY - stack.offsetTop) / Math.max(stack.offsetHeight - vh, 1))
        document.documentElement.style.setProperty('--prog', progress.toFixed(4))
        if (pct) pct.textContent = String(Math.round(progress * 100)).padStart(2, '0')
        let active = 0
        posters.forEach((p, i) => {
          const r = p.getBoundingClientRect()
          p.style.setProperty('--p', (reduce ? 1 : clamp((vh - r.top) / (vh * 0.7))).toFixed(3))
          p.style.setProperty('--s', clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1).toFixed(3))
          if (r.top < vh * 0.5) active = i
        })
        ticks.forEach((tick, i) => {
          tick.classList.toggle('on', i === active)
          tick.classList.toggle('done', i < active)
        })
        if (label) label.textContent = posters[active].getAttribute('data-lbl')
      }
      if (section) {
        const rect = section.getBoundingClientRect()
        section.style.setProperty('--prog', clamp((vh * 0.6 - rect.top) / rect.height).toFixed(4))
        steps.forEach((step) =>
          step.style.setProperty(
            '--p',
            (reduce ? 1 : clamp((vh - step.getBoundingClientRect().top) / (vh * 0.6))).toFixed(3),
          ),
        )
      }
    }
    const schedule = () => {
      if (!frameId) frameId = requestAnimationFrame(frame)
    }
    listen(window, 'scroll', schedule, { passive: true })
    listen(window, 'resize', schedule)
    frame()
    $$('[data-copy]').forEach((button) =>
      listen(button, 'click', () => {
        const value = button.getAttribute('data-copy') || ''
        void navigator.clipboard
          ?.writeText(value)
          .then(() => {
            const original = button.textContent
            button.textContent = 'Copied'
            const timer = setTimeout(() => {
              button.textContent = original
            }, 1400)
            cleanups.push(() => clearTimeout(timer))
          })
          .catch(() => {})
      }),
    )
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameId)
      cleanups.forEach((fn) => fn())
      document.documentElement.classList.remove('still')
      document.documentElement.style.removeProperty('--prog')
    }
  }, [path])
  return null
}
