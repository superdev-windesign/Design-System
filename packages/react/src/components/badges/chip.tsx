// Adapted from BoardUI (MIT) — components/base/badges/chip.tsx. See THIRD_PARTY_NOTICES.md.
import type { HTMLAttributes, Ref } from "react";
import { cx, sortCx } from "../../utils/cx";

/**
 * Figma source: Board UI → dashboard 1 "Chip" layers (status chips, delta
 * chips, price chips, role chips — e.g. nodes 3731:3273, 3731:3094, 3731:3280,
 * 3731:3055).
 *
 * Colored label chip. Three emphasis levels, all rounded-sm radius/md (6px),
 * px 6:
 *
 *   bold    py 2, Body 1/Medium   (14/20/500) — status + percentage deltas
 *   subtle  py 4, Body 1/Medium   (14/20/500) — price chips
 *   caption py 4, Caption 1/Medium (12/16/500, tracking .15) — role tags
 *
 * Status pairs are semantic so the same component follows both Figma modes:
 *   lime    light 200/800 · dark 950 @ 60% / 500
 *   rose    light 200/800 · dark 950 @ 60% / 500
 *   yellow  light 200/800 · dark 950 @ 60% / 500
 *   cyan    light 200/800 · dark 950 @ 60% / 400
 *   blue    light 200/800 · dark 950 @ 60% / 300 (same dark status recipe;
 *           first needed by the medical template's "In treatment" status)
 *   purple  light 100/600 · dark 900/300 (AI profile delta chips)
 *   neutral bg color/neutral/200 text color/neutral/500
 *   gray    bg color/neutral/100 text color/neutral/800
 *   soft    bg background/secondary/default text text/secondary
 */

type ChipVariant = "bold" | "subtle" | "caption";
type ChipColor = "orange" | "lime" | "rose" | "yellow" | "cyan" | "blue" | "purple" | "neutral" | "gray" | "soft";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  color?: ChipColor;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "inline-flex items-center justify-center rounded-md px-1.5 whitespace-nowrap transition-[padding,font-size] duration-200 ease",
  variant: {
    bold: "py-0.5 text-body-md-strong",
    subtle: "py-1 text-body-md-strong",
    caption: "py-1 text-caption-strong",
  },
  color: {
    orange: "bg-tag-orange text-tag-orange-fg",
    lime: "bg-tag-lime text-tag-lime-fg",
    rose: "bg-tag-rose text-tag-rose-fg",
    yellow: "bg-tag-yellow text-tag-yellow-fg",
    cyan: "bg-tag-cyan text-tag-cyan-fg",
    blue: "bg-tag-blue text-tag-blue-fg",
    purple: "bg-tag-purple text-tag-purple-fg",
    neutral: "bg-muted text-fg-secondary",
    gray: "bg-sunken text-fg",
    soft: "bg-sunken text-fg-secondary",
  },
});

export function Chip({
  variant = "bold",
  color = "neutral",
  className,
  ref,
  ...props
}: ChipProps) {
  return (
    <span
      ref={ref}
      className={cx(styles.base, styles.variant[variant], styles.color[color], className)}
      {...props}
    />
  );
}
