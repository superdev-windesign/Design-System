"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChartCard, format } from "../shared/chart-card";
import { easing } from "../../motion/tokens";

/**
 * Stage Bars: a pipeline's stages as rounded pills, each as long as its share
 * of the first stage, with the step-to-step pass rate beside it. The pills
 * grow in one after another.
 */

export interface Stage {
  label: string;
  value: number;
}

export const STAGE_DATA: Stage[] = [
  { label: "Applied", value: 486 },
  { label: "Screened", value: 212 },
  { label: "Interviewed", value: 94 },
  { label: "Offered", value: 21 },
  { label: "Hired", value: 14 },
];

/** Pill fills from strongest to faintest, so later stages read as narrower in tone too. */
const FILLS = ["bg-chart-5", "bg-chart-5/80", "bg-chart-5/65", "bg-chart-5/50", "bg-chart-5/40"] as const;

export interface StageBarsCardProps {
  data?: Stage[];
  title?: string;
  className?: string;
}

export function StageBarsCard({ data = STAGE_DATA, title = "Hiring pipeline", className }: StageBarsCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const first = data[0]?.value ?? 1;
  const last = data[data.length - 1]?.value ?? 0;

  return (
    <ChartCard
      title={title}
      value={format.number(last)}
      caption={`${format.percent(last / first)} of ${format.number(first)} ${data[0]?.label.toLowerCase()}`}
      summary={`${title}: ${data.map((s) => `${s.label} ${s.value}`).join(", ")}.`}
      plotClassName="h-auto"
      className={className}
    >
      <ol className="flex flex-col gap-2.5 pb-1">
        {data.map((stage, i) => {
          const prev = data[i - 1];
          return (
            <li key={stage.label} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3">
              <span className="truncate text-body-sm-strong text-fg-secondary">{stage.label}</span>
              <div className="h-7">
                <motion.div
                  className={`flex h-full min-w-10 items-center justify-end rounded-full pe-2.5 ${FILLS[Math.min(i, FILLS.length - 1)]}`}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${Math.max(8, (stage.value / first) * 100)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: easing.enter }}
                >
                  <span className="text-caption-strong text-fg tabular-nums">{format.number(stage.value)}</span>
                </motion.div>
              </div>
              <span className="text-end text-body-sm text-fg-secondary tabular-nums">{prev ? format.percent(stage.value / prev.value) : "—"}</span>
            </li>
          );
        })}
      </ol>
    </ChartCard>
  );
}
