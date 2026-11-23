"use client";

import { useRef } from "react";
import { cx } from "../../utils/cx";
import { EFFECT_PALETTE, useCanvasEffect, usePointer } from "../shared";

/**
 * Ballpit: a pit of soft balls in the brand's effect colours that tumble under
 * gravity and get shoved aside by the pointer as it moves through them; press
 * to throw them up into the air. It fills its positioned parent. Decorative:
 * hidden from assistive tech; with reduced motion the balls rest in a heap.
 */

export interface BallpitProps {
  count?: number;
  className?: string;
}

type Ball = { x: number; y: number; vx: number; vy: number; r: number; c: number };

export function Ballpit({ count = 46, className }: BallpitProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = usePointer(host);
  const balls = useRef<Ball[]>([]);
  const prev = useRef({ x: 0, y: 0, down: false });

  const canvas = useCanvasEffect(
    ({ ctx, width, height, dt, colors, reset, still }) => {
      if (reset || balls.current.length !== count) {
        balls.current = Array.from({ length: count }, (_, i) => {
          const r = 12 + Math.random() * 18;
          return { x: r + Math.random() * (width - 2 * r), y: still ? height - r - Math.random() * height * 0.4 : -Math.random() * height, vx: 0, vy: 0, r, c: i % colors.length };
        });
      }
      const p = pointer.current;
      const pv = { x: (p.x - prev.current.x) / Math.max(dt, 0.001), y: (p.y - prev.current.y) / Math.max(dt, 0.001) };
      const burst = p.down && !prev.current.down;
      prev.current = { x: p.x, y: p.y, down: p.down };

      if (!still) {
        for (const b of balls.current) {
          b.vy += 1400 * dt;
          if (burst && Math.hypot(b.x - p.x, b.y - p.y) < 220) b.vy -= 900 + Math.random() * 500;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.vx *= 0.995;
          if (b.x < b.r) (b.x = b.r), (b.vx = Math.abs(b.vx) * 0.6);
          if (b.x > width - b.r) (b.x = width - b.r), (b.vx = -Math.abs(b.vx) * 0.6);
          if (b.y > height - b.r) (b.y = height - b.r), (b.vy = -Math.abs(b.vy) * 0.4), (b.vx *= 0.96);
          // The pointer is an invisible ball that shoves the others.
          if (p.inside) {
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            const d = Math.hypot(dx, dy);
            const min = b.r + 36;
            if (d < min && d > 0) {
              b.x += (dx / d) * (min - d);
              b.y += (dy / d) * (min - d);
              b.vx += (dx / d) * 120 + pv.x * 0.25;
              b.vy += (dy / d) * 120 + pv.y * 0.25;
            }
          }
        }
        for (let pass = 0; pass < 3; pass++) {
          const all = balls.current;
          for (let i = 0; i < all.length; i++) {
            for (let j = i + 1; j < all.length; j++) {
              const a = all[i]!;
              const c = all[j]!;
              const dx = c.x - a.x;
              const dy = c.y - a.y;
              const d = Math.hypot(dx, dy);
              const min = a.r + c.r;
              if (d >= min || d === 0) continue;
              const push = (min - d) / 2;
              const nx = dx / d;
              const ny = dy / d;
              a.x -= nx * push;
              a.y -= ny * push;
              c.x += nx * push;
              c.y += ny * push;
              const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
              if (rel < 0) {
                const k = rel * 0.8;
                a.vx += nx * k;
                a.vy += ny * k;
                c.vx -= nx * k;
                c.vy -= ny * k;
              }
            }
          }
        }
      }

      ctx.clearRect(0, 0, width, height);
      for (const b of balls.current) {
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = colors[b.c]!;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        // A highlight, so they read as balls rather than discs.
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = colors[colors.length - 1]!;
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { colors: [...EFFECT_PALETTE, "var(--ds-color-text-on-action)"] },
  );

  return (
    <div ref={host} className={cx("absolute inset-0 cursor-pointer overflow-hidden select-none", className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}
