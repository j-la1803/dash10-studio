// Idempotent content setup only. Does not seed, reset, or migrate the database.
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
try {
  const title = 'Dash 10 Studio project inquiries'
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: title } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length)
    console.log('Contact form already exists; existing configuration preserved.')
  else {
    const form = await payload.create({
      collection: 'forms',
      data: {
        title,
        confirmationMessage: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                direction: 'ltr',
                children: [
                  {
                    type: 'text',
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Your inquiry has been saved.',
                  },
                ],
              },
            ],
          },
        },
        submitButtonLabel: 'Send project inquiry',
        confirmationType: 'message',
        emails: [],
        fields: [
          { name: 'name', label: 'Your name', blockType: 'text', required: true },
          { name: 'email', label: 'Email address', blockType: 'email', required: true },
          { name: 'message', label: 'Project details', blockType: 'textarea', required: true },
        ],
      },
    })
    console.log(
      `Created contact form ${form.id}. Inquiries are stored privately in Payload; email notifications are not enabled.`,
    )
  }
} finally {
  await payload.destroy()
}

process.exit(0)
