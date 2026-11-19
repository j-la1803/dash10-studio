// Defaults to a read-only plan. Apply alongside release of the prepared UI.
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import type { Form } from '../src/payload-types'
import { inquiryServices } from '../src/app/(frontend)/contact/validation'
const payload = await getPayload({ config })
try {
  const result = await payload.find({
    collection: 'forms',
    depth: 0,
    limit: 2,
    where: { title: { equals: 'Dash 10 Studio project inquiries' } },
  })
  if (result.docs.length !== 1) throw new Error('Expected exactly one existing inquiry form')
  const form = result.docs[0]
  const current = form.fields || []
  const additions = [
    { blockType: 'text', name: 'company', label: 'Company / Agency', required: false },
    { blockType: 'text', name: 'website', label: 'Website URL', required: false },
    {
      blockType: 'select',
      name: 'service',
      label: 'Service needed',
      required: true,
      options: inquiryServices.map((value) => ({ label: value, value })),
    },
  ] satisfies NonNullable<Form['fields']>
  const fields = [...current]
  for (const field of additions)
    if (!fields.some((existing) => 'name' in existing && existing.name === field.name))
      fields.push(field)
  const rank = ['name', 'email', 'company', 'website', 'service', 'message']
  fields.sort((a, b) => {
    const index = (field: typeof a) => ('name' in field ? rank.indexOf(field.name || '') : -1)
    return (index(a) < 0 ? 100 : index(a)) - (index(b) < 0 ? 100 : index(b))
  })
  if (process.argv.includes('--apply')) {
    await payload.update({ collection: 'forms', id: form.id, data: { fields } })
    console.log(
      'Updated only inquiry-form field definitions; existing submissions and notification rules preserved.',
    )
  } else
    console.log(
      JSON.stringify({
        dryRun: true,
        id: form.id,
        existingFields: current.length,
        proposedFields: fields.length,
        additiveFieldNames: additions
          .filter(
            (field) =>
              !current.some((existing) => 'name' in existing && existing.name === field.name),
          )
          .map((field) => field.name),
      }),
    )
} finally {
  await payload.destroy()
}
process.exit(0)
