"use client";

import { useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard, ChartToggle, ChartTooltip, SERIES_SWATCH, chartColors, seriesActiveColor, seriesColor } from "../shared/chart-card";

/**
 * Radar Chart: two profiles scored on the same axes, filled (areas) or as
 * outlines with dots. Good for "where is A stronger than B" at a glance.
 */

export type RadarPoint = { axis: string; a: number; b: number };

/** Two releases scored 0–100 on six quality checks. */
export const RADAR_DATA: RadarPoint[] = [
  { axis: "Speed", a: 86, b: 72 },
  { axis: "Stability", a: 78, b: 88 },
  { axis: "Accessibility", a: 92, b: 70 },
  { axis: "Coverage", a: 70, b: 81 },
  { axis: "Bundle size", a: 64, b: 76 },
  { axis: "Docs", a: 88, b: 62 },
];

const STYLES = [
  { id: "filled", label: "Filled" },
  { id: "lines", label: "Lines" },
] as const;

export interface RadarChartCardProps {
  data?: RadarPoint[];
  title?: string;
  labels?: { a: string; b: string };
  className?: string;
}

export function RadarChartCard({
  data = RADAR_DATA,
  title = "Release quality",
  labels = { a: "v3.0", b: "v2.8" },
  className,
}: RadarChartCardProps) {
  const [style, setStyle] = useState<"filled" | "lines">("filled");
  const avg = (key: "a" | "b") => Math.round(data.reduce((s, d) => s + d[key], 0) / Math.max(1, data.length));
  const filled = style === "filled";

  return (
    <ChartCard
      title={title}
      value={`${avg("a")} / 100`}
      caption={`${labels.a} average, ${labels.b} scored ${avg("b")}`}
      legend={[
        { label: labels.a, swatch: SERIES_SWATCH[4]! },
        { label: labels.b, swatch: SERIES_SWATCH[0]! },
      ]}
      actions={<ChartToggle label="Chart style" value={style} onChange={setStyle} options={STYLES} />}
      summary={`${title} on ${data.length} axes. ${labels.a}: ${data.map((d) => `${d.axis} ${d.a}`).join(", ")}. ${labels.b}: ${data
        .map((d) => `${d.axis} ${d.b}`)
        .join(", ")}.`}
      plotClassName="h-64"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={chartColors.grid} />
          <PolarAngleAxis dataKey="axis" />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={(props) => <ChartTooltip {...props} formatValue={(v) => `${v} / 100`} />} />
          {(["b", "a"] as const).map((key) => {
            const color = key === "a" ? 5 : 1;
            return (
              <Radar
                key={key}
                dataKey={key}
                name={labels[key]}
                stroke={seriesActiveColor(color)}
                strokeWidth={2}
                fill={seriesColor(color)}
                fillOpacity={filled ? 0.3 : 0}
                dot={filled ? false : { r: 3, fill: seriesActiveColor(color), strokeWidth: 0 }}
                animationDuration={500}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
