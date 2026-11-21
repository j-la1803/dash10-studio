'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Posters80.module.css'

/** Native document scroll, with the reference's continuously calculated entry state. */
export function Posters80Motion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const posters = Array.from(root.querySelectorAll<HTMLElement>('[data-poster]'))
    const ticks = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.tick}`))
    const pct = root.querySelector('[data-rail-pct]')
    const track = root.querySelector('[data-rail-track]')
    const label = root.querySelector('[data-rail-lbl]')
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))
    let frameId = 0
    function frame() {
      frameId = 0
      if (!root || !posters.length) return
      const vh = innerHeight
      // offsetTop is relative to the positioned wrapper, not the document.
      const top = root.getBoundingClientRect().top + scrollY
      const progress = clamp((scrollY - top) / Math.max(root.offsetHeight - vh, 1))
      root.style.setProperty('--prog', progress.toFixed(4))
      track?.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
      if (pct) pct.textContent = String(Math.round(progress * 100)).padStart(2, '0')
      let active = 0
      posters.forEach((poster, i) => {
        const rect = poster.getBoundingClientRect()
        const enter = motion.matches ? 1 : clamp((vh - rect.top) / (vh * 0.7))
        poster.style.setProperty('--p', enter.toFixed(3))
        poster.style.setProperty(
          '--s',
          clamp((rect.top + rect.height / 2 - vh / 2) / vh, -1, 1).toFixed(3),
        )
        if (rect.top < vh * 0.5) active = i
      })
      ticks.forEach((tick, i) => {
        tick.classList.toggle(styles.on, i === active)
        tick.classList.toggle(styles.done, i < active)
      })
      if (label) label.textContent = posters[active].dataset.lbl || ''
    }
    function requestFrame() {
      if (!frameId) frameId = requestAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const poster = entry.target as HTMLElement
          poster.dataset.motionActive = String(entry.isIntersecting)
          poster.classList.remove(styles.in)
          if (entry.isIntersecting && !motion.matches) {
            // Replay the reference's short CSS glitch, without restarting scroll reveals.
            void poster.offsetWidth
            poster.classList.add(styles.in)
          }
        })
      },
      { threshold: 0.35 },
    )
    posters.forEach((poster) => observer.observe(poster))
    const resize = new ResizeObserver(requestFrame)
    resize.observe(root)
    addEventListener('scroll', requestFrame, { passive: true })
    addEventListener('resize', requestFrame)
    motion.addEventListener('change', requestFrame)
    frame()
    return () => {
      observer.disconnect()
      resize.disconnect()
      cancelAnimationFrame(frameId)
      removeEventListener('scroll', requestFrame)
      removeEventListener('resize', requestFrame)
      motion.removeEventListener('change', requestFrame)
    }
  }, [])
  return (
    <div ref={ref} id="what-we-do" className={styles.root} data-posters-80="">
      {children}
    </div>
  )
}
