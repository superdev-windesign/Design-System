# 9. Phased implementation roadmap

The nine phases are listed in the order you asked for. **In practice, phases 3–8 run as vertical slices.** Each component goes token → Figma → code → docs → tests → release before the next one starts. Building "all of Figma" and then "all of code" is the most common reason design systems stall.

```
Phase:            1   2   3   4   5   6   7   8   9
Research/audit    ███
Principles/found.   ████
Tokens                ████
Core components          ██████████
Complex/patterns                  ██████████████ ──► ongoing
Docs/examples           ░░░░████████████████████ ──► ongoing (starts with tokens)
Frontend infra          ░░░░██████  (package, build, theming; hardened before release)
Testing/valid.             ░░████████████████████ ──► every slice
Release/adopt/maint.               ▲v0.1    ▲v0.2   ▲v0.3 ... ▲v1.0 ──► ongoing
```

**Effort** is given as indicative ranges for **one or two people** working mostly on the system. These are planning assumptions, not benchmarks. Scale them to your team, and re-estimate after Phase 4's first component.

---

## Phase 1: Research and audit (≈1–2 weeks)

| | |
|---|---|
| **Objectives** | Understand what exists, who will use the system, and which problems it must solve |
| **Tasks** | Stakeholder interviews (designers, developers, PM); UI inventory of current or reference products (colors, type, spacing, radii, shadows, control heights, components); accessibility baseline (axe, keyboard walk-through, contrast); reference analysis ([file 2](02-reference-audit.md) is done); choose 2–3 **validation screens** |
| **Deliverables** | Audit spreadsheet (value / count / usage / proposed token), Figma inventory board, a11y baseline report, adopt/adapt/avoid table, validation screen list, **baseline metrics** for [file 7](07-measurement-checklist.md) |
| **Dependencies** | Access to products or Figma files; stakeholder time |
| **Completion criteria** | Every recurring value and component is inventoried; baseline metrics recorded; validation screens agreed |
| **Common mistakes** | Copying a reference system's look instead of its *rules*; skipping the baseline (then you can't show improvement); auditing only Figma and not production code |

## Phase 2: Design principles and foundations (≈1–2 weeks)

| | |
|---|---|
| **Objectives** | Make the system-level decisions every component will inherit |
| **Tasks** | Write the charter and 3–5 principles with trade-offs; set the a11y target (WCAG 2.2 AA); decide density, base type size, theme support and RTL needs; build color ramps (OKLCH) and the type scale; set spacing, sizing, radius, elevation and motion scales; style tiles applied to the validation screens; ADRs for naming, theming and distribution |
| **Deliverables** | `docs/principles.md`, charter, foundation specs (one page per category, per [file 4 Part B](04-foundation-process.md#part-b-foundation-categories)), style tiles, ADR 0001–0003 |
| **Dependencies** | Phase 1 findings |
| **Completion criteria** | The validation screens can be mocked using only the foundations; the principles settle the 3 past debates; contrast pre-check of key pairs passes |
| **Common mistakes** | Too many type styles and colors "just in case"; principles too generic to settle anything; designing dark mode as an inversion |

## Phase 3: Design tokens (≈1–2 weeks)

| | |
|---|---|
| **Objectives** | Encode the foundations as a single, tested source of truth for both design and code |
| **Tasks** | Set up `packages/tokens` (DTCG JSON + Style Dictionary); primitives, then semantic tokens (light + dark); contrast-pair matrix and test; theme-coverage and naming tests; Tailwind bridge and base CSS (focus, reduced motion, forced colors); Figma variables (Primitives hidden, Semantic with Light/Dark modes, code syntax set); token docs page generated from JSON |
| **Deliverables** | `@windesign/tokens` v0.0.x building `tokens.css`, `tokens.ts` and the Figma JSON; passing contrast and coverage tests; Figma variable collections; token reference page |
| **Dependencies** | Phase 2 scales and decisions |
| **Completion criteria** | **Theme-swap test passes:** change the accent and flip to dark mode with zero component changes, and the contrast suite stays green. Figma and code token names match 1:1. |
| **Common mistakes** | Component-specific tokens in the global semantic layer (BoardUI); raw hex in semantic tokens; no contrast test; naming by appearance (`gray-text`); letting Figma and code drift because nobody owns the sync |

## Phase 4: Core components (≈3–6 weeks for the MVP set)

| | |
|---|---|
| **Objectives** | Ship the components that nearly every screen needs, at production quality |
| **Tasks** | Monorepo, `@windesign/react` build, Storybook. **Tracer bullet:** Button end to end (Figma ↔ code ↔ stories ↔ docs ↔ tests ↔ release). Then TextField (with the Field wrapper), Checkbox, Switch, Select, Dialog, Tooltip and Badge, plus utilities (Icon, VisuallyHidden, Stack, Spinner). Shared recipes (focus, field, menu, overlay). |
| **Deliverables** | 8 components + utilities meeting the definition of done ([file 6 §6.4](06-component-inventory.md#64-universal-acceptance-criteria-definition-of-done-for-every-component)); matching Figma components; Storybook with full state matrices |
| **Dependencies** | Tokens (Phase 3); React Aria; icon set |
| **Completion criteria** | Each component passes lint (no raw values), axe, keyboard tests, visual snapshots in light, dark and RTL, and the contrast matrix. Button, TextField and Select align in height at every size. |
| **Common mistakes** | Building 30 components shallowly instead of 8 deeply; hand-rolling ARIA instead of using React Aria; skipping the pending, invalid and disabled states; different size names per component; Figma variants that don't match code props |

## Phase 5: Complex components and patterns (≈4–8 weeks, then ongoing)

| | |
|---|---|
| **Objectives** | Cover the rest of the validation screens and the most common product tasks |
| **Tasks** | v0.2: RadioGroup, TextArea, Menu (sharing the Select recipe), Tabs, SegmentedControl, Toast, Alert, Card, Avatar, Table (static → sortable). v0.3: Combobox, DatePicker, Pagination, Breadcrumb, EmptyState, Skeleton. Patterns: form layout, filters bar, page header, settings page, data table with filters, app shell. |
| **Deliverables** | Components + pattern pages with copyable code; pattern stories rendered at 320 / 768 / 1280px |
| **Dependencies** | Core components; real product requirements |
| **Completion criteria** | All validation screens rebuilt using only DS parts (gaps logged); each pattern documented with responsive rules |
| **Common mistakes** | Turning every pattern into a rigid component (patterns need flexibility); product-specific components in the core library; building complex inputs before the Field and Popover foundations are solid |

## Phase 6: Documentation and examples (starts in Phase 3, then ongoing)

| | |
|---|---|
| **Objectives** | Make the system usable without asking its authors |
| **Tasks** | Docs page template ([file 8 §8.8](08-implementation-strategy.md#88-documentation-and-interactive-examples)); foundation pages with live tokens in both themes; component pages with an accessibility section and content guidelines; pattern pages; getting started, theming and contributing guides; `AGENTS.md` / `SKILL.md` rules for AI coding agents; changelog |
| **Deliverables** | Storybook (and later a docs site), all pages for released components, agent rules file |
| **Dependencies** | Released components and tokens |
| **Completion criteria** | A new developer builds a themed form screen from the docs alone; findability task test passed |
| **Common mistakes** | Docs written last; prop tables without *when to use* guidance; no accessibility section; examples that don't match the current API |

## Phase 7: Frontend implementation and integration (infrastructure early, hardening before v1)

| | |
|---|---|
| **Objectives** | Make the packages production-grade and easy to adopt in real apps |
| **Tasks** | Package builds (ESM, types, tree-shaking, `sideEffects` for CSS); SSR/RSC compatibility (`"use client"` boundaries); theme provider and no-flash script; Tailwind preset/bridge plus a compiled-CSS option for non-Tailwind consumers; ESLint plugin (no raw colors or arbitrary values, no primitives); bundle-size tracking; integration into one product branch; codemod scaffolding for future majors |
| **Deliverables** | Installable `@windesign/tokens`, `@windesign/styles`, `@windesign/icons`, `@windesign/react`; integration guide; example app (`apps/playground`) |
| **Dependencies** | Core components; target product's tech stack |
| **Completion criteria** | One product renders the validation screens from the published packages, in both themes, with SSR; lint rules active in that product |
| **Common mistakes** | Publishing without a theme or no-flash solution (white flash in dark mode); forcing Tailwind on consumers without a fallback; big-bang migration of a whole product |

## Phase 8: Testing and validation (every slice, plus a formal pass before v1.0)

| | |
|---|---|
| **Objectives** | Prove the system is correct, accessible, consistent and useful |
| **Tasks** | CI: lint, unit/interaction, axe, visual (light, dark, RTL, reduced motion), contrast matrix, bundle size. Manual: keyboard walk-throughs, screen-reader matrix, forced colors, 200% zoom and 320px reflow, touch devices. Usability: rebuild-time comparison against baseline; designer and developer feedback sessions. Optionally an external accessibility audit before v1.0. |
| **Deliverables** | Green CI suite; a11y report per release; validation report (metrics vs baseline from [file 7](07-measurement-checklist.md)) |
| **Dependencies** | Stories and tests from every slice |
| **Completion criteria** | Zero serious/critical axe issues; all keyboard tables verified; the contrast matrix passes in all themes; validation screens built faster than baseline |
| **Common mistakes** | Treating "axe passes" as "accessible"; snapshot tests nobody reviews; testing only light mode and LTR |

## Phase 9: Release, adoption and maintenance (from v0.1, ongoing)

| | |
|---|---|
| **Objectives** | Get the system used, keep it healthy, and evolve it with its users |
| **Tasks** | Changesets releases with visual diffs; status labels; a pilot with one product team; office hours and a support channel; adoption metrics; quarterly audit and survey; deprecation policy and codemods; contribution model (RFCs); dependency and React Aria upgrade cadence |
| **Deliverables** | v0.1 → v0.2 → v0.3 → **v1.0** releases; adoption dashboard; CONTRIBUTING.md; roadmap reviewed quarterly |
| **Dependencies** | Earlier phases; product team buy-in |
| **Completion criteria (v1.0)** | Stable APIs for the core set; ≥2 products (or 2 major areas of one product) on the system; docs complete for all stable components; a11y audit passed; deprecation and contribution policies published |
| **Common mistakes** | Declaring v1.0 too early (then you break APIs); no owner after launch; ignoring escape-hatch data; never removing anything |

---

## The smallest useful first version (v0.1)

**Goal:** prove the whole chain on real screens, not to cover the catalog.

| Area | Included in v0.1 |
|---|---|
| Tokens | Neutral and accent ramps; status hues; semantic color (light + dark); 8–10 composite type styles; spacing (Tailwind multiplier plus a few semantic aliases); control heights (sm, md, lg); radius roles; 3 elevation levels; motion durations and easings; focus ring; z-index |
| Tests | Contrast-pair matrix, theme coverage, naming |
| Styles | Base CSS (focus, reduced motion, forced colors), Tailwind bridge, no-flash theme script |
| Components (8) | **Button** (variants, sizes, icon-only, pending) · **TextField** (with Field label/description/error) · **Checkbox** · **Switch** · **Select** · **Dialog** · **Tooltip** · **Badge** |
| Utilities | Icon, VisuallyHidden, Stack/Inline, Spinner |
| Figma | Variables (Light/Dark), text styles, effect styles, the same 8 components with matching props |
| Docs | Storybook with full state matrices; foundation pages; getting started; theming; `AGENTS.md` |
| Validation | **Two real screens rebuilt:** (1) a settings form inside a Dialog (exercises fields, checkbox, switch, select, buttons, dialog focus behavior); (2) a list or overview page with badges, tooltips and actions. Zero raw values, both themes, keyboard-only walk-through, axe clean. |

**Why these eight:**

- They cover every interaction family: action, text input, binary choice, single choice from a list, overlay, hint and status.
- They exercise the hardest shared infrastructure: field labeling and validation, popovers and positioning, focus management, theming.
- Any token or architecture mistake will show up within them.
- The two validation screens catch layout and alignment issues that isolated stories hide.

**What v0.1 tells you before you expand:**

- Do the token names work for designers and developers?
- Does Figma ↔ code stay in sync?
- How long does one component *really* take to reach the definition of done? Use this to re-plan v0.2.
- Which escape hatches did the validation screens need? Those gaps are your v0.2 priorities.
