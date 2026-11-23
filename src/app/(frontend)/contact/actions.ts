'use server'

import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { saveInquiry } from '@/utilities/inquiries/saveInquiry'
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
        'Check your name, email, website URL, selected service, and project details (between 20 and 5,000 characters).',
    }
  try {
    let rateKey: string | undefined
    // Only trust the platform-controlled address on Vercel. Never persist a raw IP.
    if (process.env.VERCEL === '1' && process.env.PAYLOAD_SECRET) {
      const ip = (await headers()).get('x-vercel-forwarded-for')?.split(',')[0].trim()
      if (ip && isIP(ip))
        rateKey = createHmac('sha256', process.env.PAYLOAD_SECRET)
          .update(`inquiry:${new Date().toISOString().slice(0, 10)}:${ip}`)
          .digest('hex')
    }
    return await saveInquiry(await getPayload({ config }), inquiry, rateKey)
  } catch {
    return {
      status: 'error',
      message:
        'We couldn’t confirm your inquiry was saved. Please try again in a moment.',
    }
  }
}
