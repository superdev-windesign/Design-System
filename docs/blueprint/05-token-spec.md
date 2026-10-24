# 5. Initial design-token specification

> **These are starting values, not universal standards.** Each one comes with the reason it was chosen. Replace a value when your audit, brand or users give you a better reason. The *structure* (names, layers, roles) matters more than the exact numbers.

## 5.1 Naming grammar

```
CSS variable:   --ds-{category}-{role}-{variant?}-{state?}
Token path:     {category}.{role}.{variant?}.{state?}
Figma variable: {category}/{role}/{variant?}/{state?}
```

| Rule | Example | Why |
|---|---|---|
| Category first | `color`, `space`, `size`, `radius`, `shadow`, `font`, `text`, `motion`, `z` | Groups tokens in tools and autocomplete |
| Role by purpose, never by appearance | `color.text.secondary`, not `color.gray-500` | Lets you change the value without the name lying |
| **State always last** | `color.action.primary.bg.hover` | Fixes BoardUI's mixed order (`button-ghost-hover` vs `dropdown-item-hover-background`) |
| Fixed state vocabulary | `default`, `hover`, `pressed`, `selected`, `disabled`, `invalid` | One vocabulary across all components |
| Project prefix on CSS variables | `--ds-…` | No collisions with Tailwind's `--color-*` namespace or third-party CSS |
| Component tokens are namespaced and **scoped** | `--ds-button-icon-gap` lives in `button.css`, not the global file | Keeps the semantic layer small |

## 5.2 Primitive color

Generate ramps in **OKLCH** for perceptually even steps, then export hex/OKLCH. The values below are Tailwind-like neutrals and a blue placeholder accent, so you can start immediately. Swap the accent for your brand hue.

| Token | Value | Note |
|---|---|---|
| `color.neutral.0` | `#ffffff` | |
| `color.neutral.50` | `#fafafa` | |
| `color.neutral.100` | `#f5f5f5` | |
| `color.neutral.200` | `#e5e5e5` | |
| `color.neutral.300` | `#d4d4d4` | |
| `color.neutral.400` | `#a3a3a3` | |
| `color.neutral.450` | `#8f8f8f` | **Added step**: the lightest neutral at ≥3:1 on white (≈3.2:1) for input borders |
| `color.neutral.500` | `#737373` | 4.74:1 on white |
| `color.neutral.600` | `#525252` | 7.8:1 on white |
| `color.neutral.700` | `#404040` | |
| `color.neutral.800` | `#262626` | |
| `color.neutral.900` | `#171717` | |
| `color.neutral.950` | `#0a0a0a` | |
| `color.blue.{50…950}` | e.g. 500 `#3b82f6`, 600 `#2563eb`, 700 `#1d4ed8`, 800 `#1e40af` | Placeholder brand hue |
| `color.accent.{50…950}` | `{color.blue.*}` | **Alias.** Rebrand by re-pointing these 11 tokens. |
| `color.red`, `color.amber`, `color.green`, `color.sky` | Full ramps | Status hues; not brand-tinted |
| `color.chart.{1…8}` | Categorical hues at matched lightness | Check them with a color-blindness simulator |

## 5.3 Semantic color: light and dark

Contrast values are **[Measured]** for the starting palette above using WCAG 2.x. The CI contrast test (§5.12) keeps them true when values change.

### Surfaces

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `color.bg.canvas` | neutral.0 | neutral.950 | Page background |
| `color.bg.surface` | neutral.0 | neutral.900 | Cards, controls, table |
| `color.bg.surface-raised` | neutral.0 | neutral.800 | Menus, popovers, dialogs (dark: lighter = higher) |
| `color.bg.sunken` | neutral.50 | neutral.950 | Wells, sidebars, code blocks |
| `color.bg.subtle` | neutral.100 | neutral.800 | Hover on neutral surfaces |
| `color.bg.muted` | neutral.200 | neutral.700 | Pressed or selected neutral, filled fields |
| `color.bg.disabled` | neutral.100 | neutral.800 | Disabled controls |
| `color.overlay.scrim` | neutral.950 @ 50% | black @ 64% | Behind modals |

### Text and icons

| Token | Light | Dark | Contrast (measured) | Rule |
|---|---|---|---|---|
| `color.text.primary` | neutral.950 | neutral.50 | 19.8 on canvas / 19.0 | Headings, values, body |
| `color.text.secondary` | neutral.600 | neutral.300 | 7.8 light, 6.2 on `bg.muted` / 13.4 dark, 7.0 on `bg.muted` | Supporting copy. **Passes on every surface.** |
| `color.text.tertiary` | neutral.500 | neutral.400 | 4.74 on canvas but **4.35 on `bg.subtle`** / 7.85 dark canvas, **4.1 on `bg.muted`** | Hints and meta. **Restricted:** canvas and surface only (enforced by the pair matrix). |
| `color.text.placeholder` | neutral.500 | neutral.400 | Same as tertiary | Placeholder is never the only label |
| `color.text.disabled` | neutral.400 | neutral.600 | Exempt (WCAG 1.4.3) | Pair with `aria-disabled` / `disabled` |
| `color.text.on-action` | neutral.0 | neutral.0 | 5.17 on accent.600, 6.70 on accent.700 | Text on accent or danger fills |
| `color.text.link` | accent.700 | accent.300 | ≥4.5 (verify per brand) | Links; underline in body copy |
| `color.text.danger` | red.700 | red.400 | 6.47 on white / 7.2 dark | Error messages. *Not* `red-500` (BoardUI's 3.81:1 failure). |
| `color.icon.primary` / `.secondary` / `.tertiary` | Same as text roles | Same | ≥3:1 for meaningful icons (WCAG 1.4.11) | Decorative icons are exempt but should be `aria-hidden` |

### Borders and focus

| Token | Light | Dark | Rule |
|---|---|---|---|
| `color.border.subtle` | neutral.200 | neutral.800 | Decorative dividers and card edges (no contrast requirement) |
| `color.border.default` | neutral.300 | neutral.700 | Secondary button edge, table lines |
| `color.border.input` | neutral.450 | neutral.450 | Form control boundary: **≥3:1** against adjacent surfaces (3.2 light / 5.5 dark) |
| `color.border.focus` | accent.600 | accent.400 | **The single focus color.** ≥3:1 against canvas (5.17 / 7.8). |
| `color.border.danger` | red.600 | red.400 | Invalid fields |

### Actions

| Token | Light | Dark | Note |
|---|---|---|---|
| `color.action.primary.bg.default` | accent.600 | accent.600 | Solid fill (avoids gradient-stop contrast issues) |
| `color.action.primary.bg.hover` | accent.700 | accent.500\* | \*Check `on-action` contrast if you lighten in dark mode; switch to dark text if it fails |
| `color.action.primary.bg.pressed` | accent.800 | accent.700 | |
| `color.action.secondary.bg.default` | neutral.0 | neutral.900 | Paired with `border.default` |
| `color.action.secondary.bg.hover` | neutral.100 | neutral.800 | |
| `color.action.tertiary.bg.hover` | neutral.100 | neutral.800 | "Ghost": transparent at rest |
| `color.action.danger.bg.default` | red.600 | red.600 | White text 4.83:1 |
| `color.action.selected.bg` | accent.50 | accent.950 | Selected rows, menu items, tabs |
| `color.action.selected.fg` | accent.700 | accent.300 | |
| `color.action.disabled.bg` / `.fg` | neutral.100 / neutral.400 | neutral.800 / neutral.600 | Explicit tokens, no opacity |

### Status (named by meaning)

| Token pattern | Light | Dark |
|---|---|---|
| `color.status.{info,success,warning,danger}.bg` | 50 step of sky / green / amber / red | 950 step (or 900 at reduced alpha) |
| `color.status.*.fg` | 800 step (e.g. green.800 on green.50 = 6.8:1) | 300 step |
| `color.status.*.border` | 200 step | 800 step |
| `color.status.*.icon` | 600 step | 400 step |
| `color.tag.{blue,green,purple,…}.bg/fg` | Hue-named **categorical** colors for tags and labels, which carry no meaning | |

## 5.4 Typography

Fonts: `font.family.sans` = Inter (or your brand UI face) with a system fallback stack; `font.family.mono` = JetBrains Mono or similar. Enable `font-variant-numeric: tabular-nums` in tables and metrics.

The base below is **14px**, which suits dense product UI. If your product is reading-heavy, shift the body styles up one step (16px).

| Token (composite) | Size / line height | Weight | Tracking | Use |
|---|---|---|---|---|
| `text.display-lg` | 48 / 56 | 600 | −0.02em | Marketing hero |
| `text.display-md` | 36 / 44 | 600 | −0.02em | Hero KPI, empty-state headline |
| `text.display-sm` | 30 / 36 | 600 | −0.01em | Page hero |
| `text.heading-xl` | 24 / 32 | 600 | −0.01em | Page title (`h1` in app) |
| `text.heading-lg` | 20 / 28 | 600 | 0 | Section title |
| `text.heading-md` | 16 / 24 | 600 | 0 | Card or dialog title |
| `text.heading-sm` | 14 / 20 | 600 | 0 | Group label, table header |
| `text.body-lg` / `-strong` | 16 / 24 | 400 / 500 | 0 | Long-form reading |
| `text.body-md` / `-strong` | **14 / 20** | 400 / 500 | 0 | Default UI text; text inside md controls |
| `text.body-sm` / `-strong` | 13 / 18 | 400 / 500 | 0 | Dense tables, sm controls |
| `text.caption` / `-strong` | 12 / 16 | 400 / 500 | +0.01em | Hints, meta, xs controls |
| `text.label-xs` | 11 / 16 | 600 | +0.02em | Badges, overlines (sparingly) |
| `text.code` | 13 / 20 | 400 mono | 0 | Inline and block code |

**Rules:**

- **Two weights per style at most.** That's 19 composite styles instead of BoardUI's 52.
- **Line heights are even numbers.** Text inside fixed-height controls uses 20 or 16px, so heights land on the 4px grid (20 + 2×8 = 36; 16 + 2×8 = 32; 16 + 2×4 = 24).
- **Color is never part of a type token.**

## 5.5 Spacing

**Primitive scale (4px unit).** If you use Tailwind, don't redefine these: Tailwind's `--spacing: 0.25rem` multiplier *is* this scale. Only add the semantic aliases.

| Token | px | | Token | px |
|---|---|---|---|---|
| `space.0` | 0 | | `space.6` | 24 |
| `space.0-5` | 2 | | `space.8` | 32 |
| `space.1` | 4 | | `space.10` | 40 |
| `space.1-5` | 6 | | `space.12` | 48 |
| `space.2` | 8 | | `space.16` | 64 |
| `space.3` | 12 | | `space.20` | 80 |
| `space.4` | 16 | | `space.24` | 96 |
| `space.5` | 20 | | | |

**Semantic spacing** (only decisions that repeat across many components):

| Token | Value | Use |
|---|---|---|
| `space.control.padding-x.{xs,sm,md,lg}` | 8 / 10 / 12 / 16 | Horizontal padding inside buttons and fields |
| `space.control.gap.{sm,md}` | 4 / 6 | Icon ↔ label gap |
| `space.field.label-gap` | 6 | Label → control |
| `space.field.stack` | 16 | Field → field in a form |
| `space.card.inset.{sm,md,lg}` | 12 / 16 / 24 | Card padding |
| `space.page.gutter` | 16 → 24 → 32 (by breakpoint) | Page side margin |
| `space.section.gap` | 32 → 48 → 64 | Between page sections |

## 5.6 Sizing

| Token | Value | Notes |
|---|---|---|
| `size.control.xs` | 24 | Dense tables and inline actions; meets the WCAG 2.5.8 minimum exactly |
| `size.control.sm` | 32 | Toolbars, compact forms |
| `size.control.md` | 36 | **Default** for buttons, inputs, selects and segmented controls. All must match. |
| `size.control.lg` | 40 | Touch-leaning or prominent forms |
| `size.control.xl` | 48 | Mobile primary actions, marketing CTAs |
| `size.icon.{xs,sm,md,lg}` | 14 / 16 / 20 / 24 | Mapped to control sizes xs / sm / md / lg |
| `size.avatar.{xs,sm,md,lg,xl}` | 20 / 24 / 32 / 40 / 56 | |
| `size.touch-target.min` | 24 | WCAG 2.5.8 (AA) floor |
| `size.touch-target.comfortable` | 44 | Apple HIG 44pt; Material recommends 48dp. Use for primary touch actions. |
| `size.content.max` | 1280 | Default max page width |
| `size.prose.max` | 68ch | Readable line length |

## 5.7 Radius and borders

| Token | Value | Use |
|---|---|---|
| `radius.none` / `xs` / `sm` / `md` / `lg` / `xl` / `2xl` / `3xl` / `full` | 0 / 2 / 4 / 6 / 8 / 12 / 16 / 24 / 9999 | Primitive scale |
| `radius.control.{xs,sm,md,lg}` | 4 / 6 / 8 / 10 | Radius grows with control height |
| `radius.surface` | 12 | Cards, panels |
| `radius.overlay` | 12 | Menus, popovers, tooltips |
| `radius.dialog` | 16 | Dialogs, sheets |
| `radius.pill` | full | Tags, switches, pill tabs |
| `border.width.default` | 1px | |
| `border.width.strong` | 2px | Selected cards, invalid emphasis |
| `focus.ring.width` / `focus.ring.offset` | 2px / 2px | **One** focus style everywhere; inset (offset 0, inset ring) only for table cells and rows |

**Nesting rule:** inner radius = outer radius − padding, with a minimum of 4px. For example, a 12px menu with 4px padding holds 8px items.

## 5.8 Elevation (shadow + surface + z-index)

| Level | Token | Light shadow | Dark treatment | Surface | z-index |
|---|---|---|---|---|---|
| 0 Flat | `elevation.flat` | none | none | `bg.surface` | `z.base` (0) |
| 1 Raised | `elevation.raised` | `0 1px 2px rgb(0 0 0 / 0.06)` | Opacity ×2–3, plus `border.subtle` | `bg.surface` | `z.base` |
| 2 Sticky | `elevation.sticky` | `0 1px 0 rgb(0 0 0 / 0.06)` | Border only | `bg.surface` | `z.sticky` (100) |
| 3 Overlay | `elevation.overlay` | `0 4px 12px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.06)` | Stronger shadow + border | `bg.surface-raised` | `z.popover` (1400) |
| 4 Modal | `elevation.modal` | `0 16px 40px rgb(0 0 0 / 0.16), 0 2px 6px rgb(0 0 0 / 0.08)` | Stronger shadow + border | `bg.surface-raised` | `z.modal` (1300) over `z.overlay` scrim (1200) |

**z-index scale:**

| Token | Value |
|---|---|
| `z.base` | 0 |
| `z.raised` | 10 |
| `z.sticky` | 100 |
| `z.dropdown` | 1000 |
| `z.overlay` | 1200 |
| `z.modal` | 1300 |
| `z.popover` | 1400 |
| `z.toast` | 1500 |
| `z.tooltip` | 1600 |

Popovers and tooltips sit *above* modals, because they can open from inside one. React Aria's portals make conflicts rarer, but the scale removes guessing.

## 5.9 Motion

| Token | Value | Use |
|---|---|---|
| `motion.duration.instant` | 0ms | Reduced-motion substitute |
| `motion.duration.fast` | 100ms | Hover color, small fades |
| `motion.duration.base` | 150ms | Press, toggles, checkbox |
| `motion.duration.moderate` | 200ms | Tooltip, popover, menu enter |
| `motion.duration.slow` | 300ms | Dialog, sheet, drawer enter |
| `motion.duration.slower` | 500ms | Staggered content reveals |
| `motion.easing.standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes in place |
| `motion.easing.enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | Things arriving (decelerate). BoardUI's signature curve. |
| `motion.easing.exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving (accelerate) |
| `motion.distance.{sm,md}` | 4px / 12px | Enter offsets |
| `motion.scale.enter` | 0.96 | Overlay enter scale |
| `motion.press.scale` | 0.98 | Button press |

**Rules:**

- Exits use the next shorter duration (e.g. enter 200 → exit 150).
- Stagger steps of 30–50ms, capped at ~6 items.
- Under `prefers-reduced-motion: reduce`, durations go to `instant` and transforms are removed, but **end states and meaning stay** (the check is drawn and the spinner becomes a static indicator plus text).

## 5.10 Breakpoints and grid

| Token | Min width | Columns | Gutter | Margin |
|---|---|---|---|---|
| (base) | 0 | 4 | 16 | 16 |
| `breakpoint.sm` | 640 | 8 | 16 | 24 |
| `breakpoint.md` | 768 | 8 | 24 | 24 |
| `breakpoint.lg` | 1024 | 12 | 24 | 32 |
| `breakpoint.xl` | 1280 | 12 | 24 | 32, max content 1280 |
| `breakpoint.2xl` | 1536 | 12 | 32 | auto (centered) |

The breakpoints match Tailwind's defaults, so there's no translation layer. Components adapt with **container queries**; pages adapt with breakpoints.

## 5.11 Opacity

| Token | Value | Use |
|---|---|---|
| `opacity.scrim` | 0.5 light / 0.64 dark | Modal backdrop |
| `opacity.hover-overlay` | 0.04 / 0.08 | Optional state layer on colored surfaces |

There's deliberately **no `opacity.disabled`**: disabled states use explicit color tokens (BoardUI's approach, which keeps contrast predictable).

## 5.12 Contrast pair matrix (test fixture)

Keep a file that lists every *intended* pairing. A test computes the ratios for every theme and fails CI below the requirement.

```json
[
  { "fg": "color.text.primary",   "bg": ["color.bg.canvas", "color.bg.surface", "color.bg.subtle", "color.bg.muted"], "min": 4.5 },
  { "fg": "color.text.secondary", "bg": ["color.bg.canvas", "color.bg.surface", "color.bg.subtle", "color.bg.muted"], "min": 4.5 },
  { "fg": "color.text.tertiary",  "bg": ["color.bg.canvas", "color.bg.surface"],                                   "min": 4.5 },
  { "fg": "color.text.on-action", "bg": ["color.action.primary.bg.default", "color.action.primary.bg.hover", "color.action.danger.bg.default"], "min": 4.5 },
  { "fg": "color.text.danger",    "bg": ["color.bg.canvas", "color.bg.surface"],                                   "min": 4.5 },
  { "fg": "color.border.input",   "bg": ["color.bg.canvas", "color.bg.surface"],                                   "min": 3.0 },
  { "fg": "color.border.focus",   "bg": ["color.bg.canvas", "color.bg.surface", "color.bg.surface-raised"],       "min": 3.0 }
]
```

This one file would have caught BoardUI's tertiary text, placeholder, gradient-top, error-text and dark secondary-text failures automatically.

## 5.13 Source format and output

**Source (DTCG-style JSON, `packages/tokens/src/`).** Shown in the string shorthand that Style Dictionary v4 accepts. The stable DTCG spec writes dimensions as `{ "value": 14, "unit": "px" }` and colors as objects. Use whatever your tool version expects.

```jsonc
// primitives/color.json
{
  "color": {
    "neutral": { "0": { "$type": "color", "$value": "#ffffff" }, "950": { "$type": "color", "$value": "#0a0a0a" } },
    "blue":    { "600": { "$type": "color", "$value": "#2563eb" }, "700": { "$type": "color", "$value": "#1d4ed8" } },
    "accent":  { "600": { "$type": "color", "$value": "{color.blue.600}" }, "700": { "$type": "color", "$value": "{color.blue.700}" } }
  }
}

// semantic/color.light.json
{
  "color": {
    "text":   { "primary": { "$type": "color", "$value": "{color.neutral.950}" } },
    "action": { "primary": { "bg": {
      "default": { "$type": "color", "$value": "{color.accent.600}" },
      "hover":   { "$type": "color", "$value": "{color.accent.700}" }
    } } }
  }
}

// semantic/typography.json
{
  "text": {
    "body-md": {
      "$type": "typography",
      "$value": { "fontFamily": "{font.family.sans}", "fontSize": "14px", "lineHeight": "20px", "fontWeight": 400, "letterSpacing": "0em" }
    }
  }
}
```

**Output (`packages/tokens/dist/css/tokens.css`, generated; never edit by hand):**

```css
:root,
[data-theme="light"] {
  color-scheme: light;
  --ds-color-text-primary: #0a0a0a;
  --ds-color-action-primary-bg-default: #2563eb;
  --ds-color-action-primary-bg-hover: #1d4ed8;
  --ds-color-border-focus: #2563eb;
  --ds-size-control-md: 2.25rem;
  --ds-radius-control-md: 0.5rem;
  --ds-motion-duration-base: 150ms;
  --ds-motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  color-scheme: dark;
  --ds-color-text-primary: #fafafa;
  --ds-color-border-focus: #60a5fa;
  /* …only semantic tokens that change… */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* same as [data-theme="dark"], generated */ }
}
```

Mapping these variables into Tailwind utilities and a React component is shown in [file 8 §8.11](08-implementation-strategy.md#811-example-from-token-to-component).
