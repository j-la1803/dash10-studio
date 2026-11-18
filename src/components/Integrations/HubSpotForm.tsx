'use client'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { HubSpotConfig } from '@/utilities/integrations/config'
import { measureSubmission } from '@/utilities/integrations/analytics'

type FormInstance = { getFormId(): string; getInstanceId(): string; getConversionId(): string }
declare global {
  interface Window {
    HubSpotFormsV4?: { getFormFromEvent(event: Event): FormInstance }
  }
}
const mountedForms = new Set<string>()
export function HubSpotForm({
  config,
  fallback,
}: {
  config: HubSpotConfig | null
  fallback: ReactNode
}) {
  const host = useRef<HTMLDivElement>(null)
  const id = useId()
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading')
  const [useFallback, setUseFallback] = useState(false)
  useEffect(() => {
    if (!config || useFallback || !host.current) return
    // One active embed per form ID. Avoid duplicate provider mounts, including Strict Mode.
    if (mountedForms.has(config.formId)) {
      const duplicate = requestAnimationFrame(() => setStatus('error'))
      return () => cancelAnimationFrame(duplicate)
    }
    mountedForms.add(config.formId)
    let instanceId: string | null = null
    let complete = false
    const matched = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string; instanceId?: string }>).detail
      return (
        detail?.formId === config.formId &&
        typeof detail.instanceId === 'string' &&
        (!instanceId || detail.instanceId === instanceId)
      )
    }
    const ready = (event: Event) => {
      if (!matched(event)) return
      instanceId = (event as CustomEvent<{ instanceId: string }>).detail.instanceId
      clearTimeout(timeout)
      setStatus('ready')
    }
    const success = (event: Event) => {
      if (complete || !instanceId || !matched(event)) return
      try {
        const instance = window.HubSpotFormsV4?.getFormFromEvent(event)
        const receipt = instance?.getConversionId()
        if (
          !receipt ||
          instance?.getFormId() !== config.formId ||
          instance.getInstanceId() !== instanceId
        )
          return
        complete = true
        measureSubmission('hubspot', receipt)
        setStatus('success')
      } catch {
        /* Never infer success from clicks or read submitted field values. */
      }
    }
    const failed = (event: Event) => {
      if (!complete && matched(event)) setStatus('error')
    }
    window.addEventListener('hs-form-event:on-ready', ready)
    window.addEventListener('hs-form-event:on-submission:success', success)
    window.addEventListener('hs-form-event:on-submission:failed', failed)
    const timeout = setTimeout(() => setStatus('error'), 15000)
    const script = document.createElement('script')
    script.async = true
    script.src = `https://${config.region === 'na1' ? 'js' : `js-${config.region}`}.hsforms.net/forms/embed/${config.portalId}.js`
    script.onerror = () => {
      clearTimeout(timeout)
      setStatus('error')
    }
    // Defer injection one frame so Strict Mode cleanup cannot leave two loader executions.
    const frame = requestAnimationFrame(() => host.current?.append(script))
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      script.remove()
      mountedForms.delete(config.formId)
      window.removeEventListener('hs-form-event:on-ready', ready)
      window.removeEventListener('hs-form-event:on-submission:success', success)
      window.removeEventListener('hs-form-event:on-submission:failed', failed)
    }
  }, [config, id, useFallback])
  if (!config || useFallback) return fallback
  return (
    <div className="hubspot-wrapper">
      {status === 'loading' && <p role="status">Loading the project inquiry form…</p>}
      {status === 'success' ? (
        <p role="status">Thanks. Your project inquiry has been received.</p>
      ) : (
        <>
          <div ref={host} hidden={status === 'error'}>
            <div
              id={id}
              className="hs-form-frame"
              data-region={config.region}
              data-form-id={config.formId}
              data-portal-id={config.portalId}
            />
          </div>
          {status === 'error' && (
            <div role="alert">
              <p>The HubSpot form is unavailable. You can use our secure inquiry form instead.</p>
              <button onClick={() => setUseFallback(true)}>Use the secure inquiry form</button>
            </div>
          )}
        </>
      )}
      <noscript>
        <p>
          JavaScript is required for the HubSpot form. Email justin@dash10.studio or enable
          JavaScript to use the secure inquiry form.
        </p>
      </noscript>
    </div>
  )
}
