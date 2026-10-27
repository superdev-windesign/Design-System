"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { useNumberFormatter } from "react-aria";
import { motion, useReducedMotion } from "motion/react";
import { RiArrowRightDownLine, RiArrowRightUpLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { easing, layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/* -------------------------------------------------------------------------- */
/*                               AnimatedNumber                               */
/* -------------------------------------------------------------------------- */

export interface AnimatedNumberProps {
  value: number;
  /** Intl.NumberFormat options, e.g. `{ style: "currency", currency: "USD" }`. */
  format?: Intl.NumberFormatOptions;
  className?: string;
}

/**
 * A number whose digits roll like an odometer when it changes (and count up
 * from zero on first render). Screen readers get the formatted value once;
 * the rolling strips are hidden from them.
 */
export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const formatter = useNumberFormatter(format);
  const reduceMotion = useReducedMotion() ?? false;
  const text = formatter.format(value);
  const chars = [...text];

  return (
    <span className={cx("inline-flex tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((char, i) => {
          // Key from the right so the ones digit keeps its column as digits are added.
          const place = chars.length - i;
          return /\d/.test(char) ? (
            <Digit key={`d${place}`} digit={Number(char)} place={place} reduceMotion={reduceMotion} />
          ) : (
            <span key={`c${place}${char}`}>{char}</span>
          );
        })}
      </span>
    </span>
  );
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ digit, place, reduceMotion }: { digit: number; place: number; reduceMotion: boolean }) {
  return (
    <span className="relative inline-block overflow-hidden">
      {/* Invisible glyph sizes the column to exactly one tabular digit. */}
      <span className="invisible">0</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={reduceMotion ? false : { y: "0%" }}
        animate={{ y: `${-digit * 10}%` }}
        // Higher places settle a beat later, like a mechanical counter.
        transition={reduceMotion ? { duration: 0 } : { ...layoutSpring, delay: Math.min(place, 6) * 0.03 }}
      >
        {DIGITS.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </motion.span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Sparkline                                 */
/* -------------------------------------------------------------------------- */

export interface SparklineProps {
  data: number[];
  /** Index of the highlighted point, if any. */
  activeIndex?: number | null;
  /** Pointer scrubbing: called with the nearest point's index, or null on leave. */
  onScrub?: (index: number | null) => void;
  /** Text alternative. Defaults to a summary of the range. */
  "aria-label"?: string;
  className?: string;
}

/** Smooth path through the points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * A small trend line that draws itself in, with a soft fill underneath.
 * Drawn in real pixels (measured), so the stroke stays crisp at any width.
 */
export function Sparkline({ data, activeIndex = null, onScrub, "aria-label": ariaLabel, className }: SparklineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const gradientId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const formatter = useNumberFormatter({ notation: "compact", maximumFractionDigits: 1 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const points = useMemo<[number, number][]>(() => {
    const { width, height } = size;
    if (!width || data.length < 2) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = 3; // keeps the stroke and marker inside the box
    return data.map((v, i) => [
      (i / (data.length - 1)) * width,
      height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2),
    ]);
  }, [data, size]);

  const line = smoothPath(points);
  const area = line && `${line} L${size.width},${size.height} L0,${size.height} Z`;
  const active = activeIndex != null ? points[activeIndex] : undefined;

  const label =
    ariaLabel ??
    (data.length
      ? `Trend over ${data.length} periods, from ${formatter.format(data[0]!)} to ${formatter.format(data[data.length - 1]!)}`
      : "No data");

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!onScrub || data.length < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    // Pixel space is left-to-right even in RTL, matching how the line is drawn.
    onScrub(Math.round(ratio * (data.length - 1)));
  };

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      className={cx("block h-12 w-full touch-pan-y overflow-visible text-accent-500", className)}
      viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={() => onScrub?.(null)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      {line && (
        <>
          <motion.path
            d={area}
            fill={`url(#${gradientId})`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.45, ease: easing.standard }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: easing.enter }}
          />
        </>
      )}
      {active && (
        <g aria-hidden>
          <line x1={active[0]} x2={active[0]} y1={0} y2={size.height} className="stroke-line" strokeDasharray="2 3" />
          <circle cx={active[0]} cy={active[1]} r={4} className="fill-surface" stroke="currentColor" strokeWidth={2} />
        </g>
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  StatCard                                  */
/* -------------------------------------------------------------------------- */

export interface StatCardProps {
  label: string;
  value: number;
  /** How to format `value` (and scrubbed sparkline points). */
  format?: Intl.NumberFormatOptions;
  /** Change as a fraction, e.g. `0.124` for +12.4%. */
  change?: number;
  /** Set when a fall is good news (churn, latency, costs) so colors flip. */
  invertTrend?: boolean;
  /** What the change compares against, e.g. "vs last month". */
  comparison?: string;
  icon?: IconComponent;
  /** History for the sparkline. Hovering it shows each point's value. */
  data?: number[];
  /** Labels for `data` points, shown while scrubbing. */
  dataLabels?: string[];
  footer?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  format,
  change,
  invertTrend = false,
  comparison,
  icon: Icon,
  data,
  dataLabels,
  footer,
  className,
}: StatCardProps) {
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const percent = useNumberFormatter({ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" });
  const labelId = useId();

  const scrubbed = scrubIndex != null && data ? data[scrubIndex] : undefined;
  const shown = scrubbed ?? value;
  const isUp = (change ?? 0) > 0;
  const isGood = change === undefined || change === 0 ? null : isUp !== invertTrend;
  const TrendIcon = isUp ? RiArrowRightUpLine : RiArrowRightDownLine;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={cx("flex flex-col gap-3 rounded-surface border border-line bg-surface p-4 shadow-raised", className)}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-control-sm bg-muted">
            <Icon aria-hidden className="size-4 text-icon-secondary" />
          </span>
        )}
        <span id={labelId} className="min-w-0 flex-1 truncate text-body-md-strong text-fg-secondary">
          {label}
        </span>
        {change !== undefined && (
          <span
            className={cx(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full py-0.5 ps-1.5 pe-2 text-caption-strong tabular-nums",
              isGood === null && "bg-muted text-fg-secondary",
              isGood === true && "bg-status-success text-status-success-text",
              isGood === false && "bg-status-danger text-status-danger-text",
            )}
          >
            {change !== 0 && <TrendIcon aria-hidden className="size-3.5" />}
            <span className="sr-only">{isUp ? "Up" : change === 0 ? "No change" : "Down"} </span>
            {percent.format(change)}
            {comparison && <span className="sr-only"> {comparison}</span>}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <AnimatedNumber value={shown} format={format} className="text-display-sm text-fg" />
        <span className="min-h-5 text-body-sm text-fg-secondary">
          {scrubIndex != null ? (dataLabels?.[scrubIndex] ?? `Point ${scrubIndex + 1} of ${data?.length ?? 0}`) : comparison}
        </span>
      </div>

      {data && data.length > 1 && <Sparkline data={data} activeIndex={scrubIndex} onScrub={setScrubIndex} />}
      {footer}
    </div>
  );
}
