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
// Confirmed production container. Environment settings can disable analytics, but
// a stale or unrelated container ID must never install a second/wrong container.
export const productionGtmContainer = 'GTM-MZ6ZN2NH'
export function gtmContainer(env: Record<string, string | undefined>) {
  if (env.ANALYTICS_ENABLED === 'false' || env.ANALYTICS_VERIFIED === 'false') return null
  const container = env.GTM_CONTAINER_ID || productionGtmContainer
  return container === productionGtmContainer ? container : null
}
