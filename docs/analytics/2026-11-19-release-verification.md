# GA4/GTM production release verification — November 19, 2026

Production application commit: `ef73cb7075f586d7e0f6b251784528bcc6b7b352` (Vercel deployment succeeded). GTM-MZ6ZN2NH **Version 2 is Live**, named “Dash 10 — consent-safe GA4 release 2026-11-19.” Published through the existing authorized browser session; not merely saved/imported. Measurement destination G-MFJV44GKLV; GA4 enhanced measurement is confirmed off. Personal-data capabilities and all competing GTM automatic categories are disabled.

## Verified results

- TypeScript, production build, scoped lint: passed.
- Unit suite: 39 passed, one pre-existing opt-in integration test skipped.
- Local production-mode regression suite: 14 passed (analytics consent/scroll/outbound, GPC/DNT, agency form, legal pages and blocked tracking).
- Production consent regression suite: six passed, covering accepted/declined/revoked consent, client navigation, saved preferences, scroll/outbound behavior and GPC/DNT at 1440x900 and 390x900. The test now waits for the Contact route to render before granting consent, avoiding a false extra-homepage-view assertion during in-flight navigation.
- Two clean, non-Preview production Chrome sessions (1440x900 and 390x900): one GTM request (HTTP 200) per document and successful GA4 collection responses (HTTP 204). Each session recorded exactly five page_view hits for `/`, `/about`, Back to `/`, `/contact`, `/privacy`. No duplicate automatic views.
- Each session recorded the expected 90% scroll events, one project_inquiry CTA and one outbound `click` carrying only destination_id=google_privacy. Merely filling the Contact form produced no form_start, form_submit or generate_lead.
- Synthetic query-string and form-field sentinel values were absent from all captured Google request URLs/bodies. No names, email addresses, telephone numbers, messages, full outbound URLs or arbitrary titles were forwarded by the event pipeline.
- Before consent and on reload after withdrawal: zero Google tracking requests. GPC/DNT override even a saved allow preference. GA4 requests after acceptance carry analytics-only consent (G101) and non-personalized ads (`npa=1`); Tag Assistant separately confirms all advertising consent types denied.
- Tag Assistant Preview: one initial view and one client-navigation view with sanitized context, safe outbound click, scroll/CTA forwarding, and exactly one confirmed contact_form_success -> generate_lead hit. Submitted fixture name/email/project text absent from the lead hit. Shared Payload submission #8 exists exactly once; no notification email was sent from the local Preview build.
- GA4 Realtime visibly reported page_view, scroll, click and **one generate_lead** from the controlled Preview test. Realtime is aggregate/delayed, not the source of the per-session exact-count assertions above; those use captured production requests. QA traffic can affect near-term reports.
- generate_lead registered as a GA4 key event using “Create with code” (existing GTM implementation), once per event, no default monetary value. No parallel no-code event-generation rule was created. Existing unrelated key events were preserved. The test hit preceded key-event registration, so this report does not claim a retroactive key-event count of one.

## Remaining limitation

No reliable jurisdiction-specific consent-policy system exists. Global affirmative opt-in is retained as explicitly permitted by the approval; U.S. visitors are not assumed eligible for default-on tracking. Lawful regional auto-enablement requires a separately verified location/policy implementation. The 0% advertising-consent diagnostic may persist because ad_user_data remains deliberately denied; do not enable ads permissions to clear it.

Saved inquiries remain the authoritative lead record; analytics can be blocked or interrupted. Standard GA4 pseudonymous cookie/session identifiers and technical request information remain part of consented GA4 processing. “No PII fields” is not a claim that analytics processes no personal data in any legal sense.

Raw local evidence: `/tmp/dash10-ga4-live-results.json`, `/tmp/dash10-ga4-production-regression.log`, `/tmp/dash10-ga4-final-browser.log`, `/tmp/dash10-ga4-all-unit.log`, `/tmp/dash10-ga4-build.log`, `/tmp/dash10-ga4-tsc.log`, `/tmp/dash10-ga4-lint.log`. No credentials or Preview authentication URLs are included here.
