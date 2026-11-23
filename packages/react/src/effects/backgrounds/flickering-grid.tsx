"use client";

import { useRef } from "react";
import { cx } from "../../utils/cx";
import { useCanvasEffect } from "../shared";

/**
 * FlickeringGrid: a field of tiny squares that blink on and off at random, like
 * a server rack or a city at night. Quiet enough to sit behind text. It fills
 * its positioned parent; `fade` lets it vanish toward the edges. With reduced
 * motion it's a still pattern.
 */

export interface FlickeringGridProps {
  /** Square size and gap, in pixels. */
  square?: number;
  gap?: number;
  /** Ink (default) or the accent. */
  tone?: "ink" | "accent";
  /** Brightest a square gets, 0–1. */
  maxOpacity?: number;
  /** Share of squares that change each second. */
  flicker?: number;
  fade?: boolean;
  className?: string;
}

export function FlickeringGrid({ square = 4, gap = 6, tone = "ink", maxOpacity = 0.3, flicker = 0.4, fade = true, className }: FlickeringGridProps) {
  const cells = useRef<Float32Array>(new Float32Array(0));
  const canvas = useCanvasEffect(
    ({ ctx, width, height, dt, colors, reset, still }) => {
      const step = square + gap;
      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);
      if (reset || cells.current.length !== cols * rows) {
        cells.current = Float32Array.from({ length: cols * rows }, () => Math.random() * maxOpacity);
      }
      const grid = cells.current;
      if (!still) {
        for (let i = 0; i < grid.length; i++) if (Math.random() < flicker * dt) grid[i] = Math.random() * maxOpacity;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colors[0]!;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.globalAlpha = grid[y * cols + x]!;
          ctx.fillRect(x * step, y * step, square, square);
        }
      }
    },
    { colors: [tone === "accent" ? "var(--ds-color-accent-500)" : "var(--ds-color-text-primary)"] },
  );

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cx("pointer-events-none absolute inset-0 size-full", className)}
      style={fade ? { maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)" } : undefined}
    />
  );
}
