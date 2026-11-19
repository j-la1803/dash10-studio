import type { Payload } from 'payload'
import type { FormSubmission } from '@/payload-types'
import type { Inquiry, InquiryState } from '@/app/(frontend)/contact/validation'
import { notifyInquiry } from './notifications'

export const savedMessage = 'Your inquiry has been saved. Thanks for telling us about your project.'
const success = (): InquiryState => ({ status: 'success', message: savedMessage })

async function recordNotification(payload: Payload, stored: FormSubmission, inquiry: Inquiry) {
  const value = stored.submissionData?.find((item) => item.field === '_notification')?.value
  let status: string | undefined
  try {
    status = value ? JSON.parse(value).status : undefined
  } catch {
    /* Treat an unreadable receipt as uncertain. */
  }
  if (status === 'accepted') return
  if (status !== 'not_configured' && Date.now() - Date.parse(stored.createdAt) > 23 * 3600000) {
    payload.logger.warn('Saved inquiry requires notification history review before retry.')
    return
  }
  // Email is deliberately outside the persistence success boundary. A provider outage
  // must never discard a saved inquiry or invite another submission of the same data.
  try {
    const notification = await notifyInquiry(inquiry, stored.id)
    await payload.update({
      collection: 'form-submissions',
      id: stored.id,
      data: {
        submissionData: [
          ...(stored.submissionData || []).filter((item) => item.field !== '_notification'),
          { field: '_notification', value: JSON.stringify(notification) },
        ],
      },
    })
    if (notification.status === 'failed')
      payload.logger.warn('Inquiry notification failed; saved record retained for review.')
  } catch {
    payload.logger.warn(
      'Inquiry notification status unavailable; saved record retained for review.',
    )
  }
}

// The existing submission array stores all fields; no schema migration is needed.
export async function saveInquiry(
  payload: Payload,
  inquiry: Inquiry,
  rateKey?: string,
): Promise<InquiryState> {
  const forms = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Dash 10 Studio project inquiries' } },
    limit: 1,
    depth: 0,
  })
  const form = forms.docs[0]
  if (!form) throw new Error('Inquiry form is not configured')
  const existing = await payload.find({
    collection: 'form-submissions',
    depth: 0,
    limit: 1,
    where: {
      and: [
        { form: { equals: form.id } },
        { 'submissionData.value': { equals: inquiry.requestId } },
      ],
    },
  })
  if (existing.docs.length) {
    const record = existing.docs[0]
    const original = Object.fromEntries(
      (record.submissionData || []).map((item) => [item.field, item.value]),
    )
    if (Object.entries(inquiry).some(([key, value]) => original[key] !== value))
      return {
        status: 'error',
        message: 'This request has already been saved. Reload the page to start a new inquiry.',
      }
    // Recover a missed notification after an interrupted first attempt using the same provider key.
    await recordNotification(payload, record, inquiry)
    return success()
  }
  const count = async (minutes: number, value: string) =>
    (
      await payload.count({
        collection: 'form-submissions',
        where: {
          and: [
            { form: { equals: form.id } },
            { createdAt: { greater_than: new Date(Date.now() - minutes * 60000).toISOString() } },
            { 'submissionData.value': { equals: value } },
          ],
        },
      })
    ).totalDocs
  if (await count(1, inquiry.email))
    return {
      status: 'error',
      message:
        'An inquiry from this email was just received. Please wait a minute before sending another.',
    }
  if ((await count(60, inquiry.email)) >= 5 || (rateKey && (await count(60, rateKey)) >= 10))
    return {
      status: 'error',
      message: 'Too many inquiries were received recently. Please try again later.',
    }

  const submissionData = Object.entries(inquiry).map(([field, value]) => ({ field, value }))
  if (rateKey) submissionData.push({ field: '_rateKey', value: rateKey })
  const submission = await payload.create({
    collection: 'form-submissions',
    context: { studioInquiry: true },
    data: { form: form.id, submissionData },
  })
  const stored = await payload.findByID({
    collection: 'form-submissions',
    id: submission.id,
    depth: 0,
  })
  const persisted = Object.fromEntries(
    (stored.submissionData || []).map((item) => [item.field, item.value]),
  )
  if (Object.entries(inquiry).some(([key, value]) => persisted[key] !== value))
    throw new Error('Saved inquiry did not match submitted fields')

  await recordNotification(payload, stored, inquiry)
  return success()
}
