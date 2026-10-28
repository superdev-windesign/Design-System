"use client";

import { useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { ChartCard, ChartToggle, SERIES_SWATCH, chartColors, format, quietAxis, seriesColor } from "../shared/chart-card";

/**
 * Scatter Chart: two measures per record to show correlation, in two groups.
 * Turn on bubbles to size each dot by a third measure.
 */

export type ScatterPoint = { x: number; y: number; z: number; name: string };

/** Closed deals: days to close against contract value, sized by seats. */
export const SCATTER_DATA: { label: string; points: ScatterPoint[] }[] = [
  {
    label: "New business",
    points: [
      { name: "Northwind", x: 18, y: 12000, z: 20 },
      { name: "Lumen", x: 26, y: 18500, z: 35 },
      { name: "Cedar", x: 34, y: 24000, z: 40 },
      { name: "Atlas", x: 41, y: 31500, z: 60 },
      { name: "Harbor", x: 52, y: 38000, z: 75 },
      { name: "Summit", x: 63, y: 52000, z: 110 },
      { name: "Meridian", x: 70, y: 47000, z: 90 },
      { name: "Redwood", x: 84, y: 68000, z: 150 },
    ],
  },
  {
    label: "Expansion",
    points: [
      { name: "Pinecrest", x: 9, y: 8000, z: 15 },
      { name: "Fieldstone", x: 14, y: 14500, z: 25 },
      { name: "Evergreen", x: 21, y: 21000, z: 40 },
      { name: "Westbridge", x: 27, y: 19000, z: 30 },
      { name: "Brightline", x: 33, y: 29500, z: 55 },
      { name: "Lakeview", x: 38, y: 36000, z: 70 },
    ],
  },
];

export interface ScatterChartCardProps {
  data?: typeof SCATTER_DATA;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  className?: string;
}

function ScatterTooltip({ active, payload, xLabel, yLabel, zLabel }: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ScatterPoint }>;
  xLabel: string;
  yLabel: string;
  zLabel: string;
}) {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-body-sm shadow-overlay">
      <p className="text-body-sm-strong text-fg">{point.name}</p>
      <p className="text-fg-secondary">
        {yLabel} <span className="text-fg tabular-nums">{format.money(point.y)}</span>
      </p>
      <p className="text-fg-secondary">
        {xLabel} <span className="text-fg tabular-nums">{point.x} days</span>
      </p>
      <p className="text-fg-secondary">
        {zLabel} <span className="text-fg tabular-nums">{point.z}</span>
      </p>
    </div>
  );
}

export function ScatterChartCard({
  data = SCATTER_DATA,
  title = "Deal size vs. time to close",
  xLabel = "Days to close",
  yLabel = "Contract value",
  zLabel = "Seats",
  className,
}: ScatterChartCardProps) {
  const [bubbles, setBubbles] = useState<"dots" | "bubbles">("dots");
  const all = data.flatMap((g) => g.points);
  const avgPerDay = all.reduce((s, p) => s + p.y / p.x, 0) / Math.max(1, all.length);

  return (
    <ChartCard
      title={title}
      value={`${format.money(avgPerDay)} / day`}
      caption={`Average value per day of cycle, ${all.length} deals`}
      legend={data.map((g, i) => ({ label: g.label, swatch: SERIES_SWATCH[i === 0 ? 5 : 2]! }))}
      actions={
        <ChartToggle
          label="Point size"
          value={bubbles}
          onChange={setBubbles}
          options={[
            { id: "dots", label: "Dots" },
            { id: "bubbles", label: zLabel },
          ]}
        />
      }
      summary={`${title}: ${all.length} deals. Larger contracts take longer to close; expansion deals close faster than new business.`}
      plotClassName="h-60"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 4" />
          <XAxis type="number" dataKey="x" name={xLabel} unit="d" {...quietAxis} tickMargin={8} />
          <YAxis type="number" dataKey="y" name={yLabel} {...quietAxis} width={44} tickFormatter={(v: number) => `$${format.compact(v)}`} />
          <ZAxis type="number" dataKey="z" range={bubbles === "bubbles" ? [40, 520] : [60, 60]} />
          <Tooltip
            cursor={{ stroke: chartColors.cursor, strokeDasharray: "4 4" }}
            content={(props) => <ScatterTooltip {...props} xLabel={xLabel} yLabel={yLabel} zLabel={zLabel} />}
          />
          {data.map((group, i) => (
            <Scatter
              key={group.label}
              name={group.label}
              data={group.points}
              fill={seriesColor(i === 0 ? 6 : 3)}
              fillOpacity={bubbles === "bubbles" ? 0.6 : 0.9}
              animationDuration={500}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
