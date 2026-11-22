# Complete website replacement — preview review, November 21, 2026

Production remains unchanged at `8d6c1087495f7aca1e8e5b88f1948ef39500fa6a` (GitHub Production deployment 7956017452). Unfinished heading work was preserved in local checkpoint `99f9bab`; implementation branch is `codex/complete-website-replacement`. No production merge/deployment is authorized yet.

## Implementation

- The eight owner-supplied HTML files are preserved verbatim in `src/components/Replacement/source/`. `scripts/import-approved-design.mjs` generates server-rendered React template data and the exact source CSS. No standalone replacement host, iframe, previous global CSS, previous hero component or previous poster components are used by the eight replacement routes.
- Header, footer, all inline SVGs, page text, spacing, responsive rules and supplied motion logic come from these files. The exact referenced Inter/JetBrains Mono Latin faces are self-hosted. The referenced `assets/dash-10-video-bg-slowed.mp4` maps to the existing identically named `/videos/` asset; no encoding or old hero layout is reused.
- HTML links map to Next.js routes, including `/blog`. Historical `/posts/{slug}` article URLs, metadata/JSON-LD, draft access, content, images and relationships remain in the existing Payload implementation. The new reusable article shell extends the supplied blog typography, grid, reading width, navigation and footer. All future posts automatically use it.
- The supplied mobile menu has focus management, Escape and focus containment. A nested `<main>` in the exported homepage becomes a layout-equivalent `<div>`. Historical `#web-development` is retained alongside the supplied `#web` service target without changing grid spacing.
- The five-field source contact form uses the existing Payload/Resend pipeline, validation, honeypot, throttling, request-ID deduplication, Reply-To rules and consent-aware success measurement. It never opens an email app. The exact selected need is included in the saved message/notification; its category maps to the existing service enum. Raw messages are validated before the selection label is added. No schema, environment or sending configuration changes were made.
- GA4/GTM and saved consent/opt-out signals are retained. `/blog` is added to the sanitized analytics path whitelist, sitemap and publication invalidation. No additional analytics scripts or personal-data parameters were introduced.

## Approved / necessary differences from static reference

1. Owner explicitly approved complete existing Privacy/Terms policies in the supplied legal shell, rather than the ZIP placeholders. Existing effective dates are retained. Privacy wording reflects the five visible form fields.
2. Owner explicitly approved published articles replacing “Coming soon”/drafting/empty-state copy. Article titles, excerpts, categories, publication dates and destinations come from Payload.
3. Real inquiry persistence and accessible feedback replace the prototype email-composer panel. Visible form fields, labels, button appearance and placement retain the supplied design.
4. The existing Analytics preferences control remains in the footer. Native Next.js links, valid route fragments, source asset paths, semantic markup and menu focus handling are functional adaptations.

## Verification

- TypeScript and production build pass.
- Existing units: 39 passed, one intentionally skipped shared-CMS read test. New contact adapter tests: nine passed (48 passing total).
- Lint: zero errors; three existing warnings in unchanged populateAuthors, SplitContent and admin-test code.
- Focused replacement browser tests: three passed at mobile/desktop, covering menu, navigation, all three article destinations, metadata/content, native validation, server-side spam rejection, retained values, focus feedback and consent/page-view/CTA behavior.
- All eight pages compared directly to rendered supplied HTML at 390, 768 and 1440 CSS px: 24 successful candidate renders, no JavaScript exceptions or horizontal page overflow. Heading font sizes, positions and metrics match the reference. Non-content-adapted page total heights match within 0–1 CSS px. Reference font requests were fulfilled with the identical locally captured source font bytes to avoid cross-origin font fallback during comparison.
- 99 internal links/fragment targets validated across eight pages. All three existing article URLs return 200; a real article is captured at all three widths, with title/date/canonical/structured data and rich-text content verified.
- Targeted axe WCAG A/AA scans of Contact, Blog and an existing article report zero violations at 390 and 1440px. This is a scoped automated check, not a certification.
- One clearly labeled owner-authorized form QA submission was saved as Payload submission **9** (form 1). It contains the name/email/company, mapped category and original e-commerce selection. Two immediate clicks produced one action request. Accessible success received focus and analytics stayed declined.

## Remaining release gates

**Fresh Resend delivery is not verified.** The local environment has no `RESEND_API_KEY`; its verification/enabled flags are false. QA record 9 correctly reports `not_configured` and has no message ID. No notification delivery or inbox receipt is claimed. Existing production provider settings were not inspected or changed. A controlled preview delivery test with the existing verified private configuration, including provider delivery events, remains necessary before declaring the complete contact flow verified.

The preview must receive owner visual approval before replacing production. Do not merge this branch to main or change DNS, environment variables, database schema or existing CMS posts as part of review.

## Screenshots

Full-page candidate captures; the adjacent `*-reference.png` files contain the original HTML at the same widths. Article has no supplied standalone reference, so its three captures show the reusable extension for an existing published article.

| Page | Mobile | Tablet | Desktop |
|---|---|---|---|
| index | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-index-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-index-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-index-preview.png) |
| services | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-services-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-services-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-services-preview.png) |
| process | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-process-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-process-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-process-preview.png) |
| about | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-about-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-about-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-about-preview.png) |
| blog | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-blog-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-blog-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-blog-preview.png) |
| contact | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-contact-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-contact-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-contact-preview.png) |
| privacy | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-privacy-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-privacy-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-privacy-preview.png) |
| terms | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-terms-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-terms-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-terms-preview.png) |
| article | [390px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/390-article-preview.png) | [768px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/768-article-preview.png) | [1440px](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/1440-article-preview.png) |

[Review gallery](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-complete-replacement/review.html)

Local preview: http://localhost:3102/ . A hosted branch preview is requested through the existing Vercel GitHub workflow; its URL/status will be reported in the task.
