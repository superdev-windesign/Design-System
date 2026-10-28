"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, ChartToggle, ChartTooltip, SERIES_SWATCH, chartColors, describeChange, format, quietAxis, seriesColor } from "../shared/chart-card";

/**
 * Earnings Chart: money in per month, each bar paired with the same month of
 * the previous period, so growth reads month by month. Switch between the
 * last six and twelve months.
 */

export type EarningsPoint = { label: string; current: number; previous: number };

export const EARNINGS_DATA: EarningsPoint[] = [
  { label: "Nov", current: 18200, previous: 15100 },
  { label: "Dec", current: 21900, previous: 17400 },
  { label: "Jan", current: 16800, previous: 14900 },
  { label: "Feb", current: 17400, previous: 15800 },
  { label: "Mar", current: 20100, previous: 16900 },
  { label: "Apr", current: 19300, previous: 17700 },
  { label: "May", current: 22600, previous: 18300 },
  { label: "Jun", current: 23800, previous: 19100 },
  { label: "Jul", current: 22100, previous: 19800 },
  { label: "Aug", current: 25400, previous: 20600 },
  { label: "Sep", current: 26900, previous: 21300 },
  { label: "Oct", current: 28700, previous: 22800 },
];

const RANGES = [
  { id: "6", label: "6M" },
  { id: "12", label: "12M" },
] as const;

export interface EarningsChartCardProps {
  data?: EarningsPoint[];
  title?: string;
  className?: string;
}

export function EarningsChartCard({ data = EARNINGS_DATA, title = "Payouts", className }: EarningsChartCardProps) {
  const [range, setRange] = useState<"6" | "12">("6");
  const shown = data.slice(-Number(range));
  const current = shown.reduce((sum, p) => sum + p.current, 0);
  const previous = shown.reduce((sum, p) => sum + p.previous, 0);

  return (
    <ChartCard
      title={title}
      value={format.money(current)}
      valueKey={range}
      delta={describeChange(current, previous)}
      caption={`${format.money(previous)} in the same months last year`}
      legend={[
        { label: "This year", swatch: SERIES_SWATCH[4]! },
        { label: "Last year", swatch: "bg-chart-neutral" },
      ]}
      actions={<ChartToggle label="Range" value={range} onChange={setRange} options={RANGES} />}
      summary={`${title} for the last ${range} months: ${format.money(current)}, against ${format.money(previous)} a year earlier.`}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={shown} barGap={3} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" {...quietAxis} tickMargin={10} />
          <YAxis {...quietAxis} width={44} tickCount={4} tickFormatter={(v: number) => `$${format.compact(v)}`} />
          <Tooltip cursor={{ fill: chartColors.track, opacity: 0.5 }} content={(props) => <ChartTooltip {...props} formatValue={format.money} />} />
          <Bar dataKey="previous" name="Last year" fill={chartColors.neutral} radius={[5, 5, 2, 2]} maxBarSize={18} animationDuration={500} />
          <Bar dataKey="current" name="This year" fill={seriesColor(5)} radius={[5, 5, 2, 2]} maxBarSize={18} animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
