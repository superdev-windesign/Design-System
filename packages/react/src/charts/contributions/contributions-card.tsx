"use client";

import { useMemo, useState } from "react";
import { ChartCard, SERIES_RAMP, format } from "../shared/chart-card";
import { cx } from "../../utils/cx";

/**
 * Contributions: daily activity as a calendar grid, one column per week
 * (half a year by default; `weeks={53}` for a full year), shaded in five
 * steps of any series colour. Hovering a day shows its date and count in the
 * header.
 */

const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

/** Deterministic demo activity: weekday-heavy, with a few busy streaks. */
export function demoContributions(weeks = 26, end = new Date(2026, 9, 25)) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const days: { date: Date; count: number }[] = [];
  const start = new Date(end);
  start.setDate(end.getDate() - weeks * 7 + 1);
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const streak = Math.sin(i / 9) > 0.55 ? 6 : 0;
    const count = Math.max(0, Math.round(rand() * (weekend ? 3 : 9) + streak - (rand() < 0.22 ? 9 : 0)));
    days.push({ date, count });
  }
  return days;
}

export interface ContributionsCardProps {
  days?: { date: Date; count: number }[];
  /** Weeks of demo data when `days` isn't given. Default 26; 53 is a year. */
  weeks?: number;
  /** Series colour (1–9) for the shading. Default 7. */
  color?: number;
  title?: string;
  unit?: string;
  className?: string;
}

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short" });

export function ContributionsCard({ days: given, weeks: demoWeeks = 26, color = 7, title = "Contributions", unit = "commits", className }: ContributionsCardProps) {
  const days = useMemo(() => given ?? demoContributions(demoWeeks), [given, demoWeeks]);
  const ramp = SERIES_RAMP[Math.max(1, Math.min(9, color)) - 1]!;
  const LEVEL_CLASS = ["bg-chart-track", ramp[1], ramp[3], ramp[4], ramp[5]] as const;
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  const level = (count: number) => (count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4)));

  // Pad the start so the first column begins on Monday.
  const lead = days[0] ? (days[0].date.getDay() + 6) % 7 : 0;
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...days.map((_, i) => i)];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const hovered = hover !== null ? days[hover] : undefined;

  return (
    <ChartCard
      title={hovered ? dayFormat.format(hovered.date) : title}
      value={hovered ? `${hovered.count} ${unit}` : `${format.number(total)} ${unit}`}
      valueKey={hover ?? "total"}
      caption={hovered ? "That day" : `In the last ${weeks.length} weeks`}
      summary={`${title}: ${format.number(total)} ${unit} over ${weeks.length} weeks, busiest day ${max}.`}
      plotClassName="h-auto"
      className={className}
    >
      <div className="flex flex-col gap-3 pb-1">
        <div aria-hidden className="flex gap-1 overflow-x-auto" onMouseLeave={() => setHover(null)}>
          <div className="flex flex-col gap-1 pe-1 pt-5">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="flex h-3 items-center text-caption text-fg-secondary">
                {d}
              </span>
            ))}
          </div>
          {weeks.map((week, w) => {
            const firstDay = week.find((c) => c !== null);
            const date = firstDay != null ? days[firstDay]?.date : undefined;
            const showMonth = date && date.getDate() <= 7;
            return (
              <div key={w} className="flex flex-col gap-1">
                <span className="h-4 text-caption whitespace-nowrap text-fg-secondary">{showMonth ? monthFormat.format(date) : ""}</span>
                {week.map((cell, d) =>
                  cell === null ? (
                    <span key={d} className="size-3" />
                  ) : (
                    <span
                      key={d}
                      onMouseEnter={() => setHover(cell)}
                      className={cx(
                        "size-3 rounded-sm transition-[outline-color]",
                        LEVEL_CLASS[level(days[cell]!.count)],
                        hover === cell && "outline-2 outline-offset-1 outline-fg",
                      )}
                    />
                  ),
                )}
              </div>
            );
          })}
        </div>
        <div aria-hidden className="flex items-center justify-end gap-1.5 text-caption text-fg-secondary">
          Less
          {LEVEL_CLASS.map((c) => (
            <span key={c} className={cx("size-3 rounded-sm", c)} />
          ))}
          More
        </div>
      </div>
    </ChartCard>
  );
}
