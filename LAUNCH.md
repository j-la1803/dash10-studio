# Dash 10 Studio — final QA and launch preparation

Status: **production deployment approved by the user on November 17, 2026**. Visual refinements and the content follow-ups below may continue after launch. Updated November 17, 2026 (America/Chicago).

## Configuration

- Inquiry address: `justin@dash10.studio`. Added only the missing `CONTACT_EMAIL` entry to the ignored local `.env`; existing database credentials, secrets, and working localhost URL were preserved.
- Production origin: `https://dash10studio.com`. `.env.production.example` records the deployment values without secrets. The candidate was built with these values explicitly supplied in the command environment. Generated sitemap URLs use HTTPS and the approved domain.
- The local `.env` intentionally remains `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`. Do not copy that value to production or reuse a locally built artifact that used localhost.
- Favicon links now use the supplied monochrome brand artwork. Payload template metadata was removed from the affected public pages and metadata generators. Existing CMS content was not rewritten.

## Approved design review

Reference: `docs/design/homepage-approved.png` supplied by the user. Reviewed section by section with the rendered candidate at 1440×1000 and 390×844. Additional responsive checks cover 768×1024, 1024×768, and 1200×650.

| Section | Review and changes |
| --- | --- |
| Header | Approved Dash 10 wordmark-only SVG (`dash10-wordmark-white.svg`), with no Studio line or tagline, preserved geometry and clear space; home header overlays the mountain. Services, Process, About, Blog, and Let's Talk remain the navigation. Mobile toggle, Escape, focus return, and route changes checked. |
| Hero | Restored the reference's four-line headline and narrower left column, original mountain video, monochrome overlay, drafting gauge, and fade to black. Inter SemiBold headings; supporting text line-height 1.7. Video playback and reduced-motion pause checked. |
| Platform bar | Six equal desktop cells, authentic platform symbol SVGs with readable labels, 1px borders; two columns on phones. Technology labels do not claim partnerships. Symbol-plus-label treatment remains a visual variation from the reference's full wordmark lockups. |
| Scene 01 | Browser composition, reference heading breaks, left drafting rail/index and right UI label. Paragraph line-height 1.75 and clear CTA spacing. |
| Scene 02 | Code editor illustration, reference heading breaks, code label and drafting details. |
| Scene 03 | Connected platform diagram with visible paths to database, commerce, payments, analytics, shipping, and inventory. |
| Scene 04 | Terminal illustration and reference heading breaks; Start a Project reaches Contact. |
| Sticky behavior | One shared 100svh CSS-sticky stage sits inside a 500svh track on desktop (at least 1100px wide, with enough measured space for the scene content). Four equal native-scroll segments select one overlaid scene at a time, with restrained opacity/position transitions and no wheel/touch interception. The left progress indicator uses (active scene + 1) / 4: 25%, 50%, 75%, 100%. Keyboard-selectable scene controls, inert inactive panels, and focus preservation support accessibility. Short screens/tablets/phones, reduced motion, and no-JS rendering expose all four sections in normal document flow. |
| Capabilities | Added the five reference questions using keyboard-accessible native disclosures. |
| Studio values | Added the reference's Milwaukee, veteran-owned, and focused-work cards with the supplied white icons. The mockup's warm icon color was kept monochrome as required by the brand instructions. |
| Footer | Replaced the initial large CTA layout with the reference's logo, service/company/contact columns and faded official white D10 monogram. All included routes and service anchors work. Header/footer branding now uses the wordmark only. The decorative footer uses `dash10-monogram-white-unboxed.svg`, derived by removing only the frame rectangle and trimming empty viewBox space; the original glyph paths and source SVG are preserved. The background remains low-opacity with a soft mask. |

Original video files have no Git diff. The header/footer wordmark SVG bytes match the original supplied brand archive. The original boxed monogram is preserved alongside its explicitly approved unboxed derivative. The optional accent in `public/brand/brand.json` remains unchanged and is not applied to website presentation.

## Inquiry delivery/storage — verified, not a visual-only form

The Contact page now submits a real inquiry through a Next.js server action to Payload's existing PostgreSQL `form-submissions` collection. No new collection, table, schema migration, or destructive seed was introduced.

- Required name, normalized email, and 20–5,000-character message are validated on the server. There is a honeypot, a persistent per-email 60-second duplicate cooldown, a pending state, and explicit failure feedback. Controlled inputs preserve the visitor's draft after errors.
- Next.js server-action origin protections remain enabled. Anonymous collection reads/deletes are denied. The protected inquiry form cannot be submitted directly through the public Payload REST/GraphQL create operation; the validated server action supplies its server-only context. Other existing CMS forms retain their submission behavior.
- The visitor sees success only after insertion and a database read-back. Text is stored in structured plain-text fields and displayed through the authenticated Payload admin.
- A browser submitted a synthetic inquiry, then a separate Payload process read the exact stored name/email/message from PostgreSQL. The duplicate check saved no second inquiry. The synthetic record was removed after verification; unrelated data was preserved. See `docs/qa/inquiry-verification.json`.
- **Email notifications are not configured or claimed.** The site's inquiry form has no configured emails; the app has no email adapter. No test email was sent. The working fallback is the approved mailto address.
- Operationally, Justin must monitor **Payload admin → Form Submissions**, filtered to **Dash 10 Studio project inquiries**, or approve and configure an email adapter/notification workflow before relying on inbox alerts. Inquiries are not emailed automatically to the contact address.
- The setup command is idempotent: `pnpm prepare:contact`. It creates only the missing dedicated form document, preserving existing form configuration. It was run successfully against the configured database.

## Verification and artifacts

- Production build, including TypeScript and sitemap generation: passed with production domain/email overrides.
- Repository ESLint: zero errors; three pre-existing warnings remain (unused `req` in `populateAuthors`, existing raw image in `SplitContent`, unused `testInfo` in the admin test). No warnings in the new Studio components.
- The five initial lint errors were in unchanged template code: redundant header state, two nested ref accesses in Card, and two intentional post-SSR preference hydration effects. Header/Card received small fixes; the two hydration effects retain documented local lint exceptions. No global rule was disabled.
- Earlier complete production-mode browser suite: **8 passed** (Google Chrome), including inquiry delivery/storage checks. The November 17 design pass: **8 passed**, covering the relevant visual/navigation/scroll checks without generating more inquiry records; `docs/qa/design-update-tests.json` records that run. `docs/qa/browser-tests.json` retains the earlier complete run. The complete coverage includes homepage content, mobile navigation, all included header/footer/scene destinations and anchors, desktop sticky positioning/readability, short viewport fallback, overflow, reduced motion, inquiry validation/save/duplicate handling/private access/API bypass prevention, network failure feedback, video playback, and FAQ keyboard behavior.
- Screenshots: `docs/qa/homepage-desktop.png`, `docs/qa/homepage-mobile.png`, `docs/qa/scene-01-desktop.png` through `scene-04-desktop.png`, `docs/qa/contact-desktop.png`, `docs/qa/contact-mobile.png`, `docs/qa/blog-desktop.png`, and `docs/qa/footer-desktop.png` / `footer-mobile.png`.
- `docs/qa/visual-checks.json` records computed fonts, line-height, platform borders/columns, footer opacity, video source, overflow, missing image checks, and browser errors (none recorded).
- The desktop full-page screenshot retains the live pinned layout. `docs/qa/homepage-desktop-overview.png` is a separately labeled unfolded overview of all four scenes for visual comparison; only screenshot CSS unpins the stage for that artifact. Individual scene viewport screenshots retain the actual pinned behavior and left progress values. Mobile screenshots show the real flow layout. The original video is paused at a reproducible frame only during capture; normal browsing plays it.

## Remaining decisions/blockers

1. Final human visual approval of the supplied reference comparison, including the full wordmark versus symbol/label platform treatment and the live sticky scroll spacing.
2. The existing published blog post titled **test** at `/posts/t` remains live and appears in the sitemap. Approve its replacement or unpublish it in Payload before launch. No user CMS content was deleted or unpublished.
3. Privacy/Terms copy and social-profile URLs shown in the mockup were not provided. Those links are intentionally absent instead of pointing to placeholders. Supply approved content/destinations or explicitly approve omitting them for launch.
4. Confirm the inquiry-monitoring workflow. Storage is verified; inbox notification delivery has not been configured or tested.
5. The production host, domain routing/TLS, production database target/backups, secrets, and durable media storage must be confirmed on the deployment host. These were not changed or verified remotely. The database-backed smoke test must be repeated against that actual production environment before switching traffic.
6. This repository has no committed schema migration baseline. Reusing the existing initialized database needs no schema migration for this change; a blank production database requires a reviewed/tested baseline migration before launch. Never run the destructive template seed or enable development schema push against production.
7. The Git working tree is still uncommitted, including the initial build, final QA work, and user-supplied design files. Review the complete diff and record an approved release commit before deployment.

## Exact deployment sequence — after explicit approval only

This is a Node/Next.js service deployment, not a static export. Commands below are instructions, not a deployment performed by Codex. The current scaffold `docker-compose.yml` targets MongoDB/Node 18 and is not a valid deployment recipe for this PostgreSQL app.

1. Choose the production host/service. Provision a supported Node runtime (for example Node 22) and pnpm 11; use the same pinned lockfile. Configure persistent PostgreSQL and persistent `public/media` storage (or a separately implemented/tested object-storage adapter). Back up the database and media and record the rollback release.
2. In the host's secure environment settings, set `NODE_ENV=production`, `NEXT_PUBLIC_SERVER_URL=https://dash10studio.com`, `CONTACT_EMAIL=justin@dash10.studio`, `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, and `CRON_SECRET`. Keep secrets out of Git and command history. Preserve existing working values where already correct. Do not install `.env.production.example` as a live file with blank secrets.
3. Check out the approved release commit in a new release directory. Install the locked dependencies:

   ```sh
   pnpm install --frozen-lockfile
   ```

4. If using a new database, stop here until its baseline migration is reviewed, applied and verified on staging. For the existing initialized production database, this work adds no schema changes. Prepare the inquiry form content without seeding/resetting:

   ```sh
   pnpm prepare:contact
   ```

5. Build with the production environment already present; validate the built sitemap domain:

   ```sh
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm build
   rg 'https://dash10studio.com' public/sitemap*.xml
   ```

6. Start the built release behind the host's process manager/reverse proxy. Bind the service port expected by that host:

   ```sh
   PORT=3000 pnpm start
   ```

7. Before routing public traffic, run the browser checks against the local production service (installed Google Chrome is the default QA browser):

   ```sh
   pnpm exec playwright install chromium
   QA_BASE_URL=http://localhost:3000 QA_INQUIRY_MARKER=launch-qa-release-check pnpm exec playwright test tests/e2e/frontend.e2e.spec.ts --config=playwright.qa.config.ts --reporter=line
   NODE_ENV=production pnpm exec tsx scripts/verify-inquiry.ts launch-qa-release-check
   QA_BASE_URL=http://localhost:3000 node scripts/capture-visual-qa.mjs
   ```

   The QA config uses Chrome by default; set `QA_BROWSER_CHANNEL=chromium` to use the installed Playwright Chromium instead. A new `launch-qa-...` marker can be chosen per run. The verification script reads/removes only that synthetic inquiry. Retain the generated evidence with the release.

8. Review the resulting screenshots and database verification. Confirm the real admin can see new inquiries, all intended CMS content is published, and no test post remains. If notifications are added, test actual receipt separately; a stored inquiry is not proof of email delivery.
9. Only after the user's final approval, set the host-provided DNS routing for `dash10studio.com`, enable TLS, and route traffic to the approved release. Exact DNS records depend on the chosen host and are not invented here. Decide whether `www` is supported and configure its canonical redirect consistently.
10. Verify HTTPS home/contact/services/process/about/blog, mobile navigation, inquiry save/read in admin, media/video loading, robots/sitemaps, and any notifications on the real domain. Keep the prior release/database/media backup available for rollback; do not restore or migrate data automatically without assessing incoming inquiries.


## Approved production release — November 17, 2026

- Source: `main` in `github.com/j-la1803/dash10-studio`; remote was `6e97c580a10a67acc70059ccc5e2ca7c032e0d07` at preflight.
- Existing hosting: Vercel project `jla1803/dash10-studio`, production deployments triggered by its GitHub integration on `main`.
- Domain confirmation: `https://dash10studio.com` and `https://dash10-studio.vercel.app` returned byte-identical existing homepage HTML, served by Vercel. The last GitHub Production deployment succeeded on the existing project.
- Deployment scope: commit the approved implementation, validate the release, push `main`, and observe the existing automatic deployment. No production variables, DNS, infrastructure, secrets, schema, or destructive migration changes are authorized.
- Client invoice files and unrelated brand-kit generators remain local and are excluded from the public release commit. Only the approved design reference, QA artifacts, website assets, and implementation are included.
- The visual approval and uncommitted-release items above are superseded by this deployment authorization. Test blog content, optional legal/social links, and email notifications remain follow-ups; inquiries use the verified private Payload storage flow.


## November 17 production fix — native scrolling in desktop windows

Root cause reproduced on the deployed release: its media query required both desktop width and at least 750 CSS pixels of viewport height. Chrome windows at 1440×720 and 1280×650/720 incorrectly used the normal-flow fallback (`data-pinned=false`) even with reduced motion disabled. At 1440×900 and 1280×800, native-wheel measurements confirmed the sticky stage itself could pin; ancestor styles showed no nested scroll container, transform, or containment. The existing homepage `overflow: clip` did not prevent pinning in Chrome and was left unchanged.

Fix: remove the arbitrary desktop height gate. Check the measured height of the copy/illustration against the actual available viewport, with responsive internal stage padding. Pin normal desktop windows when the content fits; retain accessible document flow on mobile/tablet, reduced motion, or genuinely insufficient content space. ResizeObserver checks content changes as well as the track. Calculate the four scroll segments from the track's client height minus the measured sticky-stage height, accounting for its border at entry. Progress remains 25/50/75/100 and the FAQ follows the natural end of the sticky range. Scene controls are native fragment links; the component no longer calls scrollTo or forces scroll positions.

Regression: `tests/e2e/sticky-scroll.e2e.spec.ts` uses real 80px mouse-wheel inputs from the page top through the FAQ, not programmatic scrolling. It records actual stage/progress viewport coordinates at multiple points in every scene, checks step values and release, and covers 1440×900, 1280×800, 1440×720, 1280×650, normal mobile scrolling, and reduced motion. The 1280×650 regression was first run against the deployed version and failed on `data-pinned=false`, demonstrating the original defect. Existing keyboard-navigation tests now exercise the native scene links.

No hero, content, typography, platform bar, footer, brand artwork, production variables, infrastructure, DNS, secrets, or database schema changes are part of this fix.

## November 17 approved motion release — normal sections, sticky rail only

This supersedes the earlier pinned-stage behavior. All four storytelling sections now remain in normal document flow on every viewport. Only the desktop left navigation rail uses CSS `position: sticky`, bounded by the four-section wrapper so it releases into the FAQ. Tablet/mobile hide the rail and retain normal scrolling. No scroll interception, forced positions, nested scrolling, or new dependencies.

Progress uses the viewport center's distance through the section wrapper, clamped to 0–100%; the active number is the section containing that center. A passive scroll handler schedules a single requestAnimationFrame, updates the fill with scaleY, and only changes React state when the active scene changes. ResizeObserver refreshes geometry. Native fragment links remain keyboard accessible.

IntersectionObserver triggers once-only 600ms heading/copy/CTA/illustration reveals (20px rise, 100/180ms copy/CTA stagger), plus selected horizontal-rule scale reveals. Mobile uses 12px/500ms and shorter staggering. Content is visible by default; CSS animations finish without requiring a JavaScript completion callback. Reduced motion suppresses these effects. CTA underlines and arrows respond to hover/focus; native details are progressively enhanced with reversible 320ms opening/closing and an immediate reduced-motion path. The frameless footer mark is approximately 23% smaller. Header artwork/size, hero video, platform bar, copy, and other pages remain unchanged.

Verification: TypeScript and production build pass; lint has zero errors and only the three existing template warnings. Chrome regression tests measure normal section displacement, stationary rail coordinates, continuous progress, reverse scrolling and release at 1440×900 and 1280×800; also cover mobile, reduced motion, once-only reveals, keyboard/reversible FAQ, no-JavaScript content, navigation, and original assets/video. Contact submission fixtures are excluded from this motion-only release.

Deployment uses the existing GitHub `main` → Vercel `jla1803/dash10-studio` integration: commit the scoped files, push `origin main`, wait for the GitHub Production deployment to succeed, then rerun these browser tests with `QA_BASE_URL=https://dash10studio.com` and `playwright.qa.config.ts`. No production environment variables, DNS, database schema, secrets, or hosting infrastructure changes are required. Existing optional email notification/legal/social/test-blog follow-ups remain outside this release.

## November 17 approved refinements — mountain loop and Milwaukee footer

The annotated FireShot reference removes the rule above the technology bar, the four storytelling rules, and the full-width FAQ boundary rules. Their whitespace/padding remains. Individual technology tiles, editor mockups, FAQ controls, the values row, and the legal footer divider retain their structural borders. The redundant vertical border/crosshairs beside each story are removed; the existing left navigation rail now provides the single unified track/01–04 component. Its native scrolling, continuous progress, active colors, sticky boundary/release, and mobile/reduced-motion behavior are preserved.

The hero now serves `/videos/dash10-mountain-loop.mp4`: forward then reversed frames from the original mountain video, slowed by the same factor and played at the existing 0.7 rate. Duplicate endpoint frames are omitted before retiming. H.264/yuv420p, original 1438×768 dimensions, 30fps, no audio, fast-start MP4. It is 3,095,166 bytes versus the prior 2,978,639 bytes (approximately 3.9% larger), while providing both playback directions. No browser direction manipulation, new runtime dependency, positioning/cropping/darkness/overlay changes. Rebuild explicitly with `FFMPEG=/path/to/ffmpeg sh scripts/build-mountain-loop.sh`; the encoder is a local authoring tool, not an application dependency.

The existing fourth footer column now displays BASED IN, a small monochrome Lucide Beer beside MILWAUKEE, WI, and 43.0389° N / 87.9065° W beneath it. Coordinates match `docs/design/guide/brand-guide.html`. Only the visible footer email is removed; contact links, the contact form and its private inquiry storage remain unchanged. The four-column structure, approved header wordmark, and faded frameless footer D10 are preserved.

Release checks: TypeScript, production build and lint (zero errors; three existing template warnings), plus Chrome frontend/sticky-scroll/refinements suites. The refinement tests compare decoded video pixels at loop endpoints, the forward/reverse turnaround and mirrored playback positions; verify playback crosses the native loop boundary at the existing speed; and check desktop/mobile borders, unified navigation, footer structure/coordinates/icon, overflow, and access to the contact form. Production deployment continues through `main` → the existing Vercel project and requires no environment, DNS, schema, infrastructure, or secret changes. Repeat the same non-submission browser suite against `https://dash10studio.com` after deployment.

## November 17 phase two — brand grid, inactive integrations, private editorial drafts

Visual release: retain the outlined header wordmark and mountain loop; normalize approved Inter SemiBold headlines to −3% tracking and use locally served JetBrains Mono for technical text. Shared shell gutter/content-width, story inset and column-gap tokens align hero, technology bar, stories, capabilities and footer across mobile, desktop and wide screens. Remove the hero's unaligned quarter-width guides and redundant capabilities rules; do not add new borders. The platform grid spans the full content width, with eight equal cells (8/4/2 responsive columns). Existing authentic SVGs remain; Google Tag Manager uses Google's supplied SVG in grayscale. HubSpot is a plain referential name pending permission for approved monochrome logo artwork.

Favicon: exact approved outlined D10 glyph geometry, no frame or background, black fill, SVG plus transparent 16/32/48/180 PNG and ICO. `node scripts/build-favicon.mjs` rebuilds these assets. A light/dark background comparison confirms the intentional contrast limitation of black glyphs on dark tabs; no unapproved badge/background or white substitution is introduced.

HubSpot/GTM foundations fail closed. No real identifiers, credentials, environment values or live tracking were added. The working Payload inquiry remains live. Both integrations require complete identifiers AND explicit enabled/verified flags; setup, consent design, success event schema, de-duplication, GTM-only GA4 configuration and required real-provider verification are in `docs/INTEGRATIONS.md`. Preview must confirm HubSpot CRM receipt and GA4 DebugView before any production activation. Optional analytics are never loaded before opt-in, and measurements never include inquiry fields, raw URLs, query strings or user IDs.

Three approximately 660-word articles are saved in the existing Payload database as drafts (IDs 2, 3, 4), with categories, SEO titles/descriptions, lead excerpts and internal links. Private local source/review links are in `content/drafts/README.md`; the public repository excludes `/content/drafts/` so the article bodies are not published through Git. Re-running `scripts/prepare-blog-drafts.ts` preserves them and creates no duplicates. Public APIs and direct article URLs do not expose them. No collection/schema/migration change or article publication is part of the release. The existing published test post remains a separate editorial follow-up.

Verification: TypeScript and production build pass; lint has zero errors and only the three known template warnings. Seven focused integration tests cover release gates, consent, safe event payloads, receipt de-duplication, provider fallback and native inquiry locking. Twenty-two Chrome browser checks cover desktop/mobile/wide grid coordinates, platform cells, official wordmark, transparent favicon geometry/assets, inactive service requests, private draft URLs/APIs, video loop, normal scrolling, sticky rail/reverse scrolling/release, reduced motion, no-JavaScript story content, FAQ and navigation. Two additional contact browser tests confirm durable storage, duplicate protection, private access and network errors; the synthetic inquiry was read back and removed with `scripts/verify-inquiry.ts`.

Deploy the verified source using the existing `main` → Vercel `jla1803/dash10-studio` workflow, with current production configuration preserved. Run the 22 non-submission checks against `QA_BASE_URL=https://dash10studio.com` after deployment. No DNS, hosting infrastructure, production secrets or database migrations are required. Remaining setup: real HubSpot form identifiers/CRM delivery verification, real GTM container with reviewed GA4 tags and consent verification, HubSpot logo permission/artwork, and editorial approval before publishing any draft.
