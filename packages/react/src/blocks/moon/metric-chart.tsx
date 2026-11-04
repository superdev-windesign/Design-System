"use client";

import { useState } from "react";
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover as AriaPopover,
  Radio,
  RadioGroup,
  Select,
  SelectValue,
  ToggleButton,
  ToggleButtonGroup,
} from "react-aria-components";
import { RiArrowDownSLine, RiBarChartLine, RiLineChartLine } from "@remixicon/react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard, ChartTooltip, chartColors, describeChange, format, quietAxis, seriesColor } from "../../charts/shared/chart-card";
import { focusRing } from "../../recipes/focus-ring";
import { MENU_ITEM, MENU_ITEM_ACTIVE, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * Metric chart, after Moon's KPI overview: a centred title with the period
 * under it, tiles along the top for each metric's total and change, then the
 * plot, drawn in black against a dashed comparison. The legend under the plot
 * turns the comparison on and off, and the corner switches to bars.
 *
 * Totals, deltas and the screen-reader summary all recompute from the data, so
 * they can't disagree with the plot.
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
  { id: "line", label: "Line chart", icon: RiLineChartLine },
  { id: "bar", label: "Bar chart", icon: RiBarChartLine },
] as const;

const DELTA_TONE = { lime: "text-status-success-text", rose: "text-status-danger-text", neutral: "text-fg-secondary" } as const;

/** A short sample of a line, for the legend. */
const LegendLine = ({ dashed = false }: { dashed?: boolean }) => <span aria-hidden className={cx("w-5 border-t-2", dashed ? "border-dashed border-line-control" : "border-fg")} />;

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

  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];
  if (!metric) return null;

  const pointsFor = (m: MetricChartMetric) => m.points[periodId] ?? [];
  const formatValue = metric.formatValue ?? format.compact;
  const points = pointsFor(metric);
  const { current, previous } = totals(metric, points);
  const hasPrevious = points.some((point) => point.previous !== undefined);
  // Wide enough for the longest label, allowing for the axis rounding up past the data.
  const axisWidth = Math.max(44, (formatValue(Math.max(...points.map((point) => point.value), 0)).length + 1) * 7);
  const period = periods.find((p) => p.id === periodId)?.label ?? periodId;
  const showPrevious = compare && hasPrevious;

  return (
    <ChartCard
      align="center"
      title={title}
      actions={
        <Select aria-label="Period" value={periodId} onChange={(key) => setPeriodId(String(key))}>
          <AriaButton className={cx("flex cursor-pointer items-center gap-1 rounded-control-xs text-body-sm text-fg", focusRing)}>
            <SelectValue />
            <RiArrowDownSLine aria-hidden className="size-4" />
          </AriaButton>
          <AriaPopover className={cx(MENU_POPOVER_SURFACE, "min-w-40 p-1")}>
            <ListBox items={periods} className={cx(MENU_ITEMS_CONTAINER, "outline-none")}>
              {(option) => (
                <ListBoxItem id={option.id} textValue={option.label} className={({ isFocused }) => cx(MENU_ITEM, "px-2 py-1.5 text-body-md", isFocused && MENU_ITEM_ACTIVE)}>
                  {option.label}
                </ListBoxItem>
              )}
            </ListBox>
          </AriaPopover>
        </Select>
      }
      summary={`${metric.label} over ${period}: ${formatValue(current)}${previous !== undefined ? `, against ${formatValue(previous)} the period before` : ""}.`}
      className={cx("relative rounded-panel bg-surface", className)}
      plotClassName="flex flex-col gap-4"
      footer={
        hasPrevious ? (
          <div className="flex flex-wrap items-center justify-center gap-4 text-caption text-fg-secondary">
            <ToggleButton
              isSelected={compare}
              onChange={setCompare}
              className={({ isSelected }) => cx("flex cursor-pointer items-center gap-1.5 rounded-control-xs data-[hovered]:text-fg", !isSelected && "opacity-60", focusRing)}
            >
              <LegendLine dashed />
              Previous period
            </ToggleButton>
            <span className="flex items-center gap-1.5">
              <LegendLine />
              {metric.label}
            </span>
          </div>
        ) : undefined
      }
    >
      <ToggleButtonGroup
        aria-label="Chart type"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[kind]}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (next) setKind(next as "line" | "bar");
        }}
        className="absolute end-3 top-3 flex gap-0.5"
      >
        {KINDS.map(({ id, label, icon: Icon }) => (
          <ToggleButton
            key={id}
            id={id}
            aria-label={label}
            className={cx("flex size-8 cursor-pointer items-center justify-center rounded-control-sm text-icon-tertiary transition-colors data-[hovered]:bg-muted data-[selected]:text-fg", focusRing)}
          >
            <Icon aria-hidden className="size-4.5" />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <RadioGroup aria-label="Metric" orientation="horizontal" value={metric.id} onChange={setMetricId} className="flex flex-wrap gap-2">
        {metrics.map((option) => {
          const figures = totals(option, pointsFor(option));
          const change = figures.previous !== undefined ? describeChange(figures.current, figures.previous, { lowerIsBetter: option.lowerIsBetter }) : undefined;
          return (
            <Radio
              key={option.id}
              value={option.id}
              aria-label={option.label}
              className={({ isSelected }) =>
                cx("flex min-w-36 flex-1 cursor-pointer flex-col gap-0.5 rounded-item bg-canvas p-2.5 ring-1 ring-inset transition-shadow", isSelected ? "ring-line-control" : "ring-transparent data-[hovered]:ring-line", focusRing)
              }
            >
              {({ isSelected }) => (
                <>
                  <span className="flex min-w-0 items-center gap-1.5 text-caption text-fg-secondary">
                    <span aria-hidden className={cx("size-1.5 shrink-0 rounded-full", isSelected ? "bg-fg" : "bg-line-control")} />
                    <span className="truncate">{option.label}</span>
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-title-sm-strong tabular-nums text-fg">{(option.formatValue ?? format.compact)(figures.current)}</span>
                    {change && <span className={cx("text-caption tabular-nums", DELTA_TONE[change.color])}>{change.label}</span>}
                  </span>
                </>
              )}
            </Radio>
          );
        })}
      </RadioGroup>

      <div className="h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={chartColors.grid} />
            <XAxis dataKey="label" {...quietAxis} tickMargin={10} interval="preserveStartEnd" />
            <YAxis {...quietAxis} width={axisWidth} tickCount={4} tickFormatter={(value: number) => formatValue(value)} />
            <Tooltip cursor={{ stroke: chartColors.cursor, strokeDasharray: "4 4" }} content={(props) => <ChartTooltip {...props} formatValue={formatValue} />} />
            {showPrevious && <Line type="monotone" dataKey="previous" name="Previous period" stroke={chartColors.comparison} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />}
            {kind === "line" ? (
              <Line type="monotone" dataKey="value" name={metric.label} stroke={seriesColor(color)} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            ) : (
              <Bar dataKey="value" name={metric.label} fill={seriesColor(color)} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
