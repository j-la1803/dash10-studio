// Read-only verifier for the explicitly synthetic browser-test record. Does not delete it.
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const marker = process.argv[2]
if (!marker || !/^agency-qa-[a-z0-9-]+$/.test(marker))
  throw new Error('Provide an agency-qa- marker')
const payload = await getPayload({ config })
try {
  const result = await payload.find({
    collection: 'form-submissions',
    depth: 0,
    limit: 10,
    where: { 'submissionData.value': { equals: `${marker}@example.com` } },
  })
  if (result.docs.length !== 1)
    throw new Error(`Expected one synthetic inquiry, found ${result.docs.length}`)
  const doc = result.docs[0]
  const values = Object.fromEntries(
    (doc.submissionData || []).map((item) => [item.field, item.value]),
  )
  if (
    values.name !== 'Dash 10 QA' ||
    values.company !== 'Synthetic agency QA' ||
    values.website !== 'https://example.com/agency' ||
    values.service !== 'White-label development' ||
    !values.message?.includes(marker) ||
    !values.requestId
  )
    throw new Error('Stored fields do not match fixture')
  console.log(
    JSON.stringify({
      id: doc.id,
      persisted: true,
      fieldsVerified: ['name', 'email', 'company', 'website', 'service', 'message'],
      notificationStatus: JSON.parse(values._notification || '{}').status || 'not_recorded',
      duplicateCount: result.docs.length,
      syntheticRecordRetained: true,
    }),
  )
} finally {
  await payload.destroy()
}
process.exit(0)
