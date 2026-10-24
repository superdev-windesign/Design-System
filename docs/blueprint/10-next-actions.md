# 10. Immediate next actions

Three steps, in order. Each one produces something concrete, and each unblocks the next.

---

## First: write the charter and pick your validation screens (1–3 days)

**Do:**

1. Create `docs/charter.md` with:
   - **Scope:** which product(s), web only or not, React + Tailwind v4?
   - **Users:** who will use the system (you, other designers, developers, AI agents).
   - **End-user context:** dense dashboard? reading-heavy? mostly desktop?
   - **Accessibility target:** WCAG 2.2 AA, plus forced colors and reduced motion.
   - **Themes:** light + dark, and RTL if needed.
   - **Distribution:** npm package in a monorepo (recommended in [file 8 §8.2](08-implementation-strategy.md#82-distribution-model-package-vs-copy-in-registry)).
   - **Success criteria:** "The validation screens are rebuilt with zero raw values."
2. Write **3–5 principles**, each with the trade-off it accepts.
3. Pick **2 validation screens** from a real product, or a realistic one you'd build anyway. A settings form inside a dialog, plus a list/overview page, is a good default because together they exercise all 8 v0.1 components.
4. Run a quick **UI inventory** on those screens (or on the closest existing product): screenshot every button, input, select and dialog into one Figma page; list every color, font size, spacing value and control height you find. This is your baseline.

**Done when:**

- The charter fits on one page.
- The two screens exist as screenshots or mockups.
- The inventory spreadsheet lists value → count → where used.

**Why first:** without the charter, every later choice (14px vs 16px body, density, themes, package vs copy-in) becomes a debate. Without validation screens, "done" has no meaning.

---

## Second: build the token foundation with its tests (≈1–2 weeks)

**Do:**

1. Scaffold the monorepo: `packages/tokens`, `packages/styles`, `apps/docs`, using the layout in [file 8 §8.12](08-implementation-strategy.md#812-suggested-folder-structure).
2. Write the **primitives** (neutral + accent + status ramps) and **semantic tokens** (light + dark) from [file 5](05-token-spec.md). Adjust the starting values to your brand and to the audit.
3. Add the **contrast-pair matrix** test, the **theme-coverage** test and the **naming** test. Make CI fail on violations.
4. Generate `tokens.css`, the Tailwind `@theme inline` bridge, and base CSS (focus outline, reduced motion, forced colors).
5. Mirror the tokens in **Figma variables**: a hidden Primitives collection, plus Semantic with Light and Dark modes and code syntax set to `var(--ds-…)`.
6. Run the **theme-swap test**: change the accent, flip to dark, confirm the contrast suite stays green.

**Done when:**

- `pnpm build` produces the CSS.
- The tests pass.
- Figma and code token names match one to one.
- A plain HTML page using the variables switches theme correctly with no flash.

**Why second:** tokens are the contract between design and code. Testing them now prevents BoardUI's main problems (sub-4.5:1 text tokens, component tokens leaking into the global layer) before a single component depends on them.

---

## Third: ship Button end to end as the tracer bullet (≈1 week)

**Do:**

1. Create `packages/react` with React Aria Components, tailwind-variants and the focus-ring recipe. Use the code in [file 8 §8.11](08-implementation-strategy.md#811-example-from-token-to-component) as the starting point.
2. Build **Button**: variants primary / secondary / tertiary / danger; sizes sm / md / lg; icon-only (type-enforced `aria-label`); pending state.
3. Build the matching **Figma component** with identical prop names, auto layout bound to variables, and the state variants.
4. Write the **stories** (variant × size × state × light/dark/RTL), **tests** (role-based queries, keyboard, axe) and the **docs page** using the template in [file 8 §8.8](08-implementation-strategy.md#88-documentation-and-interactive-examples).
5. Release `@ds/react@0.0.1` with Changesets, and use the Button in one of your validation screens.

**Done when:**

- Button meets every item in the definition of done ([file 6 §6.4](06-component-inventory.md#64-universal-acceptance-criteria-definition-of-done-for-every-component)).
- It renders correctly in a real screen in both themes.
- You've recorded how long it took. That number is the basis for re-planning the remaining v0.1 components (TextField next, then Checkbox, Switch, Select, Dialog, Tooltip, Badge).

**Why third, and why Button:** it's the simplest component that touches *every* layer: tokens, theme, focus, motion, Figma props, React Aria, types, stories, visual and a11y tests, docs, release. Any friction in the pipeline shows up here, while it's still cheap to fix. After that, each new component is mostly "more of the same".

---

## After these three

Follow the [roadmap](09-roadmap.md): finish v0.1 (eight components, two validation screens rebuilt), measure against your baseline ([file 7](07-measurement-checklist.md)), then plan v0.2 from the gaps the validation screens revealed.
