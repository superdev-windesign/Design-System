"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard, ChartToggle, ChartTooltip, SERIES_SWATCH, format, seriesActiveColor, seriesColor } from "../shared/chart-card";

/**
 * Donut Chart: shares of a whole (traffic by source, spend by category).
 * The total sits in the hole; hovering a slice darkens it and shows its
 * value. The legend lists every part with its share, so the chart never
 * relies on colour or hover alone. Switch to a full pie with the toggle.
 *
 * Keep it to a handful of parts; past six or so, use Bar List instead.
 */

export type DonutSlice = { label: string; value: number };

/** Sessions by traffic source, last 30 days. */
export const DONUT_DATA: DonutSlice[] = [
  { label: "Direct", value: 4200 },
  { label: "Organic search", value: 3100 },
  { label: "Referral", value: 1800 },
  { label: "Social", value: 1200 },
  { label: "Email", value: 700 },
];

const VIEWS = [
  { id: "donut", label: "Donut" },
  { id: "pie", label: "Pie" },
] as const;

export interface DonutChartCardProps {
  data?: DonutSlice[];
  title?: string;
  /** Formats amounts. Default: whole numbers. */
  formatValue?: (value: number) => string;
  /** The word under the total in the hole. Default "total". */
  totalLabel?: string;
  className?: string;
}

export function DonutChartCard({ data = DONUT_DATA, title = "Sessions by source", formatValue = format.number, totalLabel = "total", className }: DonutChartCardProps) {
  const [view, setView] = useState<"donut" | "pie">("donut");
  const [active, setActive] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const share = (v: number) => format.percent(v / Math.max(1, total));
  const largest = data.reduce((a, b) => (b.value > a.value ? b : a), data[0] ?? { label: "", value: 0 });

  return (
    <ChartCard
      title={title}
      value={formatValue(total)}
      caption={`${largest.label} is the largest at ${share(largest.value)}`}
      legend={data.map((d, i) => ({ label: `${d.label} ${share(d.value)}`, swatch: SERIES_SWATCH[i % 9]! }))}
      actions={<ChartToggle label="Chart style" value={view} onChange={setView} options={VIEWS} />}
      summary={`${title}: ${formatValue(total)} in all. ${data.map((d) => `${d.label} ${formatValue(d.value)} (${share(d.value)})`).join(", ")}.`}
      plotClassName="h-60"
      className={className}
    >
      <div className="relative size-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={(props) => <ChartTooltip {...props} formatValue={formatValue} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={view === "donut" ? "62%" : 0}
              outerRadius="100%"
              paddingAngle={view === "donut" ? 1.5 : 0.5}
              cornerRadius={view === "donut" ? 3 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="var(--ds-color-bg-surface)"
              strokeWidth={2}
              animationDuration={700}
              onMouseEnter={(_, index) => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((d, i) => (
                <Cell key={d.label} fill={active === i ? seriesActiveColor(i + 1) : seriesColor(i + 1)} opacity={active === null || active === i ? 1 : 0.55} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {view === "donut" && (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-title-md-strong text-fg tabular-nums">{active === null ? formatValue(total) : share(data[active]!.value)}</span>
            <span className="text-body-sm text-fg-secondary">{active === null ? totalLabel : data[active]!.label}</span>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
