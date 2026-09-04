'use client'

import React, { useEffect, useRef } from 'react'

type VideoHeroProps = {
  eyebrow: string
  lines: string[]
  video: string
  playbackRate?: number
}

export const VideoHero = ({ eyebrow, lines, video, playbackRate = 0.7 }: VideoHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  return (
    <main className="dash-hero">
      <video
        ref={videoRef}
        className="dash-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={video} type="video/mp4" />
      </video>

      <div className="dash-hero-overlay" />
      <div className="dash-grid-lines" />

      <div className="dash-hero-content">
        <div className="dash-eyebrow">{eyebrow}</div>

        <h1 className="dash-hero-heading">
          {lines.map((line) => (
            <React.Fragment key={line}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </h1>
      </div>
    </main>
  )
}
