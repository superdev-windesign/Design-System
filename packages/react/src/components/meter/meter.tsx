"use client";

import type { ReactNode } from "react";
import { Label, Meter as AriaMeter } from "react-aria-components";
import type { MeterProps as AriaMeterProps } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Meter: a quantity inside a known range, such as storage used, a quota, a
 * score. The fill turns amber and then red as it crosses `thresholds`, and
 * the state is spelled out in words beside the value so it never rests on
 * colour alone.
 *
 * `segments` draws the scale as separate ticks, the way a gauge on paper
 * would; leave it out for a continuous bar.
 */

export type MeterTone = "neutral" | "success" | "warning" | "danger";

const FILL: Record<MeterTone, string> = {
  neutral: "bg-progress-fill",
  success: "bg-status-success-solid",
  warning: "bg-status-warning-solid",
  danger: "bg-status-danger-solid",
};

const TONE_TEXT: Record<MeterTone, string> = {
  neutral: "text-fg-secondary",
  success: "text-status-success-text",
  warning: "text-status-warning-text",
  danger: "text-status-danger-text",
};

export interface MeterProps extends Omit<AriaMeterProps, "className" | "children"> {
  label?: ReactNode;
  showValue?: boolean;
  /** Percentages at which the tone changes. Default { warning: 75, danger: 90 }. Pass `null` to keep one tone. */
  thresholds?: { warning: number; danger: number } | null;
  /** Fixes the tone instead of deriving it from `thresholds`. */
  tone?: MeterTone;
  /** Words for the tones, shown beside the value. */
  toneLabels?: Partial<Record<MeterTone, string>>;
  /** Draw the bar as this many ticks. */
  segments?: number;
  hint?: ReactNode;
  className?: string;
}

const DEFAULT_THRESHOLDS = { warning: 75, danger: 90 };
const DEFAULT_TONE_LABELS: Partial<Record<MeterTone, string>> = { warning: "Nearly full", danger: "Critical" };

export function Meter({
  label,
  showValue = true,
  thresholds = DEFAULT_THRESHOLDS,
  tone: fixedTone,
  toneLabels = DEFAULT_TONE_LABELS,
  segments,
  hint,
  className,
  ...props
}: MeterProps) {
  return (
    <AriaMeter {...props} className={cx("flex w-full flex-col gap-1.5", className)}>
      {({ percentage, valueText }) => {
        const tone: MeterTone =
          fixedTone ?? (thresholds ? (percentage >= thresholds.danger ? "danger" : percentage >= thresholds.warning ? "warning" : "neutral") : "neutral");
        const word = toneLabels[tone];
        return (
          <>
            {(label || showValue) && (
              <div className="flex items-baseline justify-between gap-3">
                {label && <Label className="text-body-md-strong text-fg">{label}</Label>}
                {showValue && (
                  <span className="flex items-baseline gap-2">
                    {word && <span className={cx("text-caption-strong", TONE_TEXT[tone])}>{word}</span>}
                    <span className="font-mono text-caption tabular-nums text-fg-secondary">{valueText}</span>
                  </span>
                )}
              </div>
            )}
            {segments ? (
              <div className="grid w-full gap-0.5" style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}>
                {Array.from({ length: segments }, (_, i) => (
                  <span key={i} className={cx("h-2 rounded-hairline", (i + 0.5) / segments <= percentage / 100 ? FILL[tone] : "bg-progress-track")} />
                ))}
              </div>
            ) : (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-progress-track">
                <div className={cx("h-full rounded-full transition-[width] duration-(--ds-motion-duration-slow) ease-out", FILL[tone])} style={{ width: `${percentage}%` }} />
              </div>
            )}
            {hint && <p className="text-caption-strong text-fg-secondary">{hint}</p>}
          </>
        );
      }}
    </AriaMeter>
  );
}
