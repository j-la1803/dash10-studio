// Explicit operator retry: default is read-only. Never use this to resend accepted mail.
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { inquiryEmailConfig, notifyInquiry } from '../src/utilities/inquiries/notifications'
import { validateInquiry } from '../src/app/(frontend)/contact/validation'
const id = Number(process.argv[2])
if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Provide an existing inquiry ID')
const payload = await getPayload({ config })
try {
  const record = await payload.findByID({ collection: 'form-submissions', id, depth: 0 })
  const values = Object.fromEntries(
    (record.submissionData || []).map((item) => [item.field, item.value]),
  )
  const formData = new FormData()
  for (const [key, value] of Object.entries(values))
    if (typeof value === 'string') formData.set(key, value)
  const inquiry = validateInquiry(formData)
  if (!inquiry) throw new Error('Record is not a valid agency inquiry; no email sent')
  const previous = JSON.parse(values._notification || '{}')
  const ready = Boolean(inquiryEmailConfig(process.env))
  if (!process.argv.includes('--send'))
    console.log(
      JSON.stringify({
        id,
        ready,
        previousStatus: previous.status || 'not_recorded',
        dryRun: true,
      }),
    )
  else {
    if (!ready) throw new Error('Resend is not fully configured/verified/enabled; no email sent')
    if (previous.status === 'accepted')
      throw new Error('Already accepted: inspect delivery logs/inboxes instead of sending again')
    if (
      previous.status !== 'not_configured' &&
      Date.now() - Date.parse(record.createdAt) > 23 * 3600000
    )
      throw new Error(
        'Outside safe provider idempotency window; manually verify provider history before retrying',
      )
    const result = await notifyInquiry(inquiry, id)
    await payload.update({
      collection: 'form-submissions',
      id,
      data: {
        submissionData: [
          ...(record.submissionData || []).filter((item) => item.field !== '_notification'),
          { field: '_notification', value: JSON.stringify(result) },
        ],
      },
    })
    console.log(JSON.stringify({ id, ...result, deliveryConfirmed: false }))
  }
} finally {
  await payload.destroy()
}
process.exit(0)
