# 3. Recommended design-system architecture

This takes what works in BoardUI (semantic tokens, theme by remap, accent alias, headless behavior, shared recipes) and fixes what doesn't (a flat, component-polluted semantic layer, mixed vocabularies, contrast gaps).

## 3.1 Layer model

```
┌──────────────────────────────────────────────────────────────────────┐
│ 6  Templates & product screens   owned by product teams; not in DS   │
├──────────────────────────────────────────────────────────────────────┤
│ 5  Patterns & blocks             documented recipes (forms, empty     │
│                                  states, filters bar, settings page)  │
├──────────────────────────────────────────────────────────────────────┤
│ 4  Components                    React + React Aria; styled only via  │
│                                  semantic/component tokens            │
├──────────────────────────────────────────────────────────────────────┤
│ 3  Component tokens (optional)   scoped to ONE component, defined in  │
│                                  that component's package/folder      │
├──────────────────────────────────────────────────────────────────────┤
│ 2  Semantic tokens               role-based, themeable (light/dark/…) │
├──────────────────────────────────────────────────────────────────────┤
│ 1  Primitive tokens              raw scales: color ramps, dimension,  │
│                                  font, duration, easing               │
├──────────────────────────────────────────────────────────────────────┤
│ 0  Principles & decisions        charter, principles, ADRs            │
└──────────────────────────────────────────────────────────────────────┘
```

**Reference rules.** Enforce them with lint rules, not just good intentions.

| Layer | May reference | Must not |
|---|---|---|
| Primitive | Raw values only | Reference other tokens (except rare same-layer aliases such as `accent → blue`) |
| Semantic | Primitives | Contain raw values (no hex in the semantic layer) |
| Component token | Semantic tokens (primitives only with a written reason) | Live in the global semantic file |
| Component | Semantic and its own component tokens | Use primitives, raw hex or arbitrary values |
| Pattern / template | Components, semantic tokens, layout utilities | Restyle component internals |

**Why:** each layer can change without breaking the ones above it. A primitive retune ripples through automatically. A theme only touches layer 2. A component refactor never touches tokens.

## 3.2 Packages

Keep the foundation framework-agnostic and the components framework-specific.

| Package | Contents | Framework-agnostic? |
|---|---|---|
| `@windesign/tokens` | DTCG JSON source. Build outputs: CSS custom properties (per theme), JS/TS constants, JSON for Figma sync | Yes |
| `@windesign/styles` | Base CSS (reset, `color-scheme`, focus ring, reduced-motion and forced-colors helpers), theme files, an optional Tailwind v4 bridge (`@theme inline`) | Yes (Tailwind optional) |
| `@windesign/icons` | SVG source, optimized, plus generated React components | SVG yes; React wrapper no |
| `@windesign/react` | Components, recipes, hooks | React |
| `@windesign/eslint-plugin` (later) | `no-raw-color`, `no-arbitrary-value`, `no-primitive-token-in-component` | — |
| `apps/docs` | Storybook and/or a docs site | — |
| `apps/playground` | The real "validation screens" you rebuild with the system | — |

**Why split tokens from components:** Figma, native apps, emails or a second framework can consume `@windesign/tokens` without React, and the token build becomes the single source of truth.

## 3.3 Theming model

- **Theme = a set of semantic-token values.** Ship `light` and `dark` first. Add `high-contrast` later if your users need it.
- **Activation:** `data-theme="light|dark"` on `<html>`, defaulting to `prefers-color-scheme`. Set the CSS `color-scheme` property in each theme so native controls and scrollbars match.
- **No flash:** an inline script in `<head>` reads the stored preference before first paint. BoardUI documents the same.
- **Subtree theming:** allowed, e.g. a dark sidebar in a light app. This is why the Tailwind bridge uses `@theme inline` (see [file 8](08-implementation-strategy.md)).
- **Brand:** an `accent` alias ramp (11 steps) plus an optional `accent-secondary`. Status colors (success, warning, danger, info) and chart palettes are **not** brand-tinted, so their meaning stays stable.
- **Density (later):** a `data-density="compact|comfortable"` switch that remaps size and spacing semantic tokens only. Don't build it until a product needs it.

## 3.4 Component API conventions (decide once, apply everywhere)

| Concern | Convention | Reason |
|---|---|---|
| Size names | `xs \| sm \| md \| lg` everywhere, default `md` | Avoids BoardUI's `medium` vs `md` split |
| Variant names | By **intent**: `primary \| secondary \| tertiary \| danger`. Appearance names like `ghost` or `outline` only when intent is identical. | Intent survives a visual redesign; appearance names don't |
| Boolean props | Follow React Aria: `isDisabled`, `isInvalid`, `isRequired`, `isSelected` | Components wrap React Aria; one convention end to end |
| Icon slots | `startIcon` / `endIcon` (or `leadingIcon` / `trailingIcon`), passed as component references | Logical (RTL-safe) names; the component controls icon size and `aria-hidden` |
| Links vs buttons | Separate `Button` and `LinkButton`, or `href` switching to `<a>` | Semantics stay correct; avoids a fragile `as` prop |
| Escape hatch | `className` is merged last via tailwind-merge. Usage is tracked. | Lets teams ship; tracking shows where the system falls short |
| Refs | Ref as a prop (React 19) | Composition with tooltips, popovers and form libraries |
| Controlled / uncontrolled | Support both (`value` / `defaultValue`, `isOpen` / `defaultOpen`) | Matches React Aria; supports forms and app state |
| Children vs props | Content goes in `children`; structure goes in slots or subcomponents (`Dialog.Title`) | Flexible content with stable anatomy |

## 3.5 Global state model

Every interactive component maps its states to the same token roles. Write this table once and reference it from every component spec.

| State | Trigger | Visual rule | Token roles |
|---|---|---|---|
| Default | — | Base surface, border and text | `*.default` |
| Hover | Pointer over, hover-capable devices only | One step toward emphasis | `*.hover` |
| Pressed | Pointer or key down | One more step, plus optional `scale(.98)` | `*.pressed` |
| Focus-visible | Keyboard / programmatic focus | **One focus ring style system-wide:** 2px `border.focus`, 2px offset (inset for cells and rows) | `border.focus`, `focus.ring.*` |
| Selected / checked | Value state | Accent surface or indicator | `action.selected.*` |
| Invalid | Validation | Danger border/ring, icon and message; never color alone | `status.danger.*` |
| Disabled | `isDisabled` | Explicit disabled colors; no hover or press; not focusable unless `aria-disabled` is required | `*.disabled` |
| Read-only | `isReadOnly` | Looks like a value, not a field; still focusable and selectable | `bg.subtle`, `text.primary` |
| Loading / pending | Async action | Keeps width; spinner replaces or accompanies the label; `aria-busy` or live announcement | `text.*`, `motion.*` |
| Open / expanded | Disclosure | Indicator rotates; `aria-expanded` | — |

## 3.6 Governance and decision records

- **Owner:** one accountable person or team for the system, plus named owners per component.
- **ADRs:** use Architecture Decision Records (`docs/adr/0001-token-naming.md`) for anything you'd otherwise debate twice: naming, theming, distribution model, the React Aria choice.
- **Contribution flow:** proposal → "is it a variant, composition or new component?" review → design and a11y review → build → docs → release. See [file 8 §8.9](08-implementation-strategy.md#89-versioning-maintenance-and-contribution).
- **Status labels** on every component: `experimental` → `beta` → `stable` → `deprecated`. Consumers know what's safe to depend on.

## 3.7 Why this architecture

| Goal | How the architecture serves it |
|---|---|
| Cohesive | One state model, one focus style, one size scale, shared recipes |
| Reusable | Tokens are framework-agnostic; components wrap a headless library |
| Accessible | React Aria for behavior; contrast enforced at the token layer, as a test |
| Maintainable | Strict layer references; component tokens scoped; ADRs; status labels |
| Scalable | New themes and brands are token-only changes; patterns are documented, not hard-coded into the library |
