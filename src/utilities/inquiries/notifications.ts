import type { Inquiry } from '@/app/(frontend)/contact/validation'
import { validEmail } from '@/app/(frontend)/contact/validation'

export type NotificationResult = {
  status: 'not_configured' | 'accepted' | 'failed'
  attemptedAt: string
  messageId?: string
  code?: string
}

// Server-side only: this module must never be imported by a client component.
export function inquiryEmailConfig(env: Record<string, string | undefined>) {
  if (env.CONTACT_NOTIFICATIONS_ENABLED !== 'true' || env.RESEND_DOMAIN_VERIFIED !== 'true')
    return null
  const key = env.RESEND_API_KEY?.trim()
  const from = env.CONTACT_NOTIFICATION_FROM?.trim()
  const recipients = [
    ...new Set(
      (env.CONTACT_NOTIFICATION_TO || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
  if (
    !key ||
    !from ||
    /[\r\n]/.test(from) ||
    !/^Dash 10 Studio <notifications@dash10studio\.com>$/.test(from) ||
    recipients.length !== 2 ||
    !recipients.every(validEmail)
  )
    return null
  return { key, from, recipients }
}

export function notificationBody(inquiry: Inquiry, submissionId: number | string) {
  return [
    `New Dash 10 Studio project inquiry #${submissionId}`,
    '',
    `Full name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company / Agency: ${inquiry.company || '(not provided)'}`,
    `Website URL: ${inquiry.website || '(not provided)'}`,
    `Service needed: ${inquiry.service}`,
    '',
    'Project details:',
    inquiry.message,
  ].join('\n')
}

export async function notifyInquiry(
  inquiry: Inquiry,
  submissionId: number | string,
  env: Record<string, string | undefined> = process.env,
  request: typeof fetch = fetch,
): Promise<NotificationResult> {
  const attemptedAt = new Date().toISOString()
  if (!validEmail(inquiry.email)) return { status: 'failed', attemptedAt, code: 'invalid_reply_to' }
  const config = inquiryEmailConfig(env)
  if (!config) return { status: 'not_configured', attemptedAt }
  try {
    const response = await request('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `dash10-project-inquiry-${submissionId}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: config.recipients,
        reply_to: inquiry.email,
        subject: `Dash 10 Studio project inquiry #${submissionId}`,
        text: notificationBody(inquiry, submissionId),
      }),
      signal: AbortSignal.timeout(10000),
    })
    const data = (await response.json()) as { id?: unknown }
    if (!response.ok || typeof data.id !== 'string' || !data.id)
      return { status: 'failed', attemptedAt, code: `http_${response.status}` }
    // Accepted by the API is not proof of delivery to either inbox.
    return { status: 'accepted', attemptedAt, messageId: data.id }
  } catch {
    // Never log credentials, visitor messages, recipient lists or provider error bodies.
    return { status: 'failed', attemptedAt, code: 'request_failed' }
  }
}
