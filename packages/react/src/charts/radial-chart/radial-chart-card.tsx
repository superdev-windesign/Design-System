"use client";

import { useState } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { ChartTiles, ChartCard, ChartToggle, SERIES_SWATCH, chartColors, format, seriesColor } from "../shared/chart-card";

/**
 * Radial Chart: parts of a quota, as concentric rings (each part against its
 * own limit) or as one half gauge stacking the parts towards the total.
 */

export type RadialPart = { label: string; used: number; limit: number };

/** Storage by file type, in GB. */
export const RADIAL_DATA: RadialPart[] = [
  { label: "Media", used: 68, limit: 100 },
  { label: "Documents", used: 41, limit: 60 },
  { label: "Backups", used: 22, limit: 50 },
];

const VIEWS = [
  { id: "rings", label: "Rings" },
  { id: "gauge", label: "Gauge" },
] as const;

export interface RadialChartCardProps {
  data?: RadialPart[];
  title?: string;
  unit?: string;
  /** Formats amounts; defaults to the number followed by `unit`. Use it for currency. */
  formatValue?: (value: number) => string;
  /** Show each part's use against its limit as tiles under the chart. */
  showTiles?: boolean;
  className?: string;
}

export function RadialChartCard({ data = RADIAL_DATA, title = "Storage used", unit = "GB", formatValue, showTiles = false, className }: RadialChartCardProps) {
  const fmt = formatValue ?? ((v: number) => `${format.number(v)} ${unit}`);
  const [view, setView] = useState<"rings" | "gauge">("rings");
  const used = data.reduce((s, d) => s + d.used, 0);
  const limit = data.reduce((s, d) => s + d.limit, 0);
  const share = used / Math.max(1, limit);

  // Rings: each part as a share of its own limit, outermost first.
  const rings = data.map((d, i) => ({ name: d.label, value: (d.used / d.limit) * 100, fill: seriesColor(i + 3) })).reverse();
  // Gauge: one bar per part, stacked end to end, measured against the total.
  let running = 0;
  const gauge = data
    .map((d, i) => {
      running += d.used;
      return { name: d.label, value: (running / limit) * 100, fill: seriesColor(i + 3) };
    })
    .reverse();

  return (
    <ChartCard
      title={title}
      value={fmt(used)}
      caption={`${format.percent(share)} of ${fmt(limit)}`}
      legend={data.map((d, i) => ({ label: `${d.label} ${fmt(d.used)}`, swatch: SERIES_SWATCH[(i + 2) % 9]! }))}
      actions={<ChartToggle label="Chart style" value={view} onChange={setView} options={VIEWS} />}
      summary={`${title}: ${fmt(used)} of ${fmt(limit)}. ${data
        .map((d) => `${d.label} ${fmt(d.used)} of ${fmt(d.limit)}`)
        .join(", ")}.`}
      plotClassName="h-60"
      footer={showTiles ? <ChartTiles tiles={data.map((d) => ({ label: d.label, value: `${fmt(d.used)} / ${fmt(d.limit)}` }))} /> : undefined}
      className={className}
    >
      <div className="relative size-full">
        <ResponsiveContainer width="100%" height="100%">
          {view === "rings" ? (
            <RadialBarChart data={rings} innerRadius="38%" outerRadius="100%" barSize={14} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="value" background={{ fill: chartColors.track }} cornerRadius={8} animationDuration={700} />
            </RadialBarChart>
          ) : (
            <RadialBarChart data={gauge} cy="78%" innerRadius="95%" outerRadius="135%" barSize={22} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="value" background={{ fill: chartColors.track }} cornerRadius={11} animationDuration={700} />
            </RadialBarChart>
          )}
        </ResponsiveContainer>
        <div
          aria-hidden
          className={
            view === "rings"
              ? "pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              : "pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center"
          }
        >
          <span className="text-title-md-strong text-fg tabular-nums">{format.percent(share)}</span>
          <span className="text-body-sm text-fg-secondary">used</span>
        </div>
      </div>
    </ChartCard>
  );
}
