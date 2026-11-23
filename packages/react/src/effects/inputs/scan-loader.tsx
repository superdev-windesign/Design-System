"use client";

import type { ReactNode } from "react";
import { ShimmerText } from "../text/shimmer-text";
import { cx } from "../../utils/cx";
import { seeded, useCanvasEffect } from "../shared";

/**
 * ScanLoader: the wait while an image is being made. A grid of pixels flickers
 * into being (more of it as `progress` rises), a scan line sweeps down over it,
 * and when `done` the finished picture comes up out of a blur. It's a progress
 * bar to assistive tech, with the label as its name.
 */

export interface ScanLoaderProps {
  label?: string;
  /** 0–1. Leave undefined while the progress is unknown. */
  progress?: number;
  done?: boolean;
  /** The finished result. */
  children?: ReactNode;
  className?: string;
}

const CELL = 10;

export function ScanLoader({ label = "Generating image", progress, done = false, children, className }: ScanLoaderProps) {
  const fill = progress ?? 0.55;
  const canvas = useCanvasEffect(
    ({ ctx, width, height, time, colors }) => {
      ctx.clearRect(0, 0, width, height);
      const rand = seeded(7);
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const threshold = rand();
          const phase = rand() * Math.PI * 2;
          const tint = rand();
          if (threshold > fill) continue;
          ctx.globalAlpha = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(time * 2.2 + phase));
          ctx.fillStyle = tint > 0.5 ? colors[0]! : colors[1]!;
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    },
    { colors: ["var(--ds-color-accent-500)", "var(--ds-color-effect-2)"] },
  );

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={progress === undefined ? undefined : 0}
      aria-valuemax={progress === undefined ? undefined : 100}
      aria-valuenow={done ? 100 : progress === undefined ? undefined : Math.round(progress * 100)}
      aria-busy={!done}
      className={cx("relative aspect-square w-64 max-w-full overflow-hidden rounded-surface border border-line bg-sunken", className)}
    >
      {done ? (
        <div className="animate-reveal absolute inset-0">{children}</div>
      ) : (
        <>
          <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
          <span aria-hidden className="animate-scan absolute inset-0">
            <span className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-accent-500/25" />
            <span className="absolute inset-x-0 bottom-0 border-b-2 border-accent-500" />
          </span>
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-body-sm-strong">
            <ShimmerText>{label}…</ShimmerText>
            {progress !== undefined && <span className="text-fg-secondary tabular-nums">{Math.round(progress * 100)}%</span>}
          </span>
        </>
      )}
    </div>
  );
}
