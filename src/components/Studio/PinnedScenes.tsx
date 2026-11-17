'use client'

import { Children, useEffect, useRef, useState, type ReactNode } from 'react'

const sceneNames = [
  'Built for the real world',
  'Web development',
  'Systems and integrations',
  'Build, fix, connect',
]

export function PinnedScenes({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 1100px) and (min-height: 750px) and (prefers-reduced-motion: no-preference)',
    )
    let frame = 0
    const update = () => {
      frame = 0
      const element = track.current
      if (!element) return
      const enabled = media.matches
      setPinned(enabled)
      if (!enabled) return
      const bounds = element.getBoundingClientRect()
      // A 500vh track minus the 100vh stage leaves four equal native-scroll segments.
      const segment = Math.max(1, (bounds.height - window.innerHeight) / 4)
      const next = Math.min(3, Math.max(0, Math.floor(-bounds.top / segment)))
      if (next !== activeRef.current) {
        const outgoing = element.querySelector(`[data-panel="${activeRef.current}"]`)
        const moveFocus = outgoing?.contains(document.activeElement)
        activeRef.current = next
        setActive(next)
        // Keep keyboard focus usable if its panel is hidden by a manual scroll.
        if (moveFocus)
          requestAnimationFrame(() => {
            element
              .querySelector<HTMLElement>(`[data-panel="${next}"] h2`)
              ?.focus({ preventScroll: true })
          })
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const observer = new ResizeObserver(schedule)
    if (track.current) observer.observe(track.current)
    schedule()
    media.addEventListener('change', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      media.removeEventListener('change', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  function goToScene(index: number) {
    if (!track.current) return
    const bounds = track.current.getBoundingClientRect()
    const segment = (bounds.height - window.innerHeight) / 4
    window.scrollTo({ top: scrollY + bounds.top + segment * index + 1, behavior: 'smooth' })
  }

  return (
    <div
      id="what-we-do"
      className="studio-scenes"
      ref={track}
      data-pinned={pinned}
      data-active-scene={active + 1}
    >
      <div className="story-stage">
        {pinned && (
          <nav className="scene-progress" aria-label="Story scenes">
            <div
              className="scene-progress-track"
              role="progressbar"
              aria-label="Story progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={(active + 1) * 25}
              aria-valuetext={`Scene ${active + 1} of 4`}
            >
              <span style={{ transform: `scaleY(${(active + 1) / 4})` }} />
            </div>
            <ol>
              {sceneNames.map((name, index) => (
                <li key={name}>
                  <button
                    type="button"
                    aria-label={`Scene ${index + 1}: ${name}`}
                    aria-current={index === active ? 'step' : undefined}
                    onClick={() => goToScene(index)}
                  >
                    0{index + 1}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {Children.toArray(children).map((child, index) => (
          <div
            className="story-panel"
            key={index}
            data-panel={index}
            data-active={index === active}
            inert={pinned && index !== active}
            aria-hidden={pinned && index !== active ? true : undefined}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
