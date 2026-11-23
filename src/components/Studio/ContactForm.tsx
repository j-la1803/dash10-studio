'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { measureSubmission } from '@/utilities/integrations/analytics'
import { submitInquiry } from '@/app/(frontend)/contact/actions'
import { inquiryServices, type InquiryState } from '@/app/(frontend)/contact/validation'

const initial: InquiryState = { status: 'idle', message: '' }
export function ContactForm() {
  const locked = useRef(false)
  const receipt = useRef<string | null>(null)
  const requestId = useRef<string | null>(null)
  const [values, setValues] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    service: '',
    message: '',
  })
  const [state, action, pending] = useActionState(
    async (previous: InquiryState, data: FormData): Promise<InquiryState> => {
      if (locked.current) return previous
      locked.current = true
      try {
        requestId.current ||= crypto.randomUUID()
        data.set('requestId', requestId.current)
        const result = await submitInquiry(previous, data)
        if (result.status === 'success') {
          receipt.current ||= crypto.randomUUID()
          measureSubmission('payload', receipt.current)
        } else locked.current = false
        return result
      } catch {
        locked.current = false
        return {
          status: 'error',
          message:
            'We couldn’t confirm your inquiry was saved. Please try again in a moment.',
        }
      }
    },
    initial,
  )
  const feedback = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (state.status !== 'idle') feedback.current?.focus()
  }, [state])
  return (
    <div className="inquiry-panel">
      {state.status === 'success' ? (
        <p ref={feedback} tabIndex={-1} role="status" className="inquiry-success">
          {state.message}
        </p>
      ) : (
        <form
          action={action}
          className="inquiry-form"
          aria-label="Project inquiry"
          aria-busy={pending}
        >
          <label htmlFor="inquiry-name">
            Full name
            <input
              id="inquiry-name"
              name="name"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
            />
          </label>
          <label htmlFor="inquiry-email">
            Email address
            <input
              id="inquiry-email"
              name="email"
              value={values.email}
              onChange={(event) => setValues({ ...values, email: event.target.value })}
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          <label htmlFor="inquiry-company">
            Company / Agency (optional)
            <input
              id="inquiry-company"
              name="company"
              autoComplete="organization"
              maxLength={200}
              value={values.company}
              onChange={(event) => setValues({ ...values, company: event.target.value })}
            />
          </label>
          <label htmlFor="inquiry-url">
            Website URL (optional)
            <input
              id="inquiry-url"
              name="website"
              type="url"
              autoComplete="url"
              maxLength={2048}
              placeholder="https://"
              value={values.website}
              onChange={(event) => setValues({ ...values, website: event.target.value })}
            />
          </label>
          <label htmlFor="inquiry-service">
            <span id="inquiry-service-label">Service needed</span>
            <select
              aria-labelledby="inquiry-service-label"
              id="inquiry-service"
              name="service"
              required
              value={values.service}
              onChange={(event) => setValues({ ...values, service: event.target.value })}
            >
              <option value="" disabled>
                Select a service
              </option>
              {inquiryServices.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="inquiry-message">
            Project details
            <textarea
              id="inquiry-message"
              name="message"
              value={values.message}
              onChange={(event) => setValues({ ...values, message: event.target.value })}
              rows={7}
              minLength={20}
              maxLength={5000}
              required
              aria-describedby="inquiry-help"
            />
          </label>
          <p id="inquiry-help">
            Include your goals, current platform, and the technical help you need. Please leave out
            passwords and other sensitive information.
          </p>
          <div className="inquiry-honeypot" aria-hidden="true">
            <label htmlFor="inquiry-contact-check">
              Leave this empty
              <input
                id="inquiry-contact-check"
                name="contact_check"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          <p className="inquiry-notice">
            The information you provide is stored privately so Dash 10 Studio can respond to your
            inquiry.
          </p>
          {state.status === 'error' && (
            <p ref={feedback} tabIndex={-1} role="alert">
              {state.message}
            </p>
          )}
          <button className="studio-cta" type="submit" disabled={pending}>
            {pending ? 'SAVING INQUIRY…' : 'SEND PROJECT INQUIRY'}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      )}
    </div>
  )
}
