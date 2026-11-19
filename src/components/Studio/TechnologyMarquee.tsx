'use client'
import { useState, type ReactNode } from 'react'
export function TechnologyMarquee({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false)
  return (
    <section className="platform-section" aria-labelledby="platform-title">
      <div className="platform-heading">
        <p id="platform-title" className="studio-label">
          PLATFORMS WE BUILD WITH
        </p>
        <button
          className="platform-motion-toggle"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? 'Resume motion' : 'Pause motion'}
        </button>
      </div>
      <div
        className="platform-marquee"
        data-paused={paused}
        tabIndex={0}
        role="region"
        aria-label="Technology platforms"
      >
        {children}
      </div>
    </section>
  )
}
