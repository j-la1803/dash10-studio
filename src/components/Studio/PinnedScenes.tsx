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
      '(min-width: 1100px) and (prefers-reduced-motion: no-preference)',
    )
    let frame = 0
    const update = () => {
      frame = 0
      const element = track.current
      if (!element) return
      // Use the actual content fit, not a screen-height cutoff that excludes laptop windows.
      const panels = Array.from(element.querySelectorAll<HTMLElement>('.scene-sticky'))
      const contentHeight = Math.max(
        0,
        ...panels.flatMap((panel) =>
          Array.from(
            panel.querySelectorAll<HTMLElement>('.scene-copy,.studio-window,.systems-visual'),
          ).map((content) => content.getBoundingClientRect().height),
        ),
      )
      const viewport = element.querySelector<HTMLElement>('.story-stage')!
      const padding = Math.min(80, Math.max(16, window.innerHeight * 0.06))
      const enabled = media.matches && contentHeight + padding * 2 <= window.innerHeight
      setPinned(enabled)
      if (!enabled) return
      const bounds = element.getBoundingClientRect()
      // Sticky begins inside the track border and ends when its content box is exhausted.
      const range = Math.max(1, element.clientHeight - viewport.getBoundingClientRect().height)
      const distance = -bounds.top - element.clientTop
      const next = Math.min(3, Math.max(0, Math.floor(distance / (range / 4))))
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
    if (track.current) {
      observer.observe(track.current)
      track.current
        .querySelectorAll('.scene-copy,.studio-window,.systems-visual')
        .forEach((content) => observer.observe(content))
    }
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

  return (
    <div
      id="what-we-do"
      className="studio-scenes"
      ref={track}
      data-pinned={pinned}
      data-active-scene={active + 1}
    >
      {pinned &&
        sceneNames.map((name, index) => (
          <span
            key={name}
            id={`story-step-${index + 1}`}
            className="story-step-anchor"
            aria-hidden="true"
            style={{ top: `calc(${index} * (100% - 100svh) / 4 + 2px)` }}
          />
        ))}
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
