"use client";

import { useRef } from "react";
import { cx } from "../../utils/cx";
import { useCanvasEffect, usePointer } from "../shared";

/**
 * Hyperspeed: stars streaming out of the centre as if you were flying through
 * them. Press and hold anywhere on it to jump to light speed: the stars stretch
 * into streaks, and ease back when you let go. It fills its positioned parent.
 * Decorative; with reduced motion it's a still starfield.
 */

export interface HyperspeedProps {
  count?: number;
  className?: string;
}

type Star = { x: number; y: number; z: number; pz: number };

export function Hyperspeed({ count = 420, className }: HyperspeedProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = usePointer(host);
  const stars = useRef<Star[]>([]);
  const speed = useRef(0.25);

  const canvas = useCanvasEffect(
    ({ ctx, width, height, dt, colors, reset, still }) => {
      if (reset || stars.current.length !== count) {
        stars.current = Array.from({ length: count }, () => {
          const z = Math.random();
          return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z, pz: z };
        });
      }
      const target = pointer.current.down ? 2.6 : 0.25;
      speed.current += (target - speed.current) * Math.min(1, dt * 3);
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.max(width, height) * 0.5;
      ctx.lineCap = "round";
      stars.current.forEach((s, i) => {
        s.pz = s.z;
        if (!still) s.z -= speed.current * dt;
        if (s.z <= 0.02) {
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          s.z = 1;
          s.pz = 1;
        }
        const x = cx + (s.x / s.z) * scale * 0.5;
        const y = cy + (s.y / s.z) * scale * 0.5;
        const px = cx + (s.x / s.pz) * scale * 0.5;
        const py = cy + (s.y / s.pz) * scale * 0.5;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
        ctx.strokeStyle = colors[i % 5 === 0 ? 1 : 0]!;
        ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.4);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x + 0.1, y + 0.1);
        ctx.stroke();
      });
    },
    { colors: ["var(--ds-color-text-primary)", "var(--ds-color-effect-1)"] },
  );

  return (
    <div ref={host} className={cx("absolute inset-0 cursor-pointer overflow-hidden select-none", className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}
