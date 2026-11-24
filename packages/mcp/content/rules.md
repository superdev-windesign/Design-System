# Writing UI with Windesign

Rules for code that uses the Windesign design system (`@windesign-ds/react`
and `@windesign-ds/styles`). Follow them so what you build looks and behaves
like the rest of the system, in every theme and brand.

## 1. Use the components

- Before building a control, search for it (`search_components`) and use the
  component: Button, Select, Dialog, Menu, Tabs, DatePicker, Toast and the rest.
  Don't rebuild one from `<div>`s and classes.
- Import everything from `@windesign-ds/react`, or from the copied source if
  the project added components with `npx windesign-ds@latest add <name>`.
- Wrap the app once in `<ThemeProvider defaultTheme="light">`. It applies the
  theme, brand and accent and remembers them.

## 2. Colours only from the semantic utilities

- Surfaces: `bg-canvas` (the page), `bg-surface` (cards, panels),
  `bg-sunken`, `bg-muted`, `bg-strong`.
- Text: `text-fg`, `text-fg-secondary`, `text-fg-tertiary`,
  `text-fg-disabled`, and `text-on-action` on filled buttons.
- Borders: `border-line`, `border-line-control`; focus: `outline-focus`.
- Status: `bg-status-danger-solid`, `text-status-success` and the rest
  listed by `get_tokens`.
- `accent-50` … `accent-950` is the one colour ramp exposed directly, for
  interactive emphasis (checked controls, slider fill, selection). It follows
  the brand.
- Never write hex, `rgb()`, `oklch()` or Tailwind palette classes like
  `bg-blue-500` or `text-gray-600`. The palette is removed; they won't work.
- For charts, take series colours from `seriesColor(n)` and build cards on
  `ChartCard`.

## 3. No made-up values

- No arbitrary values: no `p-[13px]`, `rounded-[7px]`, `shadow-[…]` or
  `text-[15px]`.
- Spacing: Tailwind's scale (`p-2`, `gap-1.5`, `mt-6`).
- Corners: radius roles first (`rounded-control-md` for controls,
  `rounded-surface` for cards, `rounded-overlay` for popovers), then the size
  scale (`rounded-sm` … `rounded-3xl`) only where no role fits.
- Shadows: `shadow-raised`, `shadow-overlay`.
- Text: composite styles that set size, line height and weight together:
  `text-body-md`, `text-body-md-strong`, `text-body-sm`, `text-caption`,
  `text-title-md-strong`, `text-display-lg`.
- Allowed exceptions: `transition-[…]` property lists and `calc()` layout
  limits such as `max-w-[calc(100vw-32px)]`.

## 4. Themes and brands come from tokens

- Don't write `dark:` classes. Dark mode is `data-theme="dark"` on any
  element; the tokens change and the components follow.
- Brands (`data-brand="moon"`, `data-brand="glass"`) restyle everything the
  same way. Components never check the theme or brand.

## 5. Accessibility

- Use the system's focus styles: `focusRing`, `focusRingNative` and
  `focusRingInset` from `@windesign-ds/react`. Never remove an outline
  (`outline-none`) without one of them.
- Interactive pieces are built on React Aria. Style their states with its data
  attributes: `data-[hovered]`, `data-[pressed]`, `data-[selected]`,
  `data-[disabled]`, `data-[focus-visible]`.
- Give icon-only buttons an `aria-label`, and every form field a visible
  label or `aria-label`.

## 6. Motion

- For the `motion` library, take easing and springs from `easing` and
  `layoutSpring` in `@windesign-ds/react`, not inline bezier arrays.
- Respect reduced motion: the components already do.
