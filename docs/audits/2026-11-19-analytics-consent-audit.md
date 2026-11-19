# Dash 10 Studio analytics and consent audit

Date: November 19, 2026. Read-only audit of production, GTM and GA4. No container settings, GA4 settings, consent policy or application code changed; nothing published or deployed for this audit.

## Main findings

1. **Production GTM is installed, but the published container is empty.** GTM-MZ6ZN2NH Versions shows version 1, “Empty Container is Live,” with 0 tags/triggers/settings/variables. The Default Workspace has three additions: Google Tag — Dash 10 Studio, Manage automatic event detection, and Allow user-provided data capabilities. The pending Google Analytics tag uses G-MFJV44GKLV and Initialization — All Pages, with no custom configuration parameters. A dataLayer event alone is not a GA4 hit. Clean desktop/mobile Chrome sessions load and execute the intended container after acceptance, but make no GA4 collection requests and create no GA cookies.
2. **Consent Mode v2 is analytics-only basic mode by design.** Before choice and after decline, GTM is blocked. Acceptance queues default denial for all four consent types, then grants only analytics_storage before gtm.js. ad_storage, ad_user_data and ad_personalization remain denied. Google’s diagnostics panel explicitly describes the 0% warning as affecting ads measurement/personalization; Google’s documentation identifies this warning with always-denied ad_user_data outside EEA regions. This is consistent with the intentional advertising restriction, not evidence of denied analytics_storage after acceptance. Do not grant advertising permissions to clear it. The empty live container is a separate collection problem.
3. **The pending workspace has automatic personal-data detection enabled.** Allow user-provided data capabilities and Automatically detect user-provided data are both checked, including email, phone, and name/address. The UI notes processing depends on supported destinations and accepted terms; this audit does NOT establish that PII has been transmitted. Nevertheless, disable this pending capability before publication to meet the owner’s no-PII requirement. Do not accept user-provided-data terms or add enhanced conversions.
4. **One page-view owner must be selected.** The app already emits sanitized page_view events once per pathname change after acceptance. Both GTM automatic detection and GA4 enhanced measurement currently enable browser-history page views. The pending base tag has no send_page_view=false parameter. Simply publishing it would introduce automatic page views alongside the app’s queue; adding a forwarding tag without disabling automatic page views would create a duplication risk. Currently the app queue is not forwarded at all.
5. **Lead and CTA forwarding is missing.** The app emits contact_form_success only after durable Payload storage succeeds; receipt deduplication and consent gating are present. It does not emit generate_lead. There are no published GA4 event tags forwarding this event, cta_click or project_inquiry. A Contact-page visit/click must not be treated as a successful lead.
6. **Enhanced measurement is configured but not collecting through the empty live container.** GA4 stream 16363653996 matches the production URL and measurement ID. Page views/history, scrolls, outbound clicks, site search, form interactions, video engagement and downloads are enabled. Pending GTM automatic detection also enables history, scrolls, outbound, forms, video and downloads. GA4 email redaction is active; query-parameter redaction is inactive. A stream’s “active in past 48 hours” label does not establish current non-preview collection from production; this audit observed no live collection requests.

## Recommended configuration for approval

Keep one GTM container and one GA4 destination. Keep the existing Allow/Decline flow and saved preferences; returning visitors who accepted need no repeat prompt. Retain global basic-mode opt-in rather than introducing default-on tracking or regional assumptions. Keep all advertising consent denied. Additional consent checks must not require advertising permission for analytics-only tags.

| Measurement | Proposed single source and safeguards |
| --- | --- |
| Page views | Keep the existing application page_view queue. Configure the base Google tag with send_page_view=false; disable automatic browser-history page views in both relevant GTM and GA4 settings. Add exactly one custom-event GA4 forwarding tag for page_view, with sanitized page_location/page_referrer/page_path. Verify an initial visit, consent granted mid-page, each client route and Back/Forward produces exactly one collection event. Do not create a second GA4 “create event” rule for page_view. |
| Scroll engagement | Enable one enhanced-measurement scroll source (90% depth, not every scroll movement). Test reset/once-per-page behavior across virtual navigation in Preview. If finer 25/50/75/90% tracking is later approved, replace the 90% source with one deduplicated implementation; do not stack both. |
| Outbound links | Enable one outbound-click source. Strip query strings/fragments and exclude mailto/tel and any submitted or user-supplied URL/text. If the selected enhanced-measurement implementation cannot guarantee this filtering, turn its outbound option off and use one sanitized custom click event containing only an approved destination domain/link ID. Never send email addresses in link_url or link_text. |
| Leads | One GTM Custom Event trigger matching contact_form_success -> GA4 event generate_lead, with only form_provider=payload and optionally a fixed form_id=project_inquiry. Mark generate_lead as the lead key event. Do not derive it from form_submit, button clicks, success-text visibility, project_inquiry, or a Contact page view. Do not also create a GA4 event-conversion rule that duplicates it. Keep the existing client receipt deduplication; no record IDs, receipt UUIDs or submitted values are sent. |
| CTAs | Forward cta_click and project_inquiry once using the existing fixed cta_id/placement allowlists. Treat them as engagement, not saved-lead conversions. |
| Other automatic events | Disable Form interactions (not durable success), Site search (free text/query strings), and user-provided-data capabilities before launch. Video engagement is for supported YouTube embeds; it does not measure the self-hosted mountain video. Leave unused categories off unless a concrete measurement need is approved. |

Apply sanitized page context to **all** event types, not just manual page_view; automatic events otherwise can include the real document URL/referrer. Preserve email redaction as defense in depth and add known sensitive query-key redaction, without relying on redaction as the primary PII filter. Do not configure user_id, user_data, enhanced conversions, form-field variables or arbitrary DOM text. A query key list alone cannot cover all possible PII, so allowlisted event schemas and URL filtering remain necessary.

The current safePath maps privacy/terms to /other and all article paths to /posts/article. This protects against arbitrary paths but limits useful content reporting. A small approved allowlist of public pages/article slugs could improve reporting without admitting arbitrary visitor-supplied URLs.

Before activation, update the Privacy Policy’s accurate current statement that GA4 is not active in the published container. Describe the actual approved measurements and consent behavior after release; do not claim analytics is active before publication.

## Verification performed

Clean Chrome profiles, 1440x900 desktop and 390x900 mobile, production https://dash10studio.com:

- No Google tracking requests before a choice or after decline, including a subsequent client-side service navigation. No GA cookies.
- Acceptance queued all four default-denied Consent Mode v2 signals, then analytics_storage=granted only. Exactly one GTM-MZ6ZN2NH script/container initialized per document.
- Application page_view sequence after mid-session acceptance: /services, /about, /services on Back; exactly one queued view for each transition, with the expected sanitized preceding page.
- Footer Contact CTA queued exactly one project_inquiry with cta_id=contact and placement=footer; navigation queued one /contact page_view.
- Saved acceptance survived reload with no repeat consent prompt and one container on the new document.
- Declining via Analytics preferences revoked consent and reloaded; subsequent reload made no tracking request and had no GA cookies.
- Scrolling to the bottom did not produce a GA4 scroll request because the live container is empty. No GA4 collection request of any event type was observed in either viewport. Outbound/scroll/lead delivery cannot be declared verified until the approved configuration is published or Preview-tested.
- Integration/inquiry unit suites: 28 passed. Cover consent gating, safe event schema, stripping unexpected properties, no replay of pre-consent submissions, submission deduplication, provider/Payload failure semantics and persistent cooldown.
- Production browser regression with Google scripts blocked: passed; navigation, FAQ and Contact form remained usable.
- No new contact submission or notification was created for this analytics audit; confirmed-success behavior was checked in the existing code/unit tests. Do not fabricate a live generate_lead verification while no forwarding tag is published.

Evidence files (local only): /tmp/dash10-analytics-audit.json, /tmp/dash10-analytics-cta.json, /tmp/dash10-analytics-unit.log, /tmp/dash10-analytics-blocked.log. These test sessions can appear in container diagnostics but currently do not generate GA4 hits from the empty published container.

## Approval and release gates

Approval is required before changing/publishing GTM tags or settings, changing GA4 enhanced measurement/key-event settings, and deploying corresponding analytics/privacy changes. Do not publish the three existing workspace additions unchanged. First disable personal-data detection, choose and configure one page-view pipeline, add the safe event mappings, review payloads in Tag Assistant/DebugView, and only then publish one reviewed container version. Test accepted/declined/returning/revoked consent on both viewports; inspect actual GA4 network payloads and counts, not just the dataLayer. Verify blocked scripts leave navigation/FAQ/form functional. Inspect unsuccessful versus successful form saves with a controlled test only when authorized.

A shift to opt-out/default-on collection, advanced-mode denied-consent pings, geographic consent rules, advertising permissions, Google Signals or user-provided data would be a separate privacy-policy/legal-basis decision. It is not needed to implement automatic measurement after consent and is not approved by this audit. No jurisdictional exemption is assumed.

## Primary references

- [Google Consent Mode implementation](https://developers.google.com/tag-platform/security/guides/consent)
- [Google Tag Diagnostics: 0% consent warning](https://support.google.com/tagmanager/answer/14681508?hl=en)
- [GA4 single-page application measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
- [Enhanced measurement event behavior and collected parameters](https://support.google.com/analytics/answer/9216061)
- [GA4 redaction and its limitations](https://support.google.com/analytics/answer/13544947?hl=en)
