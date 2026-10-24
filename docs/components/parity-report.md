# Parity report: Select and Date Range Picker vs BoardUI

**Date:** 24 October 2026.

**Method:** both sites were open in the same Chromium (viewport 1024 px wide, device pixel ratio 1.5). The same elements were measured with `getComputedStyle` and `getBoundingClientRect`, after finishing any running transitions. BoardUI's live pages were the reference: `/components/select` and `/components/date-picker`.

**Why borders read 0.667 px:** heights like 37.3 px are CSS 38 px minus Chrome snapping a 1 px border to device pixels at DPR 1.5. Both sites snap the same way.

**Reading the colors:** BoardUI reports colors in `lab()` and this system in `oklch()`. Where the table says "same", both resolve to the same palette step. For example, `lab(2.75 0 0)` and `oklch(0.145 0 0)` are both neutral-950.

## Select (light theme)

| Element | Property | BoardUI | This system |
|---|---|---|---|
| Trigger (md, "All prices") | box | 105.6 × 37.3 | 105.6 × 37.3 |
| | padding / radius / gap | 8px 10px / 10px / 6px | same |
| | border / background | 1px #ebebeb / #fff | same |
| | shadow | 0 1px 2px rgba(0,0,0,.05) | same |
| | text | 14/20 500, neutral-950 | same |
| Chevron | size / color | 16 × 16, neutral-500 | same; rotates 180° when open |
| Status trigger (`w-35.5`) | box | 142 × 37.3 | 142 × 37.3 |
| Status dot | size / halo | 12 × 12, green-100 | same |
| Popover | box | 266 × 133.3 | 266 × 133.3 |
| | padding / radius / border | 8 / 16 / 1px #ebebeb | same |
| | shadow | 0 1px 1px .04, 0 4px 4px .02 | same |
| | offset from trigger | 3.5 px | 3.8 px (sub-pixel, from trigger position) |
| Listbox | box / gap | 248.7 × 116 / 4px | same |
| Option | box / padding / radius | 248.7 × 36 / 8 / 10 | same |
| | selected background | #f7f7f7 | same |
| | text | 14/20 500 | same |

## Date Range Picker (light theme)

| Element | Property | BoardUI | This system |
|---|---|---|---|
| Popover | box | 814 × 350 | 814 × 349.7 (*) |
| | radius / background / shadow | 24 / #f7f7f7 / dropdown | same |
| Calendar content | height | 382 | 382 |
| Month panel | box / padding / radius | 326 × 314 / 15 / 16 | same |
| | background / shadow | #fff / shadow-xs | same |
| Month title | box / text | 264 × 20 / 14/20 500 | same |
| Month chevron | box / radius / color | 16 × 16 / 3px / neutral-500 | same |
| Weekday header | box / text | 32 × 24 / 14/20 500 neutral-500 | same |
| Day cell | box / radius | 32 × 32 / 8 | same |
| Day grid | box | 320 × 268 | 320 × 268 |
| Quick-select preset | box / padding / radius | 118 × 32 / 6px 8px / 10 | same |
| Cancel | box / border / shadow | 71.8 × 36 / 1px #ebebeb / xs | same |
| Apply (disabled) | box / gradient / text | 62.9 × 36 / neutral-200→300 / neutral-400 | same |

(*) The popover is capped by React Aria to the viewport space below the trigger, and the trigger sits at a different spot on each page. The calendar content inside is 382 px tall on both.

## Dark theme spot check (Date Range Picker open)

Same palette step and shadow on both sites for every surface checked:

| Element | Value |
|---|---|
| Popover | neutral-900, shadow 0 1px 1px .14 / 0 4px 4px .10 |
| Month panel | neutral-800, shadow .18 |
| Weekday text | neutral-500 |
| Day text | neutral-50 |
| Cancel | neutral-800 background, neutral-700 border |
| Apply (disabled) | gradient neutral-700→800, neutral-500 text |
| Trigger | neutral-800 background, neutral-700 border, shadow .18 |

## Intentional differences

None of these change how a component looks at rest.

| Area | BoardUI | This system | Why |
|---|---|---|---|
| Focus indicator | `ring-2 ring-offset-2` (box-shadow) | `outline-2 outline-offset-2` | Box-shadows disappear in Windows forced-colors mode. Identical on white; on the grey calendar popover the 2px gap shows the surface instead of white. |
| Month chevrons | `outline-none`, no focus style | System focus ring | Keyboard users can see where they are |
| Quick-select presets | Browser default focus ring | System focus ring | One focus style |
| Button API | `onClick`, `disabled`, `variant="ghost"`, `size="medium"` | `onPress`, `isDisabled`, `variant="tertiary"`, `size="md"` | System conventions (blueprint §3.4); built on React Aria Button |
| Button states | `:hover` / `:active` | `data-hovered` / `data-pressed` | Consistent across mouse, touch and keyboard |
| Calendar footer | Native buttons | React Aria Buttons wrapped in `CalendarActions` | React Aria calendars would otherwise treat them as month navigation |
| Single DatePicker trigger | No `aria-expanded` | `aria-expanded` | Screen readers announce open/closed |
| Forced colors | No rules | Selected options and days keep a visible marker | Blueprint accessibility target |
| Not ported | `ButtonLink`, `useTemplateCopy` localization, `directionalIconClass`, Meeting Scheduler | — | Out of scope for these two components |

## Inherited debt (kept for exact parity)

These are BoardUI behaviors copied deliberately. Each is tracked, either in `packages/tokens/src/contrast-pairs.json` (`knownFailures`) or here.

| Issue | Measured | Where |
|---|---|---|
| White text on the top stop of the primary gradient (accent-500) | 3.76:1 (needs 4.5) | Apply button, both themes |
| Secondary text on cards | 3.19:1 in dark | Calendar weekday headers |
| Secondary text on muted fill | 3.97:1 light, 3.19:1 dark | "N days selected" pill |
| Secondary text on sunken fill | 4.42:1 light, 3.79:1 dark | Footer date separator |
| Control border vs surface | 1.19:1 light, 1.45:1 dark (needs 3 if it's the only cue) | Select and picker triggers, date chips |
| Select trigger height | 38 px, next to 36 px Buttons | Toolbars mixing filters and buttons don't line up |
| Focused option looks the same as the selected option | — | Select listbox |
| Date chip focus | Border darkens to neutral-400 only | Footer chips |

Fixing these is token or class work, with no structural changes. The contrast tests will flag each one as it gets resolved.
