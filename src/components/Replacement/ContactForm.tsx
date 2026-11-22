'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitDesignInquiry } from './contact-action'
import { contactServices } from './contact-options'
import type { InquiryState } from '@/app/(frontend)/contact/validation'
import { measureSubmission } from '@/utilities/integrations/analytics'

const initial: InquiryState = { status: 'idle', message: '' }

/** Supplied five-field design; existing persistence, validation, Resend and deduplication. */
export function ReplacementContactForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    need: 'A new website',
  })
  const locked = useRef(false),
    requestId = useRef<string | null>(null)
  const feedback = useRef<HTMLParagraphElement>(null)
  const [state, action, pending] = useActionState(
    async (previous: InquiryState, data: FormData) => {
      if (locked.current) return previous
      locked.current = true
      requestId.current ||= crypto.randomUUID()
      data.set('requestId', requestId.current)
      try {
        const result = await submitDesignInquiry(previous, data)
        if (result.status === 'success') measureSubmission('payload', requestId.current)
        else locked.current = false
        return result
      } catch {
        locked.current = false
        return {
          status: 'error',
          message: 'We couldn’t confirm your inquiry was saved. Please try again.',
        } as InquiryState
      }
    },
    initial,
  )
  useEffect(() => {
    if (state.status !== 'idle') feedback.current?.focus()
  }, [state])
  return (
    <>
      <form
        id="contactForm"
        className="form2"
        action={action}
        aria-label="Project inquiry"
        aria-busy={pending}
      >
        <div>
          <label htmlFor="cName">Name</label>
          <input
            id="cName"
            name="name"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="cEmail">Email</label>
          <input
            id="cEmail"
            name="email"
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div>
          <label htmlFor="cCo">Company</label>
          <input
            id="cCo"
            name="company"
            value={values.company}
            onChange={(event) => setValues({ ...values, company: event.target.value })}
            autoComplete="organization"
            maxLength={200}
          />
        </div>
        <div>
          <label htmlFor="cNeed">What do you need?</label>
          <select
            id="cNeed"
            name="need"
            value={values.need}
            onChange={(event) => setValues({ ...values, need: event.target.value })}
          >
            {Object.keys(contactServices).map((need) => (
              <option key={need}>{need}</option>
            ))}
          </select>
        </div>
        <div className="full">
          <label htmlFor="cMsg">Tell us about the project</label>
          <textarea
            id="cMsg"
            name="message"
            value={values.message}
            onChange={(event) => setValues({ ...values, message: event.target.value })}
            minLength={20}
            maxLength={4800}
            required
          />
        </div>
        <div className="contact-trap" aria-hidden="true">
          <label htmlFor="contact-check">Leave this empty</label>
          <input id="contact-check" name="contact_check" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="full">
          <button
            className="btn solid"
            type="submit"
            disabled={pending || state.status === 'success'}
            style={{ width: '100%', maxWidth: 360, cursor: 'pointer' }}
          >
            {pending ? 'Saving inquiry…' : 'Write my message'}{' '}
            <svg
              width="16"
              height="16"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M12 36L36 12M16 12H36V32" />
            </svg>
          </button>
        </div>
        {state.status !== 'idle' && (
          <p
            className="full form-feedback"
            ref={feedback}
            role={state.status === 'success' ? 'status' : 'alert'}
            tabIndex={-1}
          >
            {state.message}
          </p>
        )}
      </form>
    </>
  )
}
