# 4. Step-by-step foundation-building process

Part A answers the ten "how do I start" questions. Part B is the working guide for each foundation category: what to **define**, **measure**, **choose**, **deliver** and **validate**.

---

## Part A: How to start a design system (Phase 2 questions)

### 1. What should I define before designing my first component?

| Define | Example | Why it comes first |
|---|---|---|
| **Scope** | "Web apps for product X and Y, React, desktop-first with responsive support; no native apps in year 1" | Every token and component decision depends on platforms and products |
| **Users of the system** | Designers in Figma, 3 front-end developers, an AI coding agent | The docs, API style and tooling are designed for *them* |
| **End users and contexts** | Data-dense dashboards used 6 h/day on laptops; occasional mobile check-ins | Decides density (14px vs 16px body), touch targets and motion appetite |
| **Principles (3–5)** | "Clarity over decoration", "Calm by default, emphasis on purpose", "Accessible is not optional" | Principles settle debates. Write each with the trade-off it accepts. |
| **Accessibility target** | WCAG 2.2 AA, plus keyboard parity, reduced motion and forced colors | A standard set later means retrofitting tokens |
| **Technical constraints** | React 19, TypeScript, Tailwind v4, SSR, evergreen browsers | Decides the token output format and the component base library |
| **Distribution model** | npm package in a monorepo vs copy-in registry | Shapes versioning and how updates reach products |
| **Validation screens** | 2–3 real screens (e.g. Settings, a Table page, Sign-in) | Gives "done" a concrete meaning: the system can build these |
| **Success criteria** | "Rebuild the 3 screens using only DS tokens and components; zero raw colors" | Without them, scope creep and gold-plating take over |

**Reasoning:** a component is a frozen bundle of decisions about color, size, behavior and accessibility. If those decisions aren't made at the system level first, every component makes them again, slightly differently. That's how inconsistency starts.

### 2. Tokens, typography, colors, spacing, grids or components: what order?

```
Principles ─► Audit ─┬─► Color primitives ──┐
                     ├─► Type scale ────────┼─► Semantic tokens ─► Radius/Border/Shadow/Motion ─► Components
                     └─► Spacing & sizing ◄─┘         │                                              ▲
                          (derived from type metrics)  └─► Layout grid & breakpoints ─────────────────┘ (patterns)
```

1. **Principles and audit first:** they tell you what problem you're solving.
2. **Color primitives and the type scale in parallel:** they're independent, and both are needed for semantic tokens.
3. **Spacing and sizing after type:** control heights come from line height plus padding. For example, 20px line height + 2 × 8px = 36px control. A 4px spacing unit works because type line heights sit on it.
4. **Semantic tokens next:** they need primitives *and* the use cases found in the audit.
5. **Radius, shadow and motion after that:** they're tuned against real surfaces and sizes.
6. **Grids and breakpoints:** needed for page patterns, but component internals don't depend on them, so they can run in parallel with early components.
7. **Components last:** they only *consume* decisions.

### 3. What should I measure and document during research?

Do a **UI inventory** of your existing products (or of 2–3 reference products if you're greenfield):

| Measure | How | What it reveals |
|---|---|---|
| Unique colors (count and frequency) | A CSS analyzer (e.g. Project Wallace) on built CSS; screenshot sampling in Figma | Near-duplicates (`#737373` vs `#757575`) waiting to be merged |
| Font sizes, weights, line heights, letter-spacing | Same, plus Figma text-style usage | How many type styles you really need |
| Spacing values | CSS analyzer; measure padding and gaps on key screens | Whether a 4px or 8px base fits; stray values |
| Radii, shadows, borders | CSS analyzer; screenshots | Elevation levels actually in use |
| Control heights and icon sizes | Measure buttons, inputs, selects and toolbars side by side | Alignment problems (BoardUI's 38px Select vs 36px Button) |
| Breakpoints and layout widths | CSS media queries; analytics on device widths | Real breakpoints and max content width |
| Durations and easings | CSS and JS animation values | Motion vocabulary |
| Component instances and variants | Screenshot every button, input, modal etc. into a Figma board, grouped | Real variant needs vs accidental variants |
| Accessibility baseline | axe scan, a keyboard walk-through and contrast checks on key screens | The size of the a11y debt you're fixing |
| Content patterns | Button labels, error messages, empty states | Voice-and-tone rules for docs |

Document each finding as **value → count → where used → proposed token or "remove"**.

### 4. How do I decide which values should become tokens?

Make a value a token when it passes **at least one** of these tests:

1. **Repeated intent:** the same decision appears in 2+ places *for the same reason*. Two values that happen to match don't count.
2. **Global retune:** "If this changes, should every usage change?" If yes, it's a token.
3. **Varies by mode:** it differs between light and dark, brands or density.
4. **Shared vocabulary:** designers and developers already talk about it ("card radius", "page gutter").

Keep it out of tokens if it's a one-off layout dimension (`max-width: 420px` on one dialog), derivable from other tokens (`calc(var(--size-control-md) / 2)`), or a component-internal magic number. Those go in the component, with a comment.

**Naming test:** if you can't name it by purpose, it isn't ready to be a semantic token.

### 5. How do I establish a consistent visual language?

1. **Write personality pairs:** "calm, not dull", "precise, not cold", "confident, not loud".
2. **Pick 2–3 signature elements** and use them deliberately. BoardUI's are hairline borders plus soft shadows, a gradient CTA and blur-in entrances.
3. **Set ratios, not just values:** for example ~90% neutral surfaces, accent only on primary actions, selection and focus; radius ∝ control height; state = one ramp step.
4. **Prove it on real screens:** make style tiles, apply them to your 2–3 validation screens, then extract tokens from what worked.
5. **Write the rules down** as do/don't pairs with images.

**Reasoning:** values give consistency of color. *Relationships* between values (ratios, steps, proportions) give consistency of feel, and they keep working when the system grows.

### 6. How do I decide which components to build first?

Score each candidate:

```
priority = (frequency on validation screens × breadth of reuse × current inconsistency pain × a11y risk) ÷ build complexity
```

Then order by **dependencies**: Button and Icon come before Dialog; Field (label, hint, error) comes before TextField, Select and Checkbox group. In practice the first set is almost always Button, TextField, Checkbox, Radio, Switch, Select, Dialog, Tooltip, Badge and Card. See [file 6](06-component-inventory.md).

### 7. How should I handle variants, states, responsive behavior and animation?

- **Variants:** a closed list, named by intent. Before adding one, prove that a prop value can't express it and that it's needed in ≥2 product contexts.
- **Sizes:** one system-wide size scale (`xs`–`lg`) mapped to control-height tokens. Each component supports only the sizes it needs.
- **States:** take them from the global state model ([file 3 §3.5](03-architecture.md#35-global-state-model)). Every component spec includes a state × variant matrix, and the matrix becomes visual tests.
- **Responsive:** components are fluid in width and stable in height. Layout changes happen in patterns, using container queries where a component must adapt to its container. On touch devices, meet a target-size rule (≥24px minimum per WCAG 2.5.8; 44–48px recommended for primary touch actions).
- **Animation:** only from motion tokens, only with a purpose (feedback, orientation, continuity), and always with a reduced-motion fallback that keeps the meaning.

### 8. What should be standardized, and what should stay flexible?

| Standardize (non-negotiable) | Flexible (guided) |
|---|---|
| Tokens and their names | Page layouts and section composition |
| Accessibility behavior (keyboard, focus, ARIA) | Content and copy (within voice guidelines) |
| Interaction states and the focus style | Spacing *between* components, within the scale |
| Size scale and control heights | Illustration and imagery choices |
| Prop API conventions | Data-visualization specifics (with chart tokens) |
| Motion curves and durations | Product-specific blocks built *from* system parts |
| Iconography set and sizes | Marketing pages (which may extend the type scale) |

**Rule:** standardize what users learn: behavior, meaning, affordance. Leave flexible what products need to differentiate: layout and content.

### 9. How do I prevent unnecessary complexity, duplicates and inconsistent styling?

- **A contribution gate with three questions:** Is it already possible? Can it be a variant or a composition? Is it needed in ≥2 places? (Rule of three before abstracting.)
- **Lint the rules:** no raw colors, no arbitrary values, no primitive tokens in components, no `dark:` overrides in components.
- **A token budget:** a semantic token needs a use case in 2+ components, or it becomes a component token.
- **Scoped component tokens:** keep them in the component's own file, not the global semantic list (BoardUI's main scaling problem).
- **Searchable docs:** people duplicate what they can't find.
- **Regular audits:** a monthly CSS-analyzer run tracking unique colors, font sizes and arbitrary values over time.
- **Deprecation as a habit:** removing things is part of maintenance.

### 10. How can I validate that the system is useful, accessible and scalable?

| Property | Validation |
|---|---|
| Useful | Rebuild the validation screens with only DS parts; time-to-build compared with before; developer and designer interviews; adoption and detach rates |
| Accessible | Automated (axe in CI) + manual keyboard + screen-reader matrix + contrast tests on token pairs + forced colors and reduced motion checks + sessions with users with disabilities when possible |
| Scalable | The **theme-swap test** (change the accent and switch to dark mode with zero component edits); the **new-product test** (a second product adopts it without forking); the **density test** later |
| Maintainable | Time to ship a token change; number of files touched per change; open-issue age |

Detailed metrics are in [file 7](07-measurement-checklist.md).

---

## Part B: Foundation categories

Each table answers: **Define** · **Measure** · **Choose** · **Deliverables** · **Validate**. Values in [file 5](05-token-spec.md) are starting points.

### B1. Design principles and system goals

| | |
|---|---|
| Define | 3–5 principles, each with a trade-off ("We choose clarity over density when they conflict"); goals and non-goals for year 1 |
| Measure | Interview 3–5 consumers (designers, developers, PM) about current pains; list recurring design debates |
| Choose | Principles that would have settled a *real* past debate; drop generic ones like "be consistent" |
| Deliverables | `docs/principles.md`, a one-page charter (scope, users, standards, success criteria), ADR #1 |
| Validate | Take 3 past disagreements and check that the principles decide them. If they don't, rewrite them. |

### B2. Target users and product requirements

| | |
|---|---|
| Define | End-user contexts (devices, session length, data density, environment); system users (designers, developers, agents); must-support features (RTL? dark mode? i18n? charts?) |
| Measure | Analytics (viewport widths, OS dark-mode share, input type), support tickets about UI, a list of screens by frequency |
| Choose | Density (14px vs 16px body), touch priority, theme support, locales |
| Deliverables | A requirements matrix (feature × priority × product) and 2–3 validation screens |
| Validate | The product owner signs off; each requirement maps to a token or component decision |

### B3. Reference analysis and visual audit

| | |
|---|---|
| Define | Which references (BoardUI plus 1–2 others relevant to your domain) and what to learn from each |
| Measure | The inventory in A3; for references, the token architecture, naming, state model and docs template ([file 2](02-reference-audit.md) is a worked example) |
| Choose | What to adopt, adapt or avoid, with reasons |
| Deliverables | An inventory board in Figma (all buttons, all inputs, …), an audit spreadsheet (value / count / usage / proposed token), an adopt / adapt / avoid table |
| Validate | Every proposed token traces back to an audit finding or a principle |

### B4. Color palette and semantic color tokens

| | |
|---|---|
| Define | Primitive ramps (neutral, accent, danger, warning, success, info, plus chart hues); semantic roles (text, icon, surface, border, action, status, overlay, focus, chart); themes |
| Measure | Contrast for every *intended* foreground/background pair in every theme; perceptual evenness of ramps; existing brand colors |
| Choose | Build ramps in **OKLCH**: keep hue roughly constant and step lightness evenly, so each step means the same perceptual jump across hues. Pick the semantic mappings that **meet contrast in every theme**. Use the accent only for action, selection and focus. Name status colors by meaning, and keep hue names for categorical tags. |
| Deliverables | Primitive ramps (JSON + Figma variables), a semantic token table with light/dark mappings, a **contrast-pair matrix** (`token-pairs.json`: fg, bg, required ratio), usage do/don't |
| Validate | An automated contrast test over the pair matrix (fails CI below threshold); the theme-swap test; color-blind simulation of status and chart colors; status never conveyed by color alone (icon or text too) |

### B5. Typography scale and text styles

| | |
|---|---|
| Define | Font families (UI, mono, optional display), base size, scale steps, weights allowed per step, line heights, letter-spacing, numeric features (`tabular-nums` for tables) |
| Measure | Font sizes in the audit; longest realistic strings; script support (Latin, Arabic, CJK); rendering at 100% and 200% zoom |
| Choose | A base of 14px for dense product UI or 16px for content-heavy UI. Use a modular-ish scale, adjusted by hand (pure ratios produce awkward sizes). Line heights on a 4px grid for control text (16, 20, 24). Tighter leading and slightly negative tracking at display sizes; slightly positive tracking at ≤12px. **Limit weights per style to 2.** |
| Deliverables | Composite text tokens (size, line height, tracking, weight), Figma text styles bound to variables, a specimen page, usage mapping (H1 → `heading-xl`, …) |
| Validate | 200% zoom and text-spacing override (WCAG 1.4.4 / 1.4.12) without clipping; the validation screens use ≤ ~8 styles; no raw `font-size` in components |

### B6. Spacing scale and layout grids

| | |
|---|---|
| Define | Base unit; scale; a few semantic spacing roles (control padding, field stack, card inset, page gutter, section gap); grid columns, gutters and margins per breakpoint; max content widths |
| Measure | Spacing values in the audit; how often the off-scale ones occur |
| Choose | A 4px unit (8px rhythm for layout, 4px and 2px for tight component internals). Mostly linear at the small end, then larger jumps (…16, 20, 24, 32, 40, 48, 64…). Grid: 4 / 8 / 12 columns across the mobile / tablet / desktop bands. |
| Deliverables | The spacing scale, semantic spacing tokens, grid specs per breakpoint, a Figma layout grid style |
| Validate | ≥95% of spacing in the validation screens comes from the scale; no off-scale values in components (lint) |

### B7. Sizing, breakpoints and responsive rules

| | |
|---|---|
| Define | Control heights (`xs`–`lg`), icon sizes, avatar sizes, touch-target minimums, breakpoints, container widths, responsive rules per pattern |
| Measure | Current control heights side by side; device analytics; the minimum supported width (320px for WCAG 1.4.10 reflow) |
| Choose | Heights as **explicit tokens** (24 / 32 / 36 / 40), all controls of one size share a height, breakpoints aligned with Tailwind defaults (no translation cost), container queries for component-level adaptation |
| Deliverables | Sizing tokens, a breakpoint table, a responsive behavior spec per pattern (e.g. "filters bar wraps under `md`, moves into a sheet under `sm`") |
| Validate | Alignment test (Button, Input and Select in one row line up at every size); reflow at 320px with no horizontal scroll; target-size audit |

### B8. Border radius, borders, shadows and elevation

| | |
|---|---|
| Define | A radius scale and semantic radius roles; border widths; elevation levels (surface + shadow + border + z-index); dark-mode elevation |
| Measure | Radii and shadows in the audit; which layers of the UI overlap (menus over dialogs, toasts over everything) |
| Choose | Radius scales with component size; nested radius = outer − padding (min 2–4px). 4–5 elevation levels named by role (`raised`, `overlay`, `modal`). In dark mode, rely on lighter surfaces plus a subtle border; shadows get stronger but matter less. |
| Deliverables | Radius tokens, an elevation table (shadow + surface + z-index per level), Figma effect styles |
| Validate | Overlays stay distinguishable in both themes; no ad-hoc shadows in components |

### B9. Iconography and illustration

| | |
|---|---|
| Define | One icon set (or a custom one with a grid), stroke vs fill, sizes, optical alignment with text, RTL mirroring rules, illustration style and when it's allowed |
| Measure | How many icons the validation screens need; icon-text alignment at each control size |
| Choose | One library with consistent stroke width (BoardUI uses Remix Icon). Sizes tied to control sizes (14 / 16 / 20 / 24). Mirror only **directional** icons in RTL (arrows, chevrons), never logos or checkmarks. |
| Deliverables | `@windesign/icons` (optimized SVG to React), icon size tokens, guidelines (decorative = `aria-hidden`; meaningful = labeled), an illustration brief |
| Validate | Icons inherit `currentColor` and pass the same contrast as their text role; every icon-only control has an accessible name (lint or test) |

### B10. Motion principles and animation tokens

| | |
|---|---|
| Define | Purposes (feedback, orientation, continuity, delight), durations, easings, distances, the choreography of enter/exit, reduced-motion behavior |
| Measure | Existing durations and easings; frame rate on a mid-range laptop and phone (DevTools performance) |
| Choose | Short for feedback (100–150 ms), medium for overlays (200–300 ms), longer only for content reveals. Ease-out to enter, ease-in to exit, exits ~25% faster than entrances. Animate `transform` and `opacity`; use `filter: blur` sparingly. Reduced motion keeps the end state and meaning, without the movement. |
| Deliverables | Motion tokens, a motion spec per component (what moves, why, duration, easing), a reduced-motion matrix |
| Validate | Every animation has a purpose and a reduced-motion fallback; no dropped frames in the performance profile; nothing important depends on motion |

### B11. Accessibility standards

| | |
|---|---|
| Define | Target (WCAG 2.2 AA), keyboard patterns per component (follow the WAI-ARIA Authoring Practices), screen-reader support matrix, focus style, target size, reduced motion, forced colors, zoom/reflow, language and direction |
| Measure | Baseline audit (axe, keyboard walk-through, screen-reader smoke test), contrast-pair matrix |
| Choose | One focus style system-wide (≥3:1 against adjacent colors); text tokens ≥4.5:1 wherever they carry meaning; a headless library (React Aria) for behavior |
| Deliverables | An accessibility section in *every* component doc (keyboard table, ARIA, announcements), an a11y test plan, a forced-colors stylesheet |
| Validate | CI: axe + contrast tests; release: manual keyboard and screen-reader checklist per changed component |

### B12. Naming conventions and token architecture

| | |
|---|---|
| Define | Token grammar, tiers, file layout, prefix, CSS variable and utility naming, component and prop naming |
| Measure | Try the names on 20 real tokens and 10 components; check that designers and developers read them the same way |
| Choose | `{category}.{role}.{variant?}.{state?}` with state always last; a project prefix (`--ds-`) on CSS variables; Figma paths that mirror the token paths |
| Deliverables | `docs/naming.md`, an ADR, linting for names (Style Dictionary name checks or a JSON schema) |
| Validate | A new teammate can guess the token for "secondary text on a hovered card" without looking it up |

### B13. Light and dark themes

| | |
|---|---|
| Define | Which themes (light + dark now; high contrast later?), switching mechanism, persistence, default, per-subtree theming |
| Measure | OS dark-mode share; contexts (long sessions → dark mode is valuable) |
| Choose | Dark mode is a *separate design*, not an inversion: a darker canvas, lighter raised surfaces, desaturated accents, reduced shadow reliance, re-checked contrast for every pair |
| Deliverables | A dark semantic token set, theme setup docs (no-flash script, `color-scheme`), side-by-side screenshots of the validation screens |
| Validate | The contrast matrix passes in both themes; visual regression snapshots per theme; no `dark:` utilities in components |
