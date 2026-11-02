"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChartCard, chartColors, seriesColor } from "../shared/chart-card";
import { cx } from "../../utils/cx";
import { focusRingNative } from "../../recipes/focus-ring";
import { easing } from "../../motion/tokens";

/**
 * Sleep Score: one 0–100 score on an open arc gauge, with the factors behind
 * it as short bars underneath. The arc draws in on mount.
 */

export interface SleepFactor {
  label: string;
  /** Shown value, e.g. "7h 32m". */
  display: string;
  /** 0–1, how close this factor is to ideal. */
  score: number;
}

export const SLEEP_FACTORS: SleepFactor[] = [
  { label: "Duration", display: "7h 32m", score: 0.86 },
  { label: "Deep sleep", display: "1h 41m", score: 0.78 },
  { label: "Consistency", display: "± 18 min", score: 0.9 },
  { label: "Wake-ups", display: "3", score: 0.62 },
];

const RATINGS = [
  { min: 85, label: "Excellent" },
  { min: 70, label: "Good" },
  { min: 50, label: "Fair" },
  { min: 0, label: "Poor" },
];

/** 270° arc, open at the bottom. */
const SWEEP = 270;
const R = 70;
const C = 2 * Math.PI * R;

export interface SleepScoreCardProps {
  score?: number;
  factors?: SleepFactor[];
  title?: string;
  className?: string;
}

export function SleepScoreCard({ score = 82, factors = SLEEP_FACTORS, title = "Sleep score", className }: SleepScoreCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const rating = RATINGS.find((r) => score >= r.min)?.label ?? "";
  const arc = (SWEEP / 360) * C;
  // Hovering or focusing a factor puts it in the gauge and the headline.
  const [focus, setFocus] = useState<number | null>(null);
  const factor = focus !== null ? factors[focus] : undefined;
  const shown = factor ? Math.round(factor.score * 100) : score;

  return (
    <ChartCard
      title={title}
      value={factor ? `${factor.label} · ${factor.display}` : `${score} · ${rating}`}
      valueKey={focus ?? "score"}
      caption={factor ? `${Math.round(factor.score * 100)}% of ideal` : "Last night"}
      summary={`${title} ${score} out of 100, ${rating}. ${factors.map((f) => `${f.label} ${f.display}`).join(", ")}.`}
      plotClassName="h-auto"
      className={className}
    >
      <div className="flex flex-col items-center gap-5 pb-2 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative size-44 shrink-0">
          <svg aria-hidden viewBox="0 0 176 176" className="size-full" style={{ transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }}>
            <circle cx={88} cy={88} r={R} fill="none" stroke={chartColors.track} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${arc} ${C}`} />
            <motion.circle
              cx={88}
              cy={88}
              r={R}
              fill="none"
              stroke={seriesColor(9)}
              strokeWidth={14}
              strokeLinecap="round"
              initial={reduceMotion ? false : { strokeDasharray: `0 ${C}` }}
              animate={{ strokeDasharray: `${arc * (shown / 100)} ${C}` }}
              transition={{ duration: 1.2, ease: easing.enter }}
            />
          </svg>
          <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-display-sm text-fg tabular-nums">{shown}</span>
            <span className="text-body-sm-strong text-fg-secondary">{factor ? factor.label : rating}</span>
          </div>
        </div>

        <dl className="grid w-full grid-cols-1 gap-1" onMouseLeave={() => setFocus(null)}>
          {factors.map((f, i) => (
            <div
              key={f.label}
              tabIndex={0}
              onMouseEnter={() => setFocus(i)}
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus(null)}
              className={cx(
                "flex flex-col gap-1.5 rounded-lg px-2 py-1 transition-opacity duration-(--ds-motion-duration-base)",
                focus !== null && focus !== i && "opacity-45",
                focusRingNative,
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-body-sm-strong text-fg-secondary">{f.label}</dt>
                <dd className="text-body-md-strong text-fg tabular-nums">{f.display}</dd>
              </div>
              <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-chart-track">
                <motion.div
                  className="h-full origin-left rounded-full bg-chart-9 rtl:origin-right"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={{ scaleX: f.score }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: easing.enter }}
                />
              </div>
            </div>
          ))}
        </dl>
      </div>
    </ChartCard>
  );
}
