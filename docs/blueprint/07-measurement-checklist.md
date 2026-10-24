# 7. Measurement and validation checklist

**How to read the targets.** Targets that come from a standard (WCAG ratios, target sizes) are stated as hard numbers. For everything else the target is a **direction relative to your own baseline** (e.g. "falls over time"). A universal number for those would be invented, and your baseline is the only honest reference. Record the baseline during the research phase.

**Stage column:** **E** = meaningful from the start (v0.x, before adoption). **A** = meaningful once products use the system.

---

## 7.1 Visual consistency

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Unique color values in product CSS | CSS analyzer (e.g. Project Wallace) on built CSS, run monthly | Trends down toward the token count; new raw colors only appear with a tracked exception | E → A |
| Unique font-size / line-height / weight combinations | Same analyzer | ≤ the number of type tokens actually used (aim for the composite set only) | E → A |
| Off-scale spacing values | Analyzer + lint report of arbitrary values | Down from baseline each release; zero inside `@ds/react` | E |
| Control height alignment | Visual test: Button, TextField, Select and SegmentedControl in one row at each size | Identical heights (BoardUI fails this: 38 vs 36) | E |
| Single focus style | Story that tabs through every component; screenshot diff | One ring style (plus the documented inset variant for cells) | E |
| Visual regression stability | Snapshot suite per variant × state × theme | Every diff is intentional and reviewed; no unexplained diffs merged | E |

## 7.2 Token reuse and health

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Raw values in components | ESLint / Stylelint rules (`no-raw-color`, `no-arbitrary-value`) | Zero in `@ds/react`; exceptions documented in code | E |
| Primitive tokens used directly in components | Lint rule or grep for `--ds-color-{hue}-` in component code | Zero | E |
| Semantic token utilization | Script: for each semantic token, count references across components and products | Every semantic token is used by ≥2 components or patterns; unused tokens get deprecated | E → A |
| Component-scoped token ratio | Count component tokens vs semantic tokens | Component tokens stay scoped in component files; the global semantic list grows slowly (BoardUI: ~55% component-specific) | E |
| Theme coverage | Script: every semantic color token has a value in every theme (or is marked theme-invariant) | 100% | E |
| Contrast-pair compliance | Automated contrast test over the pair matrix ([file 5 §5.12](05-token-spec.md#512-contrast-pair-matrix-test-fixture)) | 100% of pairs ≥ their requirement in all themes | E |

## 7.3 Component coverage

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Validation-screen coverage | Rebuild each validation screen; count UI elements built from DS parts vs custom | All elements from DS parts, or listed as known gaps with a ticket | E |
| Product UI coverage | Codebase scan (`react-scanner` or a script) for DS imports vs local look-alikes (e.g. `<button className=…>`) | DS share rising release over release | A |
| Gap backlog | Requests tagged "missing component / variant" | Gaps are triaged; repeated requests (≥2 teams) get prioritized | A |
| Detach rate (Figma) | Figma library analytics (detachments vs insertions; available on Organization/Enterprise plans) | Falling; high-detach components get investigated (usually a missing variant or a too-rigid API) | A |

## 7.4 Accessibility

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Automated violations | axe on every story (Storybook a11y addon / test runner) and on validation screens (Playwright + axe) | Zero serious/critical in CI. Automated tools catch only part of WCAG, so this is a floor, not proof. | E |
| Text contrast | Contrast matrix test | ≥4.5:1 normal text, ≥3:1 large text (WCAG 1.4.3) | E |
| Non-text contrast | Matrix: input borders, focus ring, meaningful icons, checkbox borders | ≥3:1 (WCAG 1.4.11) | E |
| Focus visible and not obscured | Keyboard walk-through; sticky header/footer check | Always visible, never hidden by sticky UI (WCAG 2.4.7, 2.4.11) | E |
| Keyboard operability | Playwright interaction tests per component (open, navigate, select, dismiss, focus return) | 100% of components pass their documented keyboard table | E |
| Target size | Automated bounding-box check on interactive elements in stories | ≥24×24 CSS px or the WCAG 2.5.8 spacing exception | E |
| Screen-reader behavior | Manual matrix per release for changed components: VoiceOver + Safari (macOS/iOS), NVDA + Firefox or Chrome (Windows), TalkBack + Chrome (Android) if mobile matters | Names, roles, states and announcements match the docs | E → A |
| Reduced motion | Run stories with `prefers-reduced-motion: reduce` emulated; screenshot | No movement; end states and meaning intact | E |
| Forced colors | Windows High Contrast / `forced-colors: active` emulation in Chromium | Borders, focus rings, selected states and icons remain visible (BoardUI has no handling) | E |
| Zoom and reflow | 200% zoom and a 320px-wide viewport; text-spacing bookmarklet | No clipped text, no horizontal scroll except data tables (WCAG 1.4.4, 1.4.10, 1.4.12) | E |

## 7.5 Responsive behavior

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Overflow | Playwright: `scrollWidth <= innerWidth` on validation screens at 320, 375, 768, 1024, 1440 | No page-level horizontal scroll | E |
| Clipping and truncation | Visual snapshots at each width with long-content fixtures (long labels, German-length strings) | No clipped labels (BoardUI clipped a button label at 375px); truncation only where designed, with tooltip or full text available | E |
| Component container adaptation | Stories rendered in containers of 240 / 360 / 600px | Components adapt via container queries, or stay readable | E |
| Touch ergonomics | Device check on one iOS and one Android phone | Primary actions ≥44px; no hover-only affordances | E → A |

## 7.6 Animation performance

| Criterion | How to measure | Good result (rationale) | Stage |
|---|---|---|---|
| Animated properties | Code review plus the DevTools Performance "Animations" track | Only `transform` and `opacity` (compositor-friendly). `filter: blur()` limited to small elements, because blur is expensive on large surfaces. | E |
| Dropped frames | DevTools Performance recording on a mid-range device with 4× CPU throttle, opening a dialog, menu and toast | No long frames during the animation (60 fps ≈ 16.7 ms per frame) | E |
| Interaction latency | INP (web-vitals) in product RUM; component interaction traces | No long tasks (>50 ms, the browser's definition) caused by DS components; INP within Google's "good" band for the product | A |
| Layout shift | CLS from components (skeletons, images, fonts) | Components add no layout shift (reserve space; `font-display` plus fallback metrics) | E → A |
| Bundle cost | Size-limit or bundle analyzer per component entry point, tracked in CI | No unexplained growth. Set the budget relative to the current baseline, not an absolute number. | E |

## 7.7 Developer experience

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Time to first component | Fresh repo → install → render a themed Button, timed with a new teammate | Minutes, following only the docs; every point of confusion becomes a docs fix | E |
| Type safety | TypeScript strict; invalid prop combinations (e.g. icon-only without `aria-label`) fail to compile | Misuse caught at compile time | E |
| Docs findability | Task-based test: "find how to show an error under a field" | Found without asking anyone | E → A |
| Support load | Questions per week in the DS channel, categorized | Falling for the same categories; repeats become docs | A |
| Upgrade cost | Time to upgrade a product across a minor and a major version | Minors are drop-in; majors have a codemod and migration notes | A |
| AI-agent fit (optional) | Ask your coding agent to build a validation screen with the DS rules file loaded; count invented look-alikes and raw values | Zero invented components or raw values (the reason BoardUI ships `SKILL.md`) | E → A |

## 7.8 Design and development efficiency

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Time to build a screen | Time the validation screens before (baseline) and after | Down from baseline | E → A |
| Design → dev handoff questions | Count spec questions per feature | Down: tokens and component names are shared vocabulary | A |
| Rework from inconsistency | QA defects tagged "visual inconsistency" or "a11y" | Down from baseline | A |
| Change propagation | Time and files touched to change one semantic token (e.g. focus color) everywhere | One token file and one release; zero component files | E |

## 7.9 Adoption and usability

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Product adoption | Number of products/screens on the current major; share of UI from DS (§7.3) | Rising; no product stuck more than one major behind | A |
| Satisfaction | Short quarterly survey (designers and developers): "The DS helps me ship faster / makes accessible UI easier / I trust it" | Improving trend; written comments drive the roadmap | A |
| Escape-hatch usage | Count `className` overrides and arbitrary values on DS components in product code | Clusters reveal missing variants. Fix the system, not the product. | A |
| Contribution | External PRs and RFCs from product teams | Exists and is growing: people invest in what they trust | A |

## 7.10 Maintenance and scalability

| Criterion | How to measure | Good result | Stage |
|---|---|---|---|
| Theme-swap test | Change the accent ramp + switch to dark mode; run visual and contrast suites | Zero component code changes; contrast suite passes | E |
| New-theme cost | Add a theme (e.g. high contrast) as a spike | Token-only work | A |
| Open issue age | Issue tracker | Bugs triaged quickly; a11y bugs prioritized over features | A |
| Deprecation hygiene | Deprecated APIs and tokens with removal dates; usage counts | Removed on schedule with codemods | A |
| Release health | Changelog per release, semver discipline, visual diff attached | No unannounced breaking changes | E → A |
| Bus factor | People who can release and review each package | ≥2 | E → A |

---

## Early vs adopted: what to track when

**At the beginning (v0.x).** Focus on whether the system is *correct*:

- Token correctness (contrast matrix, theme coverage)
- Zero raw values in components
- Accessibility automation and keyboard tests
- Visual regression stability
- Validation-screen coverage
- Theme-swap test
- Time to first component

**After adoption.** Focus on whether it's *useful*:

- Product coverage and adoption
- Detach rate
- Escape-hatch clusters
- Time to build compared with baseline
- Support load
- Upgrade cost
- Satisfaction trend
- Contribution

**Review cadence:**

- Automated checks run on every PR.
- Analyzer and coverage reports run monthly.
- The survey and the roadmap review run quarterly.
