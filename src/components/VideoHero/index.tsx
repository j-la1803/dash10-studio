'use client'

import { useEffect, useRef, useState } from 'react'
import { PosterHeading } from '@/components/Studio/PosterHeading'
import sizing from '@/components/Studio/HomepageHeadingSizing.module.css'
import Link from 'next/link'

type VideoHeroProps = {
  eyebrow: string
  lines: string[]
  video: string
  playbackRate?: number
}

export const VideoHero = ({ eyebrow, lines, video, playbackRate = 0.3 }: VideoHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const element = videoRef.current
    let frame = 0
    let nextFrame = 0
    // Let the priority poster and initial page resources finish before fetching
    // decorative video. Two frames give the browser a chance to paint the poster.
    const start = () => {
      if (media.matches || !element || element.getAttribute('src')) return
      frame = requestAnimationFrame(() => {
        nextFrame = requestAnimationFrame(() => {
          if (media.matches) return
          element.src = video
          element.load()
        })
      })
    }
    const update = () => {
      if (!videoRef.current) return
      videoRef.current.playbackRate = playbackRate
      if (media.matches || userPaused.current) videoRef.current.pause()
      else if (!videoRef.current.getAttribute('src')) start()
      else if (!videoRef.current.ended) void videoRef.current.play().catch(() => {})
    }
    element?.addEventListener('loadedmetadata', update)
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    media.addEventListener('change', update)
    return () => {
      window.removeEventListener('load', start)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(nextFrame)
      media.removeEventListener('change', update)
      element?.removeEventListener('loadedmetadata', update)
    }
  }, [playbackRate, video])

  return (
    <section className="dash-hero">
      <link rel="preload" as="image" href="/images/dash10-mountain.webp" fetchPriority="high" />
      <video
        ref={videoRef}
        onEnded={() => setEnded(true)}
        onPause={() => setPaused(true)}
        onPlay={() => setPaused(false)}
        className="dash-hero-video"
        muted
        playsInline
        preload="metadata"
        poster="/images/dash10-mountain.webp"
        aria-hidden="true"
      />

      {!ended && (
        <button
          className="hero-video-control"
          aria-pressed={paused}
          onClick={() => {
            const element = videoRef.current
            if (!element) return
            userPaused.current = !element.paused
            if (element.paused && !element.ended) void element.play().catch(() => {})
            else element.pause()
          }}
        >
          {paused ? 'Resume video' : 'Pause video'}
        </button>
      )}
      <div className="dash-hero-overlay" />
      <div className="dash-grid-lines" />
      <div className="hero-gauge" aria-hidden="true">
        <span>
          00
          <br />
          04
        </span>
      </div>

      <div className="dash-hero-content">
        <div className="dash-eyebrow">{eyebrow}</div>

        <h1 className={`dash-hero-heading ${sizing.hero}`}>
          <PosterHeading
            as="span"
            solid={lines.slice(0, -1).join('\n') + '\n'}
            outline={lines.at(-1)!}
            trigger="load"
            fontSize="inherit"
            style={{ display: 'block', maxWidth: 'none' }}
          />
        </h1>
        <p className="hero-description">
          Custom websites, e-commerce platforms, and connected systems engineered to move your
          business forward.
        </p>
        <Link className="studio-cta" href="#what-we-do">
          EXPLORE WHAT WE DO <span aria-hidden="true">↓</span>
        </Link>
      </div>
    </section>
  )
}
