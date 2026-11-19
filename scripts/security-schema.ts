// Offline schema generation. Never connects, pushes schema or runs application onInit.
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const outputFile = process.argv[2]
if (!outputFile) throw new Error('Provide an output path')
const payload = await getPayload({ config, disableDBConnect: true, disableOnInit: true })
try {
  if (!payload.db.generateSchema) throw new Error('Adapter does not support schema generation')
  await payload.db.generateSchema({ outputFile, log: false })
  console.log('Offline schema written:', outputFile)
} finally {
  await payload.destroy()
}
