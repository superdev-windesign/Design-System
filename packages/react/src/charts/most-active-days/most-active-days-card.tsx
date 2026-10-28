"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChartCard, format } from "../shared/chart-card";
import { easing } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Most Active Days: a total split by weekday. The busiest day is filled in
 * the series colour and the rest stay neutral; hovering a day shows its share.
 */

export type DayValue = { label: string; value: number };

export const ACTIVE_DAYS_DATA: DayValue[] = [
  { label: "Mon", value: 1840 },
  { label: "Tue", value: 2310 },
  { label: "Wed", value: 2190 },
  { label: "Thu", value: 2460 },
  { label: "Fri", value: 1980 },
  { label: "Sat", value: 920 },
  { label: "Sun", value: 760 },
];

export interface MostActiveDaysCardProps {
  data?: DayValue[];
  title?: string;
  unit?: string;
  className?: string;
}

export function MostActiveDaysCard({ data = ACTIVE_DAYS_DATA, title = "Most active days", unit = "sessions", className }: MostActiveDaysCardProps) {
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = data.findIndex((d) => d.value === max);
  const shown = active ?? top;
  const day = data[shown];

  return (
    <ChartCard
      title={active !== null ? day?.label : title}
      value={day ? `${day.label} · ${format.number(day.value)}` : ""}
      valueKey={shown}
      caption={day ? `${format.percent(day.value / total)} of weekly ${unit}` : undefined}
      summary={`${title}: ${data.map((d) => `${d.label} ${format.number(d.value)}`).join(", ")}. Busiest is ${data[top]?.label}.`}
      plotClassName="h-48"
      className={className}
    >
      <div aria-hidden className="flex h-full items-end gap-2" onMouseLeave={() => setActive(null)}>
        {data.map((d, i) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2" onMouseEnter={() => setActive(i)}>
            <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-chart-track/50">
              <motion.div
                className={cx(
                  "absolute inset-x-0 bottom-0 rounded-xl transition-colors duration-(--ds-motion-duration-base)",
                  i === shown ? "bg-chart-5" : "bg-chart-neutral",
                )}
                initial={reduceMotion ? false : { height: 0 }}
                animate={{ height: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: easing.enter }}
              />
            </div>
            <span className={cx("text-caption-strong", i === shown ? "text-fg" : "text-fg-secondary")}>{d.label}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
