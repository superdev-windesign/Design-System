"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChartToggle, ChartCard, format, seriesColor } from "../shared/chart-card";
import { easing } from "../../motion/tokens";

/**
 * Funnel Chart: people moving through ordered stages, left to right. Each
 * stage is a column sized by its count; a tapered band carries the flow to
 * the next stage, with the step's conversion in a pill above it. Hovering a
 * stage puts its numbers in the header.
 */

export interface FunnelStage {
  label: string;
  value: number;
}

export const FUNNEL_DATA: FunnelStage[] = [
  { label: "Visited", value: 48200 },
  { label: "Signed up", value: 9640 },
  { label: "Activated", value: 5310 },
  { label: "Subscribed", value: 1870 },
];

const PLOT_HEIGHT = 200;
const COLUMN = 0.34; // share of each slot taken by the column; the rest is the band

export interface FunnelChartCardProps {
  data?: FunnelStage[];
  title?: string;
  /** Chart palette index, 1–9. */
  color?: number;
  /** `flow` (default) joins the stages with tapered bands; `bars` stands them on a baseline. */
  defaultShape?: "flow" | "bars";
  className?: string;
}

const SHAPES = [
  { id: "flow", label: "Flow" },
  { id: "bars", label: "Bars" },
] as const;

export function FunnelChartCard({ data = FUNNEL_DATA, title = "Checkout funnel", color = 6, defaultShape = "flow", className }: FunnelChartCardProps) {
  const [shape, setShape] = useState<"flow" | "bars">(defaultShape);
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const top = data[0]?.value ?? 1;
  const overall = (data[data.length - 1]?.value ?? 0) / top;
  const slot = width / Math.max(1, data.length);
  const col = slot * COLUMN;
  const h = (v: number) => Math.max(6, (v / top) * PLOT_HEIGHT);
  const stage = active !== null ? data[active] : undefined;

  return (
    <ChartCard
      title={stage ? stage.label : title}
      value={stage ? format.number(stage.value) : format.percent(overall)}
      valueKey={active ?? "all"}
      caption={
        stage
          ? `${format.percent(stage.value / top)} of ${data[0]?.label.toLowerCase()}`
          : `End to end, ${format.number(top)} → ${format.number(data[data.length - 1]?.value ?? 0)}`
      }
      actions={<ChartToggle label="Shape" value={shape} onChange={setShape} options={SHAPES} />}
      summary={`${title}: ${data.map((s) => `${s.label} ${format.number(s.value)}`).join(", ")}. ${format.percent(overall)} convert end to end.`}
      plotClassName="h-auto"
      className={className}
    >
      <div ref={ref} className="relative w-full" style={{ height: PLOT_HEIGHT + 56 }} onMouseLeave={() => setActive(null)}>
        {width > 0 && (
          <svg aria-hidden width={width} height={PLOT_HEIGHT} className="absolute top-8 left-0 overflow-visible">
            {data.map((s, i) => {
              const x = i * slot + (slot - col) / 2;
              const height = h(s.value);
              // Flow centres each column on the axis; bars stand them on the baseline.
              const y = shape === "bars" ? PLOT_HEIGHT - height : (PLOT_HEIGHT - height) / 2;
              const next = data[i + 1];
              const nh = next ? h(next.value) : 0;
              const ny = (PLOT_HEIGHT - nh) / 2;
              const nx = (i + 1) * slot + (slot - col) / 2;
              const mid = (x + col + nx) / 2;
              const dim = active !== null && active !== i;
              return (
                <g key={s.label} onMouseEnter={() => setActive(i)} className="cursor-default">
                  {next && shape === "flow" && (
                    <motion.path
                      d={`M${x + col},${y} C${mid},${y} ${mid},${ny} ${nx},${ny} L${nx},${ny + nh} C${mid},${ny + nh} ${mid},${y + height} ${x + col},${y + height} Z`}
                      fill={seriesColor(color)}
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: dim ? 0.08 : 0.2 }}
                      transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.25 + i * 0.1 }}
                    />
                  )}
                  <motion.rect
                    x={x}
                    width={col}
                    rx={8}
                    fill={seriesColor(color)}
                    initial={reduceMotion ? false : { y: PLOT_HEIGHT / 2, height: 0 }}
                    animate={{ y, height, opacity: dim ? 0.45 : 1 }}
                    transition={{ duration: 0.7, delay: reduceMotion ? 0 : i * 0.1, ease: easing.enter }}
                  />
                </g>
              );
            })}
          </svg>
        )}
        {/* Labels and conversion pills are HTML so they wrap and scale with text settings. */}
        {data.map((s, i) => {
          const next = data[i + 1];
          return (
            <div key={s.label} aria-hidden>
              <span
                className="absolute bottom-0 -translate-x-1/2 text-center text-body-sm-strong whitespace-nowrap text-fg-secondary"
                style={{ left: i * slot + slot / 2 }}
              >
                {s.label}
              </span>
              {next && (
                <span
                  className="absolute top-0 -translate-x-1/2 rounded-full bg-surface px-2 py-0.5 text-caption-strong text-fg shadow-hairline tabular-nums"
                  style={{ left: (i + 1) * slot }}
                >
                  {format.percent(next.value / s.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
