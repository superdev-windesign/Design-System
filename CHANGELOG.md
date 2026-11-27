# Changelog

All packages are versioned together: `@windesign-ds/tokens`, `@windesign-ds/styles`,
`@windesign-ds/react`, `@windesign-ds/mcp` and the `windesign-ds` CLI.

## 0.2.0

### The Windesign brand is now Tonal teal

The default look changes. If you use the Windesign brand (no `data-brand`), your
app will restyle when you upgrade; Moon and Glass are unchanged.

- **Neutrals:** cool, faintly teal greys replace warm paper. `paper-950` is still
  the ink in light mode and the page in dark mode.
- **Accent:** a new muted teal ramp, `lagoon`, is the default accent. Terracotta
  stays available as an accent preset, so a stored `"terracotta"` choice still
  resolves.
- **Primary button (light):** lagoon 700 with white text, instead of ink.
- **Type:** Manrope for display and interface. `@windesign-ds/styles/fonts.css`
  now loads Manrope, DM Sans, Inter and JetBrains Mono; Fraunces and Instrument
  Sans are no longer included.
- **Corners:** softer: 8–10px controls, 16px cards and overlays, round chips.
- **Effects:** the effect palette becomes a tonal family (teal, cyan, emerald,
  sky, amber).
- **Glass:** ruled panels in the Glass brand now blur what's behind them, so
  they read as frosted glass.

All contrast pairings are re-checked in light and dark (1,692 token tests).

### Fixes

- **Marquee:** its repeated copies are now `inert`, so their links and controls
  are reached once by keyboard, not twice.
- **`@windesign-ds/react`:** dependency ranges match the versions it is built
  against (from 0.1.1).

### Upgrading

```sh
npm install @windesign-ds/react@^0.2.0 @windesign-ds/styles@^0.2.0
```

If you import `@windesign-ds/styles/fonts.css`, nothing else changes. If you load
fonts yourself, add Manrope (`@fontsource-variable/manrope`) for Windesign.

To keep the old terracotta accent on the new neutrals, pass
`defaultAccent="terracotta"` to `ThemeProvider`.

## 0.1.1

- `@windesign-ds/react`: dependency ranges raised to the versions it's built
  against (`react-aria-components ^1.22.1` and three others).

## 0.1.0

- First public release: tokens, styles, React components, the `windesign-ds`
  CLI and the `@windesign-ds/mcp` server.
