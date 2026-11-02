"use client";

import type { ReactNode } from "react";
import { Label, ProgressBar as AriaProgressBar } from "react-aria-components";
import type { ProgressBarProps as AriaProgressBarProps } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * ProgressBar: how far along a task is (an upload, an import, a long
 * export). Leave out `value` (or set `isIndeterminate`) while the length
 * isn't known; a segment then sweeps the track. The percentage is announced
 * from `valueLabel` or the formatted value.
 *
 * For a quantity within a known range that isn't progress (storage used,
 * quota), use Meter.
 */

export type ProgressBarSize = "sm" | "md" | "lg";

const TRACK: Record<ProgressBarSize, string> = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };

export interface ProgressBarProps extends Omit<AriaProgressBarProps, "className" | "children"> {
  label?: ReactNode;
  /** Show the value (or `valueLabel`) at the end of the label row. Default true when there's a label. */
  showValue?: boolean;
  size?: ProgressBarSize;
  /** A line under the bar, e.g. "3 of 12 files · about a minute left". */
  hint?: ReactNode;
  className?: string;
}

export function ProgressBar({ label, showValue, size = "md", hint, className, isIndeterminate, ...props }: ProgressBarProps) {
  const indeterminate = isIndeterminate ?? props.value === undefined;
  return (
    <AriaProgressBar {...props} isIndeterminate={indeterminate} className={cx("flex w-full flex-col gap-1.5", className)}>
      {({ percentage, valueText }) => (
        <>
          {(label || showValue) && (
            <div className="flex items-baseline justify-between gap-3">
              {label && <Label className="text-body-md-strong text-fg">{label}</Label>}
              {(showValue ?? Boolean(label)) && !indeterminate && <span className="font-mono text-caption tabular-nums text-fg-secondary">{valueText}</span>}
            </div>
          )}
          <div className={cx("relative w-full overflow-hidden rounded-full bg-progress-track", TRACK[size])}>
            {indeterminate ? (
              <div className="absolute inset-y-0 start-0 w-1/3 rounded-full bg-progress-fill animate-progress-indeterminate" />
            ) : (
              <div
                className="h-full rounded-full bg-progress-fill transition-[width] duration-(--ds-motion-duration-slow) ease-out"
                style={{ width: `${percentage ?? 0}%` }}
              />
            )}
          </div>
          {hint && <p className="text-caption-strong text-fg-secondary">{hint}</p>}
        </>
      )}
    </AriaProgressBar>
  );
}
