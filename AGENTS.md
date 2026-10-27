# Rules for AI coding agents

These rules keep generated code on the design system instead of producing
look-alikes. They apply to `packages/react`, `packages/styles` and any app that
consumes them.

1. **Use the components.** Import from `@ds/react`; the full list is in
   `packages/react/src/index.ts` and the showcase at `#/components` in the
   playground. Don't rebuild a control with raw elements and classes.
   Motion values for the `motion` library come from `easing` and
   `layoutSpring` in `@ds/react`, never inline bezier arrays.
2. **Colors only from semantic utilities:** `bg-canvas`, `bg-surface`,
   `bg-sunken`, `bg-muted`, `text-fg`, `text-fg-secondary`, `border-line`,
   `outline-focus` and the rest listed in `packages/styles/src/tailwind.css`.
   Tailwind's default palette is removed on purpose; never write hex, `rgb()`,
   `oklch()` or `bg-blue-500`-style classes. The one ramp exposed directly is
   `accent-50…950`, for interactive emphasis (checked controls, slider fill,
   selection); it follows the brand when the accent is re-pointed.
3. **No arbitrary design values.** No `p-[13px]`, `rounded-[7px]`,
   `shadow-[...]`, `text-[15px]`. Use the spacing scale (`p-2`, `gap-1.5`),
   radius roles (`rounded-control-md`), elevation (`shadow-raised`,
   `shadow-overlay`) and text styles (`text-body-md`, `text-body-md-strong`).
   Prefer radius roles (`rounded-control-md`, `rounded-surface`); the size
   scale (`rounded-xs` … `rounded-3xl`) is for component internals where no
   role fits. Component-specific colors and effects live in
   `packages/tokens/src/component/` under the `component.*` namespace.
   Allowed exceptions: `transition-[...]` property lists and `calc()` layout
   constraints such as `max-w-[calc(100vw-32px)]`.
4. **No `dark:` in components.** Themes remap tokens (`data-theme="dark"`);
   components never branch on theme.
5. **One focus style.** Use `focusRing` / `focusRingNative` /
   `focusRingInset` from `@ds/react` (recipes). Never `outline-none` without
   a replacement.
6. **React Aria for behavior.** Interactive pieces wrap
   `react-aria-components`; style states with its data attributes
   (`data-[hovered]`, `data-[pressed]`, `data-[disabled]`,
   `data-[focus-visible]`).
7. **New tokens go through `packages/tokens/src`**, never straight into CSS.
   Add any new contrast pairing to `src/contrast-pairs.json` and run
   `npm test -w @ds/tokens`.
8. **Register new text, radius, shadow or size names in
   `packages/react/src/utils/cx.ts`** so tailwind-merge doesn't drop them.
