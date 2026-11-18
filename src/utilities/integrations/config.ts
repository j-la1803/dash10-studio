export type HubSpotConfig = { portalId: string; formId: string; region: 'na1' | 'na2' | 'eu1' }
export function hubSpotConfig(env: Record<string, string | undefined>): HubSpotConfig | null {
  const {
    HUBSPOT_PORTAL_ID: portalId = '',
    HUBSPOT_FORM_ID: formId = '',
    HUBSPOT_REGION: region,
  } = env
  if (
    env.HUBSPOT_ENABLED !== 'true' ||
    env.HUBSPOT_VERIFIED !== 'true' ||
    !/^\d+$/.test(portalId) ||
    !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(formId) ||
    !['na1', 'na2', 'eu1'].includes(region || '')
  )
    return null
  return { portalId, formId, region: region as HubSpotConfig['region'] }
}
export function gtmContainer(env: Record<string, string | undefined>) {
  return env.ANALYTICS_ENABLED === 'true' &&
    env.ANALYTICS_VERIFIED === 'true' &&
    /^GTM-[A-Z0-9]+$/.test(env.GTM_CONTAINER_ID || '')
    ? env.GTM_CONTAINER_ID!
    : null
}
