"use client";

import { useRef } from "react";
import { cx } from "../../utils/cx";
import { EFFECT_PALETTE, useCanvasEffect, usePointer } from "../shared";

/**
 * LiquidBackground: blobs of the brand's effect colours swirling slowly into each
 * other like ink in water. One of them follows the pointer at a lazy distance,
 * so the colour gathers wherever you look. It fills its positioned parent;
 * decorative, and still with reduced motion.
 */

export interface LiquidBackgroundProps {
  className?: string;
}

export function LiquidBackground({ className }: LiquidBackgroundProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = usePointer(host);
  const follow = useRef({ x: 0.5, y: 0.5 });

  const canvas = useCanvasEffect(
    ({ ctx, width, height, time, colors }) => {
      ctx.clearRect(0, 0, width, height);
      const t = time * 0.25;
      const p = pointer.current;
      const f = follow.current;
      if (p.inside) {
        f.x += (p.x / width - f.x) * 0.04;
        f.y += (p.y / height - f.y) * 0.04;
      }
      const r = Math.max(width, height) * 0.45;
      const blobs = [
        { x: 0.3 + 0.2 * Math.sin(t * 1.1), y: 0.35 + 0.2 * Math.cos(t * 0.9) },
        { x: 0.7 + 0.18 * Math.cos(t * 0.8), y: 0.4 + 0.22 * Math.sin(t * 1.3) },
        { x: 0.5 + 0.25 * Math.sin(t * 0.6 + 2), y: 0.75 + 0.15 * Math.cos(t * 1.1) },
        { x: 0.2 + 0.15 * Math.cos(t * 1.4 + 1), y: 0.8 + 0.12 * Math.sin(t * 0.7) },
        { x: f.x, y: f.y },
      ];
      // Solid discs; the canvas's own blur turns them into soft, merging pools.
      ctx.globalAlpha = 0.7;
      blobs.forEach((b, i) => {
        ctx.fillStyle = colors[i % colors.length]!;
        ctx.beginPath();
        ctx.arc(b.x * width, b.y * height, i === 4 ? r * 0.3 : r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    { colors: EFFECT_PALETTE },
  );

  return (
    <div ref={host} className={cx("absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full blur-haze saturate-150" />
    </div>
  );
}
