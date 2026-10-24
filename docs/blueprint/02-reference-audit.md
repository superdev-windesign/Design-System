# 2. Detailed reference website audit (BoardUI)

Evidence labels: **[Observed]**, **[Measured]**, **[Inferred]** and **[Not verified]**. They are defined in the [README](README.md).

---

## 2.1 Product positioning and information architecture

**[Observed]** Sidebar structure:

```
Getting started   Let's begin · Installation · MCP Server · Agent Skills · RTL Support
Foundations       Color · Typography · Components (index) · Templates
Base (31)         Announcement, Avatar, Badge, Breadcrumb, Button, Button Group, Carousel,
                  Checkbox, Chip, Close Button, Date Picker, Divider, Dropdown, File Upload,
                  Icon Button, Input, Input OTP, Link Button, Notification, Pagination, Radio,
                  Segmented Control, Select, Slider, Social Button, Switch, Table, Tabs,
                  Textarea, Tooltip, Tree View
Blocks (19)       Agent Creator, Agent Limits, Agent Progress, Agent Thinking, Auth Card,
                  Calendar, Composer, Composer Attachments, Composer Loader, Composer Panel,
                  Data Grid, Data Table, Notification Center, Questionnaire, Settings Modal,
                  Sidebar, Stat Cards, Task List, Web Search
Charts (19)       Activity Rings, Area, Bar List, Combo, Contributions, Earnings, Funnel,
                  Heatmap, Line, Most Active Days, Orders, Radar, Radial, Revenue, Sankey,
                  Scatter, Sleep Score, Stage Bars, Steps
Templates (10)    AI Chat, AI Image Generation, AI Profile, Chat Starter, Finance / Home /
                  Marketing Dashboard, Medical Profile, Multi-agent Chat, Project Board
```

**[Observed]** The overview page counts differently from the sidebar (Base 30, Blocks 18, Charts 18).

**[Inferred]** The taxonomy follows **scope of reuse**, not visual type:

- **Base** components are context-free.
- **Blocks** are product-shaped assemblies of base components.
- **Charts** are data cards.
- **Templates** are whole screens.

This is a sound structure, and section 6 recommends it.

## 2.2 Technology and distribution

| Layer | What | Evidence |
|---|---|---|
| Framework | React with `"use client"` components; the docs site runs on Next.js | [Observed] Component source and template code (`next/link`, `Metadata`) |
| Styling | Tailwind CSS v4: theme in `@theme`, utilities, `@media (hover: hover)` wrapping hover styles | [Observed] Stylesheet layers `theme` / `properties` / `utilities` |
| Behavior | `react-aria-components` | [Observed] Select imports `AriaSelect`, `AriaPopover` and others; DOM carries `data-rac` |
| Class merging | `cx()` wraps tailwind-merge; `sortCx()` builds style maps | [Observed] Button source; the Typography docs warn that custom `text-*` styles must be registered with `cx` |
| Icons | `@remixicon/react`, passed as component references | [Observed] Button docs |
| Fonts | Inter (sans), JetBrains Mono, Noto Sans Arabic, loaded via `next/font` | [Observed] Module CSS variable classes |
| Color output | Lightning CSS compiles colors to `lab()` and uses `color-mix()` with fallbacks | [Observed] Computed styles; `@supports (color: color-mix(...))` blocks |
| Distribution | CLI (`init`, `add`, `login`), MCP server, SKILL.md, "Copy Page" | [Observed] Installation and Skill pages |

**[Inferred]** Copy-in distribution fits BoardUI's business: buyers get editable source. The cost is that every consumer becomes a fork, so getting upstream fixes means re-running `add` and resolving the differences.

---

## 2.3 Token architecture

**[Observed]** This is the dependency chain I reconstructed from the CSS:

```
Tailwind @theme (primitives)            :root (semantic, light)          .dark (semantic overrides)
───────────────────────────             ───────────────────────          ─────────────────────────
--color-blue-500: #3080ff   ◄──alias──  --color-accent-500               (accent not overridden)
--color-neutral-200: #ebebeb ◄────────  --color-border-button-default ──► var(--color-neutral-700)
--color-neutral-950          ◄────────  --color-text-primary          ──► var(--color-neutral-50)
--radius-2lg: 10px                      --gradient-button-primary-default
--text-body-medium (+ --line-height,    (component-scoped, e.g.)
   --letter-spacing, --font-weight)     --color-composer-panel-tab-background
--shadow-card, --shadow-dropdown        (shadows redefined in .dark with higher opacity)

             ▼ Tailwind generates utilities from the names:
             bg-background-primary-default · text-text-secondary · rounded-2lg · text-body-medium
```

| Layer | Count | Notes |
|---|---|---|
| `@theme` (primitives and scales) | 604 vars | 16 hue families plus gray, zinc and neutral; spacing; radius; shadow; type; easing; blur |
| `:root` semantic | 194 | Includes ~106 component- or feature-scoped tokens (name-based count) |
| `.dark` overrides | 163 | 41 semantic tokens keep their light value in dark mode, e.g. `text-secondary`, `text-placeholder`, `border-focus-ring` and the switch gradients |
| Accent alias | 11 | `accent-50…950` → `blue-*` |

---

## 2.4 Color

### Primitives [Observed]

- **Base palettes:** Tailwind's default OKLCH scales, with some "Figma-tuned overrides" (the docs' wording).
  - Neutral is customized: `neutral-100 #f7f7f7`, `neutral-200 #ebebeb`, and an added `neutral-925 #121212` used as the dark canvas.
  - Blue is customized: `blue-400 #3392ff`, `blue-500 #3080ff`, `blue-600 #155dfc`.
- **Accent:** `--color-accent-{50…950}: var(--color-blue-{n})`. The Color page re-tints it live. Charts and status colors deliberately stay put.

### Semantic families [Observed]

| Family | Pattern | Examples (light → dark) |
|---|---|---|
| Text | `text-{prominence}` | `primary` neutral-950 → 50 · `secondary` neutral-500 (both themes) · `tertiary` 400 → 600 · `disabled` 300 → 800 · `placeholder` 400 · `error-primary` red-500 → 400 |
| Foreground (icons, on-color) | `foreground-icon-{prominence}` | `icon-primary` 950 → 50 · `icon-secondary` 500 · `icon-error` red-600 → 400 |
| Background | `background-{tier}-{state}` | `full` (canvas) white → `#121212` · `primary-default` white → neutral-800 · `primary-hover` neutral-100 → `#40404099` · `secondary-default` neutral-100 → 900 · `tertiary-default` neutral-200 → 800 · `quaternary-default` neutral-300 |
| Border | `border-{component}-{state}` | `button-default` neutral-200 → 700 · `button-hover` 300 → 500 · `button-active` 400 · `focus-ring` accent-500 · `separator-border` neutral-200 → 800 |
| Action | `button-ghost-*`, `gradient-button-{primary,danger}-{state}` | Ghost: accent-100 background with accent-700 text. Primary: `linear-gradient(180deg, accent-500, accent-600)`. |
| Status (hue-named) | `status-{hue}-{background,text}` | `status-lime-background` lime-200 / `status-lime-text` lime-800 |
| Notification (meaning-named) | `notification-{information,success,error}-{background,foreground}` | success: lime-100 / lime-600 |
| Charts | `chart-1…9` (+ `-active`), `chart-track`, `chart-cursor` | teal, lime, pink, sky, purple, blue, emerald, yellow, indigo at 400 (default) / 500 (active) |

### Surface model [Inferred]

- **Light:** `background-full` is the canvas. Surfaces then step through `primary` (white cards and controls), `secondary`, `tertiary` and `quaternary`, each a step heavier. Fills are used for nesting and for input fields.
- **Dark:** the canvas is the darkest layer (`#121212`) and cards are *lighter* (neutral-800). Elevation reads through lightness, not shadow. That's the right model for dark UIs.

### Rules that keep color consistent [Inferred from observations]

1. **Interaction states move one step along a ramp.** For example white → neutral-100 → neutral-200, and the primary gradient shifts one step lighter on hover and one darker on press.
2. **Disabled uses explicit tokens, not opacity.** Examples: `button-primary-disabled-foreground` and a disabled gradient of `neutral-200 → 300`. Opacity can produce unpredictable contrast on varied backgrounds; explicit tokens avoid that.
3. **Semantic names describe purpose.** The docs put it this way: "`--color-text-secondary` says 'supporting copy', not 'neutral 500'."

### Inconsistencies [Observed]

- Raw hex values appear inside the semantic layer:
  - `--color-text-destructive: #a9101d`
  - `--color-ticket-detail-favorite: #ffb83c`
  - `--color-switch-on-chip-start: #2673fe` (overridden by `color-mix()` when the browser supports it)
- `separator-border-strong` resolves to the same neutral-200 as `separator-border`.
- Dark-mode hover tokens mix approaches: some are alpha (`#40404099`), others are solid steps.

---

## 2.5 Typography [Observed]

**Font:** Inter for sans; JetBrains Mono for code; Noto Sans Arabic swapped in for `lang="ar"`. Japanese and Simplified Chinese have their own `html[lang]` rules.

**Scale:** 13 families × 4 weights (400 / 500 / 600 / 700), named `text-{family}-{weight}`.

| Family | Size / line height | Tracking | Documented use |
|---|---|---|---|
| Large Title | 64 / 80 | 0 | Hero numerals, marketing |
| Display 1 | 56 / 72 | 0 | Full-page heroes |
| Display 2 | 48 / 64 | 0 | Large section heroes |
| Display 3 | 40 / 54 | 0 | Prominent stats |
| Display 4 | 32 / 44 | 0 | Page titles; largest style used inside the app shell |
| Title 1 | 24 / 34 | 0 | Card headline figures |
| Title 2 | 20 / 26 | 0 | Section headings |
| Title 3 | 18 / 26 (24 for Regular) | 0 | Sub-sections |
| Headline | 16 / 22 | 0 | Emphasized UI text |
| Body (Body 1) | **14 / 20** | 0 | Default UI text (buttons, inputs, menus) |
| Body 2 | 13 / 18 | 0 | Dense contexts (small selects, tables) |
| Caption 1 | 12 / 16 | +0.15px | Hints, meta, xs buttons |
| Caption 2 | 11 / 15 | +0.2px | Smallest labels |

**Patterns [Inferred]:**

- **14px body:** a dense, product-UI default (typical of dashboard and AI-app systems), rather than 16px reading text.
- **Line-height ratio:** shrinks as size grows, from ~1.43 for body to ~1.25 for Large Title.
- **Letter-spacing:** positive tracking only on the small sizes (captions), for legibility. Large sizes have 0 tracking. Many systems tighten large type; BoardUI doesn't, except in arbitrary-value marketing classes.
- **Metrics vs color:** set separately. A label reads `text-body-medium text-text-secondary`, so there are no "color-baked" type styles.

**Drift [Observed]:** Many arbitrary type utilities exist outside the scale, e.g. `leading-[22.222px]`, `leading-[42.5px]` and `tracking-[-0.44px]`. Most come from marketing pages and fractional Figma values.

---

## 2.6 Spacing, sizing and layout

**Spacing [Observed]:**

- Tailwind v4's single multiplier, `--spacing: .25rem` (a 4px unit), with half steps: `gap-0.5` = 2px, `py-1.5` = 6px, `px-2.5` = 10px.
- **There are no semantic spacing tokens.** Spacing decisions live in each component's classes and source-comment tables.

**Control sizing [Observed / Measured]:**

| Control | Height | Padding | Radius | Text style | Icon |
|---|---|---|---|---|---|
| Button medium (default) | 36 | 8 (label adds 4 more horizontally) | 10 | Body 1 Medium | 20 |
| Button small | 32 | 6 vertical / 8 horizontal (label +2) | 8 | Body 1 Medium | 18 |
| Button xs | 24 | 0 vertical / 8 horizontal (label +2) | 4 | Caption 1 Semibold | 14 |
| Icon-only button | 36 / 32 / 24 square | — | as above | — | 20 / 18 / 14 |
| Input md / sm | 36 / 32 | 8 / 8×6 | 10 | Body 1 Regular | 16–20 |
| **Select trigger md** | **38** [Measured] | 8 × 10 | 10 | Body 1 Medium | 16 chevron |
| Tooltip sm / md | content | 8 × 12 (md) | 10 | Caption 1 / Body 1 | — |
| Menu popover | content, 266px shared width | 10 (8 for Select) | 16 (`2xl`) | — | — |

**[Inferred]** The 38px Select trigger is a side effect of adding a 1px border to padding-based sizing (20 line + 16 padding + 2 border). Buttons avoid this with a fixed `h-9`. **Rule for your system:** control heights should be explicit tokens (`height: var(--size-control-md)`), never the sum of padding and line height.

**Breakpoints [Observed]:**

- Tailwind defaults in rem: `sm` 40rem (640), `md` 48rem (768), `lg` 64rem (1024), `xl` 80rem (1280), `2xl` 96rem (1536).
- One-offs: 360px, 1400px, 1441px.
- Container-query units (`cqw`) scale live previews.

**Containers [Observed]:** `--container-sm…6xl`, 24rem–72rem.

**Grid [Observed]:** The component index is 1 column, then 2 columns from `sm`, then 3 fixed 304px columns from `xl`. **[Inferred]** No 12-column page-grid tokens are exposed. Layouts are composed directly with flex and grid utilities.

---

## 2.7 Radius, borders, shadows, elevation and blur

**Radius [Observed]:**

- Tailwind scale: `xs` 2, `sm` 4, `md` 6, `lg` 8, `xl` 12, `2xl` 16, `3xl` 24.
- Custom steps: `2lg` 10px, `2-5xl` 20px.
- A component token: `radius-notification-card` 10px.

| Usage | Radius |
|---|---|
| Medium controls (button, input, select, tooltip, menu rows) | 10 (`2lg`) |
| Small button | 8 |
| xs button | 4 |
| Menus and popovers | 16 (`2xl`) |
| Preview containers and dialogs | 24 (`3xl`) |

**[Inferred]** Radius grows with container size. Nesting roughly follows "inner radius ≈ outer radius − padding": a 16px panel with 10px padding holds 10px rows, against a theoretical 6.

**Borders [Observed]:** 1px hairlines in neutral-200 (`border-button-default`). Inputs have **no border**: they're filled (neutral-200) with a transparent 2px inset ring that becomes visible on focus or invalid.

**Shadows [Observed]:**

- Tailwind's scale, with low opacities. `shadow-xs` = `0 1px 2px rgb(0 0 0 / 5%)` sits on every button and trigger.
- Named, purpose-based shadows:

| Token | Value |
|---|---|
| `shadow-card` | `0 1px 1px #0000000d` |
| `shadow-dropdown` | `0 1px 1px #0000000a, 0 4px 4px #00000005` |
| `shadow-sidebar` | `0 1px 0 #00000005, 0 1px 12px #0000000f, 0 0 1px #00000052` |
| `shadow-checkbox-selected` | Inset 2px white highlight plus a 1px accent ring (a skeuomorphic "lit edge") |

- **Dark mode** redefines every shadow at roughly 2–3× the opacity. For example, `shadow-card` goes from 5% to 14% black.

**[Observed] Drift:** about 30 one-off arbitrary shadows in the utility layer, e.g. `shadow-[0px_0.896px_0.504px_0.336px_rgba(255,255,255,0.42),…]`. These are Figma values pasted verbatim.

**Elevation model [Inferred]:** BoardUI has no named elevation scale. Elevation comes from three things combined:

1. A hairline border.
2. A very soft shadow.
3. A surface step (in dark mode especially).

This "quiet elevation" is a big part of BoardUI's look.

**Blur [Observed]:** `--blur-sm` 8, `md` 12, `xl` 24, `2xl` 40. Used for glass surfaces and for blur-in entrances (2–4px).

---

## 2.8 Motion

**Tokens and values [Observed]:**

| Purpose | Value |
|---|---|
| Default transition | 150 ms, `cubic-bezier(.4, 0, .2, 1)` |
| `--button-transition-ms`, `--input-transition-ms` | 150 ms |
| Durations used in utilities | 100, 150, 200, 300, 450, 500, 700, 1100, 1400 ms |
| Signature ease-outs | `cubic-bezier(.22, 1, .36, 1)` (quint-like), `cubic-bezier(.16, 1, .3, 1)` (expo-like), `cubic-bezier(.32, .72, 0, 1)` (sheet-like) |
| Staggered reveal (`.t-stagger`) | 500 ms per item, 40 ms stagger, 12px travel, 3px blur, quint ease-out |
| Press feedback (`.button-press-motion`) | `scale(0.98)` in 220 ms on `:active`, release over 420 ms; colors 150 ms; disabled = no transform |
| Popover and tooltip enter/exit | `scale(.9 or .95)` + `opacity 0` + `blur(2–4px)` ↔ resting state, 150–200 ms ease-out, driven by React Aria's `data-entering` / `data-exiting` |
| Mobile overlays | `max-sm:data-[entering]:translate-y-full` exists (a bottom-sheet entrance below 640px). I didn't identify which component uses it. |
| Keyframes | 37, including `check-draw` (animated tick), `row-grow-in` / `row-slide-in` (table rows), `bar-rise` / `chart-reveal`, `ai-chat-text-shimmer`, agent "thinking" star and dash, `bui-beam-travel` |

**Reduced motion [Observed]:** 23 `@media (prefers-reduced-motion: reduce)` blocks. Each animated component defines its *own* fallback:

| Component | Fallback |
|---|---|
| Press motion | No transform |
| Shimmer text | Static secondary color |
| Check tick | Drawn immediately |
| Row animations | 1 ms |
| Chart reveals | No animation |
| Composer loader | Static |
| Mic bars | Frozen at 70% height |

**[Inferred]** That's better than a global "kill all animations" switch: each fallback keeps the *meaning* of the animation (the check stays visible and the loader still reads as "working") without the movement.

**Motion principles [Inferred]:**

1. Short durations (≤200 ms) for direct-manipulation feedback; longer durations (≥450 ms) only for content reveals.
2. Ease-out for entrances, with a decelerating "settle".
3. Entrances combine at most three properties (opacity, scale and blur).
4. Motion is never needed to understand state.

---

## 2.9 Component inventory and variants [Observed]

Base components, from the overview descriptions and pages:

| Component | Documented variants and features |
|---|---|
| Button | primary, secondary, ghost, danger × medium, small, xs; leading and trailing icon; icon-only; disabled; `ButtonLink` (anchor) counterpart |
| Button Group | Fused row of selectable buttons (Day / Week / Month) |
| Icon Button | Square icon-only action |
| Link Button | Inline text action styled like a link |
| Close Button | "The little ×, done properly" |
| Social Button | Sign-in buttons for 24 providers with logos |
| Checkbox | Animated tick; selected / unselected / indeterminate; card variant; two sizes |
| Radio | Gradient dot; card variant; two sizes |
| Switch | On/off with "spring motion"; gradient chip |
| Segmented Control | Sliding pill option switcher |
| Input | Label, required marker, info icon, leading and trailing adornments, hint, invalid, disabled, md and sm sizes; phone variant with a country select |
| Input OTP | One-time code boxes with paste and autofill |
| Textarea | Auto-grow, character count |
| Select | md and sm; free-form item content (status dots, avatars) with `textValue`; non-modal popover |
| Date Picker | Popover calendar; single date (plus time slots in the demo) |
| Slider | Single value and range |
| File Upload | Drag-and-drop, validation, progress |
| Dropdown | Composable menus: teams, models, actions |
| Tabs | Underline and pill; counts |
| Breadcrumb | Collapsing levels |
| Pagination | Truncation (1 2 3 4 5 … 10) |
| Table | Sortable columns, sticky header |
| Tree View | Nested folders; selection; keyboard navigation |
| Tooltip | sm and md; top / bottom / left / right; arrow or none; delay; flips |
| Notification | Status, avatar and action variants |
| Announcement | Dismissible banner |
| Avatar | Photo with initials fallback |
| Badge, Chip | Status and removable filter tokens; delta chips (+14.8%) |
| Divider | Single, double, filled (with "or" content) |
| Carousel | Snap, arrows, dots |

Blocks and charts are assemblies of the base components listed above.

---

## 2.10 Component deep dives

### Button [Observed: full source]

- **API:** `variant` (primary | secondary | ghost | danger), `size` (medium | small | xs), `iconOnly`, `leadingIcon`, `trailingIcon`, plus every native `<button>` attribute.
  - `type` defaults to `"button"`. That's good: it prevents accidental form submits.
  - The Figma property "Type" is renamed to `variant` so it doesn't clash with HTML `type`.
- **Icons are component references** (`leadingIcon={RiAddLine}`), not elements. **[Inferred]** That lets the component control the icon's size (20 / 18 / 14) and `aria-hidden`. The consumer can't pass a wrong size.
- **Icon-only:** requires `aria-label`. This is documented, but the types don't enforce it.
- **States:** CSS pseudo-classes (`hover:`, `active:`, `disabled:`) plus `aria-disabled:` equivalents, so a focusable but disabled button is possible. Focus is `focus-visible:ring-2 ring-offset-2 ring-border-focus-ring`.
- **Two elements:** `Button` renders `<button>`, `ButtonLink` renders `<a>`. **[Inferred]** That keeps semantics correct without a polymorphic `as` prop.
- **Styles live in an exported map** (`buttonStyles`) "for advanced composition and the dev Design Tuner".
- **Missing:** a loading/pending state, full-width, and an `lg` size.

### Select [Observed: full source]

- React Aria `Select`, `Button`, `Popover` and `ListBox`.
- **Trigger:** border plus `shadow-xs`, 10px radius, body-medium text, a chevron that rotates 180° when open. Measured at 38px tall.
- **Popover is `isNonModal`:** React Aria's modal scroll lock moved the page's sticky sidebar. Making it non-modal gives up React Aria's outside-press dismissal, so the team re-implemented it (`useDismissOnOutsidePress`, `useTriggerToggle`).
  - **[Inferred] Trade-off:** a non-modal listbox doesn't hide or inert the rest of the page while open. It's acceptable for a listbox, but it's a custom code path to maintain.
- **Shared recipe:** imports `MENU_ITEM`, `MENU_ITEM_ACTIVE`, `MENU_POPOVER_SURFACE` and `MENU_POPOVER_WIDTH` from the Dropdown folder.
- **Focused and selected rows share one style** (`(isFocused || isSelected) && MENU_ITEM_ACTIVE`). **[Inferred]** While navigating with the keyboard you can't tell the highlighted option from the already-selected one, unless the item content adds a checkmark.

### Input (TextField) [Observed: DOM and computed styles]

- React Aria TextField. The label is linked via `aria-labelledby`, the hint via `aria-describedby`; `required` is native; invalid sets `aria-invalid` and `data-invalid`.
- **Visual:** a filled field (`background-tertiary-default` = neutral-200) with no border.

| State | Treatment |
|---|---|
| Focus | Inset 2px **neutral-400** ring; the placeholder darkens to the primary text color |
| Invalid | Field turns red-100, the leading icon turns red, the hint text turns red-500 |
| Disabled | Lighter fill, muted text |

- **[Measured]** Field fill vs canvas: 1.19:1. Focus ring vs field: 2.17:1. Placeholder vs field: 2.17:1.
- **[Inferred] Risks:**
  - The field's boundary is hard to see for low-vision users.
  - A darkened placeholder on focus can be mistaken for an entered value.

### Tooltip [Observed: behavior tested]

- React Aria `TooltipTrigger`. **Keyboard focus opened it** after the delay. The trigger got `aria-describedby` pointing to the tooltip, and **Escape closed it**. A focus-visible accent ring was shown on the trigger.
- **Surface:** white, 1px border, `shadow-dropdown`, 10px radius, max width 240px, sm (12px) or md (14px).
- **Entrance:** `data-[entering]:scale-90 opacity-0 blur-[4px]`, 200 ms ease-out.
- Placement prop, plus automatic flipping (per the docs).

### Settings Modal (block) [Observed: behavior tested at 375×812]

- `role="dialog"`, `aria-modal="true"`, `aria-label="Settings"`. **Escape closes it and focus returns to the trigger.**
- The block doesn't render its own trigger: "keep `isOpen` in the host that owns the action". That's a good separation of concerns.
- **[Observed, see limitations]** After opening it, with either the mouse or Enter:
  - Focus stayed on the trigger behind the dialog.
  - Tab then moved to a link on the underlying page.
  - The page outside wasn't `inert` or `aria-hidden`.
- **[Observed]** At 375px the dialog fits the viewport (`max-w: calc(100vw - 32px)`), but a "Manage limits" button label is clipped, and the icon-only page rail has no visible labels.

---

## 2.11 State and interaction model

| State | How it's implemented [Observed] | Notes |
|---|---|---|
| Hover | `hover:` utilities, compiled inside `@media (hover: hover)` | Touch devices never get "sticky hover" |
| Pressed | `active:` plus `scale(.98)` press motion | Press motion skipped when disabled |
| Focus | `focus-visible:` only: no ring on mouse click, ring on keyboard | Two styles (accent ring with offset vs inset neutral ring) |
| Disabled | Native `disabled` **and** `aria-disabled="true"` styled identically | `cursor-not-allowed`; explicit disabled color tokens |
| Invalid | `aria-invalid` / `data-invalid` | Background change plus red icon and hint |
| Selected / checked | React Aria render props / `data-selected` | Accent surfaces |
| Open / expanded | React Aria `isOpen`; chevron rotates; popover `data-entering` / `data-exiting` | |
| Loading | Only in specialized blocks (shimmer text, composer loader) | Not on Button |
| Table row / cell focus | `.bui-table tbody tr[data-focus-visible]` → inset 2px accent ring | A third focus style, but consistent within tables |

**[Inferred] The underlying rule:** state is expressed through **attributes**, not component-specific classes: native pseudo-classes, ARIA attributes and React Aria `data-*` attributes. Styling then works the same way across components, and the accessibility semantics *are* the styling hooks.

---

## 2.12 Responsive behavior

- **[Observed]** At 375px wide, the pages I tested had **no horizontal overflow** (`scrollWidth === innerWidth`). The docs sidebar collapses into an "Open navigation" drawer.
- **[Observed]** Base components are **fixed-height, fluid-width**: controls keep 36px heights on every screen. Responsiveness lives in *layouts and blocks*: card grids (1 → 2 → 3 columns), dialogs capped at `100vw - 32px` and `100dvh - 32px`, and template previews scaled with container queries.
- **[Observed]** Touch targets: the default 36px controls are above WCAG 2.5.8's 24×24 minimum, but below the 44pt / 48dp guidance from Apple and Google. `xs` buttons are exactly 24px.
- **[Not verified]** Tablet layouts for the Pro templates, and whether any base component changes behavior on touch (e.g. Select becoming a sheet).

---

## 2.13 Accessibility

### Strengths [Observed]

- React Aria underneath every form and overlay component: labels, descriptions, keyboard behavior, `aria-describedby` for tooltips.
- Focus-visible rings, with a 2px offset on buttons.
- Explicit disabled tokens, and `aria-disabled` support for focusable disabled controls.
- Icon-only buttons are documented as requiring `aria-label`; icons are `aria-hidden`.
- Hover effects are scoped to hover-capable devices.
- Per-component reduced-motion fallbacks.
- RTL support: `rtl:` variants plus mirroring of directional icons.

### Gaps

| Gap | Evidence |
|---|---|
| Contrast failures in text tokens | [Measured] See the table below |
| Weak input boundary and focus ring | [Measured] 1.19:1 and 2.17:1 |
| No forced-colors / Windows High Contrast styles | [Observed] No `@media (forced-colors)` rules in the stylesheets |
| Modal focus containment | [Observed in automated test] Focus not moved into the dialog; Tab escapes to the page behind |
| Docs-site landmarks | [Observed] `/components` contains 7 `<main>` landmarks (the live template previews render their own) and no skip link |
| RTL ships as a `:lang()` list | [Observed] The source declares `@custom-variant rtl (&:dir(rtl))` (correct), but the shipped CSS contains `:lang(ar), :lang(he), …` because the CSS build (Lightning CSS) lowers `:dir()` for older browser targets. **[Inferred]** In the shipped CSS, a page marked `dir="rtl"` in an unlisted language wouldn't mirror. Check your own build's browser targets for the same effect. *(Corrected after reading BoardUI's source on 24 Oct 2026; the first version of this audit attributed the `:lang()` list to the source.)* |

### Measured contrast (WCAG 2.x)

Thresholds: 4.5:1 for normal text and 3:1 for UI component boundaries and focus indicators.

| Foreground / background | Light | Dark | Required | Verdict |
|---|---|---|---|---|
| `text-primary` / `background-full` | 19.80 | 17.95 | 4.5 | Pass |
| `text-secondary` / `background-full` | 4.74 | **3.95** | 4.5 | Dark fails |
| `text-secondary` / `background-primary-default` (cards) | 4.74 | **3.19** | 4.5 | Dark fails |
| `text-tertiary` / `background-full` | **2.58** | **2.40** | 4.5 if it carries meaning | Fails |
| Placeholder / input field | **2.17** | 5.86 | 4.5 (recommended) | Light fails |
| White / `accent-500` (top stop of primary gradient) | **3.76** | 3.76 | 4.5 | Fails at the top stop |
| White / `accent-600` (bottom stop) | 5.25 | 5.25 | 4.5 | Pass |
| Ghost button text / ghost background | 5.60 | 5.72 | 4.5 | Pass |
| `text-error-primary` / `background-full` | **3.81** | 6.49 | 4.5 | Light fails |
| `status-lime-text` / `status-lime-background` | 6.02 | 8.43 | 4.5 | Pass |
| Focus ring (`accent-500`) / canvas | 3.76 | 4.98 | 3.0 | Pass |
| Input focus ring (neutral-400) / field | **2.17** | **1.94** | 3.0 (recommended) | Weak |
| Button border / canvas | 1.19 | 1.81 | 3.0 if it's the only boundary cue | Secondary button relies on fill and shadow too |
| Input fill / canvas | 1.19 | 1.24 | 3.0 if it's the only boundary cue | Weak |

---

## 2.14 Naming conventions

| Thing | Convention [Observed] | Comment |
|---|---|---|
| Semantic color token | `--color-{role}-{tier}-{state}`, e.g. `--color-background-primary-hover` | Mirrors Figma variable paths (`text/primary` → `--color-text-primary`) |
| Component-scoped token | `--color-{component}-{part}-{…}`, e.g. `--color-composer-panel-add-hover-background` | **The part/state/property order varies:** `button-ghost-hover`, `dropdown-item-hover-background`, `badge-new-text` |
| Utility | `text-text-primary`, `bg-background-primary-default`, `border-border-button-default` | The doubled prefix is a documented side effect of the Tailwind namespace plus the full semantic path |
| Type | `text-{family}-{weight}` | Clear and predictable |
| Shadow | Size scale (`xs`…`xl`) plus purpose names (`card`, `dropdown`, `sidebar`) | Purpose names are better |
| Radius | T-shirt sizes plus `2lg`, `2-5xl`, plus `notification-card` | Mixed systems |
| Files | `components/{foundations,base,application}/{group}/{name}.tsx`, e.g. `base/buttons/button.tsx`, `base/dropdown/menu-styles` | Folder tiers mirror the docs taxonomy |
| Props | `variant` / `size` / `iconOnly` / `leadingIcon`; React Aria components use `isOpen`, `isDisabled`; Button uses native `disabled` | Mixed boolean conventions |
| Sizes | Button: `medium` / `small` / `xs`; Select and Tooltip: `md` / `sm` | Inconsistent |

---

## 2.15 Documentation and implementation patterns

**Component page template [Observed]:**

1. Title and a one-paragraph description stating purpose *and* key behavior (e.g. "the popover is non-modal so the page keeps scrolling").
2. Preview / Code toggle, "Copy Page", and "Copy for AI" options.
3. Installation (CLI or Manual). The Manual tab shows the full, commented source.
4. A "Dark mode ready" note linking to theme setup.
5. One section per variant or feature, each with a live preview and a minimal usage snippet.
6. Previous / next component links.

**In the source [Observed]:**

- Figma node IDs.
- Variant matrix and sizing tables.
- Deviations from Figma explained ("Figma forces 32×32 even though 8+18+8=34").
- Bug-workaround rationale (the non-modal popover).
- Exported style maps.

**For agents [Observed]:**

- `SKILL.md` with progressive-disclosure references: `components.md`, generated from the live registry; `theming.md`; `patterns.md`, with page recipes for dashboard, table page, auth, AI chat and settings; and `motion.md`.
- A version stamp, rebuilt on every deploy.
- An MCP server for installs and full source.

**[Inferred]** Docs are treated as part of the product, and **the docs explain intent**. Intent is what prevents misuse.

---

## 2.16 Synthesis: the architectural decisions underneath

| Decision | Alternatives BoardUI didn't take | Consequence |
|---|---|---|
| Semantic-only consumption, theme by remap | `dark:` variants in components | Dark mode is centralized; a third theme is cheap |
| Accent alias over one hue | Hard-coded blue in components | Brand swap is a single change |
| Composite type utilities | Free combination of size, weight and leading | Type is consistent, but the 52-combination matrix invites misuse |
| Headless behavior library | Hand-rolled ARIA | High baseline accessibility; a dependency on React Aria's model (`isDisabled`, render props) |
| Copy-in source distribution | npm package | Total customizability; upstream fixes are harder to get |
| Figma 1:1 sizing in code comments | Token-driven sizing | Pixel fidelity, at the cost of fractional values and drift |
| Component tokens in the global namespace | Scoped component tokens | Fast to ship, but the semantic layer becomes a long, flat list |
| Per-component motion fallbacks | Global reduced-motion reset | Motion keeps its meaning in reduced-motion mode; each component has more to maintain |
