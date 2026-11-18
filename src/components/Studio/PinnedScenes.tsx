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
      const geometry = sections.map((section) => section.getBoundingClientRect())
      const next = geometry.findIndex((section) => section.bottom > center)
      setActive(next < 0 ? sections.length - 1 : next)
      geometry.forEach((section, index) => {
        // Full visibility by 35vh; stay readable until the last 25vh leaves the top.
        // Position alone determines progress, so direction changes never restart anything.
        const entering = (window.innerHeight - section.top) / (window.innerHeight * 0.65)
        const leaving = section.bottom / (window.innerHeight * 0.25)
        const linear = Math.min(1, Math.max(0, Math.min(entering, leaving)))
        const reveal = media.matches ? 1 : linear * linear * (3 - 2 * linear)
        const distance = window.innerWidth <= 700 ? 16 : 24
        sections[index].style.setProperty('--scene-reveal', String(reveal))
        sections[index].style.setProperty('--scene-offset', `${-distance * (1 - reveal)}px`)
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(root)
    sections.forEach((section) => resize.observe(section))
    media.addEventListener('change', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      media.removeEventListener('change', schedule)
      sections.forEach((section) => {
        section.style.removeProperty('--scene-reveal')
        section.style.removeProperty('--scene-offset')
      })
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
