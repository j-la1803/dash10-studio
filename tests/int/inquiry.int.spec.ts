import { beforeEach, describe, expect, it, vi } from 'vitest'
import { inquiryServices, validateInquiry } from '@/app/(frontend)/contact/validation'
import { inquiryEmailConfig, notifyInquiry } from '@/utilities/inquiries/notifications'
import { saveInquiry } from '@/utilities/inquiries/saveInquiry'
import type { Payload } from 'payload'

const requestId = '4d50acb1-8e5e-40d7-a7cd-f5e42e501b34'
const fields = {
  name: 'Agency QA',
  email: 'visitor@example.com',
  company: 'Example agency',
  website: 'https://example.com/',
  service: inquiryServices[0],
  message: 'A synthetic inquiry for white-label development testing.',
  requestId,
}
const form = (change: Record<string, string | undefined> = {}) => {
  const data = new FormData()
  for (const [key, value] of Object.entries({ ...fields, ...change })) {
    if (typeof value === 'string') data.set(key, value)
  }
  return data
}
const env = {
  RESEND_API_KEY: 'test-only-key',
  RESEND_DOMAIN_VERIFIED: 'true',
  CONTACT_NOTIFICATIONS_ENABLED: 'true',
  CONTACT_NOTIFICATION_FROM: 'Dash 10 Studio <notifications@dash10studio.com>',
  CONTACT_NOTIFICATION_TO: 'first@example.com,second@example.com',
}
beforeEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('agency inquiry validation and notification safety', () => {
  it('accepts the six fields and permits empty optional fields', () => {
    expect(validateInquiry(form())).toEqual(fields)
    expect(validateInquiry(form({ company: '', website: '' }))).toMatchObject({
      company: '',
      website: '',
    })
  })
  it.each([
    { contact_check: 'bot' },
    { name: 'a' },
    { name: 'Alice\r\nBcc: attacker@example.com' },
    { email: 'visitor@example.com\r\nBcc: attacker@example.com' },
    { service: 'invented' },
    { website: 'javascript:alert(1)' },
    { website: 'https://user:pass@example.com' },
    { company: 'a'.repeat(201) },
    { message: 'short' },
    { requestId: 'invalid' },
  ])('rejects invalid/spam/header input %j', (change) =>
    expect(validateInquiry(form(change))).toBeNull(),
  )
  it('never contacts Resend when verification or configuration is missing', async () => {
    const send = vi.fn()
    expect(inquiryEmailConfig({ ...env, RESEND_DOMAIN_VERIFIED: 'false' })).toBeNull()
    expect((await notifyInquiry(fields, 12, { ...env, RESEND_API_KEY: '' }, send)).status).toBe(
      'not_configured',
    )
    expect(send).not.toHaveBeenCalled()
  })
  it('uses both recipients, a fixed From, validated Reply-To and a retry key', async () => {
    const send = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 'message-123' }), { status: 200 }))
    const result = await notifyInquiry(fields, 12, env, send)
    expect(result).toMatchObject({ status: 'accepted', messageId: 'message-123' })
    const [url, options] = send.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(options.headers['Idempotency-Key']).toBe('dash10-project-inquiry-12')
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({
      from: env.CONTACT_NOTIFICATION_FROM,
      to: ['first@example.com', 'second@example.com'],
      reply_to: fields.email,
    })
    for (const field of ['name', 'email', 'company', 'website', 'service', 'message'] as const)
      expect(body.text).toContain(fields[field])
    expect(body.html).toBeUndefined()
  })
  it('reports provider rejection without returning secret or provider error text', async () => {
    const send = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'private-provider-error' }), { status: 403 }),
      )
    expect(await notifyInquiry(fields, 12, env, send)).toMatchObject({
      status: 'failed',
      code: 'http_403',
    })
  })
})

function store() {
  const submissionData = Object.entries(fields).map(([field, value]) => ({ field, value }))
  return {
    find: vi
      .fn()
      .mockResolvedValueOnce({ docs: [{ id: 1 }] })
      .mockResolvedValueOnce({ docs: [] }),
    count: vi.fn().mockResolvedValue({ totalDocs: 0 }),
    create: vi.fn().mockResolvedValue({ id: 12 }),
    findByID: vi.fn().mockResolvedValue({ id: 12, submissionData }),
    update: vi.fn().mockResolvedValue({}),
    logger: { warn: vi.fn() },
  }
}
describe('durable inquiry success boundary', () => {
  it('requires exact persistent read-back before success', async () => {
    const db = store()
    db.findByID.mockResolvedValue({ id: 12, submissionData: [] })
    await expect(saveInquiry(db as unknown as Payload, fields)).rejects.toThrow('did not match')
    expect(db.update).not.toHaveBeenCalled()
  })
  it('never reports success when persistence fails', async () => {
    const db = store()
    db.create.mockRejectedValue(new Error('database unavailable'))
    await expect(saveInquiry(db as unknown as Payload, fields)).rejects.toThrow(
      'database unavailable',
    )
    expect(db.findByID).not.toHaveBeenCalled()
  })
  it('keeps a saved record successful when notification status cannot be stored', async () => {
    vi.stubEnv('CONTACT_NOTIFICATIONS_ENABLED', 'false')
    const db = store()
    db.update.mockRejectedValue(new Error('status write unavailable'))
    expect(await saveInquiry(db as unknown as Payload, fields)).toMatchObject({ status: 'success' })
    expect(db.logger.warn).toHaveBeenCalled()
  })
  it('retains durable success when the provider rejects email', async () => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })))
    const db = store()
    expect(await saveInquiry(db as unknown as Payload, fields)).toMatchObject({ status: 'success' })
    expect(JSON.parse(db.update.mock.calls[0][0].data.submissionData.at(-1).value)).toMatchObject({
      status: 'failed',
    })
    expect(db.create).toHaveBeenCalledTimes(1)
  })
  it('reuses an identical request without another save or notification', async () => {
    const db = store()
    db.find
      .mockReset()
      .mockResolvedValueOnce({ docs: [{ id: 1 }] })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 12,
            submissionData: [
              ...Object.entries(fields).map(([field, value]) => ({ field, value })),
              { field: '_notification', value: JSON.stringify({ status: 'accepted' }) },
            ],
          },
        ],
      })
    expect(await saveInquiry(db as unknown as Payload, fields)).toMatchObject({ status: 'success' })
    expect(db.create).not.toHaveBeenCalled()
    expect(db.update).not.toHaveBeenCalled()
  })
  it('recovers a missed notification on a saved request without recreating it', async () => {
    vi.stubEnv('CONTACT_NOTIFICATIONS_ENABLED', 'false')
    const db = store()
    db.find
      .mockReset()
      .mockResolvedValueOnce({ docs: [{ id: 1 }] })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 12,
            createdAt: new Date().toISOString(),
            submissionData: Object.entries(fields).map(([field, value]) => ({ field, value })),
          },
        ],
      })
    expect(await saveInquiry(db as unknown as Payload, fields)).toMatchObject({ status: 'success' })
    expect(db.create).not.toHaveBeenCalled()
    expect(db.update).toHaveBeenCalledTimes(1)
  })
  it('applies the persistent cooldown before creating a record', async () => {
    const db = store()
    db.count.mockResolvedValue({ totalDocs: 1 })
    expect(await saveInquiry(db as unknown as Payload, fields)).toMatchObject({
      status: 'error',
      message: expect.stringContaining('wait a minute'),
    })
    expect(db.create).not.toHaveBeenCalled()
  })
})
