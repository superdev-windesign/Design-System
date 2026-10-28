# Windesign Design System

A token-driven React design system, set up according to the blueprint in
[docs/blueprint](docs/blueprint/README.md). The components so far, all rebuilt
for visual parity with [BoardUI](https://www.boardui.com/components):

- **Select** and **Date Range Picker**, plus the single-date **Date Picker** and the **Button** they depend on.
- **All 31 of BoardUI's free base components** (Input, Checkbox, Switch, Tabs, Table, Tooltip, Tree View and more), converted onto the @ds tokens by [tools/boardui-port](tools/boardui-port/README.md).
- **Agent Progress**: animated multi-step progress, adapted from BoardUI Pro under the owner's license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). It is not shown in the public showcase.
- **Pro tier**, designed for this system rather than ported:
  - **Command Palette**: Autocomplete + Menu in a modal with a gliding highlight. `CommandMenu` embeds the same list inline.
  - **Toast**: call `toast.success(…)` from anywhere and mount one `<Toaster />`. Toasts rest as a stack, fan out on hover or focus and swipe away; `toast.promise` swaps a loading toast for the outcome.
  - **Step Wizard**: steps slide in the direction of travel, validate before moving on, and are announced to screen readers.
  - **Stat Card**: a rolling odometer number, a trend chip, and a sparkline you can scrub to read each point.
- **Blocks** (17): BoardUI's nine free blocks ported (Agent Thinking, Composer Loader, Auth Card, Data Grid, Data Table, Notification Center, Settings Modal, Sidebar, Stat Cards), plus eight designed here: Composer Panel, Composer Attachments, Web Search, Task List, Agent Limits, Questionnaire, Agent Creator and Calendar.
- **Charts** (18): BoardUI's free Revenue Chart ported, plus seventeen designed here on a shared chart shell (`ChartCard`, `ChartTooltip`, `seriesColor`): Activity Rings, Area, Bar List, Combo, Contributions, Earnings, Funnel, Heatmap, Line, Most Active Days, Radar, Radial, Sankey, Scatter, Sleep Score, Stage Bars and Steps. Cartesian and polar charts use [recharts](https://recharts.org).
- **Templates** (10): whole screens assembled from the blocks and charts, laid out with container queries so they fit whatever space they're given: Chat Starter, AI Chat, Multi-agent Chat, AI Image Generation, AI Profile, and Home, Finance, Marketing, Medical Profile and Project Board dashboards. The chat templates share `useChatSession`: pass `respond` (an async generator of text chunks) to connect a model; without it a demo responder streams canned replies.
- **Foundations**: Color and Typography pages in the playground, read live from the Tailwind bridge so they always match the tokens.

Browse them at `#/components` in the playground: every card is a live
preview, and each component has a page with an interactive demo and its
import line. A docs sidebar lists every page by group, with quick search
(⌘K / Ctrl K). On small screens it becomes a slide-in drawer.

Measurements are in [docs/components/parity-report.md](docs/components/parity-report.md).

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
| `npm run build` | Builds tokens, then the playground into `apps/playground/dist`, mirrored to `./dist` so hosts find it whether their root is the repo or `apps/playground` |
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
