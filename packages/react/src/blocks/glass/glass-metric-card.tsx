"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * Glass metric card: one number on a pane of glass, set large and light, with a
 * fine rule of bars along the foot showing how it got there. It's a small widget
 * for a glance. For a real chart, with axes and a tooltip, use ChartCard.
 */

export interface GlassMetricCardProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  /** A short change or note beside the value, e.g. "+17.4%". */
  delta?: ReactNode;
  /** The recent values, oldest first. */
  series?: number[];
  /** Says what the bars show, for anyone who can't see them. */
  seriesLabel?: string;
  /** Which bar to light. Default the latest. */
  highlight?: number;
  /** Labels under the bars, spread evenly. */
  axis?: string[];
  className?: string;
}

export function GlassMetricCard({ label, value, unit, delta, series = [], seriesLabel, highlight, axis = [], className }: GlassMetricCardProps) {
  const peak = Math.max(...series, 1);
  const lit = highlight ?? series.length - 1;
  return (
    <section className={cx("glass-panel glass-slab flex w-full max-w-72 flex-col gap-4 rounded-panel border p-5", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="text-body-md-strong text-fg">{label}</h3>
        <p className="flex items-baseline gap-2">
          <span className="text-display-md font-normal tabular-nums text-fg">{value}</span>
          {unit && <span className="text-body-md text-fg-secondary">{unit}</span>}
          {delta && <span className="ms-auto text-body-sm-strong tabular-nums text-fg-secondary">{delta}</span>}
        </p>
      </div>
      {series.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div role="img" aria-label={seriesLabel} aria-hidden={seriesLabel ? undefined : true} className="flex h-14 items-end gap-0.5">
            {series.map((point, index) => (
              <span key={index} className={cx("min-w-px flex-1 rounded-full", index === lit ? "bg-accent-600" : "bg-fg/25")} style={{ height: `${Math.max(6, (point / peak) * 100)}%` }} />
            ))}
          </div>
          {axis.length > 0 && (
            <div aria-hidden className="flex justify-between text-caption tabular-nums text-fg-secondary">
              {axis.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
