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
| `packages/styles/src/utilities.css` (press motion, action button layers) | `styles/theme.css` |
| The token structure in `packages/tokens/src/semantic/*.json`, and component token values for switch, slider and radio effects in `packages/tokens/src/component/*.json` | `styles/theme.css` |
| 39 further files under `packages/react/src/components/`, `foundations/` and `utils/` (Announcement, Avatar, Badge, Chip, Breadcrumb, Button Group, Close Button, Icon Button, Link Button, Carousel, Checkbox, Checkbox Card, Meeting Scheduler, Divider, Dropdown, File Upload, Input, Input OTP, Kbd, Notification, Pagination, Radio, Radio Card, Segmented Control, Slider, Social Button, Switch, Switch Card, Table, Tabs, Pill Tabs, Textarea, Tooltip, Tree View, direction and copy helpers) | `components/base/**`, `components/foundations/**`, `utils/**`; converted by `tools/boardui-port/port.mjs` |
| 25 files under `packages/react/src/blocks/`, `charts/revenue-chart/` and `hooks/` (Agent Thinking, Composer Loader, Auth Card and media carousel, Data Grid and its example, Data Table, Notification Center, Settings Modal and its pages, Dashboard Sidebar with team and user menus, Stat Cards, Theme Toggle, Revenue and Orders chart cards, count-up hook) | `components/application/**`, `components/application/docs/examples/data-grid-example.tsx`, `hooks/use-count-up.ts`; converted by `tools/boardui-port/port.mjs` |
| The number-fade and row animations in `packages/styles/src/utilities.css` | `styles/theme.css`, `styles/globals.css` |

Every adapted file starts with a header naming its BoardUI source. Demo
defaults that held a real person's name and email were replaced with
fictional ones, and a third-party logo image with a generic icon. In the blocks, stock photo
avatars became initials, BoardUI's logo, artwork and site images were removed, and
links to BoardUI's template pages became neutral anchors.

The other blocks and charts in `blocks/` and `charts/` (Composer Panel, Composer
Attachments, Web Search, Task List, Agent Limits, Questionnaire, Agent Creator,
Calendar, and the 17 chart cards other than Revenue) are original work for this
repository; BoardUI sells blocks with those names in Pro, but no Pro code or design
was used for them.

The templates in `packages/react/src/templates/` and the chat, code panel, kanban
and image pieces in `blocks/` are also original. BoardUI's free Chat Starter was not
ported: it depends on Next.js routing, a server route and the Vercel AI SDK, and
carries a BoardUI Pro upsell; this repository's Chat Starter is built on its own
chat session hook instead.

The colour palette (paper, terracotta and the chart series), type pairing, corner
scale, depth and the documentation site's design are this repository's own.

## BoardUI Pro

No BoardUI Pro code is included. An earlier Agent Progress, adapted from the
Pro block of that name, was replaced by the original implementation in
`packages/react/src/components/agent-progress/agent-progress.tsx`.

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

## Moon Design System

The Moon brand takes its colour values, shadows, typeface choice and component
measurements from Moon Design System (https://github.com/coingaming/moon-design,
MIT License): `packages/tokens/src/primitives/moon.json`,
`packages/tokens/src/brands/moon/*.json` and `packages/styles/src/brands/moon.css`.
No Moon component code is included; the components are this repository's own,
restyled through those tokens. "Moon" names the design language it follows and
doesn't imply endorsement by its authors.

```
MIT License

Copyright (c) 2024 Yolo Group

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

## Fonts

`@windesign-ds/styles/fonts.css` loads Fraunces, Instrument Sans, DM Sans, Inter and
JetBrains Mono through Fontsource. All are under the SIL Open Font License 1.1,
shipped with each `@fontsource-variable/*` package.
