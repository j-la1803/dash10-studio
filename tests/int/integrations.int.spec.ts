import { createElement } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Analytics } from '@/components/Integrations/Analytics'
import { HubSpotForm } from '@/components/Integrations/HubSpotForm'
import { ContactForm } from '@/components/Studio/ContactForm'
import { gtmContainer, hubSpotConfig, type HubSpotConfig } from '@/utilities/integrations/config'
import {
  measure,
  measureSubmission,
  safePath,
  type MeasurementEvent,
} from '@/utilities/integrations/analytics'
const navigation = vi.hoisted(() => ({ path: '/' }))
const inquiry = vi.hoisted(() => ({ submit: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => navigation.path }))
vi.mock('@/app/(frontend)/contact/actions', () => ({ submitInquiry: inquiry.submit }))
const fixture: HubSpotConfig = {
  portalId: '12345',
  formId: '00000000-0000-0000-0000-000000000001',
  region: 'na1',
}
const fallback = createElement('p', null, 'Existing private inquiry form')
beforeEach(() => {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    clear: () => storage.clear(),
    removeItem: (key: string) => storage.delete(key),
  })
  navigation.path = '/'
  window.dataLayer = []
  window.dashAnalyticsAllowed = false
  document.getElementById('dash-gtm')?.remove()
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) =>
    window.setTimeout(() => fn(0), 0),
  )
  vi.stubGlobal('cancelAnimationFrame', (n: number) => clearTimeout(n))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  delete window.HubSpotFormsV4
})
const events = () =>
  window.dataLayer!.filter(
    (x): x is Record<string, unknown> => !!x && typeof x === 'object' && 'event' in x,
  )

describe('integration release gates', () => {
  it('uses only the confirmed GTM container, supports disabling, and keeps HubSpot gated', () => {
    expect(gtmContainer({ GTM_CONTAINER_ID: 'GTM-TEST123', ANALYTICS_ENABLED: 'true' })).toBeNull()
    expect(
      gtmContainer({
        GTM_CONTAINER_ID: 'invalid',
        ANALYTICS_ENABLED: 'true',
        ANALYTICS_VERIFIED: 'true',
      }),
    ).toBeNull()
    expect(gtmContainer({})).toBe('GTM-MZ6ZN2NH')
    expect(gtmContainer({ GTM_CONTAINER_ID: 'GTM-MZ6ZN2NH' })).toBe('GTM-MZ6ZN2NH')
    expect(gtmContainer({ ANALYTICS_ENABLED: 'false' })).toBeNull()
    expect(gtmContainer({ GTM_CONTAINER_ID: 'GTM-P2S64XCX' })).toBeNull()
    expect(hubSpotConfig({ HUBSPOT_ENABLED: 'true', HUBSPOT_VERIFIED: 'true' })).toBeNull()
    const view = render(createElement(HubSpotForm, { config: null, fallback }))
    expect(view.getByText('Existing private inquiry form')).toBeTruthy()
    expect(document.querySelector('script[src*="hsforms"]')).toBeNull()
  })
})
describe('consented analytics', () => {
  it('loads once after opt-in, measures initial/client navigation once, and strips personal input', () => {
    const view = render(createElement(Analytics, { containerId: 'GTM-TEST123' }))
    expect(document.getElementById('dash-gtm')).toBeNull()
    expect(events()).toHaveLength(0)
    fireEvent.click(screen.getByText('Allow analytics'))
    expect(document.querySelectorAll('#dash-gtm')).toHaveLength(1)
    expect(events().filter((e) => e.event === 'page_view')).toHaveLength(1)
    view.rerender(createElement(Analytics, { containerId: 'GTM-TEST123' }))
    expect(events().filter((e) => e.event === 'page_view')).toHaveLength(1)
    navigation.path = '/contact?email=private@example.com'
    view.rerender(createElement(Analytics, { containerId: 'GTM-TEST123' }))
    expect(events().filter((e) => e.event === 'page_view')).toHaveLength(2)
    measure({
      event: 'contact_form_success',
      form_provider: 'payload',
      email: 'private@example.com',
    } as unknown as MeasurementEvent)
    expect(JSON.stringify(events())).not.toContain('private@example.com')
    expect(events().at(-1)).toEqual({ event: 'contact_form_success', form_provider: 'payload' })
    expect(safePath('/posts/private@example.com?name=Alice')).toBe('/posts/article')
  })
  it('discards pre-consent submissions and deduplicates success receipts', () => {
    measureSubmission('payload', 'before-consent-fixture')
    expect(events()).toHaveLength(0)
    window.dashAnalyticsAllowed = true
    measureSubmission('payload', 'before-consent-fixture')
    expect(events()).toHaveLength(0)
    measureSubmission('payload', 'after-consent-fixture')
    measureSubmission('payload', 'after-consent-fixture')
    expect(events()).toEqual([{ event: 'contact_form_success', form_provider: 'payload' }])
  })
  it('decline and disabled integration never load GTM', () => {
    const view = render(createElement(Analytics, { containerId: null }))
    expect(view.container.textContent).toBe('')
    view.rerender(createElement(Analytics, { containerId: 'GTM-TEST123' }))
    fireEvent.click(screen.getByText('Decline analytics'))
    expect(document.getElementById('dash-gtm')).toBeNull()
    expect(events()).toHaveLength(0)
  })
})
describe('HubSpot verified success lifecycle', () => {
  it('ignores wrong instances/failure and records one confirmed receipt, then removes the form', async () => {
    window.dashAnalyticsAllowed = true
    const view = render(createElement(HubSpotForm, { config: fixture, fallback }))
    await waitFor(() => expect(view.container.querySelector('script')).toBeTruthy())
    window.HubSpotFormsV4 = {
      getFormFromEvent: () => ({
        getFormId: () => fixture.formId,
        getInstanceId: () => 'instance-one',
        getConversionId: () => 'confirmed-conversion',
      }),
    }
    const emit = (name: string, instanceId = 'instance-one') =>
      act(() => {
        window.dispatchEvent(
          new CustomEvent(`hs-form-event:${name}`, {
            detail: { formId: fixture.formId, instanceId },
          }),
        )
      })
    emit('on-submission:success')
    expect(events()).toHaveLength(0)
    emit('on-ready')
    emit('on-submission:success', 'wrong-instance')
    expect(events()).toHaveLength(0)
    emit('on-submission:failed')
    expect(events()).toHaveLength(0)
    emit('on-submission:success')
    emit('on-submission:success')
    expect(events()).toEqual([{ event: 'contact_form_success', form_provider: 'hubspot' }])
    expect(view.container.querySelector('.hs-form-frame')).toBeNull()
    expect(screen.getByText('Thanks. Your project inquiry has been received.')).toBeTruthy()
  })
  it('offers the existing form on provider load error', async () => {
    const view = render(createElement(HubSpotForm, { config: fixture, fallback }))
    await waitFor(() => expect(view.container.querySelector('script')).toBeTruthy())
    fireEvent.error(view.container.querySelector('script')!)
    fireEvent.click(screen.getByText('Use the secure inquiry form'))
    expect(screen.getByText('Existing private inquiry form')).toBeTruthy()
    expect(events()).toHaveLength(0)
  })
  it('locks the private form while saving and emits only after durable success', async () => {
    window.dashAnalyticsAllowed = true
    let resolve!: (value: { status: 'success'; message: string }) => void
    inquiry.submit.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const view = render(createElement(ContactForm))
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test Person' } })
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'private@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Tell us about your project'), {
      target: { value: 'A private project description with enough characters.' },
    })
    const form = view.container.querySelector('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    await waitFor(() => expect(inquiry.submit).toHaveBeenCalledTimes(1))
    expect(events()).toHaveLength(0)
    await act(async () => {
      resolve({ status: 'success', message: 'Saved privately' })
    })
    expect(events()).toEqual([{ event: 'contact_form_success', form_provider: 'payload' }])
    expect(screen.getByText('Saved privately')).toBeTruthy()
  })
})
