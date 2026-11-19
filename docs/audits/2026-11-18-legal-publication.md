# Public legal pages — November 18, 2026

Publication is explicitly authorized by the owner. Effective date uses America/Chicago. The website operator is identified as Dash 10 Studio, without inventing a corporate entity, mailing address, jurisdiction, certification or compliance guarantee.

## Verified behavior

- Inspected both original files in `content/drafts/legal/`. Replaced review notices with complete server-rendered policies. Local Markdown copies now mirror the final pages; deployed TSX is the authoritative website source.
- Contact fields: name, email, project message; server validation/honeypot/cooldown. Successful response follows a saved submission and database read. `form-submissions` read/delete access requires authentication; inquiry creation bypass protection remains. No inquiry was created, edited or deleted for this work.
- Existing shared CMS form configuration read only: one matching form, zero notification rules. Payload has no configured email adapter. No automatic email-delivery promise is made.
- Supabase confirmed from configured DATABASE_URL host (no connection string or credentials logged); Payload uses its Postgres adapter. Vercel production is the existing hosting workflow. Payload is described as CMS software rather than a separate hosted recipient.
- Production `/contact` renders the Payload form and no HubSpot embed; no HubSpot network requests observed. Prepared integration is not described as active.
- Fresh isolated Chrome before consent: no Google tracking requests. After Allow analytics: GTM-MZ6ZN2NH HTTP 200 and initialized container. Published script contains no confirmed GA4 ID/tag; no GA4 requests or analytics cookies observed. The policy explicitly distinguishes installed GTM from inactive GA4 rather than claiming GA4 is already collecting data. Declining again retains deny and reloads with no analytics cookies. No Google workspace/settings were changed.
- Application event payloads are allowlisted and omit inquiry fields/query strings; consent controls and anonymous inquiry access remain unchanged.
- No automatic inquiry-retention/deletion job is configured; policy states records remain until removed, without inventing a period. Provider log/backup retention, project regions, mailbox provider and account-specific Google settings were not established by repository configuration. No specific period, region, mailbox vendor or third-party deletion guarantee is asserted. No broader off-site business practices are claimed.

## Implementation and checks

- Shared LegalPage uses existing monochrome editorial classes, semantic article/H1/H2/time, comfortable reading width/line height and one inline email contact per page. No contact buttons added.
- Removed obsolete review component and placeholder-specific noindex. Draft-mode noindex in the common layout is retained for authenticated previews.
- Added `/privacy` and `/terms` to public sitemap routes while keeping their reserved CMS slugs excluded from duplicates. Bumped sitemap cache key so persistent cache cannot serve the old exclusion after deployment.
- TypeScript and production build pass; 16 offline unit tests pass (shared CMS test skipped by default). Sixteen relevant Chrome checks pass, including 1440/390/320 legal reflow, semantic HTML, canonical/robots, footer links, consent focus, contact fallback and existing header/tracking regressions.
- Whole-page axe checks for both documents at 1440 and 390 have zero WCAG A/AA violations. Automated checks do not establish universal legal or accessibility compliance.

Primary factual provider references: [Google service data](https://policies.google.com/technologies/partner-sites), [Google Analytics collection](https://support.google.com/analytics/answer/11593727), [Vercel shared responsibilities](https://vercel.com/docs/security/shared-responsibility), [Supabase shared responsibilities](https://supabase.com/docs/guides/deployment/shared-responsibility-model). Current site observations take precedence over planned integrations and generic provider capabilities.

No material publication blocker remains for the statements actually made. Activating GA4, HubSpot or a new data use requires revisiting the Privacy Policy. No database, infrastructure, secrets, branding or analytics implementation was modified.
