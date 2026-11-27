# Windesign Design System

A token-driven React design system in Tonal teal: cool tide-grey neutrals, a
muted lagoon-teal accent, Manrope for display and interface type, and soft
rounded corners with pill buttons. It was
set up according to the blueprint in [docs/blueprint](docs/blueprint/README.md)
and started from BoardUI's free MIT components, which have since been re-themed;
the rest is original work. What's in it:

- **Select** and **Date Range Picker**, plus the single-date **Date Picker** and the **Button** they depend on.
- **31 base components** (Input, Checkbox, Switch, Tabs, Table, Tooltip, Tree View and more), ported from BoardUI's free MIT components by [tools/boardui-port](tools/boardui-port/README.md) and re-themed.
- **38 standard components**, designed here on React Aria:
  - Overlays: Dialog (with Modal), Alert Dialog, Drawer, Popover, Hover Card, Menu (sections, shortcuts, submenus, checkable items) and Context Menu.
  - Navigation and actions: Menubar, Navigation Menu, Stepper, Toolbar and Toggle Button.
  - Forms and selection: Combobox, Multi-select, Tag Group, Checkbox Group, Number Field, Search Field, Password Field (with a strength gauge), Date Field, Time Field, Color Picker, Rating, and Form with Field Error.
  - Feedback: Progress Bar, Meter, Spinner, Skeleton, Empty State and Alert.
  - Layout and data display: Card, Accordion, List, Description List, Timeline, Resizable Panels, Scroll Area, and Image with Aspect Ratio.
- **17 more**: Calendar and Range Calendar, Time Picker, Date-Time Picker, Link, Avatar Group, Progress Circle, Code Block, Copy Button, typography (Heading, Text, Code, Blockquote, Prose), layout (Stack, Inline, Grid, Container), ThemeProvider with `useTheme` and ThemeScope, Skip Link and Visually Hidden, Editable Text, Phone Field, Tour, Bottom Navigation, Virtual List, Truncate, and Relative Time / Formatted Number.
- **Specialised**: Side Navigation, Table of Contents (scroll-spy), Mentions Input, Tree Select, Floating Action Button and Back to Top, Countdown and Stopwatch, a draggable Bottom Sheet, a Week / Day Schedule, and a Donut Chart.
- **Smaller additions**: Breadcrumb folds long trails (`maxItems`), Select can search its options (`isSearchable`), Table can keep its header in view (`stickyHeader`), and Skeleton content arrives through a short blur. The playground search also finds components by other names (Modal, Progress, Date Calendar…).
- **Pro tier**, designed for this system rather than ported:
  - **Command Palette**: Autocomplete + Menu in a modal with a gliding highlight. `CommandMenu` embeds the same list inline.
  - **Toast**: call `toast.success(…)` from anywhere and mount one `<Toaster />`. Toasts rest as a stack, fan out on hover or focus and swipe away; `toast.promise` swaps a loading toast for the outcome.
  - **Step Wizard**: steps slide in the direction of travel, validate before moving on, and are announced to screen readers.
  - **Stat Card**: a rolling odometer number, a trend chip, and a sparkline you can scrub to read each point.
- **Blocks** (19): BoardUI's nine free blocks ported (Agent Thinking, Composer Loader, Auth Card, Data Grid, Data Table, Notification Center, Settings Modal, Sidebar, Stat Cards), plus ten designed here: Composer, Agent Progress, Composer Panel, Composer Attachments, Web Search, Task List, Agent Limits, Questionnaire, Agent Creator and Calendar.
- **Charts** (20): BoardUI's free Revenue and Orders charts ported, plus eighteen designed here on a shared chart shell (`ChartCard`, `ChartTooltip`, `seriesColor`): Activity Rings, Area, Bar List, Combo, Contributions, Earnings, Funnel, Heatmap, Line, Most Active Days, Radar, Radial, Sankey, Scatter, Sleep Score, Stage Bars, Steps and Donut. Cartesian and polar charts use [recharts](https://recharts.org).
- **Templates** (11): whole screens assembled from the blocks and charts, laid out with container queries so they fit whatever space they're given: Chat Starter, AI Chat, Multi-agent Chat, AI Image Generation, AI Profile, Home, Finance, Marketing, Medical Profile and Project Board dashboards, and a Calendar app. The chat templates share `useChatSession`: pass `respond` (an async generator of text chunks) to connect a model; without it a demo responder streams canned replies.
- **Foundations**: Color and Typography pages in the playground, read live from the Tailwind bridge so they always match the tokens.

The playground is laid out like a book: a contents page, numbered chapters
where every entry is a live figure ("Fig. 03.1"), and a page per entry with
Preview and Code tabs and the rest of its chapter alongside. Search everything
with ⌘K / Ctrl K; it runs on the system's own Command Palette.

## Packages

```
packages/
  tokens/   DTCG JSON → CSS custom properties + flat JSON (Style Dictionary 5)
  styles/   base.css, Tailwind v4 bridge (@theme inline), shared utilities
  react/    components on React Aria, styled only through tokens
apps/
  playground/  Vite app showing every component in light, dark and system themes
docs/
  blueprint/   the design-system blueprint and the original BoardUI audit
```

The packages are internal workspace packages: `@windesign-ds/react` exports its
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
| `npm run typecheck` | TypeScript for `@windesign-ds/react` and the playground |
| `npm run build:tokens` | Rebuilds `packages/tokens/dist` |
| `npm run sync:palette -w @windesign-ds/tokens` | Regenerates color primitives from the installed Tailwind palette |

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
@import "@windesign-ds/styles/tailwind.css";
@source "../node_modules/@windesign-ds/react/src";
```

```tsx
import { DateRangePicker, Select, SelectItem } from "@windesign-ds/react";

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
  component uses. `knownFailures` records deliberate exceptions with a reason
  (there are none now); the test fails if one starts passing so it gets removed.
- Third-party code and licenses: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
