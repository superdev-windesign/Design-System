"use client";

import { useRef } from "react";
import { cx } from "../../utils/cx";
import { seeded, useCanvasEffect } from "../shared";

/**
 * ShootingStars: a quiet night sky of twinkling stars, crossed every few
 * seconds by a shooting star with a glowing tail. It fills its positioned
 * parent. Decorative; with reduced motion the stars hold still and none fall.
 */

export interface ShootingStarsProps {
  /** Stars per 10,000 square pixels. */
  density?: number;
  className?: string;
}

type Streak = { x: number; y: number; vx: number; vy: number; life: number };

export function ShootingStars({ density = 1.2, className }: ShootingStarsProps) {
  const streak = useRef<Streak | null>(null);
  const nextAt = useRef(1);

  const canvas = useCanvasEffect(
    ({ ctx, width, height, time, dt, colors, still }) => {
      ctx.clearRect(0, 0, width, height);
      const rand = seeded(11);
      const count = Math.round((width * height * density) / 10000);
      ctx.fillStyle = colors[0]!;
      for (let i = 0; i < count; i++) {
        const x = rand() * width;
        const y = rand() * height;
        const r = 0.4 + rand() * 1.1;
        const phase = rand() * Math.PI * 2;
        ctx.globalAlpha = still ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.8 + phase));
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (still) return;

      if (!streak.current && time > nextAt.current) {
        const fromLeft = Math.random() < 0.5;
        streak.current = { x: fromLeft ? -40 : width + 40, y: Math.random() * height * 0.5, vx: (fromLeft ? 1 : -1) * (420 + Math.random() * 240), vy: 160 + Math.random() * 120, life: 1 };
      }
      const s = streak.current;
      if (s) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 0.6;
        const tail = 0.22;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
        g.addColorStop(0, colors[1]!);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
        ctx.stroke();
        if (s.life <= 0 || s.x < -200 || s.x > width + 200 || s.y > height + 100) {
          streak.current = null;
          nextAt.current = time + 1.5 + Math.random() * 3;
        }
      }
    },
    { colors: ["var(--ds-color-text-primary)", "var(--ds-color-effect-1)"] },
  );

  return <canvas ref={canvas} aria-hidden className={cx("pointer-events-none absolute inset-0 size-full", className)} />;
}
