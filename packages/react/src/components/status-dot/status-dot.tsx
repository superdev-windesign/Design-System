// The colour set was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
import type { HTMLAttributes, Ref } from "react";
import { cx } from "../../utils/cx";

/**
 * Status indicator: an 8px solid dot, no halo, in a 12×12 box so it lines
 * up with 12px text. Decorative (`aria-hidden`): always pair it with a text
 * label.
 */

export type StatusDotColor = "green" | "yellow" | "indigo";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  color?: StatusDotColor;
  ref?: Ref<HTMLSpanElement>;
}

const styles = {
  base: "inline-flex size-3 shrink-0 items-center justify-center rounded-full",
  dot: {
    green: "bg-indicator-green",
    yellow: "bg-indicator-yellow",
    indigo: "bg-indicator-indigo",
  },
} as const;

export function StatusDot({ color = "green", className, ref, ...props }: StatusDotProps) {
  return (
    <span ref={ref} aria-hidden className={cx(styles.base, className)} {...props}>
      <span className={cx("size-2 rounded-full", styles.dot[color])} />
    </span>
  );
}
