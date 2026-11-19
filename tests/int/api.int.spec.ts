// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload | undefined
// This repository's .env points to a shared CMS. Default unit runs must not initialize it.
describe.skipIf(process.env.CMS_READ_TEST !== 'true')('read-only shared CMS API', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'production')
      throw new Error('Use NODE_ENV=production to prevent development schema push')
    payload = await getPayload({ config })
  })
  afterAll(async () => {
    await payload?.destroy()
  })
  it('can count configured CMS users without reading credentials or writing records', async () => {
    const result = await payload!.count({ collection: 'users' })
    expect(result.totalDocs).toBeGreaterThan(0)
  })
})
