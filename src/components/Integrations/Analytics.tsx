'use client'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { measure, safePath } from '@/utilities/integrations/analytics'
function readFooterTarget() {
  return document.getElementById('footer-analytics-preferences')
}
function subscribeFooter() {
  return () => {}
}
const preferenceKey = 'dash10-analytics-consent-v1'
let memoryChoice: 'allow' | 'deny' | null = null
function readPreference() {
  try {
    const value = localStorage.getItem(preferenceKey)
    return value === 'allow' || value === 'deny' ? value : null
  } catch {
    return memoryChoice
  }
}
function revokeConsent() {
  window.dashAnalyticsAllowed = false
  function consent(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params -- Google consent commands use arguments objects.
    window.dataLayer?.push(arguments)
  }
  consent('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (/^_ga($|_)/.test(name)) {
      document.cookie = `${name}=; Max-Age=0; path=/`
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.dash10studio.com`
    }
  })
  location.reload()
}
function subscribePreference(notify: () => void) {
  const storageChanged = () => {
    if (readPreference() !== 'allow' && document.getElementById('dash-gtm')) revokeConsent()
    notify()
  }
  window.addEventListener('storage', storageChanged)
  window.addEventListener('dash10:consent', notify)
  return () => {
    window.removeEventListener('storage', storageChanged)
    window.removeEventListener('dash10:consent', notify)
  }
}
export function Analytics({ containerId }: { containerId: string | null }) {
  const path = usePathname()
  const choice = useSyncExternalStore(subscribePreference, readPreference, () => null)
  const [show, setShow] = useState(false)
  const footerTarget = useSyncExternalStore(subscribeFooter, readFooterTarget, () => null)
  const preferencesButton = useRef<HTMLButtonElement>(null)
  const consentPanel = useRef<HTMLElement>(null)
  useEffect(() => {
    if (show) consentPanel.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }, [show])
  const lastPath = useRef<string | null>(null)
  useEffect(
    () => () => {
      window.dashAnalyticsAllowed = false
    },
    [],
  )
  useEffect(() => {
    if (!containerId || choice !== 'allow') {
      window.dashAnalyticsAllowed = false
      return
    }
    window.dataLayer ||= []
    if (!document.getElementById('dash-gtm')) {
      // Arguments objects are the Google consent command format.
      function consent(..._args: unknown[]) {
        // eslint-disable-next-line prefer-rest-params -- Google consent commands use arguments objects.
        window.dataLayer!.push(arguments)
      }
      consent('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      consent('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
      const script = document.createElement('script')
      script.id = 'dash-gtm'
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`
      document.head.append(script)
    }
    window.dashAnalyticsAllowed = true
    const page = safePath(path)
    if (lastPath.current !== path) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: page,
        page_location: `https://dash10studio.com${page}`,
        page_referrer: lastPath.current
          ? `https://dash10studio.com${safePath(lastPath.current)}`
          : '',
      })
      lastPath.current = path
    }
  }, [choice, containerId, path])
  useEffect(() => {
    if (!containerId) return
    const clicked = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.(
        'a.studio-cta, .studio-header a[href="/contact"]',
      )
      if (!link) return
      const href = link.getAttribute('href') || ''
      const cta_id = href.startsWith('mailto:')
        ? 'email'
        : href === '/contact'
          ? 'contact'
          : href.startsWith('/services')
            ? 'services'
            : href === '/process'
              ? 'process'
              : href === '#what-we-do'
                ? 'home_story'
                : null
      if (!cta_id) return
      measure({
        event: cta_id === 'contact' ? 'project_inquiry' : 'cta_click',
        cta_id,
        placement: link.closest('footer')
          ? 'footer'
          : link.closest('header')
            ? 'header'
            : 'content',
      })
    }
    document.addEventListener('click', clicked)
    return () => document.removeEventListener('click', clicked)
  }, [containerId])
  function choose(value: 'allow' | 'deny') {
    try {
      localStorage.setItem(preferenceKey, value)
    } catch {
      /* In-memory consent still works. */
    }
    if (choice === 'allow' && value === 'deny') {
      revokeConsent()
      return
    }
    memoryChoice = value
    window.dispatchEvent(new Event('dash10:consent'))
    setShow(false)
    if (show) preferencesButton.current?.focus()
  }
  if (!containerId) return null
  return (
    <>
      <section
        hidden={!show && choice !== null}
        id="analytics-consent"
        ref={consentPanel}
        className="analytics-consent"
        role="region"
        aria-label="Analytics preferences"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && choice !== null) {
            setShow(false)
            preferencesButton.current?.focus()
          }
        }}
      >
        <p>
          Allow optional analytics to help us understand which pages are useful? Your project
          inquiry works either way.
        </p>
        <button onClick={() => choose('allow')}>Allow analytics</button>
        <button onClick={() => choose('deny')}>Decline analytics</button>
      </section>
      {footerTarget &&
        createPortal(
          <button
            ref={preferencesButton}
            className="analytics-preferences"
            aria-expanded={show || choice === null}
            aria-controls="analytics-consent"
            onClick={() => setShow(!show)}
          >
            Analytics preferences
          </button>,
          footerTarget,
        )}
    </>
  )
}
