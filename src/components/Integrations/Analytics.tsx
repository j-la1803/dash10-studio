'use client'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { measure, pageContext, privacyOptOut } from '@/utilities/integrations/analytics'
function readFooterTarget() {
  return document.getElementById('footer-analytics-preferences')
}
function subscribeFooter() {
  return () => {}
}
const preferenceKey = 'dash10-analytics-consent-v1'
let memoryChoice: 'allow' | 'deny' | null = null
function readPreference() {
  if (privacyOptOut()) return 'deny'
  try {
    const value = localStorage.getItem(preferenceKey)
    return value === 'allow' || value === 'deny' ? value : memoryChoice
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
  const optOut = useSyncExternalStore(subscribePreference, privacyOptOut, () => false)
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
    window.dataLayer.push(pageContext(path, lastPath.current || ''))
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
    if (lastPath.current !== path) {
      window.dataLayer.push({ event: 'page_view', ...pageContext(path, lastPath.current || '') })
      lastPath.current = path
    }
  }, [choice, containerId, path])
  useEffect(() => {
    if (!containerId) return
    const clicked = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null
      const anchor = element?.closest<HTMLAnchorElement>('a[href]')
      if (anchor) {
        const url = new URL(anchor.href, location.href)
        if (['http:', 'https:'].includes(url.protocol) && url.origin !== location.origin) {
          measure({
            event: 'outbound_click',
            destination_id: url.hostname === 'policies.google.com' ? 'google_privacy' : 'external',
          })
        }
      }
      const link = element?.closest(
        'a.studio-cta, a[data-studio-cta], .studio-header a[href="/contact"]',
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
  useEffect(() => {
    if (choice !== 'allow' || !containerId || privacyOptOut()) return
    let sent = false
    let frame = 0
    const check = () => {
      frame = 0
      const height = document.documentElement.scrollHeight
      if (!sent && height > innerHeight && (scrollY + innerHeight) / height >= 0.9) {
        sent = true
        measure({ event: 'scroll', percent_scrolled: 90 })
      }
    }
    const schedule = () => {
      if (!frame && !sent) frame = requestAnimationFrame(check)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [path, choice, containerId])
  function choose(value: 'allow' | 'deny') {
    if (privacyOptOut()) value = 'deny'
    try {
      localStorage.setItem(preferenceKey, value)
    } catch {
      memoryChoice = value
    }
    if (choice === 'allow' && value === 'deny') {
      revokeConsent()
      return
    }
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
        {optOut ? (
          <p>
            Your browser’s privacy signal disables analytics. Change that browser preference to
            enable optional analytics.
          </p>
        ) : (
          <button onClick={() => choose('allow')}>Allow analytics</button>
        )}
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
