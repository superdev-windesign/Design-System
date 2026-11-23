"use client";

import { cx } from "../../utils/cx";
import { useCanvasEffect } from "../shared";

/**
 * DitherBackground: a slow-moving field of light and shade drawn the way old
 * screens drew gradients: with ordered dithering, a fixed pattern of square
 * dots. It reads as texture rather than colour, so it sits well behind type.
 * It fills its positioned parent; with reduced motion it's a still frame.
 */

export interface DitherBackgroundProps {
  /** Dot size in pixels. */
  pixel?: number;
  tone?: "ink" | "accent";
  /** Opacity of the dots, 0–1. */
  strength?: number;
  className?: string;
}

// The 4×4 Bayer matrix, as thresholds from 0 to 1.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export function DitherBackground({ pixel = 3, tone = "ink", strength = 0.35, className }: DitherBackgroundProps) {
  const canvas = useCanvasEffect(
    ({ ctx, width, height, time, colors }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colors[0]!;
      ctx.globalAlpha = strength;
      const t = time * 0.35;
      const cols = Math.ceil(width / pixel);
      const rows = Math.ceil(height / pixel);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i / cols;
          const y = j / rows;
          // Two drifting waves and a soft vignette make the field.
          const wave = 0.5 + 0.25 * Math.sin(x * 6 + t * 2) * Math.cos(y * 5 - t * 1.3) + 0.25 * Math.sin((x + y) * 4 - t);
          const value = wave * (1 - 0.6 * Math.hypot(x - 0.5, y - 0.6));
          if (value > BAYER[(i % 4) + (j % 4) * 4]!) ctx.fillRect(i * pixel, j * pixel, pixel, pixel);
        }
      }
    },
    { colors: [tone === "accent" ? "var(--ds-color-accent-500)" : "var(--ds-color-text-primary)"] },
  );
  return <canvas ref={canvas} aria-hidden className={cx("pointer-events-none absolute inset-0 size-full", className)} />;
}
