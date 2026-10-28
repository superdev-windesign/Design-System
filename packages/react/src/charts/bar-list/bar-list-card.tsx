"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChartCard, ChartToggle, format } from "../shared/chart-card";
import { easing } from "../../motion/tokens";

/**
 * Bar List: a ranked breakdown where each row's bar shows its share of the
 * largest row. Tabs switch between breakdowns of the same total.
 */

export interface BarListRow {
  label: string;
  value: number;
}

export const BAR_LIST_DATA: Record<string, { label: string; rows: BarListRow[] }> = {
  pages: {
    label: "Pages",
    rows: [
      { label: "/pricing", value: 18420 },
      { label: "/docs/getting-started", value: 12960 },
      { label: "/blog/release-notes", value: 8310 },
      { label: "/changelog", value: 5240 },
      { label: "/integrations", value: 3170 },
    ],
  },
  referrers: {
    label: "Referrers",
    rows: [
      { label: "Search", value: 21300 },
      { label: "Newsletter", value: 9870 },
      { label: "Community forum", value: 7420 },
      { label: "Partner sites", value: 4810 },
      { label: "Social", value: 4700 },
    ],
  },
  countries: {
    label: "Countries",
    rows: [
      { label: "United States", value: 16900 },
      { label: "Germany", value: 8120 },
      { label: "India", value: 7980 },
      { label: "Brazil", value: 5340 },
      { label: "Japan", value: 4110 },
    ],
  },
};

export interface BarListCardProps {
  data?: typeof BAR_LIST_DATA;
  title?: string;
  /** Chart palette swatch class for the bars. */
  barClassName?: string;
  className?: string;
}

export function BarListCard({ data = BAR_LIST_DATA, title = "Top sources", barClassName = "bg-chart-4/35", className }: BarListCardProps) {
  const keys = Object.keys(data);
  const [tab, setTab] = useState(keys[0] ?? "");
  const reduceMotion = useReducedMotion() ?? false;
  const rows = data[tab]?.rows ?? [];
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <ChartCard
      title={title}
      value={format.number(total)}
      valueKey={tab}
      caption={`Visits from the top ${rows.length} ${data[tab]?.label.toLowerCase()}`}
      actions={<ChartToggle label="Breakdown" value={tab} onChange={setTab} options={keys.map((k) => ({ id: k, label: data[k]!.label }))} />}
      summary={`${title} by ${data[tab]?.label.toLowerCase()}: ${rows.map((r) => `${r.label} ${format.number(r.value)}`).join(", ")}.`}
      plotClassName="h-auto"
      className={className}
    >
      <ol className="flex flex-col gap-1.5 pb-1">
        {rows.map((row, i) => (
          <li key={`${tab}-${row.label}`} className="relative flex h-9 items-center justify-between gap-4 overflow-hidden rounded-lg px-3">
            <motion.span
              aria-hidden
              className={`absolute inset-y-0 start-0 rounded-lg ${barClassName}`}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${(row.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: easing.enter }}
            />
            <span className="relative truncate text-body-md-strong text-fg">{row.label}</span>
            <span className="relative shrink-0 text-body-md text-fg-secondary tabular-nums">
              <span className="text-fg">{format.number(row.value)}</span>
              <span className="ms-2">{format.percent(row.value / total)}</span>
            </span>
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
