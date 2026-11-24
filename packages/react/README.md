# @windesign/react

Accessible React components for the Windesign design system: form controls,
overlays, navigation, data display, charts, blocks, full-screen templates and
animated effects. Behaviour comes from [React Aria](https://react-spectrum.adobe.com/react-aria/),
so keyboard and screen reader support are built in. Styling comes only from the
system's tokens, through Tailwind CSS v4, and three brands (Windesign, Moon and
Glass) each with light and dark themes.

Browse every component live: https://galactic-deepskyblue-toad-85.hostingersite.com

## Install

```sh
npm install @windesign/react @windesign/styles
```

Needs React 19 and Tailwind CSS v4.

## Set up

```css
/* src/styles.css */
@import "tailwindcss";
@import "@windesign/styles/fonts.css"; /* optional: the brands' typefaces */
@import "@windesign/styles/tailwind.css";

/* Let Tailwind see the classes the components use. */
@source "../node_modules/@windesign/react/dist";
```

```tsx
// src/main.tsx
import { ThemeProvider } from "@windesign/react";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>,
);
```

```tsx
import { Button } from "@windesign/react";

export function SaveBar({ onSave }: { onSave: () => void }) {
  return <Button onPress={onSave}>Save changes</Button>;
}
```

Components that need the browser carry `"use client"`, so they work in the
Next.js App Router.

## Themes and brands

`ThemeProvider` sets `data-theme` (`light` / `dark`), `data-brand` (`moon`,
`glass`, or none for Windesign) and the accent colour, and remembers each choice.
Any element can carry `data-theme` or `data-brand` to restyle just its subtree.

## Licence

MIT. Parts are adapted from other MIT projects; see `THIRD_PARTY_NOTICES.md`.
