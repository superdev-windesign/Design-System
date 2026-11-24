# @windesign-ds/tokens

The Windesign design tokens, written in the [DTCG](https://www.designtokens.org/)
format and built with Style Dictionary into CSS custom properties and flat JSON.
Primitives (colour ramps, spacing, radii, type, motion) feed semantic tokens
(`color.surface`, `color.fg.secondary`, `radius.control.md`…) for light and dark
themes and three brands.

```sh
npm install @windesign-ds/tokens
```

```css
@import "@windesign-ds/tokens/css"; /* every --ds-* variable, all themes and brands */
```

```js
// Resolved values per theme: light, dark, moon-light, moon-dark, glass-light, glass-dark.
import light from "@windesign-ds/tokens/json/light.json" with { type: "json" };
```

Most apps don't import this directly: `@windesign-ds/styles` loads it and maps the
tokens onto Tailwind CSS utilities.

MIT licence.
