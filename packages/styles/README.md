# @windesign/styles

The CSS half of the Windesign design system: a Tailwind CSS v4 theme that
replaces Tailwind's palette, radii, shadows and type sizes with the system's
semantic utilities (`bg-surface`, `text-fg-secondary`, `rounded-control-md`,
`shadow-overlay`, `text-body-md`…), plus base styles, shared utilities and the
Moon and Glass brands.

```sh
npm install @windesign/styles
```

```css
@import "tailwindcss";
@import "@windesign/styles/fonts.css"; /* optional: Fraunces, Instrument Sans, DM Sans, Inter, JetBrains Mono */
@import "@windesign/styles/tailwind.css";
```

Use it with [`@windesign/react`](https://www.npmjs.com/package/@windesign/react),
or on its own to build in the system's language. Themes switch with
`data-theme="dark"` and brands with `data-brand="moon"` or `data-brand="glass"`
on any element.

| Entry | What it is |
| --- | --- |
| `@windesign/styles/tailwind.css` | The theme, base styles, utilities and brands |
| `@windesign/styles/fonts.css` | The brands' typefaces, self-hosted |
| `@windesign/styles/base.css` | Base element styles only |
| `@windesign/styles/utilities.css` | Shared utilities only |

MIT licence.
