"use client";

import { useState } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, ChartToggle, ChartTooltip, chartColors, describeChange, format, quietAxis, seriesColor } from "../../charts/shared/chart-card";
import { Switch } from "../../components/switch/switch";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Metric chart: one card for several metrics. Pick a metric from the tiles
 * under the plot (each shows its total and change), then choose the period,
 * line or bars, and whether to compare against the period before.
 *
 * The headline follows the pointer, so reading a point doesn't mean chasing a
 * tooltip. Totals, deltas and the screen-reader summary all recompute from the
 * data, so they can't disagree with the plot.
 */

export interface MetricPoint {
  label: string;
  value: number;
  /** The same point in the period before, drawn when comparing. */
  previous?: number;
}

export interface MetricChartMetric {
  id: string;
  label: string;
  /** Points per period, keyed by a `periods` id. */
  points: Record<string, MetricPoint[]>;
  /** Formats values. Default: a compact number. */
  formatValue?: (value: number) => string;
  /** Lower is better (refunds, churn): flips the delta colours. */
  lowerIsBetter?: boolean;
  /** Add the points up for the total (default), or show their average, for rates. */
  aggregate?: "sum" | "average";
}

export interface MetricChartProps {
  title?: string;
  metrics: MetricChartMetric[];
  periods: { id: string; label: string }[];
  defaultMetric?: string;
  defaultPeriod?: string;
  defaultKind?: "line" | "bar";
  defaultCompare?: boolean;
  /** Series colour from the chart palette, 1–9. Default 1. */
  color?: number;
  className?: string;
}

const KINDS = [
  { id: "line", label: "Line" },
  { id: "bar", label: "Bars" },
] as const;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** The figure a set of points comes to, and the same for the period before, if it was recorded. */
function totals(metric: MetricChartMetric, points: MetricPoint[]) {
  const reduce = (values: number[]) => (metric.aggregate === "average" ? sum(values) / Math.max(values.length, 1) : sum(values));
  const before = points.flatMap((point) => (point.previous === undefined ? [] : [point.previous]));
  return { current: reduce(points.map((point) => point.value)), previous: before.length > 0 ? reduce(before) : undefined };
}

export function MetricChart({
  title = "Performance",
  metrics,
  periods,
  defaultMetric,
  defaultPeriod,
  defaultKind = "line",
  defaultCompare = true,
  color = 1,
  className,
}: MetricChartProps) {
  const [metricId, setMetricId] = useState(defaultMetric ?? metrics[0]?.id ?? "");
  const [periodId, setPeriodId] = useState(defaultPeriod ?? periods[0]?.id ?? "");
  const [kind, setKind] = useState<"line" | "bar">(defaultKind);
  const [compare, setCompare] = useState(defaultCompare);
  const [active, setActive] = useState<number | null>(null);

  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];
  if (!metric) return null;

  const pointsFor = (m: MetricChartMetric) => m.points[periodId] ?? [];
  const formatValue = metric.formatValue ?? format.compact;
  const points = pointsFor(metric);
  const { current, previous } = totals(metric, points);
  const hovered = active !== null ? points[active] : undefined;
  const hasPrevious = points.some((point) => point.previous !== undefined);
  // Wide enough for the longest label, allowing for the axis rounding up past the data.
  const axisWidth = Math.max(44, (formatValue(Math.max(...points.map((point) => point.value), 0)).length + 1) * 7);
  const period = periods.find((p) => p.id === periodId)?.label ?? periodId;
  const showPrevious = compare && hasPrevious;

  return (
    <ChartCard
      title={hovered ? hovered.label : `${title}: ${metric.label}`}
      value={formatValue(hovered?.value ?? current)}
      valueKey={active ?? `${metricId}-${periodId}`}
      delta={previous !== undefined && !hovered ? describeChange(current, previous, { lowerIsBetter: metric.lowerIsBetter }) : undefined}
      caption={hovered ? metric.label : `Over ${period}`}
      actions={
        <div className="flex flex-wrap justify-end gap-2">
          <ChartToggle label="Period" value={periodId} onChange={setPeriodId} options={periods} />
          <ChartToggle label="Chart type" value={kind} onChange={setKind} options={KINDS} />
        </div>
      }
      summary={`${metric.label} over ${period}: ${formatValue(current)}${previous !== undefined ? `, against ${formatValue(previous)} the period before` : ""}.`}
      className={className}
      footer={
        <div className="flex flex-col gap-3">
          <RadioGroup aria-label="Metric" orientation="horizontal" value={metric.id} onChange={setMetricId} className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {metrics.map((option) => {
              const figures = totals(option, pointsFor(option));
              return (
                <Radio
                  key={option.id}
                  value={option.id}
                  aria-label={option.label}
                  className={({ isSelected }) =>
                    cx(
                      "flex cursor-pointer flex-col gap-0.5 rounded-control-md border p-2.5 transition-colors",
                      isSelected ? "border-accent-600 bg-surface" : "border-transparent bg-surface data-[hovered]:border-line-control-hover",
                      focusRing,
                    )
                  }
                >
                  <span className="truncate text-caption text-fg-secondary">{option.label}</span>
                  <span className="text-body-md-strong tabular-nums text-fg">{(option.formatValue ?? format.compact)(figures.current)}</span>
                </Radio>
              );
            })}
          </RadioGroup>
          {hasPrevious && (
            <Switch size="sm" isSelected={compare} onChange={setCompare}>
              Compare to the period before
            </Switch>
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={points}
          margin={{ top: 6, right: 6, bottom: 0, left: 0 }}
          onMouseMove={(state) => {
            const index = Number(state?.activeTooltipIndex);
            setActive(state?.isTooltipActive && Number.isFinite(index) ? index : null);
          }}
          onMouseLeave={() => setActive(null)}
        >
          <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" {...quietAxis} tickMargin={10} interval="preserveStartEnd" />
          <YAxis {...quietAxis} width={axisWidth} tickCount={4} tickFormatter={(value: number) => formatValue(value)} />
          <Tooltip cursor={{ stroke: chartColors.cursor, strokeDasharray: "4 4" }} content={(props) => <ChartTooltip {...props} formatValue={formatValue} />} />
          {showPrevious && <Line type="monotone" dataKey="previous" name="Period before" stroke={chartColors.comparison} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />}
          {kind === "line" ? (
            <Line type="monotone" dataKey="value" name={metric.label} stroke={seriesColor(color)} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          ) : (
            <Bar dataKey="value" name={metric.label} fill={seriesColor(color)} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
