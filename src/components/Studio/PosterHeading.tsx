'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import poster from './Posters80.module.css'

type Props = {
  as: 'h1' | 'h2' | 'span'
  solid: string
  outline: string
  fontSize?: CSSProperties['fontSize']
  style?: CSSProperties
  trigger?: 'load' | 'viewport' | 'external'
  className?: string
  id?: string
}

/** Reuse the poster's headline, outline and three glitch keyframes at existing sizes. */
export function PosterHeading({
  as: Tag,
  solid,
  outline,
  fontSize,
  style,
  trigger = 'external',
  className = '',
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || trigger === 'external') return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let inside = false
    const play = () => {
      if (disposed || motion.matches) return
      element.parentElement!.classList.remove(poster.in)
      void element.offsetWidth
      element.parentElement!.classList.add(poster.in)
    }
    const preference = () => {
      if (motion.matches) element.parentElement!.classList.remove(poster.in)
    }
    motion.addEventListener('change', preference)
    let observer: IntersectionObserver | undefined
    if (trigger === 'load') {
      // Do not replay on scrolling or video state changes, or glitch during font swap.
      void document.fonts.ready.then(play)
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries[0].isIntersecting
          if (visible && !inside) play()
          if (!visible) element.parentElement!.classList.remove(poster.in)
          inside = visible
        },
        { threshold: 0.35 },
      )
      observer.observe(element)
    }
    return () => {
      disposed = true
      observer?.disconnect()
      motion.removeEventListener('change', preference)
    }
  }, [trigger])
  const text = solid + outline
  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`${poster.headline} ${poster.glitch} ${className}`}
      style={{ ...style, ...(fontSize ? { fontSize } : {}) }}
      data-text={text}
      aria-label={text.replaceAll('\n', ' ')}
      data-poster-heading={trigger === 'external' ? undefined : trigger}
    >
      {solid}
      <span className={poster.lt} aria-hidden="true">
        {outline}
      </span>
    </Tag>
  )
}
