"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import { EFFECT_PALETTE, useCanvasEffect } from "../shared";

/**
 * SplashCursor: the pointer trails ink as it moves through the area, in the
 * brand's effect colours, and a click throws a splash. The ink spreads, softens
 * and fades on its own. It sits behind the content it wraps. Decorative:
 * hidden from assistive tech, mouse only, and off with reduced motion.
 */

export interface SplashCursorProps {
  children?: ReactNode;
  className?: string;
}

type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number; color: number };

export function SplashCursor({ children, className }: SplashCursorProps) {
  const host = useRef<HTMLDivElement>(null);
  const drops = useRef<Drop[]>([]);
  const hue = useRef(0);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let last: { x: number; y: number } | null = null;
    const at = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top };
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = at(e);
      if (last) {
        const vx = (p.x - last.x) * 0.15;
        const vy = (p.y - last.y) * 0.15;
        const speed = Math.hypot(vx, vy);
        if (speed > 0.2) drops.current.push({ ...p, vx, vy, r: 6 + Math.min(18, speed * 4), life: 1, color: Math.floor(hue.current) });
      }
      hue.current = (hue.current + 0.02) % EFFECT_PALETTE.length;
      last = p;
    };
    const down = (e: PointerEvent) => {
      const p = at(e);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const s = 1.5 + Math.random() * 3;
        drops.current.push({ ...p, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 10 + Math.random() * 14, life: 1, color: i % EFFECT_PALETTE.length });
      }
    };
    const leave = () => (last = null);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const canvas = useCanvasEffect(
    ({ ctx, width, height, dt, colors, still }) => {
      ctx.clearRect(0, 0, width, height);
      if (still) return void (drops.current = []);
      drops.current = drops.current.filter((d) => d.life > 0).slice(-220);
      for (const d of drops.current) {
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.94;
        d.vy *= 0.94;
        d.r += dt * 30;
        d.life -= dt * 0.9;
        ctx.globalAlpha = Math.max(0, d.life) * 0.5;
        ctx.fillStyle = colors[d.color]!;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { colors: EFFECT_PALETTE },
  );

  return (
    <div ref={host} className={cx("relative overflow-hidden", className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full blur-soft" />
      <div className="relative">{children}</div>
    </div>
  );
}
