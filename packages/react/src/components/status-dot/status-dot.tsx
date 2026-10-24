// Adapted from BoardUI (MIT) — components/base/badges/status-dot.tsx. See THIRD_PARTY_NOTICES.md.
import type { HTMLAttributes, Ref } from "react";
import { cx } from "../../utils/cx";

/**
 * 12×12 status indicator: a 6px solid dot centred on a tinted halo.
 * Decorative (`aria-hidden`): always pair it with a text label.
 * In dark mode only the halo drops to 40% opacity; the dot stays solid.
 */

export type StatusDotColor = "green" | "yellow" | "indigo";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  color?: StatusDotColor;
  ref?: Ref<HTMLSpanElement>;
}

const styles = {
  base: "inline-flex size-3 shrink-0 items-center justify-center rounded-full",
  halo: {
    green: "bg-indicator-green-halo",
    yellow: "bg-indicator-yellow-halo",
    indigo: "bg-indicator-indigo-halo",
  },
  dot: {
    green: "bg-indicator-green",
    yellow: "bg-indicator-yellow",
    indigo: "bg-indicator-indigo",
  },
} as const;

export function StatusDot({ color = "green", className, ref, ...props }: StatusDotProps) {
  return (
    <span ref={ref} aria-hidden className={cx(styles.base, styles.halo[color], className)} {...props}>
      <span className={cx("size-1.5 rounded-full", styles.dot[color])} />
    </span>
  );
}
