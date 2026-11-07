// The counter API was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
import type { HTMLAttributes, Ref } from "react";
import { cx, sortCx } from "../../utils/cx";

/**
 * A small count (unread totals, items waiting), set as mono figures on a
 * crisp 2px chip, so a column of counts lines up digit for digit.
 *   primary → accent fill with on-action figures, for counts that want attention
 *   neutral → quiet fill with secondary figures
 */

type BadgeColor = "primary" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "bui-badge inline-flex items-center justify-center rounded-control-xs px-1 py-px font-mono text-caption tabular-nums whitespace-nowrap",
  color: {
    primary: "bg-accent-600 text-on-action",
    neutral: "bg-badge-neutral text-fg-secondary",
  },
});

export function Badge({ color = "neutral", className, ref, ...props }: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cx(styles.base, styles.color[color], className)}
      {...props}
    />
  );
}
