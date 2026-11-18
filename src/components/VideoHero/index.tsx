'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'

type VideoHeroProps = {
  eyebrow: string
  lines: string[]
  video: string
  playbackRate?: number
}

export const VideoHero = ({ eyebrow, lines, video, playbackRate = 0.6 }: VideoHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      if (!videoRef.current) return
      videoRef.current.playbackRate = playbackRate
      if (media.matches) videoRef.current.pause()
      else if (!videoRef.current.ended) void videoRef.current.play().catch(() => {})
    }
    const element = videoRef.current
    element?.addEventListener('loadedmetadata', update)
    update()
    media.addEventListener('change', update)
    return () => {
      media.removeEventListener('change', update)
      element?.removeEventListener('loadedmetadata', update)
    }
  }, [playbackRate])

  return (
    <section className="dash-hero">
      <video
        ref={videoRef}
        className="dash-hero-video"
        muted
        playsInline
        preload="metadata"
        poster="/images/dash10-mountain.png"
        aria-hidden="true"
      >
        <source src={video} type="video/mp4" />
      </video>

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

        <h1 className="dash-hero-heading">
          {lines.map((line) => (
            <React.Fragment key={line}>
              {line} <br />
            </React.Fragment>
          ))}
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
