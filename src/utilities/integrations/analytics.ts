// No arbitrary payloads, field values, URLs, query strings, titles or personal identifiers.
export type MeasurementEvent =
  | { event: 'contact_form_success'; form_provider: 'payload' | 'hubspot' }
  | {
      event: 'cta_click' | 'project_inquiry'
      cta_id: 'contact' | 'services' | 'process' | 'home_story' | 'email'
      placement: 'header' | 'footer' | 'content'
    }

declare global {
  interface Window {
    dataLayer?: unknown[]
    dashAnalyticsAllowed?: boolean
  }
}
const submissionReceipts = new Set<string>()
export function safePath(path: string) {
  const clean = path.split(/[?#]/)[0]
  if (['/', '/services', '/process', '/about', '/contact', '/posts', '/search'].includes(clean))
    return clean
  return clean.startsWith('/posts/') ? '/posts/article' : '/other'
}
export function measure(event: MeasurementEvent) {
  if (typeof window === 'undefined' || !window.dashAnalyticsAllowed) return
  if (event.event === 'contact_form_success') {
    if (!['payload', 'hubspot'].includes(event.form_provider)) return
  } else if (
    !['cta_click', 'project_inquiry'].includes(event.event) ||
    !['contact', 'services', 'process', 'home_story', 'email'].includes(event.cta_id) ||
    !['header', 'footer', 'content'].includes(event.placement)
  )
    return
  // Reconstruct the schema even when a caller supplies unexpected runtime properties.
  const payload =
    event.event === 'contact_form_success'
      ? { event: event.event, form_provider: event.form_provider }
      : { event: event.event, cta_id: event.cta_id, placement: event.placement }
  try {
    window.dataLayer?.push(payload)
  } catch {
    /* Measurement must never interrupt a saved inquiry or navigation. */
  }
}
export function measureSubmission(provider: 'payload' | 'hubspot', receipt: string) {
  if (!receipt || submissionReceipts.has(`${provider}:${receipt}`)) return
  submissionReceipts.add(`${provider}:${receipt}`)
  // A pre-consent submission is intentionally discarded, never replayed after consent.
  measure({ event: 'contact_form_success', form_provider: provider })
}
