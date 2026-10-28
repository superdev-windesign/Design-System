"use client";

import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, ChartToggle, ChartTooltip, SERIES_SWATCH, chartColors, describeChange, format, quietAxis, seriesColor } from "../shared/chart-card";

/**
 * Area Chart: several series over time, drawn stacked (totals), overlapping
 * (compare shapes) or as a share of the whole (100%). The headline is the
 * latest total and its change across the window.
 */

export interface AreaSeries {
  key: string;
  label: string;
}

export type AreaPoint = { label: string } & Record<string, number | string>;

export const AREA_SERIES: AreaSeries[] = [
  { key: "organic", label: "Organic" },
  { key: "paid", label: "Paid" },
  { key: "referral", label: "Referral" },
];

export const AREA_DATA: AreaPoint[] = [
  { label: "W1", organic: 4200, paid: 1800, referral: 900 },
  { label: "W2", organic: 4480, paid: 2100, referral: 960 },
  { label: "W3", organic: 4310, paid: 2600, referral: 1020 },
  { label: "W4", organic: 4890, paid: 2400, referral: 1180 },
  { label: "W5", organic: 5120, paid: 2950, referral: 1240 },
  { label: "W6", organic: 5060, paid: 3300, referral: 1310 },
  { label: "W7", organic: 5480, paid: 3150, referral: 1460 },
  { label: "W8", organic: 5790, paid: 3520, referral: 1530 },
  { label: "W9", organic: 6020, paid: 3880, referral: 1610 },
  { label: "W10", organic: 6310, paid: 3720, referral: 1790 },
  { label: "W11", organic: 6640, paid: 4100, referral: 1840 },
  { label: "W12", organic: 6980, paid: 4460, referral: 1950 },
];

type Mode = "stacked" | "overlap" | "share";

const MODES = [
  { id: "stacked", label: "Stacked" },
  { id: "overlap", label: "Overlap" },
  { id: "share", label: "100%" },
] as const;

export interface AreaChartCardProps {
  data?: AreaPoint[];
  series?: AreaSeries[];
  title?: string;
  defaultMode?: Mode;
  className?: string;
}

export function AreaChartCard({
  data = AREA_DATA,
  series = AREA_SERIES,
  title = "Visitors by channel",
  defaultMode = "stacked",
  className,
}: AreaChartCardProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const gradientPrefix = useId().replace(/:/g, "");

  const total = (point: AreaPoint | undefined) => series.reduce((sum, s) => sum + Number(point?.[s.key] ?? 0), 0);
  const latest = total(data[data.length - 1]);
  const first = total(data[0]);

  return (
    <ChartCard
      title={title}
      value={format.number(latest)}
      delta={describeChange(latest, first)}
      caption={`Last week, vs ${format.number(first)} in ${data[0]?.label ?? "the first week"}`}
      legend={series.map((s, i) => ({ label: s.label, swatch: SERIES_SWATCH[i % 9]! }))}
      actions={<ChartToggle label="Chart style" value={mode} onChange={setMode} options={MODES} />}
      summary={`${title} over ${data.length} weeks. Total weekly visitors went from ${format.number(first)} to ${format.number(latest)}.`}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} stackOffset={mode === "share" ? "expand" : "none"} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${gradientPrefix}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesColor(i + 1)} stopOpacity={mode === "overlap" ? 0.35 : 0.85} />
                <stop offset="100%" stopColor={seriesColor(i + 1)} stopOpacity={mode === "overlap" ? 0.02 : 0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" {...quietAxis} tickMargin={10} interval="preserveStartEnd" />
          <YAxis
            {...quietAxis}
            width={44}
            tickCount={4}
            tickFormatter={(v: number) => (mode === "share" ? format.percent(v) : format.compact(v))}
          />
          <Tooltip
            cursor={{ stroke: chartColors.cursor, strokeDasharray: "4 4" }}
            content={(props) => <ChartTooltip {...props} formatValue={format.number} />}
          />
          {series.map((s, i) => (
            <Area
              key={s.key}
              dataKey={s.key}
              name={s.label}
              type="monotone"
              stackId={mode === "overlap" ? undefined : "total"}
              stroke={seriesColor(i + 1)}
              strokeWidth={2}
              fill={`url(#${gradientPrefix}-${s.key})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: chartColors.surface }}
              animationDuration={600}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
