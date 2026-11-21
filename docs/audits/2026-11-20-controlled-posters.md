# Controlled reset and exact Posters 80 implementation

Date: November 20, 2026. Local review only; no production deployment or merge.

## Recovery and scope

- Stable baseline: `ef73cb7075f586d7e0f6b251784528bcc6b7b352`, the verified production analytics release before the Posters redesign. Git/deployment history placed the subsequent `cdda105` and `0724896` redesigns after it.
- Safety branch: `codex/safety-before-controlled-reset-2026-11-20`, preserving `0724896`.
- Working branch: `codex/controlled-posters-reset`.
- Recovery checkpoint: `af066f271e533d4c1c72344663d277a1c0c9206c`.
- Restored the original homepage scene slot and interior page designs. Kept the unrelated keyboard-accessible article table fix and later analytics verification changes.
- Authoritative reference, confirmed by owner: `/Users/justinlafountain/Downloads/Dash 10 Posters 80 (1).html`.
- Reference SHA-256: `b093aece76befafeedb476592ac2e06b1727e02310503552fae522602606e27b`.

The new implementation replaces only the four scenes between the technology marquee and Capabilities. Header, hero (including 0.3× playback), marquee, Capabilities/FAQ, footer, interior designs, CMS records, contact storage/notifications, consent logic, metadata and integrations remain intact. No database changes, migrations, credentials, DNS or hosting changes were made.

## Implementation files

- `src/components/Studio/Home.tsx`: replace the old four-scene slot with `Posters80`; preserve the surrounding markup.
- `src/components/Studio/Posters80.tsx`: server-rendered reference poster markup, exact reference headings/line breaks, HUD panels, SVGs, numerals, crop marks and mapped CTAs.
- `src/components/Studio/Posters80.module.css`: scoped reference styles, responsive rules and keyframes; no global stylesheet edits.
- `src/components/Studio/Posters80Motion.tsx`: one passive, rAF-coalesced scroll pipeline; continuous reference reveal/parallax calculations, entry-triggered 400ms glitch and dynamic reduced-motion handling.
- `src/components/Integrations/Analytics.tsx`: extend only the existing CTA selector with `data-studio-cta`; preserve the existing event names, payload allowlist and consent behavior.
- `public/fonts/posters-inter-latin.woff2`, `posters-jetbrains-mono-latin.woff2`, `Posters-Inter-OFL.txt`, `Posters-fonts.txt`: self-host the official reference fonts with isolated family aliases and license/source information; reuse the existing JetBrains Mono OFL.
- `tests/e2e/horizontal-reveals.e2e.spec.ts`, `sticky-scroll.e2e.spec.ts`: update the previous scene regression checks for the approved reference, including actual coordinates and live animation values.

The source's fixed rail is adapted to a sticky element within an absolute bounding wrapper spanning only the four scenes. It remains stationary during its intended interval and releases when scene 04 ends. The sections themselves stay in normal document flow.

Progress uses `(documentScroll - regionStart) / (regionHeight - viewportHeight)`, clamped to 0–1. Scene activation follows the reference's viewport-midpoint rule. Reveal progress uses `(viewportHeight - sceneTop) / (viewportHeight * 0.7)`, clamped to 0–1. No forced scrolling, snapping or nested scrolling is introduced. `#what-we-do` remains the hero CTA destination.

CTA destinations: `/services`, `/process`, `/services#integrations`, `/contact`.

## Verification evidence

- Production build: passed (`NODE_OPTIONS=--no-deprecation node node_modules/next/dist/bin/next build`).
- TypeScript: passed (`node node_modules/typescript/bin/tsc --noEmit`).
- Scoped ESLint and `git diff --check`: passed.
- Unit suite: 39 passed, one pre-existing skipped test.
- Chrome regression suite: 37 passed on the final build, including normal wheel scrolling, actual section/rail viewport coordinates at 375/390/430/1280/1440, reverse reveal calculations, rail release, keyboard focus/navigation through every CTA, hero/media behavior, policies, metadata and consent/CTA event isolation.
- Live motion checks: captured actual `animationstart` events for the 400ms headline/pseudo-element glitches; observed reticle/codefall/network/sweep values change over time. Reduced motion disables the effects. No-JavaScript content remains readable.
- Accessibility: 18 page/viewport WCAG 2 A/AA, 2.1 AA and 2.2 AA axe scans, zero violations, across home, Services, Process, About, blog index/article, Contact, Privacy and Terms.
- Original-reference comparison: all 16 poster/viewport combinations at 375/390/430/1440 had **0px maximum difference** in measured heading, paragraph, panel and numeral geometry; section heights matched, with no horizontal page overflow. Original unmodified reference fonts were used for the reference side of the final comparison.
- Services and Contact desktop/mobile screenshot pixels matched the recovered baseline exactly. Interior page source files, legal page and post hero also match the stable baseline. The retained article table accessibility converter is the deliberate unrelated functional exception.
- New reference display fonts total 17,292 bytes; regular weights reuse outline-identical existing assets. Variable display subsets retain original glyph outlines and variation data. Offscreen decorative animations pause until visible, retaining the reference effects and periods.

### Mobile performance: remaining review item

Comparable local production-build Lighthouse mobile runs, no concurrent browser work:

| Measurement | Recovered baseline | Final candidate |
| --- | ---: | ---: |
| Performance score | 90 | 86 |
| Simulated LCP | 3.68s | 4.03s |
| Total blocking time | 27.5ms | 46ms |
| Cumulative layout shift | 0 | 0 |

This is a remaining modest lab regression, not a performance improvement. The first unoptimized font pass was slower; reusing regular faces and subsetting the extra fonts removed approximately 61KB of added font data. No hero/video or other preserved-area changes were made to conceal the result. These are single comparable lab samples, not field/Core Web Vitals measurements. Further mobile performance review remains appropriate before production approval.

### Screenshots

Reference is on the left; implementation is on the right, with all four scenes shown:

- [375px comparison](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-controlled-posters/comparison-375.png)
- [390px comparison](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-controlled-posters/comparison-390.png)
- [430px comparison](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-controlled-posters/comparison-430.png)
- [1440px comparison](/Users/justinlafountain/.codex/visualizations/2026/11/17/01a1e780-4dbc-7ac0-9484-366c43b2791a/dash10-controlled-posters/comparison-1440.png)

Individual full-resolution reference and implementation scene screenshots, plus `geometry.json`, are in the same artifact directory.

### Recovery files

Checkpoint `af066f2` restored `src/app/(frontend)/{about,contact,posts,process,services}/page.tsx`, `src/components/Studio/{Home,PinnedScenes,LegalPage}.tsx`, and `src/heros/PostHero/index.tsx`. It removed the rejected `DisplayTitle.tsx`, `PosterScenes.tsx`, `Posters.module.css`, and obsolete `posters.e2e.spec.ts`/`poster-motion.e2e.spec.ts`. All remain recoverable from the safety branch.

### Regression command

```sh
QA_BASE_URL=http://localhost:3102 node node_modules/@playwright/test/cli.js test --config=playwright.qa.config.ts analytics-pipeline.e2e.spec.ts header-analytics.e2e.spec.ts horizontal-reveals.e2e.spec.ts sticky-scroll.e2e.spec.ts quality.e2e.spec.ts performance.e2e.spec.ts legal.e2e.spec.ts --workers=1 --reporter=line
```

Use a production build/start, not `next dev`, for this shared CMS project. The checks performed no CMS record mutations.

## Owner preview

[Local production-mode preview](http://localhost:3102/).

Production remains unchanged at `07248961899bdd2688787f59b4dcbc06fa0e33d1`. Owner visual approval is required before merge or deployment.
