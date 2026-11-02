"use client";

import { useState } from "react";
import { ChartCard, format, SERIES_RAMP } from "../shared/chart-card";
import { cx } from "../../utils/cx";

/**
 * Heatmap Chart: a grid of two categories (weekday × time of day) shaded by
 * value on a ramp of one series colour, which follows the theme. Hovering a
 * cell names it and its value in the header.
 */


export const HEATMAP_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HEATMAP_COLUMNS = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"];

/** Orders per two-hour block, busiest around lunch and early evening on weekdays. */
export const HEATMAP_DATA: number[][] = HEATMAP_ROWS.map((_, r) =>
  HEATMAP_COLUMNS.map((_, c) => {
    const weekend = r >= 5;
    const lunch = Math.exp(-((c - 6) ** 2) / 3) * (weekend ? 90 : 160);
    const evening = Math.exp(-((c - 9.5) ** 2) / 2.5) * (weekend ? 210 : 180);
    const night = c < 3 ? 12 : 30;
    return Math.round(night + lunch + evening + ((r * 7 + c * 13) % 23));
  }),
);

export interface HeatmapChartCardProps {
  data?: number[][];
  rows?: string[];
  columns?: string[];
  title?: string;
  unit?: string;
  /** Series colour (1–9) the cells are shaded in. Default 6. */
  color?: number;
  className?: string;
}

export function HeatmapChartCard({
  data = HEATMAP_DATA,
  rows = HEATMAP_ROWS,
  columns = HEATMAP_COLUMNS,
  title = "Orders by hour",
  unit = "orders",
  color = 6,
  className,
}: HeatmapChartCardProps) {
  const RAMP = SERIES_RAMP[(Math.max(1, Math.min(9, color)) - 1)]!;
  const [hover, setHover] = useState<[number, number] | null>(null);
  const flat = data.flat();
  const max = Math.max(1, ...flat);
  const total = flat.reduce((s, v) => s + v, 0);
  const peak = flat.indexOf(max);
  const peakRow = Math.floor(peak / columns.length);
  const peakCol = peak % columns.length;
  const shade = (v: number) => RAMP[Math.min(RAMP.length - 1, Math.floor((v / max) * RAMP.length))];
  const block = (c: number) => `${columns[c]}:00–${columns[c + 1] ?? "24"}:00`;
  const value = hover ? data[hover[0]]?.[hover[1]] : undefined;

  return (
    <ChartCard
      title={hover ? `${rows[hover[0]]} ${block(hover[1])}` : title}
      value={hover ? `${format.number(value ?? 0)} ${unit}` : `${format.number(total)} ${unit}`}
      valueKey={hover ? hover.join("-") : "total"}
      caption={hover ? `${format.percent((value ?? 0) / max)} of the busiest block` : `Busiest: ${rows[peakRow]} ${block(peakCol)}`}
      summary={`${title}, by weekday and two-hour block. ${format.number(total)} ${unit} in total; the busiest block is ${rows[peakRow]} ${block(peakCol)} with ${max}.`}
      plotClassName="h-auto"
      className={className}
    >
      <div aria-hidden className="flex flex-col gap-2 pb-1">
        <div className="grid gap-1" style={{ gridTemplateColumns: `2.5rem repeat(${columns.length}, minmax(0, 1fr))` }} onMouseLeave={() => setHover(null)}>
          {rows.map((row, r) => (
            <div key={row} className="contents">
              <span className="flex items-center text-caption text-fg-secondary">{row}</span>
              {columns.map((_, c) => (
                <span
                  key={c}
                  onMouseEnter={() => setHover([r, c])}
                  className={cx(
                    "h-6 rounded-md transition-[outline-color]",
                    shade(data[r]?.[c] ?? 0),
                    hover?.[0] === r && hover[1] === c && "outline-2 outline-offset-1 outline-fg",
                  )}
                />
              ))}
            </div>
          ))}
          <span />
          {columns.map((c, i) => (
            <span key={c} className="text-center text-caption text-fg-secondary">
              {i % 2 === 0 ? c : ""}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 text-caption text-fg-secondary">
          0
          {RAMP.map((c) => (
            <span key={c} className={cx("h-2 w-5 rounded-full", c)} />
          ))}
          {format.number(max)}
        </div>
      </div>
    </ChartCard>
  );
}
