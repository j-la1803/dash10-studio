// Supabase recommends its existing transaction pooler for horizontally scaled functions.
// Keep CLI/migration and non-Supabase connection strings exactly as configured.
export function postgresPool(env: Record<string, string | undefined>) {
  let connectionString = env.DATABASE_URL || ''
  if (env.VERCEL === '1' && connectionString) {
    const url = new URL(connectionString)
    if (url.hostname.endsWith('.pooler.supabase.com') && (!url.port || url.port === '5432')) {
      url.port = '6543'
      connectionString = url.toString()
    }
  }
  return {
    connectionString,
    // Payload retains a control connection; leave two slots for queries/transactions.
    max: 3,
    min: 0,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 10000,
    maxLifetimeSeconds: 60,
    application_name: 'dash10-payload',
  }
}
