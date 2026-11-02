"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChartCard, ChartToggle, chartColors, format, seriesColor } from "../shared/chart-card";
import { focusRingNative } from "../../recipes/focus-ring";
import { easing } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Most Active Days: activity by day, two ways.
 *
 * - Weekdays: a total split by weekday. The busiest day is filled in the
 *   series colour; hovering a day shows its share.
 * - Calendar: every day as a small ring of how much of its goals it met, a
 *   month at a time down a scrolling list whose month names stay pinned.
 *   Picking a day calls `onSelectDay`, e.g. to show it in Activity Rings.
 */

/** One day's progress towards its goals, 0–1. */
export type ActiveDay = { date: Date; progress: number };

/** Deterministic demo days: two months ending on 31 October 2026. */
export function demoActiveDays(end = new Date(2026, 9, 31), count = 61): ActiveDay[] {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (count - 1) + i);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    return { date, progress: Math.min(1, Math.round((rand() * 0.6 + (weekend ? 0.15 : 0.4)) * 100) / 100) };
  });
}

const VIEWS = [
  { id: "weekdays", label: "Weekdays" },
  { id: "calendar", label: "Calendar" },
] as const;

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

function MiniRing({ progress, selected }: { progress: number; selected: boolean }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="size-8 -rotate-90">
      <circle cx="16" cy="16" r={r} fill="none" stroke={chartColors.track} strokeWidth={4} />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke={selected ? "var(--ds-color-text-primary)" : seriesColor(5)}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${c * progress} ${c}`}
      />
    </svg>
  );
}

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
  /** Days for the calendar view. Default: two demo months. */
  days?: ActiveDay[];
  defaultView?: "weekdays" | "calendar";
  /** The day picked in the calendar view (controlled). */
  selectedDate?: Date;
  onSelectDay?: (day: ActiveDay) => void;
  title?: string;
  unit?: string;
  className?: string;
}

export function MostActiveDaysCard({
  data = ACTIVE_DAYS_DATA,
  days: givenDays,
  defaultView = "weekdays",
  selectedDate,
  onSelectDay,
  title = "Most active days",
  unit = "sessions",
  className,
}: MostActiveDaysCardProps) {
  const [view, setView] = useState<"weekdays" | "calendar">(defaultView);
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = data.findIndex((d) => d.value === max);
  const shown = active ?? top;
  const day = data[shown];

  if (view === "calendar") {
    return (
      <ActiveDaysCalendar days={givenDays} selectedDate={selectedDate} onSelectDay={onSelectDay} title={title} view={view} onViewChange={setView} className={className} />
    );
  }

  return (
    <ChartCard
      title={active !== null ? day?.label : title}
      actions={<ChartToggle label="View" value={view} onChange={setView} options={VIEWS} />}
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

function ActiveDaysCalendar({
  days: given,
  selectedDate,
  onSelectDay,
  title,
  view,
  onViewChange,
  className,
}: {
  days?: ActiveDay[];
  selectedDate?: Date;
  onSelectDay?: (day: ActiveDay) => void;
  title: string;
  view: "weekdays" | "calendar";
  onViewChange: (view: "weekdays" | "calendar") => void;
  className?: string;
}) {
  const days = given ?? demoActiveDays();
  const [picked, setPicked] = useState<Date | undefined>(selectedDate ?? days[days.length - 1]?.date);
  const selected = selectedDate ?? picked;
  const [hover, setHover] = useState<ActiveDay | null>(null);
  const shownDay = hover ?? days.find((d) => selected && sameDay(d.date, selected));
  const average = days.reduce((sum, d) => sum + d.progress, 0) / Math.max(1, days.length);
  const best = days.reduce((a, b) => (b.progress > a.progress ? b : a), days[0]!);

  // Group into months, each padded so its first day lands under its weekday (Monday first).
  const months: { key: string; label: string; cells: (ActiveDay | null)[] }[] = [];
  for (const d of days) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    let month = months.find((m) => m.key === key);
    if (!month) {
      month = { key, label: monthName.format(d.date), cells: Array<null>((d.date.getDay() + 6) % 7).fill(null) };
      months.push(month);
    }
    month.cells.push(d);
  }

  return (
    <ChartCard
      title={shownDay ? dayName.format(shownDay.date) : title}
      value={format.percent(shownDay ? shownDay.progress : average)}
      valueKey={shownDay ? shownDay.date.toDateString() : "average"}
      caption={shownDay ? "of the day's goals met" : `Average over ${days.length} days`}
      actions={<ChartToggle label="View" value={view} onChange={onViewChange} options={VIEWS} />}
      summary={`${title}: ${days.length} days, goals met ${format.percent(average)} on average. Best day ${dayName.format(best.date)}.`}
      plotClassName="h-auto"
      className={className}
    >
      <div aria-hidden className="-mb-3 grid grid-cols-7 gap-1 text-center text-caption-strong text-fg-secondary">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="scrollbar-thin -mx-1 max-h-72 overflow-y-auto px-1" onMouseLeave={() => setHover(null)}>
        {[...months].reverse().map((month) => (
          <section key={month.key} aria-label={month.label} className="pb-3">
            {/* The month name stays pinned while its days scroll under it. */}
            <h4 className="sticky top-0 z-10 mb-2 inline-flex rounded-full border border-line bg-surface px-2.5 py-0.5 text-caption-strong text-fg shadow-raised">
              {month.label}
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {month.cells.map((cell, i) => {
                if (!cell) return <span key={i} />;
                const isSelected = !!selected && sameDay(cell.date, selected);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${dayName.format(cell.date)}, ${format.percent(cell.progress)} of goals`}
                    onMouseEnter={() => setHover(cell)}
                    onFocus={() => setHover(cell)}
                    onBlur={() => setHover(null)}
                    onClick={() => {
                      setPicked(cell.date);
                      onSelectDay?.(cell);
                    }}
                    className={cx(
                      "relative flex cursor-pointer items-center justify-center rounded-lg py-1 transition-colors duration-(--ds-motion-duration-fast) hover:bg-surface",
                      isSelected && "bg-surface",
                      focusRingNative,
                    )}
                  >
                    <MiniRing progress={cell.progress} selected={isSelected} />
                    <span className="absolute font-mono text-micro-emphasis tabular-nums text-fg">{cell.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </ChartCard>
  );
}
