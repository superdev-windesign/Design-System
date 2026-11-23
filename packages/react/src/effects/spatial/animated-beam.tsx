"use client";

import { useEffect, useId, useState } from "react";
import type { RefObject } from "react";
import { cx } from "../../utils/cx";

/**
 * AnimatedBeam: a curved line between two elements with a pulse of light
 * travelling along it, for diagrams of how things connect: sources flowing into
 * a hub, an agent calling its tools. Give it the container and the two ends as
 * refs; it redraws when anything resizes. Decorative: describe the connection
 * in text nearby. With reduced motion the line stays and the pulse stops.
 */

export interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  /** How far the curve bows, in pixels; negative bows the other way. */
  curvature?: number;
  /** Run the pulse from `to` back to `from`. */
  reverse?: boolean;
  /** Seconds before the pulse starts, to stagger several beams. */
  delay?: number;
  className?: string;
}

export function AnimatedBeam({ containerRef, fromRef, toRef, curvature = 0, reverse = false, delay = 0, className }: AnimatedBeamProps) {
  const id = useId().replace(/:/g, "");
  const [geometry, setGeometry] = useState({ d: "", w: 0, h: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const box = container.getBoundingClientRect();
      const a = fromRef.current?.getBoundingClientRect();
      const b = toRef.current?.getBoundingClientRect();
      if (!a || !b) return;
      const sx = a.left - box.left + a.width / 2;
      const sy = a.top - box.top + a.height / 2;
      const ex = b.left - box.left + b.width / 2;
      const ey = b.top - box.top + b.height / 2;
      setGeometry({ d: `M${sx},${sy} Q${(sx + ex) / 2},${(sy + ey) / 2 - curvature} ${ex},${ey}`, w: box.width, h: box.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      aria-hidden
      width={geometry.w}
      height={geometry.h}
      viewBox={`0 0 ${geometry.w} ${geometry.h}`}
      fill="none"
      className={cx("pointer-events-none absolute top-0 left-0", className)}
    >
      <defs>
        <linearGradient id={`beam-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={geometry.w} y2="0">
          <stop offset="0%" style={{ stopColor: "var(--ds-color-effect-2)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ds-color-accent-500)" }} />
        </linearGradient>
      </defs>
      <path d={geometry.d} className="stroke-line" strokeWidth={2} strokeLinecap="round" />
      <path
        d={geometry.d}
        pathLength={1}
        stroke={`url(#beam-${id})`}
        strokeWidth={2.5}
        strokeLinecap="round"
        className="animate-path-travel"
        style={{ animationDelay: `${delay}s`, animationDirection: reverse ? "reverse" : undefined }}
      />
    </svg>
  );
}
