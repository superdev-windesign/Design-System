"use client";

import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * Glass dial: a value set by turning, on a disc of glass. A ring of ticks fills
 * with light up to the knob, and the reading stays large in the middle. It suits
 * something physical, like a thermostat or a volume.
 *
 * The dial is drawn, but the control is a real range input hidden over it, so
 * the keyboard, screen readers and touch assistive tech all get a slider. The
 * pointer is an extra way in: press or drag anywhere on the disc. The gap at the
 * bottom is out of range, and dragging into it holds at the nearer end.
 */

const SWEEP = 270;
const START = -135;
const TICKS = 61;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** The knob's angle for a value, clockwise from the top. */
export function dialAngle(value: number, min: number, max: number) {
  return START + ((clamp(value, min, max) - min) / (max - min)) * SWEEP;
}

/** The value at an angle, snapped to `step`. Angles in the gap go to the nearer end. */
export function dialValue(angle: number, min: number, max: number, step: number) {
  const within = clamp((clamp(angle, START, START + SWEEP) - START) / SWEEP, 0, 1);
  const raw = min + within * (max - min);
  const snapped = min + Math.round((raw - min) / step) * step;
  return clamp(Number(snapped.toFixed(6)), min, max);
}

export interface GlassDialProps {
  /** Names the control. */
  label: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shown beside the reading and read out with it, e.g. "°". */
  unit?: string;
  /** A line under the reading, e.g. the room. */
  caption?: ReactNode;
  className?: string;
}

export function GlassDial({ label, value, defaultValue, onChange, min = 0, max = 100, step = 1, unit = "", caption, className }: GlassDialProps) {
  const disc = useRef<HTMLDivElement>(null);
  const captionId = useId();
  const [own, setOwn] = useState(defaultValue ?? min);
  const current = clamp(value ?? own, min, max);
  const reached = Math.round(((current - min) / (max - min)) * (TICKS - 1));

  const update = (next: number) => {
    setOwn(next);
    onChange?.(next);
  };

  const turnTo = (event: PointerEvent<HTMLDivElement>) => {
    const box = disc.current?.getBoundingClientRect();
    if (!box) return;
    const x = event.clientX - (box.left + box.width / 2);
    const y = event.clientY - (box.top + box.height / 2);
    update(dialValue((Math.atan2(x, -y) * 180) / Math.PI, min, max, step));
  };

  return (
    <div
      ref={disc}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        turnTo(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) turnTo(event);
      }}
      className={cx(
        "glass-panel glass-slab relative isolate flex aspect-square w-full max-w-72 cursor-grab touch-none items-center justify-center rounded-full border select-none active:cursor-grabbing",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      <svg aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full">
        {Array.from({ length: TICKS }, (_, index) => {
          const angle = ((START + (index / (TICKS - 1)) * SWEEP) * Math.PI) / 180;
          const lit = index <= reached;
          const inner = lit ? 80 : 84;
          return (
            <line
              key={index}
              x1={100 + Math.sin(angle) * inner}
              y1={100 - Math.cos(angle) * inner}
              x2={100 + Math.sin(angle) * 92}
              y2={100 - Math.cos(angle) * 92}
              strokeWidth={lit ? 2 : 1.25}
              strokeLinecap="round"
              className={cx("transition-[stroke] duration-(--ds-motion-duration-base)", lit ? "stroke-accent-500" : "stroke-line-control")}
            />
          );
        })}
      </svg>
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ rotate: `${dialAngle(current, min, max)}deg` }}>
        <span className="glass-panel absolute start-1/2 top-1.5 size-6 -translate-x-1/2 rounded-full border shadow-glass-lens rtl:translate-x-1/2" />
      </span>
      <div className="pointer-events-none relative flex flex-col items-center">
        <span aria-hidden className="text-display-lg tabular-nums text-fg">
          {current}
          {unit}
        </span>
        {caption && (
          <span id={captionId} className="text-body-sm text-fg-secondary">
            {caption}
          </span>
        )}
      </div>
      <input
        type="range"
        aria-label={label}
        aria-describedby={caption ? captionId : undefined}
        aria-valuetext={`${current}${unit}`}
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(event) => update(Number(event.target.value))}
        className="sr-only"
      />
    </div>
  );
}
