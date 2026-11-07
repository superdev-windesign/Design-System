"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Chip } from "../../components/badges/chip";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { cx } from "../../utils/cx";

/**
 * Shared pieces for the chart cards: the card shell, legend, tooltip, palette
 * and number formatting. Every card is the same sunken panel with a header
 * (label, headline figure, delta chip), optional legend or controls on the
 * end side, and the plot below, so cards line up in any dashboard row.
 */

/* -------------------------------------------------------------------------- */
/*                                   Palette                                  */
/* -------------------------------------------------------------------------- */

/** Categorical series colour `n` (1–9) as a CSS variable, for SVG fill/stroke. */
export const seriesColor = (n: number) => `var(--ds-color-chart-${((n - 1) % 9) + 1})`;
/** The hover / emphasis shade of series `n`. */
export const seriesActiveColor = (n: number) => `var(--ds-color-chart-${((n - 1) % 9) + 1}-active)`;

export const chartColors = {
  track: "var(--ds-color-chart-track)",
  cursor: "var(--ds-color-chart-cursor)",
  neutral: "var(--ds-color-chart-neutral)",
  /** A line that has to stay readable beside a series: `neutral` is too quiet for one. */
  comparison: "var(--ds-color-border-control)",
  grid: "var(--ds-color-border-default)",
  surface: "var(--ds-color-bg-sunken)",
} as const;

/** Swatch classes for legends. Literal strings so Tailwind generates them. */
export const SERIES_SWATCH = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
  "bg-chart-9",
] as const;

/**
 * Six steps from faint to full for each series colour, for grids that shade by
 * value (heatmaps, contribution calendars). `SERIES_RAMP[n - 1]` is series n.
 * Literal strings so Tailwind generates them.
 */
export const SERIES_RAMP = [
  ["bg-chart-1/15", "bg-chart-1/30", "bg-chart-1/50", "bg-chart-1/70", "bg-chart-1/85", "bg-chart-1-active"],
  ["bg-chart-2/15", "bg-chart-2/30", "bg-chart-2/50", "bg-chart-2/70", "bg-chart-2/85", "bg-chart-2-active"],
  ["bg-chart-3/15", "bg-chart-3/30", "bg-chart-3/50", "bg-chart-3/70", "bg-chart-3/85", "bg-chart-3-active"],
  ["bg-chart-4/15", "bg-chart-4/30", "bg-chart-4/50", "bg-chart-4/70", "bg-chart-4/85", "bg-chart-4-active"],
  ["bg-chart-5/15", "bg-chart-5/30", "bg-chart-5/50", "bg-chart-5/70", "bg-chart-5/85", "bg-chart-5-active"],
  ["bg-chart-6/15", "bg-chart-6/30", "bg-chart-6/50", "bg-chart-6/70", "bg-chart-6/85", "bg-chart-6-active"],
  ["bg-chart-7/15", "bg-chart-7/30", "bg-chart-7/50", "bg-chart-7/70", "bg-chart-7/85", "bg-chart-7-active"],
  ["bg-chart-8/15", "bg-chart-8/30", "bg-chart-8/50", "bg-chart-8/70", "bg-chart-8/85", "bg-chart-8-active"],
  ["bg-chart-9/15", "bg-chart-9/30", "bg-chart-9/50", "bg-chart-9/70", "bg-chart-9/85", "bg-chart-9-active"],
] as const;

/** A row of small stat tiles for a chart's footer. */
export function ChartTiles({ tiles, className }: { tiles: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cx("grid gap-2", className)} style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
      {tiles.map((t) => (
        <div key={t.label} className="flex min-w-0 flex-col gap-0.5 rounded-xl bg-surface px-3 py-2">
          <dt className="truncate text-caption-strong text-fg-secondary">{t.label}</dt>
          <dd className="truncate text-body-md-strong text-fg tabular-nums">{t.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Formatting                                 */
/* -------------------------------------------------------------------------- */

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

export const format = {
  compact: (n: number) => compact.format(n),
  number: (n: number) => whole.format(n),
  money: (n: number) => money.format(n),
  /** `0.124` → "12.4%". */
  percent: (n: number) => pct.format(n),
};

/** Change from `previous` to `current`, as a chip-ready label and tone. */
export function describeChange(current: number, previous: number, { lowerIsBetter = false } = {}) {
  if (!previous) return { label: "New", color: "neutral" as const };
  const change = (current - previous) / previous;
  const rounded = Math.round(change * 1000) / 10;
  if (rounded === 0) return { label: "0%", color: "neutral" as const };
  const good = rounded > 0 !== lowerIsBetter;
  return { label: `${rounded > 0 ? "+" : ""}${rounded}%`, color: good ? ("lime" as const) : ("rose" as const) };
}

/* -------------------------------------------------------------------------- */
/*                                   Legend                                   */
/* -------------------------------------------------------------------------- */

export interface LegendItem {
  label: string;
  /** A swatch class, e.g. `SERIES_SWATCH[0]` or `"bg-chart-neutral"`. */
  swatch: string;
  /** Draw the swatch as a short dash, for dashed comparison lines. */
  dashed?: boolean;
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cx("flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm-strong text-fg-secondary", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden className={cx(item.dashed ? "h-0.5 w-3 rounded-full" : "size-2 rounded-full", item.swatch)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Card shell                                */
/* -------------------------------------------------------------------------- */

export interface ChartCardProps {
  /** Label over the headline; swaps to the hovered point's label in most cards. */
  title: ReactNode;
  /** Headline figure. Re-keyed on change so it fades in. */
  value?: ReactNode;
  /** Changes when the headline does, to replay the fade. */
  valueKey?: string | number;
  delta?: { label: string; color: "lime" | "rose" | "neutral" };
  /** Line under the headline, e.g. "vs last month". */
  caption?: ReactNode;
  legend?: LegendItem[];
  /** Controls on the end side of the header (segmented control, tabs). */
  actions?: ReactNode;
  /**
   * Text alternative for the plot: the trend and the notable values, so the
   * card makes sense without seeing the chart.
   */
  summary: string;
  children: ReactNode;
  className?: string;
  /** Height class for the plot area. */
  plotClassName?: string;
  /** Under the plot: stat tiles, a note, a link. */
  footer?: ReactNode;
  /** Centres the header, with `actions` under the title. */
  align?: "start" | "center";
}

export function ChartCard({
  title,
  value,
  valueKey,
  delta,
  caption,
  legend,
  actions,
  summary,
  children,
  className,
  plotClassName = "h-56",
  footer,
  align = "start",
}: ChartCardProps) {
  const titleId = useId();
  const summaryId = useId();
  return (
    <div
      role="figure"
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className={cx("bui-chart-card flex min-w-0 flex-col gap-5 rounded-2xl bg-sunken px-4 pt-4 pb-3", className)}
    >
      <div className={cx("flex flex-wrap items-start justify-between gap-x-4 gap-y-3", align === "center" && "flex-col items-center gap-y-1 px-16 text-center")}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p id={titleId} className={align === "center" ? "text-title-sm-strong text-fg" : "text-body-md-strong text-fg-secondary"}>
            {title}
          </p>
          {value !== undefined && (
            <div className="flex flex-wrap items-center gap-2">
              <p key={valueKey} className="animate-number-fade text-title-lg-strong whitespace-nowrap text-fg tabular-nums">
                {value}
              </p>
              {delta && (
                <Chip variant="bold" color={delta.color}>
                  {delta.label}
                </Chip>
              )}
            </div>
          )}
          {caption && <p className="text-body-sm text-fg-secondary tabular-nums">{caption}</p>}
        </div>
        {(legend || actions) && (
          <div className="flex flex-wrap items-center gap-3">
            {legend && <ChartLegend items={legend} />}
            {actions}
          </div>
        )}
      </div>
      <div className={cx("min-h-0 w-full", plotClassName)}>{children}</div>
      {footer}
      <p id={summaryId} className="sr-only">
        {summary}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Tooltip                                  */
/* -------------------------------------------------------------------------- */

/** The parts of recharts' tooltip content props the body reads. */
export interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: unknown; value?: unknown; color?: string; dataKey?: unknown }>;
  label?: unknown;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string | number) => ReactNode;
}

/**
 * Tooltip body for recharts' `<Tooltip content={…}>`: the point's label, then
 * one row per series with its swatch and formatted value.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatValue = format.number,
  formatLabel,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="flex min-w-36 flex-col gap-1.5 rounded-xl border glass-panel px-3 py-2 shadow-overlay">
      {(typeof label === "string" || typeof label === "number") && (
        <p className="text-body-sm-strong text-fg">{formatLabel ? formatLabel(label) : label}</p>
      )}
      {payload.map((entry) => (
        <div key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2 text-body-sm">
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: entry.color }} />
          <span className="text-fg-secondary">{String(entry.name ?? "")}</span>
          <span className="ms-auto ps-3 text-fg tabular-nums">{formatValue(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

/** Props for an axis that sits quietly: no lines, ticks styled in CSS. */
export const quietAxis = { tickLine: false, axisLine: false } as const;

/* -------------------------------------------------------------------------- */
/*                                   Toggle                                   */
/* -------------------------------------------------------------------------- */

/** Single-choice view switch for a card header (Stacked / Overlap, 6M / 12M, …). */
export function ChartToggle<K extends string>({
  label,
  value,
  onChange,
  options,
}: {
  /** Accessible name for the group. */
  label: string;
  value: K;
  onChange: (value: K) => void;
  options: readonly { id: K; label: string }[];
}) {
  return (
    <SegmentedControl
      aria-label={label}
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next !== undefined) onChange(next as K);
      }}
    >
      {options.map((option) => (
        <SegmentedControlItem key={option.id} id={option.id}>
          {option.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
