# BoardUI port

Converts BoardUI's **free, MIT-licensed** components onto the `@windesign` token
system, so they live in `packages/react` as ordinary system components.
It never touches BoardUI Pro (proprietary) code.

```bash
git clone https://github.com/BoardUI/boardui ../boardui
node tools/boardui-port/port.mjs ../boardui
```

Re-run it after BoardUI updates; it rewrites the same files every time.

## What it does

| Step | Example |
|---|---|
| Rewrites `@/` imports to this package's layout | `@/components/base/buttons/button` → `../button/button` |
| Renames token utilities by meaning (`mapping.mjs` → `COLORS`, `TEXT`, `CLASSES`) | `bg-background-primary-default` → `bg-surface`, `text-body-medium` → `text-body-md-strong` |
| Renames CSS variables in inline styles and SVG | `var(--color-border-button-default)` → `var(--ds-color-border-default)` |
| Converts pixel values on the spacing scale | `w-[118px]` → `w-29.5` |
| Turns hand-tuned shadows into component tokens | Switch, Slider and Radio effects → `shadow-switch-on-md`, … |
| Converts box-shadow focus rings to the system outline | `focus-visible:ring-2 …ring-focus` → `focus-visible:outline-2 …outline-focus` |
| Adapts `<Button>` props to the React Aria API | `onClick` → `onPress`, `disabled` → `isDisabled`, `size="small"` → `"sm"` |
| Applies exact patches (`PATCHES`) | strict-mode guards; fictional demo data instead of a real person's contact; a generic icon instead of a third-party logo |
| Applies strict-mode fixes (`STRICT_PATCHES`) | `rows[i].push(x)` → `rows[i]!.push(x)` under `noUncheckedIndexedAccess` |
| Adds an attribution header to every file | `// Adapted from BoardUI (MIT) — … See THIRD_PARTY_NOTICES.md.` |

Anything it can't map is written to `report.txt`. Two entries remain on
purpose: the social button derives its gradient from each provider's brand
color at runtime, and the tooltip computes its caret shadow inline.

## Not ported

- `components/base/buttons/button.tsx`, `select`, `date-picker` (range and
  single), `status-dot`, `dropdown/menu-styles`: hand-built earlier and kept.
- `components/foundations/brand/logo.tsx`: BoardUI's own brand.
- The Chat Starter template: it's built on Next.js routing, a server route and the
  Vercel AI SDK. `@windesign/react` has its own `ChatStarter` on `useChatSession` instead.
- Everything in BoardUI Pro.
