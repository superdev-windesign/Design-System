"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartToggle, ChartCard, ChartTooltip, SERIES_SWATCH, chartColors, format, quietAxis, seriesActiveColor, seriesColor } from "../shared/chart-card";

/**
 * Steps Chart: a daily count against a goal. Days that hit the goal take the
 * series colour, the rest stay neutral, and a dashed line marks the goal.
 * The headline is the daily average; hovering a day shows that day.
 */

export type StepsPoint = { label: string; value: number };

export const STEPS_DATA: StepsPoint[] = [
  { label: "M", value: 8420 },
  { label: "T", value: 11240 },
  { label: "W", value: 6980 },
  { label: "T", value: 10510 },
  { label: "F", value: 12830 },
  { label: "S", value: 14320 },
  { label: "S", value: 5210 },
  { label: "M", value: 9640 },
  { label: "T", value: 10920 },
  { label: "W", value: 7730 },
  { label: "T", value: 11860 },
  { label: "F", value: 10140 },
  { label: "S", value: 15210 },
  { label: "S", value: 8350 },
];

export interface StepsChartCardProps {
  /** Daily counts, oldest first. Longer than a week, it splits into weeks with a switch. */
  data?: StepsPoint[];
  goal?: number;
  title?: string;
  unit?: string;
  className?: string;
}

export function StepsChartCard({ data: all = STEPS_DATA, goal = 10000, title = "Daily steps", unit = "steps", className }: StepsChartCardProps) {
  const [active, setActive] = useState<number | null>(null);
  // Whole weeks, newest last; the switch shows one at a time.
  const weeks = all.length > 7 ? Array.from({ length: Math.ceil(all.length / 7) }, (_, i) => all.slice(Math.max(0, all.length - (Math.ceil(all.length / 7) - i) * 7), all.length - (Math.ceil(all.length / 7) - 1 - i) * 7)) : [all];
  const weekOptions = weeks.map((_, i) => {
    const back = weeks.length - 1 - i;
    return { id: String(i), label: back === 0 ? "This week" : back === 1 ? "Last week" : `${back} weeks ago` };
  });
  const [week, setWeek] = useState(String(weeks.length - 1));
  const data = weeks[Number(week)] ?? all;
  const average = data.reduce((sum, d) => sum + d.value, 0) / Math.max(1, data.length);
  const hits = data.filter((d) => d.value >= goal).length;
  const point = active !== null ? data[active] : undefined;

  return (
    <ChartCard
      title={point ? (point.label.length > 1 ? point.label : `Day ${active! + 1}`) : title}
      actions={
        weeks.length > 1 ? (
          <ChartToggle
            label="Week"
            value={week}
            onChange={(next) => {
              setWeek(next);
              setActive(null);
            }}
            options={weekOptions}
          />
        ) : undefined
      }
      value={`${format.number(point?.value ?? average)} ${unit}`}
      valueKey={active ?? "avg"}
      caption={point ? (point.value >= goal ? "Goal reached" : `${format.number(goal - point.value)} short of the goal`) : `Daily average · goal met ${hits} of ${data.length} days`}
      legend={[
        { label: "Goal met", swatch: SERIES_SWATCH[6]! },
        { label: `Goal ${format.compact(goal)}`, swatch: "bg-chart-neutral", dashed: true },
      ]}
      summary={`${title} for ${data.length} days. Average ${format.number(average)} ${unit}; the ${format.number(goal)} goal was met on ${hits} days.`}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
          onMouseMove={(state) => {
            const index = Number(state?.activeTooltipIndex);
            setActive(state?.isTooltipActive && Number.isFinite(index) ? index : null);
          }}
          onMouseLeave={() => setActive(null)}
        >
          <XAxis dataKey="label" {...quietAxis} tickMargin={10} interval={0} />
          <YAxis {...quietAxis} width={36} tickCount={4} tickFormatter={format.compact} />
          <Tooltip cursor={false} content={(props) => <ChartTooltip {...props} formatValue={(v) => `${format.number(v)} ${unit}`} />} />
          <ReferenceLine y={goal} stroke={chartColors.neutral} strokeDasharray="5 5" strokeWidth={1.5} />
          <Bar dataKey="value" name="Steps" radius={[6, 6, 6, 6]} maxBarSize={20} animationDuration={500}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.value >= goal ? (active === i ? seriesActiveColor(7) : seriesColor(7)) : active === i ? chartColors.cursor : chartColors.track}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
