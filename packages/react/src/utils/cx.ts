import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge can't see our Tailwind theme, so the custom scale names from
 * @ds/styles must be registered here. Without this, `text-body-md` looks like a
 * text *color* and is silently dropped next to `text-fg`, and `shadow-raised`
 * looks like a shadow color, so `shadow-none` can't override it.
 *
 * Mirror any new text style, radius, shadow or size name from
 * packages/styles/src/tailwind.css here.
 */
export const cx = extendTailwindMerge({
  extend: {
    theme: {
      text: ["body-md", "body-md-strong", "body-sm", "body-sm-strong", "caption-strong"],
      radius: ["hairline", "control-xs", "control-sm", "control-md", "item", "chip", "surface", "overlay", "panel"],
      shadow: ["raised", "overlay"],
      blur: ["enter"],
      ease: ["standard", "out", "default", "overshoot"],
      spacing: ["control-xs", "control-sm", "control-md", "icon-xs", "icon-sm", "icon-md"],
    },
  },
});
