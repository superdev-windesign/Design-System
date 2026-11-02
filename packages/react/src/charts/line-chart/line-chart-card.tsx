"use client";

import { useId, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, ChartToggle, ChartTooltip, chartColors, describeChange, quietAxis, seriesActiveColor, seriesColor } from "../shared/chart-card";

/**
 * Line Chart: one measure over time as a line over a soft area, curved or
 * sharp, with an optional target line. Hovering a point swaps the headline for
 * that point's value.
 */

export type LinePoint = { label: string; value: number };

/** p95 API latency in ms over two weeks. */
export const LINE_DATA: LinePoint[] = [
  { label: "Oct 1", value: 312 },
  { label: "Oct 2", value: 298 },
  { label: "Oct 3", value: 341 },
  { label: "Oct 4", value: 287 },
  { label: "Oct 5", value: 276 },
  { label: "Oct 6", value: 302 },
  { label: "Oct 7", value: 268 },
  { label: "Oct 8", value: 251 },
  { label: "Oct 9", value: 259 },
  { label: "Oct 10", value: 236 },
  { label: "Oct 11", value: 244 },
  { label: "Oct 12", value: 221 },
  { label: "Oct 13", value: 214 },
  { label: "Oct 14", value: 208 },
];

export interface LineRange {
  id: string;
  label: string;
  data: LinePoint[];
}

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** Last 7, 14 and 30 days of the demo series, for the period switch. */
export const LINE_RANGES: LineRange[] = (() => {
  const end = new Date(2026, 9, 14);
  const month = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(end);
    date.setDate(end.getDate() - 29 + i);
    return { label: dayLabel.format(date), value: Math.round(372 - i * 5.2 + Math.sin(i * 1.7) * 22) };
  });
  return [
    { id: "7d", label: "7 days", data: LINE_DATA.slice(-7) },
    { id: "14d", label: "14 days", data: LINE_DATA },
    { id: "30d", label: "30 days", data: month },
  ];
})();

const SHAPES = [
  { id: "curved", label: "Curved" },
  { id: "sharp", label: "Sharp" },
] as const;

export interface LineChartCardProps {
  /** One series. Without `data` or `ranges`, the demo periods are shown. */
  data?: LinePoint[];
  /** Several periods to switch between (7 days, 30 days…). Takes precedence over `data`. */
  ranges?: LineRange[];
  title?: string;
  unit?: string;
  /** Draws a dashed reference line, e.g. an SLO. */
  target?: number;
  /** Lower values are better (latency, cost): flips the delta colours. */
  lowerIsBetter?: boolean;
  /** Series colour from the chart palette, 1–9. */
  color?: number;
  className?: string;
}

export function LineChartCard({
  data: dataProp,
  ranges: rangesProp,
  title = "API latency (p95)",
  unit = "ms",
  target = 250,
  lowerIsBetter = true,
  color = 4,
  className,
}: LineChartCardProps) {
  const ranges = rangesProp ?? (dataProp ? undefined : LINE_RANGES);
  const [rangeId, setRangeId] = useState(ranges?.[1]?.id ?? ranges?.[0]?.id ?? "");
  const data = ranges ? (ranges.find((r) => r.id === rangeId) ?? ranges[0]!).data : (dataProp ?? LINE_DATA);
  const [shape, setShape] = useState<"curved" | "sharp">("curved");
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const last = data[data.length - 1]?.value ?? 0;
  const first = data[0]?.value ?? 0;
  const point = active !== null ? data[active] : undefined;
  const shown = point?.value ?? last;
  const withUnit = (v: number) => `${Math.round(v)} ${unit}`;

  return (
    <ChartCard
      title={point ? point.label : title}
      value={withUnit(shown)}
      valueKey={active ?? "latest"}
      delta={describeChange(shown, first, { lowerIsBetter })}
      caption={point ? `vs ${withUnit(first)} on ${data[0]?.label}` : `Latest, target ${withUnit(target)}`}
      actions={
        <div className="flex flex-wrap justify-end gap-2">
          {ranges && ranges.length > 1 && <ChartToggle label="Period" value={rangeId} onChange={setRangeId} options={ranges.map(({ id, label }) => ({ id, label }))} />}
          <ChartToggle label="Line shape" value={shape} onChange={setShape} options={SHAPES} />
        </div>
      }
      summary={`${title} over ${data.length} days, from ${withUnit(first)} to ${withUnit(last)}. Target ${withUnit(target)}.`}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 6, right: 6, bottom: 0, left: 0 }}
          onMouseMove={(state) => {
            const index = Number(state?.activeTooltipIndex);
            setActive(state?.isTooltipActive && Number.isFinite(index) ? index : null);
          }}
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColor(color)} stopOpacity={0.3} />
              <stop offset="100%" stopColor={seriesColor(color)} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" {...quietAxis} tickMargin={10} interval="preserveStartEnd" />
          <YAxis {...quietAxis} width={40} tickCount={4} domain={["dataMin - 40", "dataMax + 20"]} />
          <ReferenceLine y={target} stroke={chartColors.neutral} strokeDasharray="5 5" />
          <Tooltip
            cursor={{ stroke: chartColors.cursor, strokeDasharray: "4 4" }}
            content={(props) => <ChartTooltip {...props} formatValue={withUnit} />}
          />
          <Area
            type={shape === "curved" ? "monotone" : "linear"}
            dataKey="value"
            stroke="none"
            fill={`url(#${gradientId})`}
            tooltipType="none"
            activeDot={false}
            animationDuration={500}
          />
          <Line
            type={shape === "curved" ? "monotone" : "linear"}
            dataKey="value"
            name={title}
            stroke={seriesActiveColor(color)}
            strokeWidth={2.5}
            dot={shape === "sharp" ? { r: 2.5, fill: seriesActiveColor(color), strokeWidth: 0 } : false}
            activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2, fill: seriesActiveColor(color) }}
            animationDuration={500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
