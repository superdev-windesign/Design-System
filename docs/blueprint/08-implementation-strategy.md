# 8. Figma and frontend implementation strategy

## 8.1 Recommended stack and trade-offs

| Concern | Recommendation | Alternatives | Why / trade-off |
|---|---|---|---|
| Token source | **DTCG-format JSON in the repo** | Figma as the source (export via plugin) | The repo is diffable, reviewable and testable (contrast tests run on it). Figma-as-source is friendlier to designers but harder to review and version. |
| Token build | **Style Dictionary v4** | Terrazzo, Tokens Studio's transformer | SD is the most widely used and fully customizable (custom transforms and formats). Terrazzo is DTCG-native with less setup. |
| Figma sync | **Tokens Studio** (GitHub sync), or a script using the Figma Variables REST API | Manual mirroring | Tokens Studio works on any plan. Writing variables via the REST API needs an Enterprise plan. Manual mirroring drifts. |
| Behavior | **React Aria Components** | Radix Primitives, Base UI, Ark UI (Zag) | RAC has the deepest accessibility and i18n support (dates, RTL, typeahead) and is what BoardUI uses. Its API is large and render-prop based. Radix is simpler and very popular, with less i18n depth. Ark/Zag runs across React, Vue and Solid if framework-agnostic *behavior* matters to you. |
| Styling | **Tailwind CSS v4 + tailwind-variants** (or `cva` + `tailwind-merge`) | CSS Modules + CSS variables; vanilla-extract; Panda CSS | Tailwind maps tokens to utilities through `@theme` and is fast to author, but consumers either use Tailwind or get your compiled CSS. CSS Modules put no requirements on consumers but are more verbose. vanilla-extract gives typed, build-time styles. |
| Component workshop and docs | **Storybook** (autodocs, controls, a11y addon, interaction tests); add a docs site (Next.js or Astro + MDX) when you need guidelines and patterns | Ladle, Docusaurus | Storybook doubles as the test harness for visual and a11y tests. A docs site reads better for guidelines. |
| Visual regression | **Chromatic** (Storybook-native), or **Playwright `toHaveScreenshot`** in Docker | Argos, Lost Pixel, Percy | Chromatic is hosted, with review UI and team workflow, and is paid beyond its free tier. Playwright is free, but you manage baselines and OS-consistent rendering yourself. |
| Accessibility tests | Storybook a11y addon (axe) + **Playwright + `@axe-core/playwright`** + keyboard interaction tests + a manual screen-reader matrix | Pa11y, Lighthouse | Automation catches only part of WCAG; keyboard and screen-reader checks cover the rest. |
| Unit and interaction tests | **Vitest + Testing Library + user-event** | Jest | Fast, ESM-native |
| Monorepo | **pnpm workspaces + Turborepo** | Nx | Simple, cached builds |
| Package build | **tsup / tsdown** (ESM + `.d.ts`), or Vite library mode | Rollup | Minimal config |
| Versioning | **Changesets** | semantic-release | Release intent is written per PR; works well for monorepos with several packages |
| Icons | SVG source → **SVGR** → React components; start from one open set (Remix, Lucide or similar) | Icon fonts (avoid) | Tree-shakable, `currentColor`, no FOIT, accessible |

**Keeping the foundation framework-agnostic:** `@ds/tokens` (JSON → CSS/JS) and `@ds/styles` (plain CSS) contain no React. A future Vue app, a Web Components layer, email templates or a native app can consume the same tokens. Only `@ds/react` is React-specific.

## 8.2 Distribution model: package vs copy-in registry

| Model | Pros | Cons | Fits when |
|---|---|---|---|
| **npm package** (versioned) | Central fixes reach everyone; semver; one source of truth | Less local customization; needs good escape hatches | You're building a system for **your own products** (recommended) |
| **Copy-in registry** (BoardUI, shadcn) | Full ownership and customization; no runtime dependency | Every consumer is a fork; fixes don't propagate; drift | You're selling or sharing a kit, or the components are starting points |
| **Hybrid** | Package for tokens, styles and core components; registry for blocks and templates | Two mechanisms to maintain | Products need standardized primitives *and* customizable page blocks |

**Recommendation:** start with the **package** model in a monorepo. Add a shadcn-compatible registry for blocks later, if teams need to copy and customize them.

## 8.3 Figma setup

### Variables (tokens)

| Collection | Modes | Contents | Settings |
|---|---|---|---|
| `Primitives` | 1 | Color ramps, number scales (spacing, radius, size), font families and weights | **Hide from publishing / empty scopes**, so designers can't pick primitives directly (enforces the semantic layer) |
| `Semantic / Color` | `Light`, `Dark` (+ later `High contrast`) | `text/primary`, `bg/surface`, `action/primary/bg/hover`, … aliased to primitives | Scopes set per role (text tokens only for text fills, border tokens only for strokes). **Code syntax** set to `var(--ds-color-text-primary)`, so Dev Mode shows the real variable. |
| `Semantic / Dimension` | `Default` (+ later `Compact`) | `size/control/md`, `space/control/padding-x/md`, `radius/control/md` | Number scopes (gap, padding, radius, width/height) |
| `Brand` (optional) | One per brand | The accent alias | Swapping the mode re-tints the file |

- **Mode limits depend on your Figma plan.** Check them before designing a multi-brand × multi-theme matrix.
- Bind text styles to typography variables (size, line height, weight, letter spacing) where your Figma version supports it.
- **Shadows** become effect styles named by elevation (`elevation/overlay`), with colors bound to variables where supported.

### Components

- **Same names and props as code.** Figma `Button` has properties `variant` (primary / secondary / tertiary / danger), `size` (xs / sm / md / lg), `state` (default / hover / pressed / focus / disabled), plus boolean `iconOnly`, plus instance-swap `startIcon` / `endIcon`, plus text `label`.
  - BoardUI renamed Figma's "Type" to `variant` in code. It's better to name things identically from day one.
- **Avoid variant explosion.** Use boolean and instance-swap properties for icons and optional parts instead of extra variants. Variants are only for things that change structure or appearance systematically.
- **Auto layout everywhere.** Padding and gap bound to dimension variables; fixed height bound to `size/control/*`; width hug or fill; min/max width for text-heavy parts.
- **Interactive components** for hover, pressed and focus in prototypes; the focus state uses the system ring.
- **Documentation frames** next to each component: anatomy, do/don't, and a link to the code docs.
- **Dev Mode / Code Connect:** map Figma components to real code snippets so handoff shows `<Button variant="primary">`, not CSS.

### File structure

```
📁 DS — Foundations     (variables, text styles, effect styles, icon library, grid styles)
📁 DS — Components      (one page per component; stable/beta/deprecated in page names)
📁 DS — Patterns        (forms, filters bar, settings, empty states)
📁 DS — Playground      (validation screens built only from the library)
```

## 8.4 Token pipeline

```
packages/tokens/src/*.json  (DTCG)          ← designers sync via Tokens Studio / PR
        │  style-dictionary build
        ├─► dist/css/tokens.css             (:root light + [data-theme=dark] + prefers-color-scheme)
        ├─► dist/js/tokens.ts               (typed constants, e.g., for charts/canvas)
        ├─► dist/json/tokens.figma.json     (for Figma variables sync)
        └─► dist/docs/tokens.json           (feeds the docs token tables)
        │
        └─► tests: contrast matrix · theme coverage · naming schema · no raw values in semantic layer
```

**Rules:**

- `dist/` is generated and never edited by hand.
- Semantic tokens in the CSS output can keep references (`var(--ds-color-neutral-950)`, via Style Dictionary's `outputReferences`). That makes devtools readable, and runtime re-theming of primitives possible.

## 8.5 Mapping tokens to CSS custom properties

- Prefix everything with `--ds-`, which avoids collisions with Tailwind's `--color-*` and third-party CSS.
- Themes are attribute-scoped: `[data-theme="dark"]`. The default follows `prefers-color-scheme`, and the stored user preference wins.
- Set `color-scheme: light | dark` per theme.
- Put the **no-flash script** in `<head>` before CSS paints:

  ```html
  <script>
    try {
      var t = localStorage.getItem("ds-theme");
      if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
    } catch (e) {}
  </script>
  ```

- **Base CSS in `@ds/styles`:**
  - The focus-ring utility.
  - `@media (prefers-reduced-motion: reduce)` defaults.
  - `@media (forced-colors: active)` fixes: restore borders on filled controls, use `outline` for focus, use `Highlight` / `CanvasText` system colors for selected states.
- **Use `outline` for focus rings, not `box-shadow`.** In Windows forced-colors mode box-shadows are removed, so BoardUI's ring-based focus indicators would vanish there. Outlines survive.

## 8.6 Component implementation (React + TypeScript)

**Conventions:**

- **One folder per component:** `button.tsx`, `button.styles.ts`, `button.stories.tsx`, `button.test.tsx`, `button.mdx` (docs), `index.ts`.
- **Wrap React Aria.** Behavior and ARIA come from RAC; your component adds tokens, variants and slots. Style states through RAC's data attributes (`data-[hovered]`, `data-[pressed]`, `data-[focus-visible]`, `data-[disabled]`, `data-[selected]`, `data-[invalid]`, `data-[entering]`, `data-[exiting]`).
- **Encode accessibility rules in types.** Use a discriminated union so icon-only buttons *require* `aria-label`.
- **Shared recipes** (`recipes/focus-ring.ts`, `recipes/menu.ts`, `recipes/field.ts`) are imported by every component that needs them. This is BoardUI's best structural habit.
- **Export style maps** (`buttonStyles`) for advanced composition, but document them as semi-public.
- **No `dark:` classes, no primitives, no arbitrary values in components.** A lint rule enforces it.
- **`className` is the escape hatch,** merged last. Count its usage in product code.

## 8.7 Styling with Tailwind v4: the bridge

```css
/* packages/styles/src/tailwind.css */
@import "tailwindcss";
@import "@ds/tokens/css/tokens.css";

@theme inline {
  /* Remove Tailwind's default palette so only DS colors exist as utilities */
  --color-*: initial;

  /* color → bg-*, text-*, border-*, outline-* */
  --color-canvas: var(--ds-color-bg-canvas);
  --color-surface: var(--ds-color-bg-surface);
  --color-subtle: var(--ds-color-bg-subtle);
  --color-fg: var(--ds-color-text-primary);
  --color-fg-secondary: var(--ds-color-text-secondary);
  --color-fg-disabled: var(--ds-color-text-disabled);
  --color-on-action: var(--ds-color-text-on-action);
  --color-action-primary: var(--ds-color-action-primary-bg-default);
  --color-action-primary-hover: var(--ds-color-action-primary-bg-hover);
  --color-action-primary-pressed: var(--ds-color-action-primary-bg-pressed);
  --color-action-disabled: var(--ds-color-action-disabled-bg);
  --color-line: var(--ds-color-border-default);
  --color-focus: var(--ds-color-border-focus);

  /* sizes → h-control-md, size-control-sm … (spacing namespace feeds sizing utilities) */
  --spacing-control-xs: var(--ds-size-control-xs);
  --spacing-control-sm: var(--ds-size-control-sm);
  --spacing-control-md: var(--ds-size-control-md);
  --spacing-control-lg: var(--ds-size-control-lg);

  /* radius → rounded-control-md */
  --radius-control-sm: var(--ds-radius-control-sm);
  --radius-control-md: var(--ds-radius-control-md);

  /* composite type → text-body-md-strong sets size + line-height + weight */
  --text-body-md-strong: var(--ds-font-size-body-md);
  --text-body-md-strong--line-height: var(--ds-line-height-body-md);
  --text-body-md-strong--font-weight: 500;

  /* easing → ease-standard */
  --ease-standard: var(--ds-motion-easing-standard);
}
```

**Why `@theme inline`:** without `inline`, Tailwind's utilities reference the intermediate `--color-*` variables, which are resolved on `:root`. A theme set on a *subtree* (`<aside data-theme="dark">`) then wouldn't update them. With `inline`, utilities point straight at `var(--ds-…)`, so themes work at any level.

**About the doubled prefix:** BoardUI's utilities read `text-text-primary` because the token path is appended to Tailwind's namespace. Short bridge names (`text-fg`, `bg-surface`, `border-line`) avoid that.

## 8.8 Documentation and interactive examples

**Per-component page template** (BoardUI's, with the gaps filled):

1. **Header:** name, one-sentence purpose, status (experimental / beta / stable), links to Figma and source.
2. **Live example and playground:** Storybook controls or a sandbox.
3. **When to use / when not to use**, with the alternative component named ("For navigation use LinkButton").
4. **Anatomy:** a labeled diagram.
5. **Variants, sizes, states:** a live matrix.
6. **Behavior:** overflow, truncation, responsive rules, loading.
7. **Accessibility:** a keyboard table, roles and ARIA, what screen readers announce, known limitations.
8. **Content guidelines:** label style ("Verb + noun", sentence case), error message patterns.
9. **Tokens used:** auto-generated from the styles file.
10. **Props:** auto-generated from TypeScript.
11. **Related components and patterns; changelog.**

**Also:**

- Foundation pages (color, type, spacing, elevation, motion), each showing tokens with live values in both themes.
- Pattern pages.
- Getting started, theming and contributing guides.
- ADRs.
- **Agent-readable rules:** an `AGENTS.md` or `SKILL.md` saying "use DS components, never raw hex, never arbitrary values; here's the catalog", plus a per-page "copy as Markdown". BoardUI shows this measurably reduces AI-generated look-alikes. It's cheap to add and increasingly important.
- **Docs-site hygiene:** render live examples so their landmarks don't pollute the docs page (BoardUI's `/components` has 7 `<main>` elements). Add a skip link.

## 8.9 Versioning, maintenance and contribution

**Semantic versioning rules:**

| Change | Version |
|---|---|
| Remove or rename a component, prop, token or CSS variable; change a default; change DOM structure consumers may target; change a token's *meaning* | **Major** (with codemod and migration guide) |
| New component, variant, prop or token; a visual value change within the same meaning (e.g. a slightly darker border); deprecations | **Minor** (visual diff attached to the release notes) |
| Bug and a11y fixes that don't change the API | **Patch** |

**Deprecation:**

- Mark it `@deprecated` in TypeScript and in token metadata (DTCG supports `$deprecated`).
- Warn in development builds.
- Keep it for at least one major version.
- Publish the removal date.

**Maintenance cadence:**

| Interval | Task |
|---|---|
| Every PR | CI (lint, unit, a11y, visual, contrast) |
| Weekly | Dependency PRs (Renovate) |
| Monthly | Analyzer and coverage report |
| Quarterly | Audit plus survey |
| On release | React Aria upgrade reviews against its changelog |

**Contribution model (`CONTRIBUTING.md`):**

| Size of change | Process |
|---|---|
| **Fix** | Issue → PR → review |
| **New variant or prop** | Issue with ≥2 use cases → design and a11y review → PR |
| **New component or pattern** | RFC (problem, evidence, alternatives considered, anatomy, a11y plan, API proposal) → review → build against the definition of done ([file 6 §6.4](06-component-inventory.md#64-universal-acceptance-criteria-definition-of-done-for-every-component)) → docs → release as `experimental` |
| **Reviews** | Every PR needs a code owner. Visual changes need a design reviewer. Interactive changes need an a11y checklist. |

## 8.10 Testing in practice

**Visual regression:**

- Snapshot coverage: one story per *variant × size × state* matrix, rendered in **light, dark and RTL**. Hover, pressed and focus states are forced through RAC's data attributes, or captured with Playwright actions.
- Run in Docker or a hosted service for deterministic fonts and rendering.
- Disable animations (emulate reduced motion).
- Wait for fonts to load.
- Use small, explicit diff thresholds; every diff gets reviewed.

**Accessibility:**

1. Lint: `eslint-plugin-jsx-a11y`.
2. Unit: Testing Library queries *by role and name* (if a test can't find the button by its name, neither can a screen reader).
3. Story-level: axe.
4. E2E keyboard scripts per component: open, navigate, select, dismiss, and focus return.
5. Contrast matrix on tokens.
6. Forced-colors and reduced-motion snapshots.
7. A manual screen-reader pass for changed components before each minor release.

## 8.11 Example: from token to component

**1) Token source (DTCG, excerpt):**

```jsonc
// packages/tokens/src/semantic/color.light.json
{ "color": { "action": { "primary": { "bg": {
  "default": { "$type": "color", "$value": "{color.accent.600}" },
  "hover":   { "$type": "color", "$value": "{color.accent.700}" },
  "pressed": { "$type": "color", "$value": "{color.accent.800}" } } } } } }
```

**2) Generated CSS:**

```css
:root, [data-theme="light"] {
  --ds-color-action-primary-bg-default: var(--ds-color-accent-600);
  --ds-color-action-primary-bg-hover:   var(--ds-color-accent-700);
  --ds-color-action-primary-bg-pressed: var(--ds-color-accent-800);
}
```

**3) Tailwind bridge** (§8.7): `--color-action-primary: var(--ds-color-action-primary-bg-default);` and so on, which generates `bg-action-primary`.

**4) Recipe and styles:**

```ts
// packages/react/src/utils/tv.ts — register composite text utilities with tailwind-merge
// (BoardUI's documented gotcha: otherwise `text-body-md-strong` and `text-on-action`
//  look like the same "text-*" group and one silently gets dropped)
import { createTV } from "tailwind-variants";

export const tv = createTV({
  twMergeConfig: {
    extend: {
      classGroups: {
        "font-size": [{ text: ["body-sm", "body-md", "body-md-strong", "caption", "heading-sm"] }],
      },
    },
  },
});
```

```ts
// packages/react/src/recipes/focus-ring.ts
// Outline (not box-shadow) so the ring survives Windows forced-colors mode.
export const focusRing =
  "outline-offset-2 outline-focus focus-visible:outline-2";
```

```ts
// packages/react/src/components/button/button.styles.ts
import type { VariantProps } from "tailwind-variants";
import { tv } from "../../utils/tv";
import { focusRing } from "../../recipes/focus-ring";

export const buttonStyles = tv({
  slots: {
    base: [
      focusRing,
      "inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none",
      "transition duration-(--ds-motion-duration-fast) ease-standard",
      "data-[pressed]:scale-98 motion-reduce:transition-none motion-reduce:data-[pressed]:scale-100",
      "data-[disabled]:cursor-not-allowed",
    ],
    icon: "shrink-0",
    label: "px-0.5",
  },
  variants: {
    variant: {
      primary: {
        base: [
          "bg-action-primary text-on-action",
          "data-[hovered]:bg-action-primary-hover data-[pressed]:bg-action-primary-pressed",
          "data-[disabled]:bg-action-disabled data-[disabled]:text-fg-disabled",
        ],
      },
      secondary: {
        base: [
          "border border-line bg-surface text-fg",
          "data-[hovered]:bg-subtle",
          "data-[disabled]:bg-action-disabled data-[disabled]:text-fg-disabled",
        ],
      },
    },
    size: {
      sm: { base: "h-control-sm gap-1 rounded-control-sm px-2 text-body-md-strong", icon: "size-4" },
      md: { base: "h-control-md gap-1.5 rounded-control-md px-3 text-body-md-strong", icon: "size-5" },
    },
    iconOnly: { true: { base: "aspect-square px-0" } },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;
```

**5) Component:**

```tsx
// packages/react/src/components/button/button.tsx
import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { Spinner } from "../spinner";
import { buttonStyles, type ButtonVariants } from "./button.styles";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type CommonProps = Omit<AriaButtonProps, "children"> &
  Omit<ButtonVariants, "iconOnly"> & { startIcon?: Icon; endIcon?: Icon };

// An icon-only button without an accessible name is a type error, not a code-review comment.
export type ButtonProps =
  | (CommonProps & { iconOnly?: false; children: ReactNode })
  | (CommonProps & { iconOnly: true; startIcon: Icon; "aria-label": string; children?: never });

export function Button(props: ButtonProps) {
  const { variant, size, iconOnly, startIcon: Start, endIcon: End, className, children, ...rest } = props;
  const s = buttonStyles({ variant, size, iconOnly });

  return (
    <AriaButton
      {...rest}
      className={composeRenderProps(className, (className) => s.base({ className }))}
    >
      {({ isPending }) => (
        <>
          {isPending ? (
            <Spinner className={s.icon()} aria-hidden />
          ) : Start ? (
            <Start className={s.icon()} aria-hidden />
          ) : null}
          {iconOnly ? null : <span className={s.label()}>{children}</span>}
          {!iconOnly && End ? <End className={s.icon()} aria-hidden /> : null}
        </>
      )}
    </AriaButton>
  );
}
```

**6) Usage:**

```tsx
<Button onPress={save}>Save changes</Button>
<Button variant="secondary" startIcon={PlusIcon}>New project</Button>
<Button iconOnly startIcon={TrashIcon} aria-label="Delete project" />
<Button isPending={saving} onPress={save}>Save</Button>   {/* React Aria handles pending semantics */}
// <Button iconOnly startIcon={TrashIcon} />  ← compile error: 'aria-label' is missing
```

**What one token change does:** edit `color.accent.600` in JSON → rebuild → `--ds-color-accent-600` changes → every primary button, focus ring and selected state updates. The contrast test re-runs. **No component file changes.** That's the property to protect.

## 8.12 Suggested folder structure

```
design-system/
├─ docs/
│  ├─ blueprint/                  ← this blueprint
│  └─ adr/                        ← architecture decision records
├─ packages/
│  ├─ tokens/
│  │  ├─ src/
│  │  │  ├─ primitives/           color.json · dimension.json · typography.json · motion.json
│  │  │  ├─ semantic/             color.light.json · color.dark.json · typography.json
│  │  │  │                        spacing.json · sizing.json · elevation.json · motion.json
│  │  │  └─ contrast-pairs.json   ← test fixture
│  │  ├─ style-dictionary.config.mjs
│  │  ├─ tests/                   contrast.test.ts · coverage.test.ts · naming.test.ts
│  │  └─ dist/                    (generated: css/, js/, json/)
│  ├─ styles/
│  │  └─ src/                     base.css · tailwind.css · forced-colors.css · reduced-motion.css
│  ├─ icons/
│  │  ├─ svg/                     raw icons
│  │  └─ src/                     generated React components
│  ├─ react/
│  │  └─ src/
│  │     ├─ components/
│  │     │  └─ button/            button.tsx · button.styles.ts · button.stories.tsx
│  │     │                        button.test.tsx · button.mdx · index.ts
│  │     ├─ recipes/              focus-ring.ts · field.ts · menu.ts · overlay.ts
│  │     ├─ utils/                tv.ts · compose-refs.ts
│  │     └─ index.ts
│  └─ eslint-plugin/              no-raw-color · no-arbitrary-value · no-primitive-token
├─ apps/
│  ├─ docs/                       Storybook (+ docs site later)
│  └─ playground/                 validation screens rebuilt with the DS
├─ .changeset/
├─ AGENTS.md                      rules for AI coding agents
├─ CONTRIBUTING.md
├─ package.json · pnpm-workspace.yaml · turbo.json · tsconfig.base.json
```
