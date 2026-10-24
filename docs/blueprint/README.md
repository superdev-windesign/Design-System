# Design System Blueprint

A step-by-step plan for building a production-ready design system. It is based on a hands-on audit of **BoardUI** (https://www.boardui.com/components), done on **24 October 2026**.

The goal is a cohesive, accessible, maintainable system. A big pile of components is not the goal. Each document ends with something concrete you can act on.

## Reading order

| # | Document | What it answers |
|---|----------|-----------------|
| 1 | [Executive summary](01-executive-summary.md) | What BoardUI is, the rules that keep it consistent, what to adopt and what to avoid |
| 2 | [Reference audit](02-reference-audit.md) | Tokens, components, states, motion, responsive behavior, accessibility, naming and docs, with evidence |
| 3 | [Recommended architecture](03-architecture.md) | Layers, packages, theming, API conventions and governance for your system |
| 4 | [Foundation process](04-foundation-process.md) | The 10 "how do I start" questions, then a define / measure / choose / deliver / validate guide for every foundation |
| 5 | [Initial token specification](05-token-spec.md) | Concrete token names and starting values, plus the JSON → CSS → Tailwind pipeline |
| 6 | [Component inventory and architecture](06-component-inventory.md) | Build order, component vs variant vs composition vs pattern, and specs for the core components |
| 7 | [Measurement and validation checklist](07-measurement-checklist.md) | What to measure, how to measure it, and what a good result looks like (early stage vs adopted) |
| 8 | [Figma and frontend implementation](08-implementation-strategy.md) | Figma variables and components, token pipeline, React/TypeScript, testing, versioning, folder structure, code example |
| 9 | [Implementation roadmap](09-roadmap.md) | Nine phases, each with objectives, tasks, deliverables, completion criteria and pitfalls, plus the smallest useful v0.1 |
| 10 | [Immediate next actions](10-next-actions.md) | What to do first, second and third |

## Evidence labels

Claims about BoardUI carry one of these labels, so you can tell what was seen from what was interpreted:

- **[Observed]**: seen directly on the site, in its rendered DOM, in its production CSS, or in its published component source.
- **[Measured]**: computed from observed values. For example, contrast ratios use the WCAG 2.x relative-luminance formula on the resolved token colors.
- **[Inferred]**: my reading of *why* something is built a certain way. The site doesn't say it.
- **[Not verified]**: something I could not check. It's listed as a limitation, not assumed.

## How the audit was done

1. **Read the documentation pages:** the Components index, Let's begin, Color, Typography and Agent Skills, plus the component pages for Button, Select, Input, Tooltip and Settings Modal.
2. **Extracted every CSS custom property** from the production stylesheets: 604 variables in the Tailwind `@theme` layer, 194 semantic tokens on `:root`, and 163 overrides under `.dark`. Also all 37 `@keyframes` and every media query.
3. **Read the full published source** for `Button` and `Select` from the free "Manual" install tab.
4. **Inspected the live page in Chromium:** computed styles, ARIA attributes and focus behavior. I keyboard-tested Input, Tooltip and Settings Modal, and checked layout at a 375×812 phone viewport.
5. **Computed WCAG contrast** for key token pairs in the light and dark themes.

## Limitations

- **Pro items:** BoardUI says 30 items are Pro. Their pages show usage but not source, so I only saw their rendered output.
- **Figma:** I had no access to the Figma file. Statements about Figma come from source-code comments and the docs.
- **Screen readers:** I didn't test with NVDA, JAWS or VoiceOver. I checked roles, names and relationships (labels, `aria-describedby`) only.
- **Hover tooltips:** automated mouse hover didn't open tooltips, but keyboard focus did. This is most likely an automation artifact, not a site defect.
- **Modal focus:** the focus-containment finding on Settings Modal comes from automated keyboard events in an embedded Chromium. Reproduce it by hand before treating it as a confirmed bug.
- **Snapshot in time:** the site changes often (many items carry "New" badges), and it's inconsistent about its own size: `/components` says 78 components, `/getting-started` says 85.
- **Depth of coverage:** I didn't open all ~85 component pages. The deep dives cover Button, Select, Input, Tooltip and Settings Modal. Everything else is described from the overview page, the sidebar and the global CSS.
