"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useCanvasEffect, usePointer } from "../shared";

/**
 * PixelTrail: the area is an invisible grid of square pixels, and the ones the
 * pointer passes over light up in the accent and fade, leaving a blocky,
 * 8-bit trail. It sits behind the content it wraps. Decorative: hidden from
 * assistive tech, mouse only, and off with reduced motion.
 */

export interface PixelTrailProps {
  children?: ReactNode;
  /** Pixel size in CSS pixels. */
  pixel?: number;
  /** Seconds a pixel takes to fade. */
  fade?: number;
  className?: string;
}

export function PixelTrail({ children, pixel = 24, fade = 0.7, className }: PixelTrailProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = usePointer(host);
  const lit = useRef(new Map<number, number>());
  const last = useRef<{ x: number; y: number } | null>(null);

  const canvas = useCanvasEffect(
    ({ ctx, width, height, dt, colors, still }) => {
      ctx.clearRect(0, 0, width, height);
      if (still) return;
      const cols = Math.ceil(width / pixel);
      const p = pointer.current;
      if (p.inside) {
        // Light every cell along the segment since the last frame, so fast moves leave no gaps.
        const from = last.current ?? p;
        const steps = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y) / (pixel / 2)));
        for (let s = 0; s <= steps; s++) {
          const x = from.x + ((p.x - from.x) * s) / steps;
          const y = from.y + ((p.y - from.y) * s) / steps;
          lit.current.set(Math.floor(y / pixel) * cols + Math.floor(x / pixel), 1);
        }
        last.current = { x: p.x, y: p.y };
      } else last.current = null;

      ctx.fillStyle = colors[0]!;
      for (const [cell, life] of lit.current) {
        const next = life - dt / fade;
        if (next <= 0) {
          lit.current.delete(cell);
          continue;
        }
        lit.current.set(cell, next);
        ctx.globalAlpha = next * 0.85;
        ctx.fillRect((cell % cols) * pixel, Math.floor(cell / cols) * pixel, pixel - 1, pixel - 1);
      }
    },
    { colors: ["var(--ds-color-accent-500)"] },
  );

  return (
    <div ref={host} className={cx("relative overflow-hidden", className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      <div className="relative">{children}</div>
    </div>
  );
}
