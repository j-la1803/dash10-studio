'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { validateInquiry, type InquiryState } from './validation'

export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const inquiry = validateInquiry(formData)
  if (!inquiry)
    return {
      status: 'error',
      message:
        'Please enter your name, a valid email, and a message between 20 and 5,000 characters.',
    }

  try {
    const payload = await getPayload({ config })
    const forms = await payload.find({
      collection: 'forms',
      where: { title: { equals: 'Dash 10 Studio project inquiries' } },
      limit: 1,
      depth: 0,
    })
    const form = forms.docs[0]
    if (!form) throw new Error('Inquiry form is not configured')

    // Persistent cooldown works across application instances. Personal data stays in Payload.
    const recent = await payload.count({
      collection: 'form-submissions',
      where: {
        and: [
          { form: { equals: form.id } },
          { createdAt: { greater_than: new Date(Date.now() - 60_000).toISOString() } },
          { 'submissionData.value': { equals: inquiry.email } },
        ],
      },
    })
    if (recent.totalDocs)
      return {
        status: 'error',
        message:
          'An inquiry from this email was just received. Please wait a minute before sending another.',
      }

    const submission = await payload.create({
      collection: 'form-submissions',
      context: { studioInquiry: true },
      data: {
        form: form.id,
        submissionData: Object.entries(inquiry).map(([field, value]) => ({ field, value })),
      },
    })
    // Confirm a durable read before telling the visitor the inquiry is saved.
    await payload.findByID({ collection: 'form-submissions', id: submission.id, depth: 0 })
    return {
      status: 'success',
      message: 'Your inquiry has been saved. Thanks for telling us about your project.',
    }
  } catch {
    // Do not expose database errors or visitor details in the response or logs.
    return {
      status: 'error',
      message: 'We couldn’t save your inquiry. Please try again, or email justin@dash10.studio.',
    }
  }
}
