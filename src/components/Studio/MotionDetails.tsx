'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function MotionDetails({ question, children }: { question: string; children: ReactNode }) {
  const detail = useRef<HTMLDetailsElement>(null)
  const animation = useRef<Animation | null>(null)
  const expanded = useRef(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reduce = () => {
      if (media.matches) {
        animation.current?.cancel()
        if (detail.current) detail.current.open = expanded.current
      }
    }
    media.addEventListener('change', reduce)
    return () => {
      animation.current?.cancel()
      media.removeEventListener('change', reduce)
    }
  }, [])
  function toggle() {
    const element = detail.current
    if (!element) return
    const start = element.getBoundingClientRect().height
    animation.current?.cancel()
    expanded.current = !expanded.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.open = expanded.current
      return
    }
    element.open = true
    const end = expanded.current
      ? element.getBoundingClientRect().height
      : element.querySelector('summary')!.getBoundingClientRect().height
    const current = element.animate([{ height: `${start}px` }, { height: `${end}px` }], {
      duration: 320,
      easing: 'cubic-bezier(.2,.7,.2,1)',
    })
    animation.current = current
    current.onfinish = () => {
      element.open = expanded.current
      current.cancel()
      animation.current = null
    }
  }
  return (
    <details ref={detail}>
      <summary
        onClick={(event) => {
          event.preventDefault()
          toggle()
        }}
      >
        {question}
        <span className="faq-toggle" aria-hidden="true" />
      </summary>
      <div className="faq-answer">{children}</div>
    </details>
  )
}
