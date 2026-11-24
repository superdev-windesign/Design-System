import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge can't see our Tailwind theme, so the custom scale names from
 * @windesign/styles must be registered here. Without this, `text-body-md` looks like a
 * text *color* and is silently dropped next to `text-fg`, and `shadow-raised`
 * looks like a shadow color, so `shadow-none` can't override it.
 *
 * Mirror any new text style, radius, shadow or size name from
 * packages/styles/src/tailwind.css here.
 */
export const cx = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "body-lg", "body-md", "body-md-strong", "body-sm", "body-sm-strong",
        "caption", "caption-strong", "caption-emphasis",
        "headline-emphasis", "title-sm-strong", "title-sm-emphasis", "micro-emphasis", "display-sm", "display-md", "display-lg", "title-md-strong", "title-lg-strong",
      ],
      radius: [
        "hairline", "control-xs", "control-sm", "control-md", "item", "tile", "chip", "surface", "overlay", "panel", "action",
        "xs", "sm", "md", "lg", "2lg", "xl", "2xl", "3xl",
      ],
      shadow: [
        "raised", "overlay", "hairline", "control-checked", "glass", "glass-bevel", "glass-frost", "glass-lens",
        "radio-checked-sm", "radio-checked-md",
        "slider-track", "slider-fill", "slider-thumb", "slider-thumb-active", "slider-highlight",
        "switch-on-sm", "switch-on-md", "switch-chip-sm", "switch-chip-md", "switch-chip-lg", "switch-thumb",
        "sidebar", "nav-selected",
      ],
      blur: ["enter", "enter-strong", "soft", "glow", "haze"],
      ease: ["standard", "enter", "out", "default", "overshoot"],
      spacing: ["control-xs", "control-sm", "control-md", "icon-xs", "icon-sm", "icon-md"],
    },
  },
});

/**
 * Identity helper for style-map objects, so editor tooling can sort classes
 * inside them. Kept for components ported from BoardUI.
 */
export function sortCx<T extends Record<string, unknown>>(classes: T): T {
  return classes;
}
