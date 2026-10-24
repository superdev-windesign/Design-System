/**
 * The system focus indicator: a 2px `border.focus` outline with a 2px gap.
 *
 * It's drawn with `outline` rather than a box-shadow ring because Windows
 * forced-colors mode removes box-shadows, which would hide focus entirely.
 * Visually it matches BoardUI's `ring-2 ring-offset-2` on light surfaces.
 */

/** For React Aria elements, which expose `data-focus-visible`. */
export const focusRing =
  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus";

/** For plain DOM elements (native buttons, inputs). */
export const focusRingNative =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Inset variant for cells and rows, where an outer gap would collide with neighbours. */
export const focusRingInset = "outline-2 -outline-offset-2 outline-focus";
