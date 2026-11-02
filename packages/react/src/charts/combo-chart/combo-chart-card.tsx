"use client";

import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTiles, ChartCard, ChartTooltip, SERIES_SWATCH, chartColors, describeChange, format, quietAxis, seriesActiveColor, seriesColor } from "../shared/chart-card";

/**
 * Combo Chart: a count as bars and a rate as a line, each on its own axis
 * (counts on the start side, the rate on the end side), so two measures with
 * different units share one time scale. Hovering a month dims the other bars.
 */

export type ComboPoint = { label: string; count: number; rate: number };

/** Monthly trial signups and their trial-to-paid conversion rate. */
export const COMBO_DATA: ComboPoint[] = [
  { label: "Jan", count: 820, rate: 0.112 },
  { label: "Feb", count: 910, rate: 0.118 },
  { label: "Mar", count: 1040, rate: 0.109 },
  { label: "Apr", count: 980, rate: 0.124 },
  { label: "May", count: 1160, rate: 0.131 },
  { label: "Jun", count: 1230, rate: 0.127 },
  { label: "Jul", count: 1310, rate: 0.138 },
  { label: "Aug", count: 1280, rate: 0.142 },
  { label: "Sep", count: 1450, rate: 0.149 },
];

export interface ComboChartCardProps {
  data?: ComboPoint[];
  title?: string;
  countLabel?: string;
  rateLabel?: string;
  /** Show totals under the chart: the count summed, the average rate, the best month. Default true. */
  showTiles?: boolean;
  className?: string;
}

export function ComboChartCard({
  data = COMBO_DATA,
  title = "Signups and conversion",
  countLabel = "Signups",
  rateLabel = "Converted",
  showTiles = true,
  className,
}: ComboChartCardProps) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const averageRate = data.reduce((sum, d) => sum + d.rate, 0) / Math.max(1, data.length);
  const best = data.reduce((a, b) => (b.count > a.count ? b : a), data[0] ?? { label: "", count: 0, rate: 0 });
  const [active, setActive] = useState<number | null>(null);
  const point = active !== null ? data[active] : data[data.length - 1];
  const previous = active !== null ? data[active - 1] : data[data.length - 2];

  return (
    <ChartCard
      title={active !== null ? point?.label : title}
      value={`${format.number(point?.count ?? 0)} · ${format.percent(point?.rate ?? 0)}`}
      valueKey={active ?? "latest"}
      delta={previous && point ? describeChange(point.count, previous.count) : undefined}
      caption={active !== null ? `${countLabel} and ${rateLabel.toLowerCase()} that month` : `${countLabel} and ${rateLabel.toLowerCase()}, latest month`}
      legend={[
        { label: countLabel, swatch: SERIES_SWATCH[5]! },
        { label: rateLabel, swatch: SERIES_SWATCH[2]!, dashed: true },
      ]}
      summary={`${title}: ${countLabel.toLowerCase()} grew from ${format.number(data[0]?.count ?? 0)} to ${format.number(
        data[data.length - 1]?.count ?? 0,
      )} while ${rateLabel.toLowerCase()} moved from ${format.percent(data[0]?.rate ?? 0)} to ${format.percent(data[data.length - 1]?.rate ?? 0)}.`}
      footer={
        showTiles ? (
          <ChartTiles
            tiles={[
              { label: `${countLabel}, total`, value: format.number(totalCount) },
              { label: `${rateLabel}, average`, value: format.percent(averageRate) },
              { label: "Best month", value: best.label },
            ]}
          />
        ) : undefined
      }
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
          onMouseMove={(state) => {
            const index = Number(state?.activeTooltipIndex);
            setActive(state?.isTooltipActive && Number.isFinite(index) ? index : null);
          }}
          onMouseLeave={() => setActive(null)}
        >
          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" {...quietAxis} tickMargin={10} />
          <YAxis yAxisId="count" {...quietAxis} width={40} tickCount={4} tickFormatter={format.compact} />
          <YAxis yAxisId="rate" orientation="right" {...quietAxis} width={44} tickCount={4} tickFormatter={format.percent} />
          <Tooltip
            cursor={{ fill: chartColors.track, opacity: 0.5 }}
            content={(props) => (
              <ChartTooltip {...props} formatValue={(v) => (v < 1 ? format.percent(v) : format.number(v))} />
            )}
          />
          <Bar
            yAxisId="count"
            dataKey="count"
            name={countLabel}
            fill={seriesColor(6)}
            radius={[6, 6, 2, 2]}
            maxBarSize={28}
            shape={(props: { index?: number; x?: number; y?: number; width?: number; height?: number }) => (
              <rect
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
                rx={5}
                fill={active === null || active === props.index ? seriesColor(6) : chartColors.neutral}
                className="transition-[fill] duration-(--ds-motion-duration-base)"
              />
            )}
          />
          <Line
            yAxisId="rate"
            dataKey="rate"
            name={rateLabel}
            type="monotone"
            stroke={seriesActiveColor(3)}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2, fill: seriesActiveColor(3) }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
