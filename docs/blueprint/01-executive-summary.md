# 1. Executive summary of the reference design system

## What BoardUI is

**[Observed]** BoardUI calls itself a "React design system for agentic interfaces". It's aimed at dashboards and AI-app UIs. Key facts:

| Aspect | What I found |
|---|---|
| Scope | ~85 items: 31 base components, 19 blocks, 19 chart cards, 10 full-page templates, and two foundation pages (Color, Typography). The site's own counts vary between pages. |
| Stack | React (Next.js docs site), **Tailwind CSS v4** (tokens in `@theme`), **React Aria Components** for behavior, Remix Icon, Inter and JetBrains Mono |
| Distribution | Copy-in source, like shadcn/ui: `npx boardui init` sets up dependencies, tokens, global styles, the `cx` helper and agent rules. `npx boardui add button` copies source files into your repo. There is no runtime package. |
| Design source | "Figma first". Component source comments cite Figma node IDs and reproduce Figma measurements 1:1. |
| Tokens | "400+" by the site's count. I extracted 604 theme variables, 194 semantic light tokens and 163 dark overrides. |
| Theming | Light and dark modes (via the `.dark` class), a re-tintable accent, and RTL (Arabic font swap plus mirrored directional icons) |
| AI tooling | MCP server, a `SKILL.md` agent skill, and "Copy page / Copy for AI" on every docs page |
| Business model | Free tier (MIT, 55 items) plus Pro (one-time purchase, 30 items) |

## The eight rules that make it consistent

What holds BoardUI together is a small set of rules applied everywhere, not the number of components.

| # | Rule | Evidence | Why it works |
|---|------|----------|--------------|
| 1 | **Components consume only semantic tokens** | [Observed] The Color docs say so outright. In Button's source every color class is semantic, e.g. `bg-background-primary-default` or `border-border-button-hover`. | Retuning a value never requires editing a component file. |
| 2 | **A theme is a remap, not an override** | [Observed] `.dark` re-points 163 of the 194 semantic tokens. Components contain no `dark:` classes. | Dark mode is designed once, centrally, and all components get it for free. |
| 3 | **One accent ramp drives all interactive emphasis** | [Observed] `--color-accent-50…950` are aliases of `blue-*`. Primary button, checkbox, radio, switch, slider, tabs, selected nav item and focus ring all read from it. The docs offer an "eleven-variable override" to rebrand. | Rebranding is a single change, and selection and focus look the same everywhere. |
| 4 | **Typography tokens are composite** | [Observed] 13 type styles × 4 weights. One class (e.g. `text-body-medium`) sets size, line-height, letter-spacing and weight together. Color is applied separately. | Type metrics can't be assembled inconsistently, because there's only one way to set them. |
| 5 | **Dimensions scale with control size** | [Observed] Button: height 36 / 32 / 24 → radius 10 / 8 / 4 → icon 20 / 18 / 14 → label padding 4 / 2 / 2. | Proportions stay stable as size changes, so small and large controls look related. |
| 6 | **A state change is a step on a ramp** | [Observed] Primary button gradient: default `accent-500→600`, hover `400→500`, active `600→700`. Neutral surfaces: white → `neutral-100` (hover) → `neutral-200` (active). | States are predictable and don't need to be designed one by one. |
| 7 | **Behavior is delegated to React Aria** | [Observed] Select, Input, Tooltip and the dialogs carry React Aria attributes (`data-rac`, `react-aria-*` ids). The docs say "Every form component builds on React Aria." | Keyboard handling, focus management and ARIA wiring come from a heavily tested library, not hand-rolled code. |
| 8 | **Shared recipes instead of copy-paste** | [Observed] Select and Dropdown import one menu recipe (`MENU_ITEM`, `MENU_POPOVER_SURFACE`, …). One `.button-press-motion` class. One focus ring recipe. One popover entrance (scale 0.9 + 4px blur + fade, 150–200 ms). | Related components can't drift apart, because they share the code that styles them. |

A ninth, cultural rule: **the "why" lives next to the code.** [Observed] Component files open with the Figma node, the variant matrix, a sizing table and the reasoning behind deviations. For example, the Select source explains in prose why its popover is non-modal.

## Weaknesses (what not to copy)

| Issue | Evidence | Impact |
|---|---|---|
| Contrast gaps in core text tokens | [Measured] `text-tertiary` on the canvas: 2.58:1. Input placeholder: 2.17:1. White text on the top stop of the primary gradient (`accent-500`): 3.76:1. Error text (`red-500`): 3.81:1. Dark-mode `text-secondary` on cards: 3.19:1. | Fails WCAG 1.4.3 (4.5:1 for normal text) wherever these carry meaning. Hints and error messages do. |
| Component-specific tokens in the global semantic layer | [Measured] By a name-based count, ~106 of 194 `:root` tokens are named after one component or feature: `--color-ticket-detail-*`, `--color-composer-panel-*`, `--color-docs-*`, `--color-calendar-event-*`. | The semantic layer stops being a shared vocabulary, and the token count grows with every new feature. |
| Inconsistent size API and heights | [Observed] Button sizes are `medium` / `small` / `xs`; Select and Tooltip sizes are `md` / `sm`. The Select trigger measures **38px** next to 36px Buttons and Inputs. | Toolbars that mix filters and buttons don't line up, and developers have to remember two vocabularies. |
| Two focus languages | [Observed] Buttons and triggers show a 2px accent ring with a 2px offset. Inputs show an inset neutral ring, measured at 2.17:1 against the field. | Focus looks different depending on the control. The input ring is weak. |
| Two parallel status systems | [Observed] Status colors are named by hue (`status-lime-*`, `status-rose-*`), while notifications are named by meaning (`notification-success-*`, `notification-error-*`). | Different teams will pick different tokens for the same meaning. |
| Drift outside the token system | [Measured] ~32% of the site's CSS selector rules (1,010 of 3,143) use arbitrary values such as `leading-[22.222px]` or shadows with `0.896px` offsets. This includes marketing and docs pages. | Values pile up outside the system and can't be retuned globally. |
| Small inconsistencies within the scale | [Observed] `title-3-regular` has a 24px line height while the other `title-3` weights have 26px. `separator-border-strong` resolves to the same value as `separator-border`. | Tokens look systematic but aren't fully. |
| Accessibility gaps | [Observed] No `forced-colors` (Windows High Contrast) styles. Button has no loading state. In Settings Modal, focus didn't move into the dialog and Tab reached the page behind it (see the limitations in the README). A label is clipped at 375px. | These need fixing before anything is production-grade. |

## Adopt, adapt or avoid

| Adopt as-is | Adapt | Avoid |
|---|---|---|
| Two-tier tokens (primitive → semantic) with themes by remap | Composite type tokens: keep the idea, but cut 13×4 = 52 combinations down to the ones you actually use | Component-specific tokens in the global namespace |
| An accent alias ramp for brand and selection | "Figma 1:1" pixel values: let tokens drive Figma *and* code, so neither copies the other | Mixed size vocabularies (`medium` vs `md`) |
| Dimension tables tied to control size (height → radius → icon → padding) | Gradients on CTAs: make solid the default, and if you do use a gradient, check contrast at every stop | Text tokens below 4.5:1 that are used for hints or errors |
| React Aria (or a similar headless library) for behavior | Copy-in distribution: decide deliberately between an npm package and a registry (see [file 8](08-implementation-strategy.md)) | A different focus treatment for each component |
| Shared recipes (menu, focus, press, popover entrance) | `.dark` class only: also respect `prefers-color-scheme` and set `color-scheme` | Arbitrary values in components |
| A reduced-motion fallback in every animated component | A blur-in entrance: use it sparingly, because `filter` costs more to render than transform or opacity | Shipping without forced-colors support |
| The docs page template and agent-readable docs (`SKILL.md`, "copy for AI") | | Hue-named status tokens alongside meaning-named ones |
