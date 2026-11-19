import { describe, expect, it } from 'vitest'
import { postgresPool } from '@/utilities/postgresPool'
const session =
  'postgresql://postgres.example:fixture-password@aws-0-example.pooler.supabase.com:5432/postgres?sslmode=require'
describe('serverless database connection lifecycle', () => {
  it('uses the existing transaction pooler only for Supabase on Vercel', () => {
    const url = new URL(postgresPool({ VERCEL: '1', DATABASE_URL: session }).connectionString)
    expect(url.port).toBe('6543')
    const original = new URL(session)
    for (const key of ['hostname', 'username', 'password', 'pathname', 'search'] as const)
      expect(url[key]).toBe(original[key])
    expect(postgresPool({ DATABASE_URL: session }).connectionString).toBe(session)
  })
  it('preserves explicit transaction, direct and non-Supabase endpoints', () => {
    for (const connection of [
      session.replace(':5432/', ':6543/'),
      'postgresql://localhost:5432/local',
      'postgresql://db.example.supabase.co:5432/postgres',
    ])
      expect(postgresPool({ VERCEL: '1', DATABASE_URL: connection }).connectionString).toBe(
        connection,
      )
  })
  it('bounds connection fan-out and retires idle/stale connections', () => {
    const pool = postgresPool({})
    expect(pool.max).toBe(3)
    expect(pool.min).toBe(0)
    expect(pool.idleTimeoutMillis).toBe(1000)
    expect(pool.connectionTimeoutMillis).toBe(10000)
    expect(pool.maxLifetimeSeconds).toBe(60)
  })
})
