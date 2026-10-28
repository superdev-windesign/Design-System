"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChartCard, format, seriesColor } from "../shared/chart-card";
import { easing } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Activity Rings: progress towards a few daily goals as concentric rings.
 * Rings draw in on mount; hovering or focusing a goal in the list brings its
 * ring forward and shows its numbers in the centre.
 */

export interface RingGoal {
  label: string;
  value: number;
  goal: number;
  unit: string;
  /** Chart palette index, 1–9. */
  color: number;
}

export const RING_GOALS: RingGoal[] = [
  { label: "Steps", value: 7840, goal: 10000, unit: "steps", color: 3 },
  { label: "Active minutes", value: 38, goal: 45, unit: "min", color: 2 },
  { label: "Water", value: 1.6, goal: 2.5, unit: "L", color: 4 },
];

const SIZE = 168;
const STROKE = 16;
const GAP = 4;

export interface ActivityRingsCardProps {
  goals?: RingGoal[];
  title?: string;
  className?: string;
}

export function ActivityRingsCard({ goals = RING_GOALS, title = "Today's goals", className }: ActivityRingsCardProps) {
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const overall = goals.reduce((s, g) => s + Math.min(1, g.value / g.goal), 0) / Math.max(1, goals.length);
  const focused = active !== null ? goals[active] : undefined;

  return (
    <ChartCard
      title={title}
      value={format.percent(overall)}
      caption={`Average progress across ${goals.length} goals`}
      summary={`${title}: ${goals.map((g) => `${g.label} ${g.value} of ${g.goal} ${g.unit}`).join(", ")}.`}
      plotClassName="h-auto"
      className={className}
    >
      <div className="flex flex-col items-center gap-5 pb-2 sm:flex-row sm:gap-8">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90">
            {goals.map((g, i) => {
              const r = SIZE / 2 - STROKE / 2 - i * (STROKE + GAP);
              const progress = Math.min(1, g.value / g.goal);
              const dim = active !== null && active !== i;
              return (
                <g key={g.label} className="transition-opacity duration-(--ds-motion-duration-moderate)" opacity={dim ? 0.35 : 1}>
                  <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke={seriesColor(g.color)} strokeOpacity={0.18} strokeWidth={STROKE} />
                  <motion.circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={r}
                    fill="none"
                    stroke={seriesColor(g.color)}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: progress }}
                    transition={{ duration: 1.1, delay: i * 0.12, ease: easing.enter }}
                  />
                </g>
              );
            })}
          </svg>
          <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span key={active ?? "all"} className="animate-number-fade text-title-md-strong text-fg tabular-nums">
              {focused ? format.percent(Math.min(1, focused.value / focused.goal)) : format.percent(overall)}
            </span>
            <span className="text-body-sm text-fg-secondary">{focused ? focused.label : "overall"}</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-1">
          {goals.map((g, i) => (
            <li
              key={g.label}
              tabIndex={0}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={cx(
                "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
                focusRingNative,
                active === i && "bg-surface",
              )}
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: seriesColor(g.color) }} />
              <span className="flex-1 text-body-md-strong text-fg">{g.label}</span>
              <span className="text-body-md text-fg-secondary tabular-nums">
                <span className="text-fg">{format.number(g.value)}</span> / {format.number(g.goal)} {g.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
