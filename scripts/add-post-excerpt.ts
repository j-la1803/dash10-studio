// Explicit, additive migration approved for the existing shared CMS.
// No automatic schema push, table rebuild, data rewrite or destructive down migration.
import 'dotenv/config'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { Pool } = createRequire(require.resolve('@payloadcms/db-postgres'))('pg')
if (!process.argv.includes('--apply')) throw new Error('Run with --apply after approval')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const connection = await pool.connect()
try {
  await connection.query('BEGIN')
  await connection.query("SET LOCAL lock_timeout = '5s'")
  await connection.query('ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt varchar')
  await connection.query('ALTER TABLE _posts_v ADD COLUMN IF NOT EXISTS version_excerpt varchar')
  await connection.query('COMMIT')
  console.log(
    'Optional Posts excerpt and version_excerpt columns are ready; existing rows preserved.',
  )
} catch (error) {
  await connection.query('ROLLBACK')
  throw error
} finally {
  connection.release()
  await pool.end()
}
