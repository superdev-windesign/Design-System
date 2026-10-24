# Third-party notices

## BoardUI

Parts of `packages/react` are adapted from BoardUI's free components
(https://github.com/BoardUI/boardui), used under the MIT License below.
Adapted files carry a header comment naming their BoardUI source:

| This repository | BoardUI source |
|---|---|
| `packages/react/src/components/select/select.tsx` | `components/base/select/select.tsx` |
| `packages/react/src/components/date-picker/shared.tsx` | `components/base/date-picker/shared.tsx` |
| `packages/react/src/components/date-picker/date-range-picker.tsx` | `components/base/date-picker/date-range-picker.tsx` |
| `packages/react/src/components/date-picker/date-picker.tsx` | `components/base/date-picker/date-picker.tsx` |
| `packages/react/src/components/button/button.tsx` | `components/base/buttons/button.tsx` |
| `packages/react/src/components/status-dot/status-dot.tsx` | `components/base/badges/status-dot.tsx` |
| `packages/react/src/recipes/menu.ts` | `components/base/dropdown/menu-styles.ts` |
| `packages/react/src/icons/chevrons.tsx` | `components/foundations/icons/chevrons.tsx`, `components/base/date-picker/shared.tsx` |
| `packages/react/src/utils/use-dismiss-on-outside-press.ts` | `utils/use-dismiss-on-outside-press.ts` |
| `packages/styles/src/utilities.css` (press motion, gradient buttons) | `styles/theme.css` |
| Token values in `packages/tokens/src/semantic/*.json` | `styles/theme.css` |

## BoardUI Pro

`packages/react/src/components/agent-progress/agent-progress.tsx` is adapted
from BoardUI Pro's **Agent Progress** block. It was rebuilt from the component
code that boardui.com serves to the browser, under the repository owner's
BoardUI Pro license (purchased per the owner; keep the Lemon Squeezy receipt
with this repository's records).

This file is **not** covered by the MIT notice below. Use it within the terms of
the BoardUI Pro license. In particular, don't publish `@ds/react` publicly, or
otherwise redistribute this component's source, unless the license allows it.
Run `npx boardui@latest add agent-progress` with the license activated to get
the canonical source if you need to compare.

```
MIT License

Copyright (c) 2026 Mertcan Dundar Esmergul (BoardUI)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Tailwind CSS

`packages/tokens/src/primitives/color.json` is generated from Tailwind CSS's
default palette (MIT License, © Tailwind Labs, Inc.) by
`packages/tokens/scripts/sync-tailwind-palette.mjs`.
