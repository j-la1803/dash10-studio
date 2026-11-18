'use client'

import { useActionState, useState, useRef } from 'react'
import { measureSubmission } from '@/utilities/integrations/analytics'
import { submitInquiry } from '@/app/(frontend)/contact/actions'
import type { InquiryState } from '@/app/(frontend)/contact/validation'

const initial: InquiryState = { status: 'idle', message: '' }
export function ContactForm() {
  const locked = useRef(false)
  const receipt = useRef<string | null>(null)
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [state, action, pending] = useActionState(
    async (previous: InquiryState, data: FormData): Promise<InquiryState> => {
      if (locked.current) return previous
      locked.current = true
      try {
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
            'We couldn’t save your inquiry. Please try again, or email justin@dash10.studio.',
        }
      }
    },
    initial,
  )
  return (
    <div className="inquiry-panel">
      {state.status === 'success' ? (
        <p role="status" className="inquiry-success">
          {state.message}
        </p>
      ) : (
        <form action={action} className="inquiry-form" aria-label="Project inquiry">
          <label htmlFor="inquiry-name">
            Your name
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
          <label htmlFor="inquiry-message">
            Tell us about your project
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
            Include your goals, current platform, and any timing or budget you have in mind. Please
            leave out passwords and other sensitive information.
          </p>
          <div className="inquiry-honeypot" aria-hidden="true">
            <label htmlFor="inquiry-website">
              Leave this empty
              <input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className="inquiry-notice">
            Your name, email, and message are stored privately so Dash 10 Studio can respond to your
            inquiry.
          </p>
          {state.status === 'error' && <p role="alert">{state.message}</p>}
          <button className="studio-cta" type="submit" disabled={pending}>
            {pending ? 'SAVING INQUIRY…' : 'SEND PROJECT INQUIRY'}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      )}
    </div>
  )
}
