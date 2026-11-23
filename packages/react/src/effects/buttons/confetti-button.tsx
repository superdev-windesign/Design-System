"use client";

import type { ReactNode } from "react";
import { Button } from "../../components/button/button";
import type { ButtonSize, ButtonVariant } from "../../components/button/button";
import { EFFECT_PALETTE, resolveColor } from "../shared";

/**
 * Confetti for a moment worth celebrating: a finished onboarding, a first sale.
 *
 * `fireConfetti` throws a burst from a point on screen (the centre by default)
 * on a temporary canvas over the page, in the brand's effect colours and accent,
 * then cleans up after itself. It does nothing under reduced motion, so pair it
 * with a message rather than letting it carry meaning. `ConfettiButton` fires
 * from its own centre when pressed.
 */

export interface ConfettiOptions {
  /** Viewport coordinates to burst from. */
  x?: number;
  y?: number;
  count?: number;
  /** Degrees either side of straight up. */
  spread?: number;
}

type Piece = { x: number; y: number; vx: number; vy: number; spin: number; angle: number; size: number; color: string; round: boolean };

export function fireConfetti({ x = innerWidth / 2, y = innerHeight / 2, count = 120, spread = 70 }: ConfettiOptions = {}) {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "pointer-events-none fixed inset-0 z-50 size-full";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.remove();

  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = EFFECT_PALETTE.map((c) => resolveColor(document.body, c));

  const pieces: Piece[] = Array.from({ length: count }, () => {
    const angle = ((-90 + (Math.random() * 2 - 1) * spread) * Math.PI) / 180;
    const speed = 7 + Math.random() * 9;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      round: Math.random() < 0.3,
    };
  });

  const start = performance.now();
  const life = 2200;
  const tick = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - life * 0.6) / (life * 0.4));
    for (const p of pieces) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Flat paper turning in the air: its width flickers with the spin.
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size * Math.abs(Math.cos(p.angle * 2)), p.size / 2);
      }
      ctx.restore();
    }
    if (t < life) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}

export interface ConfettiButtonProps {
  children: ReactNode;
  /** Runs as well as the confetti. */
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function ConfettiButton({ children, onPress, variant = "primary", size = "md", className }: ConfettiButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onPress={(e) => {
        const box = (e.target as HTMLElement).getBoundingClientRect();
        fireConfetti({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
        onPress?.();
      }}
    >
      {children}
    </Button>
  );
}
