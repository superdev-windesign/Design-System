# Windesign Design System

A token-driven React design system, set up according to the blueprint in
[docs/blueprint](docs/blueprint/README.md). The first components are
**Select** and **Date Range Picker** (plus the single-date **Date Picker** and
the **Button** they depend on), rebuilt for visual parity with
[BoardUI](https://www.boardui.com/components). Measurements are in
[docs/components/parity-report.md](docs/components/parity-report.md).

## Packages

```
packages/
  tokens/   DTCG JSON → CSS custom properties + flat JSON (Style Dictionary 5)
  styles/   base.css, Tailwind v4 bridge (@theme inline), shared utilities
  react/    components on React Aria, styled only through tokens
apps/
  playground/  Vite app showing every component in light, dark and system themes
docs/
  blueprint/   the design-system blueprint and BoardUI audit
  components/  per-component parity notes
```

The packages are internal workspace packages: `@ds/react` exports its
TypeScript source, so there is no build step yet. Add one (tsup or tsdown)
before publishing to a registry.

## Commands

Run from the repository root (npm workspaces):

| Command | What it does |
|---|---|
| `npm install` | Installs every workspace |
| `npm run dev` | Builds tokens, then starts the playground at http://localhost:5180 |
| `npm test` | Token tests (contrast matrix, theme coverage, naming) + component tests |
| `npm run typecheck` | TypeScript for `@ds/react` and the playground |
| `npm run build:tokens` | Rebuilds `packages/tokens/dist` |
| `npm run sync:palette -w @ds/tokens` | Regenerates color primitives from the installed Tailwind palette |

## How a value reaches a component

```
packages/tokens/src/semantic/theme.light.json   color.bg.surface = {color.white}
        │  npm run build:tokens
        ▼
dist/css/tokens.css      --ds-color-bg-surface: var(--ds-color-white)
        │  packages/styles/src/tailwind.css (@theme inline)
        ▼
--color-surface: var(--ds-color-bg-surface)   →   utility `bg-surface`
        │
        ▼
packages/react/src/components/select/select.tsx   "border border-line bg-surface …"
```

Dark mode is `data-theme="dark"` on any element (or the OS preference when
no theme is set). Components contain no `dark:` classes.

## Using it in an app

```css
/* app.css */
@import "tailwindcss";
@import "@ds/styles/tailwind.css";
@source "../node_modules/@ds/react/src";
```

```tsx
import { DateRangePicker, Select, SelectItem } from "@ds/react";

<Select aria-label="Filter by price" defaultSelectedKey="all">
  <SelectItem id="all" textValue="All prices">All prices</SelectItem>
  <SelectItem id="low" textValue="Under $100">Under $100</SelectItem>
</Select>

<DateRangePicker onChange={(range) => console.log(range)} />
```

Load Inter (e.g. `@fontsource-variable/inter`) for exact metrics, and copy
the no-flash theme script from `apps/playground/index.html` into your `<head>`.

## Conventions

- [AGENTS.md](AGENTS.md) lists the rules for code (human or AI): semantic
  utilities only, no arbitrary design values, one focus style, React Aria for
  behavior.
- `packages/tokens/src/contrast-pairs.json` lists every color pairing a
  component uses. `knownFailures` records the contrast debt inherited from
  BoardUI for parity; the test fails when one gets fixed so the entry is removed.
- Third-party code and licenses: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
