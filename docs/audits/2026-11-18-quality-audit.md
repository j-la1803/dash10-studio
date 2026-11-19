# Production quality and technical SEO audit

Audit date: November 18, 2026 (America/Chicago). Baseline production revision: `de14176`. Scope: existing Dash 10 Studio Next.js/React/Payload application and https://dash10studio.com. This is an incremental audit, not a redesign or certification.

## Baseline and existing foundations

The site already has the approved official SVG wordmark, monochrome typography, mountain video, natural-flow stories with a sticky progress rail, motion/reduced-motion fallbacks, keyboard menu/FAQ, durable Payload inquiry storage, private submissions, consent-gated GTM, and article canonicals/verified BlogPosting data. These were reused.

Before changes, the twelve-route browser audit found missing supporting-page canonicals and descriptions, template search metadata, duplicate `/home` and blog pagination/index paths, overlapping generated/server sitemaps (including search and fabricated fallback dates), missing legal routes, four low-contrast nodes across the story rail/article code, and Process/Blog reflow failures at 320px. Public primary content was server-rendered. The inquiry and preview APIs rejected anonymous private access.

## Focused changes

- Footer copyright and Privacy, Terms, Sitemap, Analytics preferences share one utility row; it wraps on mobile. Links have consistent type, minimum 24px interaction height, hover/focus underlines and visible focus. Existing consent behavior is reused with a footer portal; reopening focuses the first choice, closing returns focus, Escape closes an already-chosen preference panel. No extra footer strip.
- `/privacy` and `/terms` currently show noindex owner-review notices, not unreviewed policies. Full private drafts are in `content/drafts/legal/privacy-policy.md` and `content/drafts/legal/website-terms.md` (Git ignored, not deployed). No effective date, legal entity, retention period, liability waiver or jurisdiction has been invented.
- Native App Router `/sitemap.xml` and `/robots.txt` replace build-generated output. Sitemap contains public static routes, actual published CMS pages/posts, and real pagination pages where needed. Drafts, search, legal review notices, admin and preview routes are excluded. Static pages have no invented lastmod; CMS entries use actual updatedAt. Index lastmod is derived from its published posts. Cached data has the existing Payload invalidation tags and a 600-second fallback.
- Legacy sitemap routes redirect to the canonical sitemap. `/home` redirects to `/`; `/posts/page/1` redirects to `/posts`; invalid pagination is 404. Robots disallows private/utility areas while explicitly allowing public Payload media files and normal CSS/JS/images.
- Unique useful supporting-page metadata, production canonicals without query parameters, social metadata and an approved-image fallback. Search is noindex. Accurate Organization/WebSite JSON-LD complements existing article data; no LocalBusiness classification, invented authors, ratings, FAQ claims or hidden AI-specific content. Breadcrumb/Service markup was not added where it would be redundant or unsupported by navigation.
- Corrected rail/code contrast, accessible scene names include the visible 01–04 labels, semantic main landmarks, 320px heading wrapping, persistent marquee/video pause controls, and preserved reduced-motion fallbacks. The controls do not change logo/hero framing or story layout.
- Existing mountain poster converted to WebP: 2,035,203 bytes to approximately 85KB, at the same 1717×916 dimensions. Priority preload. Existing TTF fonts converted to WOFF2; glyph outlines and mappings verified identical. Original licensed files retained. MP4 metadata moved before media in a separate fast-start asset; no sample re-encoding, geometry, timing or quality change. Identical media SHA-256: `95cfe6ba8d8d9dfe29603fb3fc83768c590863ec0b928faef0d561f321547bbd`. Original source remains intact; playback remains once at 0.6× with final-frame hold.
- Added nosniff, same-origin framing, strict-origin referrer, restricted camera/microphone/geolocation and a limited compatible CSP (base-uri/object-src/frame-ancestors). It intentionally does not claim script-src/nonce-based XSS protection. Admin and preview responses carry noindex headers. Preview redirect validation rejects protocol-relative/backslash paths and missing configured secrets.
- Existing CMS API test corrected to Node environment, explicit shared-CMS opt-in, production-mode guard against development schema push, count-only query and connection teardown. Existing draft regression updated for the owner's intentional publication of the three articles. No article content, CMS records/schema, production secrets, DNS or hosting settings changed in this audit. The original MP4 remains available; the new faststart asset has the same 770,265 bytes and identical encoded media samples, with metadata moved before mdat. WOFF2 generation verifies every glyph outline against the approved TTF. The original fonts, licenses and PNG remain available; pages request the optimized assets.

## Performance measurements

Lighthouse CLI, Chrome, fresh profiles; default mobile simulated throttling and desktop preset. Scores are individual lab samples, not field Core Web Vitals or guarantees. The same production URL will be measured again after release. A local run made while several browser audits were concurrent is excluded from comparison because CPU contention distorted its blocking-time result.

| Production baseline | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 81 | 96 | 100 | 100 | 3.4s | 0ms | 0 |
| Mobile | 74 | 100 | 100 | 100 | 16.1s | 40ms | 0 |

The optimized local production build scored mobile Performance 80 / Accessibility 100 / Best practices 100 / SEO 100, LCP 5.2s, TBT 50ms, CLS 0. This is a different host/protocol from production and is not a direct before/after comparison; mobile LCP still exceeds the target in that sample. After-release production measurements will be recorded below. Field INP has not been measured; TBT is not INP. Meeting a lab score does not establish LCP/INP/CLS field thresholds. Sustained measurement requires real traffic and a reviewed field-data source.

## Verification

Production build and standalone TypeScript pass. The 33 relevant isolated Chrome checks pass on the focused implementation, including keyboard/FAQ/mobile menu, four natural-flow scenes and progress release, marquee motion/pause/reduced motion, video rate/end hold, SVG assets, footer utilities/consent focus, metadata/reflow/200% font sizing, valid XML/robots, redirects and private APIs. The complete 33-test pass was repeated successfully after font/video optimization.

All 16 offline unit tests pass; the one shared-CMS read test is opt-in and separately passes under `CMS_READ_TEST=true NODE_ENV=production VERCEL=1`. Lint has zero errors and the same three existing template warnings. The default unit run deliberately skips shared CMS initialization. The existing admin e2e helper creates/deletes a test account and was not run against production/shared data. No successful inquiry submission was sent; form persistence implementation and previously verified behavior were preserved, and anonymous access was rechecked.

Axe WCAG 2/2.1/2.2 A/AA checks find zero violations across all twelve updated routes; no horizontal document overflow at 320px. Internal links and existing anchor destinations pass (42 URLs/endpoints in the audit, including intentional private 403 responses). Server HTML contains primary headings and meaningful prose. JSON-LD parses and uses only actual organization/website/article facts; no claim is made of Google rich-result eligibility.

Native Chrome keyboard inspection verified the skip link is the first focusable page control, activates #main-content, and moves the subsequent tab stop into the main region. Browser keyboard regressions cover menu Escape, accordion controls, footer focus restoration and motion controls. Native accessibility-tree roles/names were inspected. Spoken VoiceOver/NVDA output has not been verified; representative assistive-technology testing by a human remains required. Automated checks do not establish WCAG 2.2 AA/ADA conformance.

## Security and privacy findings that remain open

**Framework dependency maintenance is a high-priority blocker to calling this a secure reference implementation.** `pnpm audit --prod --json` reports 10 critical, 36 high, 35 moderate and 12 low advisories in the resolved dependency tree (93 advisory records, not 93 demonstrated exploits). Some are development/build/feature-specific; no exploit attempts were made. Current direct versions include Next.js 16.2.6 and Payload packages 3.87.1.

Critical advisories include Payload Postgres/SQLite SQL injection, auth/field-access bypasses, form-builder RCE, unauthorized document updates, and Next.js image/cache/OG feature issues; the Windows-only advisory does not describe this Vercel Linux deployment. Reference examples: [Payload SQL injection](https://github.com/advisories/GHSA-v49j-62m6-pgrr), [form-builder RCE](https://github.com/advisories/GHSA-r488-j9vj-wx3q), [auth field access](https://github.com/advisories/GHSA-vc4h-q48j-5hcx), [Next image optimization](https://github.com/advisories/GHSA-2464-fhr4-w9xw). Current advisory floors reach Next.js 16.4.5 and Payload 3.90.0; re-audit the chosen compatible versions rather than assuming those versions resolve all transitive issues. A coordinated framework/Payload package upgrade needs isolated compatibility and schema-diff review. No automatic dependency rewrite or migration was applied.

Other remaining risks/limits:

- A full nonce/hash-based script CSP needs separate Next/Payload/preview/GTM compatibility work. Current CSP protects base/object/framing only.
- Inquiry spam controls are a honeypot, server-side length/email validation and persistent per-email 60-second cooldown. The cooldown is not an atomic cross-request deduplication guarantee; no distributed IP limiter/CAPTCHA was added or claimed.
- No automated inquiry retention/deletion policy is configured. Owner must establish actual retention, backup/log handling and request workflow.
- Runtime warns that CMS media uploads lack a durable storage adapter on Vercel. Existing static brand/video assets work; new CMS uploads need approved storage configuration before use.
- No email adapter is configured; inquiry success means saved to CMS, not email delivery. Owner notification/response workflow needs confirmation.
- Observed preview links still use a template signing-secret value. Authentication is also required and anonymous preview requests return 403. Owner should rotate the production preview secret through the existing secret-management process; no secret was changed or disclosed in this report.
- GTM remains consent-gated and only the approved container is installed. GA4 configuration/publication is external to the application and was not changed. App page_view events are deduplicated; verify actual GA4 network delivery and account-side automatic-page-view settings when publishing its workspace. HubSpot remains disabled/unverified in the tested public page.
- Pattern-based tracked-source/static-bundle checks found no private key/live-token/database credential strings. Only env example files are tracked. This is not proof of absence of every possible secret.

## Owner/legal review and deployment readiness

The focused non-destructive UI/SEO/accessibility/performance changes can ship after final regression verification. This is **not** final reference-quality/security/legal signoff. Do not publish policy drafts until the owner/legal reviewer resolves the operator identity, applicable rights/jurisdictions, processors/regions, retention/deletion/backups, email practices, Google settings, IP permissions and material Terms claims. Neither policy is attorney-approved.

Deploy only through main → existing Vercel project/domain. No DNS/infrastructure/schema/secret changes or newly exposed private content. Keep review notices noindex and out of the sitemap. After deploy, repeat production browser/axe/link/header checks and Lighthouse desktop/mobile; record the production commit and measured results here.

References: [Next native sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [Next headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers), [W3C pause/stop/hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html), [Google consent debugging](https://developers.google.com/tag-platform/security/guides/consent-debugging).
