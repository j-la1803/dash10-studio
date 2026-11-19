// Explicitly approved additive migration. Default mode validates in a temporary table and rolls back.
// No Payload initialization, development push, record rewrites, or destructive rollback.
import 'dotenv/config'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { postgresPool } from '../src/utilities/postgresPool'
const require = createRequire(import.meta.url)
const { Pool } = createRequire(require.resolve('@payloadcms/db-postgres'))('pg')
const apply = process.argv.includes('--apply')
const sql = await readFile(
  new URL('../migrations/20261118_payload_390.sql', import.meta.url),
  'utf8',
)
const pool = new Pool(postgresPool(process.env))
const connection = await pool.connect()
try {
  await connection.query('BEGIN')
  await connection.query("SET LOCAL lock_timeout = '5s'")
  await connection.query("SET LOCAL statement_timeout = '15s'")
  const { rows } = await connection.query(
    `SELECT data_type, datetime_precision, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='reset_password_requested_at'`,
  )
  const compatible = (column: {
    data_type: string
    datetime_precision: number
    is_nullable: string
    column_default: unknown
  }) =>
    column.data_type === 'timestamp with time zone' &&
    column.datetime_precision === 3 &&
    column.is_nullable === 'YES' &&
    column.column_default === null
  if (rows.length && !compatible(rows[0]))
    throw new Error('Existing column has an unexpected definition; no changes applied')
  await connection.query('CREATE TEMP TABLE dash10_payload_390_probe (id integer) ON COMMIT DROP')
  await connection.query(sql.replace('public.users', 'pg_temp.dash10_payload_390_probe'))
  const probe = await connection.query(
    `SELECT data_type, datetime_precision, is_nullable, column_default FROM information_schema.columns WHERE table_name='dash10_payload_390_probe' AND column_name='reset_password_requested_at'`,
  )
  if (probe.rows.length !== 1 || !compatible(probe.rows[0]))
    throw new Error('Temporary schema validation failed')
  if (apply) {
    await connection.query(sql)
    await connection.query('COMMIT')
    console.log('Applied/verified one nullable timestamp column; no records rewritten.')
  } else {
    await connection.query('ROLLBACK')
    console.log(
      'Dry run passed: one nullable timestamp(3) with time zone, no default. Shared schema unchanged.',
    )
  }
} catch (error) {
  await connection.query('ROLLBACK')
  throw error
} finally {
  connection.release()
  await pool.end()
}
