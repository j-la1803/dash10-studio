// Read-only content/schema snapshot for reviewing an explicitly approved additive migration.
import 'dotenv/config'
import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { postgresPool } from '../src/utilities/postgresPool'
const require = createRequire(import.meta.url)
const { Pool } = createRequire(require.resolve('@payloadcms/db-postgres'))('pg')
const output = process.argv[2]
if (!output?.startsWith('content/drafts/'))
  throw new Error('Use a private, ignored content/drafts path')
const pool = new Pool(postgresPool(process.env))
const connection = await pool.connect()
try {
  await connection.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  const { rows: columns } = await connection.query(
    `SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position`,
  )
  const tables = [...new Set(columns.map((c: { table_name: string }) => c.table_name))].filter(
    (name) => /^(posts|_posts_v|pages|_pages_v|categories)(_|$)/.test(String(name)),
  )
  const content: Record<string, unknown[]> = {}
  for (const name of tables) {
    const identifier = String(name).replaceAll('"', '""')
    const { rows } = await connection.query(
      `SELECT to_jsonb(t) AS record FROM "${identifier}" t ORDER BY to_jsonb(t)::text`,
    )
    content[String(name)] = rows.map((row: { record: unknown }) => row.record)
  }
  const { rows: users } = await connection.query('SELECT count(*)::integer AS count FROM users')
  await connection.query('COMMIT')
  const hash = createHash('sha256').update(JSON.stringify(content)).digest('hex')
  await writeFile(
    output,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        columns,
        content,
        contentHash: hash,
        userCount: users[0].count,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  )
  console.log(
    JSON.stringify({
      tables: tables.length,
      posts: content.posts?.length,
      userCount: users[0].count,
      contentHash: hash,
    }),
  )
} catch (error) {
  await connection.query('ROLLBACK')
  throw error
} finally {
  connection.release()
  await pool.end()
}
