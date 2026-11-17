'use client'

import { Children, useEffect, useRef, useState, type ReactNode } from 'react'

const sceneNames = [
  'Built for the real world',
  'Web development',
  'Systems and integrations',
  'Build, fix, connect',
]

// Only the navigation rail is sticky. Every section remains in document flow.
export function PinnedScenes({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = track.current
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.studio-scene'))
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const bounds = root.getBoundingClientRect()
      const center = window.innerHeight / 2
      const fraction = Math.min(1, Math.max(0, (center - bounds.top) / bounds.height))
      if (fill.current) fill.current.style.transform = `scaleY(${fraction})`
      progress.current?.setAttribute('aria-valuenow', String(Math.round(fraction * 100)))
      const next = sections.findIndex((section) => section.getBoundingClientRect().bottom > center)
      setActive(next < 0 ? sections.length - 1 : next)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(root)
    sections.forEach((section) => resize.observe(section))
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          observer.unobserve(element)
          element.dataset.revealed = 'true'
          if (media.matches) continue
          element.classList.add('is-revealing')
          element.addEventListener('animationend', () => element.classList.remove('is-revealing'), {
            once: true,
          })
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    reveals.forEach((element) => observer.observe(element))
    const reduce = () => {
      if (media.matches) reveals.forEach((element) => element.classList.remove('is-revealing'))
    }
    media.addEventListener('change', reduce)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      observer.disconnect()
      media.removeEventListener('change', reduce)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div
      id="what-we-do"
      className="studio-scenes"
      data-flow="true"
      ref={track}
      data-active-scene={active + 1}
    >
      <aside className="scene-progress-boundary">
        <nav className="scene-progress" aria-label="Story scenes">
          <div
            ref={progress}
            className="scene-progress-track"
            role="progressbar"
            aria-label="Story progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <span ref={fill} style={{ transform: 'scaleY(0)' }} />
          </div>
          <ol>
            {sceneNames.map((name, index) => (
              <li key={name}>
                <a
                  href={`#story-step-${index + 1}`}
                  aria-label={`Scene ${index + 1}: ${name}`}
                  aria-current={index === active ? 'step' : undefined}
                >
                  0{index + 1}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <div className="story-stage">
        {Children.toArray(children).map((child, index) => (
          <div id={`story-step-${index + 1}`} className="story-panel" key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
