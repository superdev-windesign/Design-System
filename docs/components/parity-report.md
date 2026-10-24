# Parity report: Select, Date Range Picker and Agent Progress vs BoardUI

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

---

## Agent Progress (BoardUI Pro)

**Source:** BoardUI doesn't publish Pro source, so this was rebuilt from the component code boardui.com ships to the browser. Structure, class lists, durations, easings, springs and the stagger formula match that code. Licensing is covered in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).

**Compared using BoardUI's demo:** five steps, `stepDuration={2400}`, same Chromium, light theme. Both runs were measured in the finished state, after all animations had settled.

| Element | BoardUI | This system |
|---|---|---|
| Card | 341 × 235, radius 16, 1px #ebebeb, #fff, shadow-xs | same |
| Header row | 10.7, 12.7 · 319.7 × 20 | same |
| Status label | 14/20 500 neutral-500, "All steps completed" | same |
| Minimize button and tile | 20 × 20; tile 18 × 18, radius 4, neutral-300 | same |
| Rows | 5 × (319.7 × 32), at y = 41.7 / 79.7 / 117.7 / 155.7 / 193.7 | same |
| Check glyph | 15 × 15 at 14.2, 50.2; neutral-300 fill, neutral-500 stroke | same |
| Step label | 116.3 × 20, 14/20 500 neutral-500 | same |
| Strike-through | 116.3 × 1, opacity 0.8, current color | same |

**Dark theme, finished state:**

- Card fill, shadow, check glyph, label and tile colors are identical.
- The card border differs: neutral-800 on boardui.com, neutral-700 here. The difference comes from a rule on BoardUI's *docs page* (`.component-detail … .border-border-button-default`) that recolors bordered `div`s inside its docs. In an app, BoardUI's component uses `border-button-default` = neutral-700, which is what this system renders.

### Motion choreography (from the shipped code, reproduced value for value)

| Moment | What moves | Timing |
|---|---|---|
| Mount | Card: opacity, y −12→0, blur 8→0, height 0→`45 + 38·n` | 350 / 500 / 400 / 650 ms, `easing.enter` |
| Rows enter | opacity, y −4→0, blur 6→0 | delay 650 + 160·i ms, 450 ms |
| Start | Rings begin sweeping | 1.1 s after mount |
| Overall ring | Linear sweep over the whole job | n × stepDuration |
| Step ring | Linear sweep over one step | stepDuration |
| Step completes | Check pops in (scale 0.72→1, rotate −18°→0); strike-through draws (scaleX 0→1, opacity 0→0.8) | 340 ms / 380 ms |
| Active row | Padding 4→9/13 px; outline pill glides to the next row (shared `layoutId`) | 360 ms; spring 260/30/0.8 |
| Countdown | Old label exits up with blur, new one enters from below | 260 ms, pop layout |
| Done | Overall ring scales out; its 24px slot collapses and the label slides left | 250 ms / 400 ms + layout spring |
| Minimize | Height → 44 px; list exits (y −4, blur 3); bar fades in after 120 ms | 420 ms / 220 ms / 200 ms |
| Restore | Height back; rows re-stagger quickly | 240 ms; 35·i ms stagger, 240 ms |
| Active text | Highlight sweeps across the label | 3.4 s loop, linear |

### Intentional differences

None of these show visually in normal use.

| Area | BoardUI | This system | Why |
|---|---|---|---|
| Screen-reader output | The whole animated card is `aria-live="polite"`, so every text change is announced | Card is `role="group"` with a name; one hidden `role="status"` says "3 steps left. Current step: …" | Concise, one announcement per change |
| List semantics | `div`s | `<ol>` / `<li>`, `aria-current="step"`, hidden ", completed" on finished steps | Order and state are exposed to assistive tech |
| Toggle buttons | No `aria-expanded`; no visible focus style | `aria-expanded` + `aria-controls`; system focus ring (inset on the minimized bar) | Keyboard and screen-reader users |
| Reduced motion | Not handled for the motion animations | `MotionConfig reducedMotion="user"`: transform and layout moves are skipped; the rings still advance because they carry information | Blueprint motion rules |
| Shimmer | `.agent-progress-loading-text` | `text-shimmer` utility, plus a forced-colors fallback | Shared utility; works in High Contrast mode |
| Prop name | `paused` | `isPaused` | System boolean convention |
| Glyph colors | Inline `var(--color-…)` attributes | `fill-*` / `stroke-*` token utilities | Themeable through the same bridge |
| Localization | `useTemplateCopy` wrapper | Not ported | BoardUI-site specific |

### Inherited debt (kept for parity)

- `isPaused` holds the step timers, but rings that are already sweeping keep animating, and resuming restarts the current step's full duration.
- The check glyph on its fill is 2.2:1 in dark mode, and the pending (dashed) marker is 1.5:1 in both themes. Both are tracked in `contrast-pairs.json` as `knownFailures`.
- Not verified live: the in-flight animation frames. The browser pane was in the background during testing, so animation frames were paused. The choreography values come from the shipped code; watch it in the playground to confirm.
