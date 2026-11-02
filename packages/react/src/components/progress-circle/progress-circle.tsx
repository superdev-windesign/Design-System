"use client";

import { ProgressBar as AriaProgressBar } from "react-aria-components";
import type { ProgressBarProps as AriaProgressBarProps } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * ProgressCircle: progress as a ring, for tight spots (a file tile, a step
 * in a list, a card corner). The large size can show the percentage in the
 * middle. Without a `value` it turns as an indeterminate arc.
 *
 * Name it with `aria-label` ("Uploading invoice.pdf").
 */

export type ProgressCircleSize = "sm" | "md" | "lg";

const SIZE: Record<ProgressCircleSize, { box: string; stroke: number }> = {
  sm: { box: "size-5", stroke: 4 },
  md: { box: "size-10", stroke: 3.5 },
  lg: { box: "size-16", stroke: 3 },
};

// r = 100 / 2π, so the circumference is exactly 100 and dash lengths are percentages.
const R = 15.9155;

export interface ProgressCircleProps extends Omit<AriaProgressBarProps, "className" | "children"> {
  size?: ProgressCircleSize;
  /** Show the percentage inside (md and lg). */
  showValue?: boolean;
  /** `accent` draws the arc in terracotta. Default `neutral` (ink). */
  tone?: "neutral" | "accent";
  className?: string;
}

export function ProgressCircle({ size = "md", showValue = false, tone = "neutral", className, isIndeterminate, ...props }: ProgressCircleProps) {
  const s = SIZE[size];
  const indeterminate = isIndeterminate ?? props.value === undefined;
  return (
    <AriaProgressBar {...props} isIndeterminate={indeterminate} className={cx("relative inline-flex shrink-0 items-center justify-center", s.box, className)}>
      {({ percentage, valueText }) => (
        <>
          <svg viewBox="0 0 36 36" aria-hidden className={cx("size-full -rotate-90", indeterminate && "animate-spinner")}>
            <circle cx="18" cy="18" r={R} fill="none" strokeWidth={s.stroke} className="stroke-progress-track" />
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeDasharray={`${indeterminate ? 25 : (percentage ?? 0)} 100`}
              className={cx(
                "transition-[stroke-dasharray] duration-(--ds-motion-duration-slow) ease-out",
                tone === "accent" ? "stroke-accent-600" : "stroke-progress-fill",
              )}
            />
          </svg>
          {showValue && !indeterminate && size !== "sm" && (
            <span className={cx("absolute font-mono tabular-nums text-fg", size === "lg" ? "text-caption-strong" : "text-micro-emphasis")}>{valueText}</span>
          )}
        </>
      )}
    </AriaProgressBar>
  );
}
