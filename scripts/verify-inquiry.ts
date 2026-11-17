// Read back and remove only the synthetic inquiry created by the QA browser test.
import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const marker = process.argv[2]
if (!marker || !/^launch-qa-[a-z0-9-]+$/.test(marker))
  throw new Error('Provide a launch-qa- marker')
const payload = await getPayload({ config })
try {
  const forms = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Dash 10 Studio project inquiries' } },
    limit: 1,
    depth: 0,
  })
  if (!forms.docs[0]) throw new Error('Contact form missing')
  const submissions = await payload.find({
    collection: 'form-submissions',
    where: {
      and: [
        { form: { equals: forms.docs[0].id } },
        { 'submissionData.value': { equals: `${marker}@example.com` } },
      ],
    },
    limit: 10,
    depth: 0,
  })
  if (submissions.docs.length !== 1)
    throw new Error(`Expected one saved inquiry, received ${submissions.docs.length}`)
  const saved = submissions.docs[0]
  const fields = Object.fromEntries(
    (saved.submissionData || []).map((item) => [item.field, item.value]),
  )
  if (
    fields.name !== 'Dash 10 QA' ||
    fields.email !== `${marker}@example.com` ||
    !fields.message?.includes(`Reference: ${marker}`)
  )
    throw new Error('Stored values do not match the submitted inquiry')
  if (forms.docs[0].emails?.length)
    throw new Error('Unexpected email configuration: QA must not send mail')
  await payload.delete({ collection: 'form-submissions', id: saved.id })
  const report = {
    verifiedAt: new Date().toISOString(),
    marker,
    storage: 'Payload PostgreSQL form-submissions',
    savedId: saved.id,
    readBackMatches: true,
    duplicateSubmissionCount: submissions.docs.length,
    emailNotifications: false,
    syntheticFixtureRemoved: true,
  }
  await writeFile('docs/qa/inquiry-verification.json', JSON.stringify(report, null, 2) + '\n')
  console.log(
    'Verified persistent inquiry storage and exact submitted values. Removed the synthetic QA record. No email sent.',
  )
} finally {
  await payload.destroy()
}
process.exit(0)
