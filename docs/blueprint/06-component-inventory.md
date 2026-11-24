# 6. Prioritized component inventory and component architecture

## 6.1 Component, variant, composition, pattern: telling them apart

| Concept | Definition | Test | BoardUI example | Where it lives |
|---|---|---|---|---|
| **Component** | A reusable unit with its own anatomy, behavior and accessibility contract | Does it have a distinct ARIA role or keyboard model, or a distinct anatomy? | Button, Select, Dialog | `@windesign-ds/react` |
| **Variant** | The same component, anatomy and behavior with a different visual treatment or size | Could it be one prop value without new structure or behavior? | Button `variant="danger"`, `size="sm"` | A prop on the component |
| **Composition** | Existing components assembled for a recurring need, with little or no new behavior | Is it mostly existing parts plus layout, configured for one purpose? | Social Button (Button + provider logo), Close Button (IconButton + "×" + label) | A small component or a documented recipe |
| **Pattern / block** | A documented solution to a UX problem: several components plus layout, content and rules | Does it solve a *task* (sign-in, filtering, settings) rather than provide a *control*? | Auth Card, Settings Modal, Data Table with filters | Docs (with copyable code), or a separate `blocks` package |
| **Template** | A full page that applies patterns to a product context | Is it a whole screen? | Home Dashboard | Product repos, or the docs as reference |

### Decision tree for a new request

```
New need ─► Can existing components + props do it? ── yes ─► Document it as usage (no new code)
              │ no
              ▼
          Same anatomy & behavior, different look/size? ── yes ─► Variant (needs ≥2 product uses)
              │ no
              ▼
          Mostly existing parts arranged for one purpose? ── yes ─► Composition or pattern recipe
              │ no
              ▼
          New role / keyboard model / anatomy? ── yes ─► New component (RFC, a11y review)
```

## 6.2 Avoiding components that are too generic or too specific

| Smell | Example | Fix |
|---|---|---|
| **Too generic:** a prop explosion | `<Box variant color bg radius shadow padding hoverBg …>` with 40 props | Use layout primitives (`Stack`, `Inline`, `Grid`) plus semantic utilities. Give components only *intent* props. |
| **Too generic:** a "god component" | One `<Input>` that is also a select, date picker and OTP field, switched by `type` | Split by behavior: the ARIA role and keyboard model differ, so it's a different component |
| **Too generic:** boolean soup | `<Button primary outline small loading danger>` | Use enumerated props (`variant`, `size`) so invalid combinations can't be expressed |
| **Too specific:** product nouns | `<BillingPlanUpgradeButton>` in the system | Product code composes `<Button variant="primary">` |
| **Too specific:** context-bound tokens | `--color-ticket-detail-low-hover` in the global layer (BoardUI) | Component or product-scoped tokens, or reuse `status.*` / `tag.*` |
| **Too specific:** a one-off variant | `variant="checkout-blue"` used once | Use the `className` escape hatch and track it; promote it if it recurs |

**Rule of thumb:** name components after **what they are** (Dialog, Menu), variants after **intent** (primary, danger), and patterns after **the task** (Sign-in form, Filters bar).

## 6.3 Build order

Tiers follow dependencies first, then the priority score from [file 4](04-foundation-process.md#6-how-do-i-decide-which-components-to-build-first).

| Tier | Components | Why this order |
|---|---|---|
| **0: Foundations in code** | Theme provider and no-flash script, `Icon`, `VisuallyHidden`, focus-ring recipe, `Stack` / `Inline` / `Grid` layout primitives, `Text` / `Heading` (optional), `Spinner` | Every later component uses them |
| **1: Actions and fields** (MVP) | `Button` (+ icon-only), `LinkButton`, `Field` (Label, Description, ErrorMessage), `TextField`, `TextArea`, `Checkbox` (+ group), `RadioGroup`, `Switch`, `Select` | Used on nearly every screen; highest a11y risk if hand-rolled |
| **2: Overlays and feedback** (MVP for Dialog, Tooltip, Badge) | `Dialog` / `AlertDialog`, `Popover`, `Tooltip`, `Menu` (dropdown), `Toast`, `Badge` / `Tag`, `Alert` / inline notification | Need Tier 1 parts and the elevation and motion tokens |
| **3: Navigation and disclosure** | `Tabs`, `SegmentedControl`, `Breadcrumb`, `Pagination`, `Link`, `Accordion` / `Disclosure`, `Sidebar nav` items | Needed once you build real pages |
| **4: Data display** | `Card` / `Surface`, `Avatar` (+ group), `Table` (static, then sortable), `EmptyState`, `Skeleton`, `ProgressBar` / `Meter`, `Divider` | Dashboards and lists |
| **5: Complex inputs** | `Combobox` / autocomplete, `DatePicker` / `DateRangePicker`, `Slider`, `FileUpload`, `NumberField`, `SearchField`, `OTP` | High complexity; build on proven foundations |
| **6: Patterns and blocks** | Forms layout, filters bar, page header, settings page, auth, data table with filters and bulk actions, app shell | Documented recipes built from Tiers 0–5 |
| **7: Data visualization** | Chart tokens, chart cards, legends, tooltips | Needs a separate data-viz palette and spec |

## 6.4 Universal acceptance criteria (definition of done for every component)

- [ ] Uses only semantic or component tokens. No raw colors, arbitrary values or primitives (lint passes).
- [ ] Full state matrix implemented, matching the global state model ([file 3 §3.5](03-architecture.md#35-global-state-model)).
- [ ] Keyboard interaction matches the WAI-ARIA Authoring Practices pattern, or React Aria's documented behavior.
- [ ] Accessible name always present; tests fail if it's missing on icon-only usage.
- [ ] Focus-visible style is the system focus ring; there's no other focus treatment.
- [ ] Contrast pairs used by the component are in the contrast matrix and pass in both themes.
- [ ] Reduced-motion fallback defined; forced-colors check done (borders and focus still visible).
- [ ] Works in RTL (logical properties; directional icons mirror).
- [ ] Stories: every variant × size × state × theme, which become visual regression baselines.
- [ ] Docs: overview, when to use / not use, anatomy, props (auto-generated), examples, accessibility section, content guidelines, tokens used, changelog, status label.
- [ ] Figma component with the same props and names, connected (Code Connect or a docs link).
- [ ] Unit and interaction tests (Testing Library + user-event) plus axe on stories.

## 6.5 Component specifications (core set)

Each spec lists **Purpose · Anatomy · Variants and sizes · States · Responsive · Accessibility · Motion · Tokens · Docs · Acceptance**. Items already covered by §6.4 aren't repeated.

### Button (and icon-only Button)

| | |
|---|---|
| Purpose | Triggers an action. For navigation use `LinkButton` (renders `<a>`). |
| Anatomy | Container › start icon? › label › end icon? (or spinner when pending) |
| Variants | `primary` (one per view region), `secondary`, `tertiary` (ghost), `danger`. Optional `danger-secondary`. |
| Sizes | `xs` 24 · `sm` 32 · `md` 36 (default) · `lg` 40. Icon-only is square at the same height. |
| States | default, hover, pressed, focus-visible, disabled, **pending** (BoardUI lacks this): keep the width, show a spinner, `aria-disabled` while pending, announce completion via a live region where relevant |
| Responsive | Fluid width allowed (`isFullWidth` or a layout utility); minimum target 24px; use `lg`/`xl` for primary touch actions |
| Accessibility | React Aria `Button`. Icon-only requires `aria-label`; make it a **type-level requirement** (discriminated union). `type="button"` default. Disabled-but-focusable via `aria-disabled` when users need to discover why it's disabled. |
| Motion | Background and border color `duration.fast` / `easing.standard`; press `scale(0.98)` `duration.base`; no transform under reduced motion |
| Tokens | `action.{variant}.bg.*`, `text.on-action`, `border.default`, `size.control.*`, `radius.control.*`, `space.control.*`, `text.body-md-strong`, `focus.ring.*`, `motion.*` |
| Acceptance | Labels never wrap or clip at any size; Buttons, Inputs and Selects of the same size align on one baseline and height; the pending state doesn't shift layout |

### Field, TextField and TextArea

| | |
|---|---|
| Purpose | Text entry with a label, description and validation. `Field` is the shared wrapper reused by Select, Checkbox group, RadioGroup and others. |
| Anatomy | Label (+ required indicator, + optional info tooltip) › control (start adornment? › input › end adornment?) › description › error message |
| Variants | `outline` (default; border uses `border.input` at ≥3:1). A `filled` variant only if the fill or edge reaches 3:1, or the design accepts the documented risk. |
| Sizes | `sm` 32 · `md` 36 · `lg` 40. TextArea: min rows, auto-grow, optional character count. |
| States | default, hover, focus-visible (system ring), invalid, disabled, read-only, with-value. **The placeholder stays placeholder-colored on focus** (unlike BoardUI). |
| Responsive | 100% width of its container; label above the control on narrow containers, optionally beside it in wide forms (a pattern, not a prop) |
| Accessibility | React Aria `TextField`. Label is mandatory (a visually hidden label is allowed). Description and error are tied via `aria-describedby`; `aria-invalid`. Error text is `text.danger` (≥4.5:1) **plus** an icon. Required: native `required` plus a visible marker plus a legend explaining the marker. Don't rely on the placeholder as a label. |
| Motion | Border and ring color `duration.fast` only |
| Tokens | `bg.surface`, `border.input`, `border.danger`, `border.focus`, `text.*`, `size.control.*`, `radius.control.*`, `space.field.*` |
| Acceptance | Error announced by screen readers on submit; 200% zoom without clipping; autofill styles don't break the theme (test Chrome autofill in dark mode) |

### Checkbox, RadioGroup and Switch

| | |
|---|---|
| Purpose | Checkbox: independent on/off or multi-select, plus indeterminate. Radio: one choice from a small set (2–5). Switch: an immediate on/off setting with no submit step. |
| Anatomy | Control (box / circle / track + thumb) › label › description? Group: legend › items › group error |
| Variants | Default; `card` (a selectable card containing the control, as BoardUI has). Two sizes: `sm` 16 and `md` 20 control. |
| States | unchecked, checked, indeterminate (checkbox), hover, pressed, focus-visible, disabled, invalid (group level), read-only |
| Responsive | The whole row (control plus label) is the hit target, ≥24px tall |
| Accessibility | React Aria `Checkbox` / `CheckboxGroup` / `RadioGroup` / `Switch`. Arrow keys move within a radio group; Space toggles. A Switch announces "on/off", not "checked". The group uses a fieldset/legend equivalent. Indicator contrast ≥3:1 in both states. |
| Motion | Check draw (`check-draw`-like stroke animation, `duration.base`); switch thumb slide (`duration.base`, a gentle spring). Reduced motion: final state immediately. |
| Tokens | `action.primary.bg.*` (checked), `border.input` (unchecked), `bg.surface`, `text.on-action` (check glyph), `radius.xs`, `radius.full`, `focus.ring.*` |
| Acceptance | The indeterminate state is exposed as `aria-checked="mixed"`; the unchecked box border meets 3:1; the card variant keeps one focus ring around the card, not two |

### Select

| | |
|---|---|
| Purpose | Choose one option from a list (≥5 options, or when space is tight). Use RadioGroup for ≤4 visible options, and Combobox when users need to type to filter long lists. |
| Anatomy | Field label › trigger (value or placeholder › chevron) › popover › listbox › option (start content? › label › selected check) |
| Variants | Default; `sm` dense. Multi-select is a separate component or mode with chips. |
| Sizes | **Same heights as Button and TextField:** 32 / 36 / 40, set as an explicit `height` (avoiding BoardUI's 38px issue) |
| States | Trigger: default, hover, focus-visible, open, disabled, invalid. Option: default, hover/focused, **selected (checkmark, distinct from focused)**, disabled. |
| Responsive | Popover matches the trigger width (min); maximum height with scroll; optional bottom sheet under `sm` for long lists |
| Accessibility | React Aria `Select`. Typeahead, Home/End, Escape closes and returns focus. Options with rich content need a `textValue`. **Selected and focused must look different.** |
| Motion | Popover enter: opacity + `scale(0.96)` + `distance.sm`, `duration.moderate` / `easing.enter`; exit faster. Chevron rotation `duration.base`. |
| Tokens | Trigger: same as TextField. Popover: `bg.surface-raised`, `elevation.overlay`, `radius.overlay`. Option: `bg.subtle` (focused), `action.selected.*` (selected). |
| Acceptance | No scroll-jump when opening (BoardUI's documented problem); keyboard-only selection works; the selected value is announced |

### Menu (dropdown)

| | |
|---|---|
| Purpose | A list of **actions** (not values) from a trigger: "More", user menu, row actions |
| Anatomy | Trigger › popover › menu › sections (heading?) › items (icon? › label › shortcut? › submenu chevron?) › separators |
| Variants | Item variants: default, `danger`. Selection modes: none, single (radio), multiple (checkbox). |
| States | Item: default, focused, pressed, disabled, checked |
| Accessibility | React Aria `MenuTrigger` / `Menu`. Arrow keys, typeahead, Escape, submenus via arrow-right. A menu is **not** a navigation list: use links for navigation. |
| Tokens / motion | **Shares the menu recipe with Select** (BoardUI's good practice): one source for item height, padding, radius, focus and selected styles |
| Acceptance | The recipe is shared in code (single import), so Select and Menu can't drift apart |

### Tooltip

| | |
|---|---|
| Purpose | A short, non-essential **description** of a control. Never put essential information or interactive content in a tooltip (use a Popover). |
| Anatomy | Trigger (must be focusable) › tooltip surface › arrow? |
| Variants | `sm` (caption) and `md` (body-sm); placement top / bottom / start / end; arrow on or off |
| States | closed, opening (delay), open, closing |
| Accessibility | React Aria `TooltipTrigger`: opens on hover **and** keyboard focus, Escape closes, trigger gets `aria-describedby`. WCAG 1.4.13: dismissable, hoverable and persistent. Icon-only buttons need an `aria-label` *in addition to* the tooltip. |
| Motion | Opacity + scale 0.96 → 1, `duration.moderate`. Skip the delay when moving between adjacent triggers (warm-up), as React Aria does by default. |
| Tokens | `bg.surface-raised` or an inverted surface, `text.primary`, `border.subtle`, `elevation.overlay`, `radius.overlay`, `z.tooltip` |
| Acceptance | Visible at 200% zoom; never clipped by overflow containers (portalled) |

### Dialog and AlertDialog

| | |
|---|---|
| Purpose | Dialog: a focused task or information that blocks the page. AlertDialog: a confirmation of a destructive or important action. |
| Anatomy | Scrim › dialog surface › header (title › description? › close button) › body (scrolls) › footer (actions, primary last in LTR) |
| Variants | Sizes `sm` 400 · `md` 560 · `lg` 720 · `fullscreen`; a `sheet` presentation (bottom on mobile, side on desktop) |
| States | closed, entering, open, exiting |
| Responsive | Max `100vw − 2×space.4` and `100dvh − 2×space.4`; the body scrolls, not the page; optional bottom sheet under `sm` |
| Accessibility | React Aria `Modal` + `Dialog`. **Focus moves into the dialog on open, Tab is contained, the background is inert, Escape closes, and focus returns to the trigger.** BoardUI's Settings Modal showed the first three failing in my test. Title is linked via `aria-labelledby`. AlertDialog focuses the least destructive action and isn't dismissable by clicking the scrim. |
| Motion | Scrim fade `duration.slow`; dialog opacity + scale 0.96 (or translate-y for a sheet), `easing.enter`; exit faster |
| Tokens | `overlay.scrim`, `bg.surface-raised`, `elevation.modal`, `radius.dialog`, `z.overlay`, `z.modal`, `text.heading-md` |
| Acceptance | Automated test: after open, `document.activeElement` is inside the dialog; Tab from the last element goes to the first; content behind is `inert` |

### Tabs and SegmentedControl

| | |
|---|---|
| Purpose | Tabs switch between **views** of related content in place. SegmentedControl switches a **mode or filter** of the same view (Day / Week / Month). |
| Anatomy | Tab list › tabs (icon? › label › count badge?) › tab panels. Segmented: track › segments › sliding indicator. |
| Variants | Tabs: `underline` and `pill`. Segmented: `sm` / `md`. |
| States | default, hover, selected, focus-visible, disabled |
| Responsive | Tab list scrolls horizontally with edge fade on overflow, or collapses to a Select under `sm` (a pattern decision) |
| Accessibility | React Aria `Tabs` (arrow keys move between tabs; `tablist` / `tab` / `tabpanel` roles). Segmented = React Aria `ToggleButtonGroup` or `RadioGroup` semantics. Don't use the tabs role for it. |
| Motion | Indicator slides between items (`duration.moderate`, `easing.standard`); reduced motion: jump |
| Acceptance | The selected state is conveyed by more than color (indicator or weight) |

### Toast and Alert (inline notification)

| | |
|---|---|
| Purpose | Toast: a brief, non-blocking confirmation of something the user did. Alert: persistent, in-context status (e.g. a form-level error). |
| Anatomy | Icon › title › description? › action? › close |
| Variants | `info`, `success`, `warning`, `danger`, neutral |
| Accessibility | Toast region as a live region (`role="status"` for polite, `alert` only for urgent). No auto-dismiss for toasts that contain actions; pause the timer on hover or focus (WCAG 2.2.1). The Alert icon has a text equivalent. |
| Motion | Slide plus fade from the region edge; stack reflow `duration.moderate` |
| Tokens | `status.*.{bg,fg,border,icon}`, `elevation.overlay`, `z.toast` |
| Acceptance | Screen readers announce the message once; keyboard users can reach a toast's action before it disappears |

### Badge / Tag / Chip

| | |
|---|---|
| Purpose | Badge: status or count (non-interactive). Tag/Chip: a categorization label, optionally removable or selectable (filters). |
| Variants | Status (by meaning): neutral, info, success, warning, danger. Categorical (by hue): `tag.{blue,green,…}`. Sizes `sm` / `md`. Optional dot. |
| Accessibility | Status isn't color-only (text or icon). A removable chip's remove button has `aria-label="Remove {label}"`. Selectable chips use a toggle-button or checkbox-group pattern. |
| Tokens | `status.*`, `tag.*`, `text.label-xs` / `text.caption-strong`, `radius.pill` |

### Card / Surface

| | |
|---|---|
| Purpose | Groups related content on a surface. **Not interactive by default.** |
| Anatomy | Surface › header (title › actions?) › body › footer? |
| Variants | `elevation` (`flat` with border, or `raised`), padding (`sm` / `md` / `lg`). Interactive card = a separate `CardLink` / `CardButton` with one focus target. |
| Accessibility | An interactive card uses a single link or button with the "stretched link" technique; no nested interactive elements inside a fully clickable card |
| Tokens | `bg.surface`, `border.subtle`, `elevation.*`, `radius.surface`, `space.card.inset.*` |

### Table

| | |
|---|---|
| Purpose | Structured, comparable data. Start static and add sorting, selection and sticky header incrementally. Data Grid (cell editing) is a separate, later component. |
| Anatomy | Table › caption (can be visually hidden) › header row › column headers (sort indicator) › body rows › cells › footer/summary? |
| Variants | Density `compact` / `default`; zebra (optional); bordered vs row-dividers |
| Responsive | Horizontal scroll inside a container with a sticky first column, or a stacked card layout under `sm` (a pattern decision documented per use) |
| Accessibility | Native `<table>` semantics (or React Aria `Table` for selection and keyboard navigation). Sort state via `aria-sort`. Row selection with checkboxes that have an accessible name. Inset focus ring for rows and cells (the system's inset variant). |
| Tokens | `text.body-sm`, `text.heading-sm` (headers), `border.subtle`, `bg.subtle` (hover), `action.selected.*`, `tabular-nums` |
| Acceptance | Screen readers announce headers with cells; sort changes are announced; no layout shift when data loads (skeleton rows) |

## 6.6 Remaining inventory (summary)

| Component | Tier | Key notes |
|---|---|---|
| Avatar / AvatarGroup | 4 | Image → initials fallback → icon; `alt` text or decorative; overlap with a ring in `bg.canvas` |
| Breadcrumb | 3 | `nav` + `aria-label="Breadcrumb"`; current page has `aria-current="page"`; collapse the middle levels |
| Pagination | 3 | `nav`; current page `aria-current`; truncation; prev/next always present |
| Accordion / Disclosure | 3 | React Aria `Disclosure`; `aria-expanded`; animated height with a reduced-motion fallback |
| Skeleton / Spinner / Progress | 0/4 | Spinner has a text alternative; ProgressBar has value and label; skeleton matches final layout to avoid shifting |
| EmptyState | 4 | Icon or illustration › title › description › primary action; content guidelines |
| Divider | 4 | Decorative `role="separator"` or `aria-hidden`; labeled variant ("or") |
| Combobox | 5 | React Aria `ComboBox`; async loading; "no results" state |
| DatePicker / RangePicker | 5 | React Aria date components (locale, calendar systems); keyboard grid navigation |
| Slider / RangeSlider | 5 | React Aria `Slider`; visible value; ≥24px thumb hit area |
| FileUpload | 5 | Native input fallback; keyboard-operable drop zone; per-file progress and errors |
| NumberField, SearchField, OTP | 5 | React Aria components; OTP supports paste and SMS autofill (`autocomplete="one-time-code"`) |
| AppShell / Sidebar / PageHeader | 6 | Patterns: landmarks (`header`, `nav`, `main`), skip link, collapsible sidebar with persisted state |
| Charts | 7 | Separate data-viz spec: categorical, sequential and diverging palettes; accessible tables and summaries for every chart |
