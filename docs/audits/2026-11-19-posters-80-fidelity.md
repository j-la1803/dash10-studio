# Posters 80 fidelity correction — November 19, 2026

Reference: the owner's exact `Dash 10 Posters 80 (1).html` in Downloads. Before release: `cdda105`. This correction is limited to the four homepage scenes and their scroll controller. No hero, navigation, marquee, interior/legal content, analytics, CMS records, database schema, credentials, or infrastructure changes.

## Feature comparison and causes

| Feature | Previous implementation / root cause | Correction |
| --- | --- | --- |
| Background numerals | Present, but a 7% white stroke instead of the reference's 14%; positioned on the right on desktop, with no entrance motion. The isolated negative layer did render in Chrome, so complete background occlusion was not reproduced. | Explicit numeral layer 0 and readable content layer 1; 14% stroke, reference desktop/mobile sizing and placement, `--p` entrance and subtle `--s` movement. Screenshots verify all four. |
| Headline outline | 1px transparent outline instead of the reference's 2px black-interior outline. Display scale was smaller; line height and tracking differed. | Homepage-only 2px outline, black interior, .92 line height, brand −3% tracking, reference desktop scale and larger mobile scale. The longer approved “WEB DEVELOPMENT” wording has a narrow-screen fit rule. |
| Font rendering | Actual local Inter SemiBold 600, while the standalone reference loads Inter Bold 700. This is an intentional brand-system difference, not a failed font load. | Retain the brand guide's explicit Inter SemiBold 600 and existing local JetBrains Mono. No font substitution or new font download. Exact Bold 700 would require owner approval; it has not been silently installed. |
| Glitch | The prototype's observer, pseudo-elements, and keyframes were omitted in the previous toned-down adaptation. Existing generic `[data-reveal] { animation: none }` would also defeat an animation placed directly on the reveal element. | Separate inner glitch layer and outer scroll reveal. Reference-derived `jit`, `g1`, and `g2` run once for 400ms when at least 35% of a scene is visible, reset below that range, and replay on re-entry. Accessible heading names exclude decorative copies. |
| Scroll entrance | Existing reversible copy reveal worked, but every panel moved from the same side and the numeral was static. | Preserve the continuous native-scroll copy reveal; panel enters from the opposite side, numeral enters from the right. `--p`, `--s`, and `--prog` are updated in the existing coalesced scroll frame. |
| Background parallax | No decorative media layer or scroll-position property was ported. | Separate non-interactive SVG/code atmosphere moves up to 24px; numerals have a smaller 12px drift. No photo overlays, scanlines, grain, or layout movement. |
| Progress rail | Sticky rail and continuous fill already worked; the prototype's active marker treatment was absent. | Preserve native links, 44px targets, continuous progress and natural release; restore monochrome active markers. Only the rail is sticky. |
| HUD/status | Plain identification labels and static panel arrows replaced the status details. | Small HUD/panel status squares pulse gently at 2.4s. No flashing block or perpetual headline glitch. |
| Technical motion | Reticle, flowing connections, decorative code motion, and terminal cursor were not ported. | Reference reticle rotation, dashed network flow, separate decorative code drift, and terminal cursor. Readable primary code remains stationary. A visibility observer pauses offscreen CSS animations; reduced motion disables all scene animations. |

## Deliberate adaptations

- Preserve approved copy and real CTA destinations: `/services`, `/process`, `/services#integrations`, `/contact`.
- Preserve normal document flow and the existing progress rail's bounded sticky behavior, rather than the prototype's viewport-fixed rail.
- Preserve the readable mobile HTML network alternative instead of shrinking SVG text to illegible sizes; animate its connection detail lightly.
- All content and numerals render without JavaScript. Animation is progressively enabled; reduced motion does not depend on hydration.
- The source's large continuous sweep, grain, scanlines, and photo effects remain absent as requested.

## Verification

Chrome checks cover 390px, 430px, and 1440px fidelity, plus 320/375/768/1280px layout regressions. Motion tests inspect real animation events, 400ms durations, completed playback, per-scene replay, advancing technical-animation clocks, scroll-linked geometry, offscreen pausing, and reduced motion. They do not merely search CSS declarations.

Visual artifacts include the exact reference, before release, and corrected scenes at all three requested widths, plus side-by-side viewport comparisons. Typography metrics use Chrome's rendered platform-font inspection.

Release results are reported with the deployed commit in the final task response. Automated accessibility scans are evidence for the tested pages, not a certification of universal accessibility. Lighthouse is a controlled lab comparison, not field Core Web Vitals data.

### Pre-release results

- TypeScript and production build passed; scoped ESLint passed.
- Unit suite: 39 passed, 1 existing skip.
- Selected browser regression suite: 47 passed. Stricter scene-specific replay assertions were subsequently rerun at all three fidelity widths: 3 passed.
- Accessibility: 18 page/viewport scans, no reported violations.
- Chrome rendered-font inspection at 1440px: reference Inter Bold 700, 77.76px / 71.54px line height; corrected local Inter SemiBold 600, 77.76px / 71.54px. Tracking remains the brand-approved −3%, versus the source's −4.5%.
- Mobile Lighthouse before release: production 84, LCP 4.3s, CLS 0; local candidate 90, LCP 3.7s, CLS 0. These environments differ, so the final response reports a separate production-to-production measurement after deployment.
