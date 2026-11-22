// Read-only verification for one explicitly labeled, owner-authorized browser QA inquiry.
// NODE_ENV=production REPLACEMENT_QA_MARKER=... node --import=tsx/esm scripts/verify-replacement-storage.ts
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
if (process.env.NODE_ENV !== 'production') throw new Error('Production mode prevents schema push')
const marker = process.env.REPLACEMENT_QA_MARKER
if (!marker || !/^D10-REPLACEMENT-QA-[a-z0-9-]+$/i.test(marker))
  throw new Error('A specific QA marker is required')
const payload = await getPayload({ config })
try {
  const records = await payload.find({
    collection: 'form-submissions',
    depth: 0,
    limit: 5,
    where: { 'submissionData.value': { contains: marker } },
  })
  const result = records.docs.map((doc) => {
    const values = Object.fromEntries(
      (doc.submissionData || []).map((field) => [field.field, field.value]),
    )
    let notification: Record<string, unknown> = {}
    try {
      notification = JSON.parse(values._notification || '{}')
    } catch {
      /* report uncertain receipt only */
    }
    return {
      id: doc.id,
      form: doc.form,
      createdAt: doc.createdAt,
      hasName: Boolean(values.name),
      hasEmail: Boolean(values.email),
      hasCompany: Boolean(values.company),
      service: values.service,
      messageIncludesSelectedNeed: values.message?.includes('What do you need?'),
      hasTestMarker: values.message?.includes(marker),
      notificationStatus: notification.status,
      notificationMessageId: notification.messageId || null,
    }
  })
  console.log(JSON.stringify({ matchingSubmissions: records.totalDocs, records: result }, null, 2))
} finally {
  await payload.destroy()
}

// This standalone verifier must not retain Payload background scheduler handles.
process.exit(0)
