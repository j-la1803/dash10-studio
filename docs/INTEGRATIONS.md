# Integration setup and release gates

## Current state

The source audit found no existing GTM, direct GA4, HubSpot or consent scripts. The approved GTM installation uses only `GTM-MZ6ZN2NH`, with the existing private Payload inquiry form remaining live. GTM requests require analytics opt-in. HubSpot remains inactive. No production environment was changed.

## HubSpot Free form

Create the project inquiry form in the **updated HubSpot forms editor**. Copy the real portal ID, form UUID and region from its supplied embed code. Configure `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, and `HUBSPOT_REGION` (`na1`, `na2`, or `eu1`); no private tokens are needed or accepted. `HUBSPOT_ENABLED=true` and `HUBSPOT_VERIFIED=true` must both be set for the wrapper to replace the existing form. A missing/invalid value fails closed to Payload.

Set the flags only in a staging/preview environment first, using the real IDs. Verify load, field validation, responsive layout, labels/focus, HubSpot's consent/privacy settings, and receipt in the HubSpot CRM. Confirm that pressing submit twice does not create two inquiries. Do not set the production verification flag until this real delivery check passes and activation is approved. Rebuild/redeploy after changing flags: Contact is currently statically rendered.

The wrapper loads HubSpot's hosted regional embed script, not a self-hosted copy. It supports one instance per form UUID on a page, installs listeners before injection, and provides loading/error/fallback states. Script errors and a 15-second load timeout offer the working private inquiry form. The success UI removes the embed, preventing another submission. A matching form ID and instance ID plus the provider's `getConversionId()` after `hs-form-event:on-submission:success` are required for measurement. Duplicate success notifications share one receipt and emit once. Failure, readiness and button clicks are not success. No field values or conversion IDs are sent to analytics.

Site CSS uses documented HubSpot CSS variables for Inter, monochrome inputs/buttons and square corners. Free-form branding, iframe styling and available customization remain controlled by HubSpot. Verify the actual form in preview; do not hide required vendor branding or rely on styles crossing an iframe boundary. Legacy `hbspt.forms.create` callbacks are intentionally not mixed with updated-form events.

References: [HubSpot forms styling](https://developers.hubspot.com/docs/cms/start-building/features/forms/forms), [global success/instance events](https://developers.hubspot.com/docs/api-reference/latest/marketing/forms/global-form-events).

## GTM and GA4

The confirmed production default is `GTM-MZ6ZN2NH`; `.env.example` documents the same public identifier. `GTM_CONTAINER_ID` may explicitly select that confirmed ID; any other ID fails closed. `ANALYTICS_ENABLED=false` or `ANALYTICS_VERIFIED=false` disables installation. No Vercel environment changes are necessary. Install **one Google/GA4 tag inside GTM**, not a direct gtag script in Next.js. No GA4 measurement ID belongs in this application.

Use basic opt-in consent: no GTM request, noscript tracking iframe, cookieless ping or event replay before consent. Default analytics and ad consent is denied. Allowing analytics grants only analytics storage; ad storage, ad user data and ad personalization remain denied. Decline leaves tags unloaded. Analytics preferences remain available for withdrawal, which denies consent, clears accessible first-party GA cookies and reloads to unload the container. Storage failure falls back to an in-memory choice. This is an analytics-only implementation; adding ads or other vendors requires a separate consent review.

Configure the container as follows before publishing:

1. Disable the Google tag's automatic `send_page_view`. Do not attach a second All Pages page-view event, History Change page-view trigger, or direct GA tag. Disable Enhanced Measurement history-based page changes, form interactions and outbound clicks; this application owns those planned events.
2. Set the Google tag/event defaults for `page_location`, `page_path`, and `page_referrer` from the corresponding safe data-layer variables. Never use raw Page URL, query strings, document titles, raw click URLs or form fields. The app sends route-only URLs without queries/fragments, maps article routes to `/posts/article`, and unknown routes to `/other` to avoid accidental personal data in paths. Counts remain one per pathname transition, including article-to-article navigation.
3. Add custom event triggers and GA4 event tags for the fixed schemas below, with analytics consent checks. Do not add a separate automatic form-success listener.
4. Use Tag Assistant and GA4 DebugView in preview: before consent, after allow/decline, initial load, Next.js client navigation, browser back/forward, CTA clicks, one successful inquiry, failed inquiry, repeated success notifications, and consent withdrawal. Confirm one page_view per route transition and one success event per accepted inquiry. Verify no names, emails, messages, query strings or arbitrary URLs appear in payloads.
5. Production installation is approved. The public GTM container response inspected on November 17 has resource version 1, with empty tags/triggers/rules and no GA4 measurement ID. The GA4 tag for `G-MFJV44GKLV` is reportedly configured in the workspace, but workspace changes must be reviewed against steps 1–4 and published in GTM before Analytics delivery can be verified. This application release does not publish the GTM workspace or create a direct GA4 installation. No production secrets or infrastructure changes are required.

| Event | Parameters | Meaning |
| --- | --- | --- |
| `page_view` | safe `page_path`, `page_location`, `page_referrer` | Initial consenting view or client pathname transition; one source only |
| `project_inquiry` | fixed `cta_id=contact`, `placement` | Contact CTA intent, **not a conversion** |
| `cta_click` | fixed `cta_id`, `placement` | Other key CTA intent; does not include link text or email URLs |
| `contact_form_success` | `form_provider=payload` or `hubspot` | Verified successful submission; the single intended GA4 key event |

The existing Payload form measures success only after the server durably writes and reads the inquiry. Its client action is locked while saving and remains locked after success; errors allow retry. HubSpot measurements require the provider success receipt. Receipts are deduplicated locally and discarded from measurement payloads. Submissions before analytics consent are not replayed later.

Reference: [Google basic consent implementation](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic).

## Brand assets and limits

The guide specifies uppercase Inter SemiBold 600 with −3% headline tracking, Inter body text and JetBrains Mono for technical details. The official outlined wordmark remains unchanged. Existing Inter files are retained; JetBrains Mono is locally served with its OFL license. No font attempts to redraw the logo.

The eight-cell technology bar describes tools, not partnerships. Google Tag Manager uses the geometry from Google's [official SVG](https://www.gstatic.com/analytics-suite/header/suite/v2/ic_tag_manager.svg), displayed in grayscale. Existing six platform SVG assets are retained. HubSpot is a plain referential name because [its trademark terms](https://legal.hubspot.com/tm-usage-guidelines) require written permission for the logo and disallow recoloring it. Supply approved monochrome artwork and permission before replacing that label with a logo; no substitute wordmark is fabricated.

The favicon generator extracts the exact approved D10 glyph group, removes the enclosing frame and changes only the fill/canvas to transparent black. SVG, transparent PNG sizes and ICO are provided. Fixed black artwork necessarily has reduced contrast on very dark tab backgrounds; it is not recolored or given a background because the approved specification explicitly requires black and transparency.

## Private article source

The GitHub repository is public. `/content/drafts/` is ignored so the unpublished article bodies, excerpts and source manifest stay on the local workstation and in private Payload drafts. They are not part of the Git deployment. The local review index is `content/drafts/README.md`; the CMS drafts are IDs 2–4. The explicit import script requires those local source files and never runs during build/deployment. Public article URLs and anonymous API queries remain inaccessible until separate publication approval. Back up or edit the drafts through the authenticated CMS; do not commit the private source directory before approval.
