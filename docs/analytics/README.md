# Dash 10 analytics release configuration

Reviewed November 19, 2026. This directory records the approved application-owned event pipeline for GTM-MZ6ZN2NH / G-MFJV44GKLV. `gtm-reviewed.json` is the importable configuration, based on an export of the existing workspace (not a second container). Publication is a separate GTM action; an import alone does not make a version live.

## Consent and regional limitation

No verified jurisdiction-specific consent system exists in this project. Affirmative opt-in is therefore retained globally, including uncertain U.S. visitors. Do not infer that country=US alone permits tracking. Saved declines, browser Global Privacy Control and Do Not Track override saved acceptance; advertising storage, ad user data and ad personalization remain denied. No geolocation service, default-on collection, advanced-mode denied-consent measurement, ad personalization or user-data collection is enabled.

Returning accepted visitors load automatically without another prompt unless a privacy signal overrides that choice. Analytics preferences can reopen the choice. Revocation sends a denied update, removes accessible first-party GA cookies and reloads. A final consent-update request may occur during revocation; subsequent page loads must remain blocked. Google blocking must never prevent website or inquiry functionality.

## Event contract

| Application event | GA4 event | Permitted event-specific values |
| --- | --- | --- |
| page_view | page_view | Sanitized page_path, page_location, page_referrer; fixed page_title |
| contact_form_success | generate_lead | form_provider=payload or hubspot; HubSpot remains disabled |
| cta_click | cta_click | Allowlisted cta_id and placement |
| project_inquiry | project_inquiry | Allowlisted cta_id=contact and placement; **not** a saved lead |
| scroll | scroll | percent_scrolled=90, once per route visit |
| outbound_click | click | destination_id=google_privacy or external |

Outbound events contain no destination URL, link text, email, telephone number or user-supplied hostname. Mailto/tel are excluded. Every application event reconstructs a fixed schema; event-specific fields are cleared to null before the next event, preventing GTM's merged data model from carrying old values forward. Page context is queued before GTM initialization and refreshed before each route's page_view. Query strings, fragments, arbitrary paths and article slugs are never forwarded. Receipt IDs and Payload document IDs are not sent. GA4 still uses its normal consented pseudonymous browser/session identifiers and technical request information; this is not a claim that analytics processes no personal data at all.

Successful leads require durable Payload confirmation. Client locking and success receipt deduplication prevent repeat events for the same client submission; pre-consent successes are discarded rather than replayed. Browser/ad-blocker/network failures can prevent analytics even when an inquiry is saved; GA4 is not the authoritative inquiry ledger.

## GTM configuration

- Existing base Google Analytics tag: destination G-MFJV44GKLV; Initialization — All Pages; send_page_view=false; allow_google_signals=false; allow_ad_personalization_signals=false; safe page context variables.
- One GA4 Event forwarding tag: Custom Event regex `^(page_view|contact_form_success|cta_click|project_inquiry|scroll|outbound_click)$`; fixed event-name mapping; only the documented data-layer variables; analytics_storage required. No arbitrary-event forwarding, field-value variables, DOM scraping or user properties.
- Automatic user-provided data capabilities disabled. All GTM automatic detection categories disabled.
- GA4 web stream 16363653996: Enhanced measurement disabled to prevent a second scroll/outbound/history/form/search pipeline. The base tag's send_page_view=false also prevents standard initial automatic views. Keep existing email redaction enabled.
- Mark generate_lead as the lead key event (one count per event); do not create a parallel GA4 create-event mapping from contact_form_success and do not mark CTA clicks/form_submit as leads.

The JSON import uses **Merge → overwrite conflicting tags/triggers/variables**, preserving existing names and avoiding renamed duplicate tags. The reviewed import adds one custom trigger and ten variables and updates only the two scoped tags/settings. Never use the default Overwrite option without examining deletion previews.

## Release and rollback

1. Run TypeScript, production build, unit tests and `analytics-pipeline`, agency-contact, legal and blocked-tracking browser checks.
2. Import into the existing workspace, then GTM Preview the local production build. Inspect actual Hits Sent and consent state. Validate page-view counts, one stored inquiry -> one generate_lead, CTA/scroll/outbound payloads, and no submitted values.
3. Deploy the application/privacy changes through existing main -> Vercel. The current website works with an empty published container during this short transition.
4. Submit/publish only the reviewed GTM workspace, with a descriptive version name. Record the actual version in the release report. Do not claim an import or saved draft is published.
5. In clean desktop/mobile production browsers inspect successful GA4 collection requests, page-view count across initial/client/back navigation, GPC/DNT, accepted/declined/revoked consent, and no duplicate scripts. Check GA4 Realtime. Realtime/report processing and ad blockers can affect visibility; requests/dataLayer alone are not proof of a report entry.
6. Rollback: disable analytics using the existing application environment gate if urgently necessary, or restore the previous known GTM version. Keep opt-in and advertising-denied settings. Do not delete inquiry records or change the database.

## Verification evidence

Preview before publication confirmed the base tag plus one forwarding tag, sanitized initial/navigation hits, analytics-only consent (G101 with advertising denied), a confirmed saved inquiry -> one generate_lead with no fixture name/email/message, and an outbound click hit with only its fixed category. Synthetic inquiry **Payload #8**, marker `agency-qa-analytics-20261119`, is retained exactly once in the shared CMS. It was submitted from the local production-mode Preview build; local notification delivery remained disabled (`not_configured`). It is an analytics QA fixture, not a new customer lead or email-delivery test.

The initial review's duplicate-submit concern was resolved through a read-only zero-record lookup and unchanged idle form before the single actual submit. No duplicate record was created.

Raw local test logs live under `/tmp/dash10-ga4-*`; they are not credentials or release artifacts. Never commit Preview authentication URLs, cookies or access tokens.
