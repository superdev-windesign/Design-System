"use client";

import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * TiltCard: a card that tips toward the pointer in 3D, with a glare that slides
 * across it as if it caught the light. `holo` adds a holographic foil that
 * shifts colour with the angle, like a trading card. The tilt is decorative:
 * the card's content and any links inside work as normal, and with reduced
 * motion (or on touch) it lies flat.
 */

export interface TiltCardProps {
  children: ReactNode;
  /** Degrees it can tip on each axis. */
  maxTilt?: number;
  holo?: boolean;
  className?: string;
}

const spring = { stiffness: 260, damping: 22, mass: 0.6 };

export function TiltCard({ children, maxTilt = 10, holo = false, className }: TiltCardProps) {
  const calm = useCalmMotion();
  // Pointer position across the card, 0–1 on each axis.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useSpring(0, spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), spring);
  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in oklab, var(--ds-color-text-on-action) 55%, transparent), transparent 55%)`;
  const foilAngle = useTransform(px, [0, 1], [100, 160]);
  const foilOpacity = useTransform(hover, [0, 1], [0.15, 0.45]);
  const foil = useMotionTemplate`linear-gradient(${foilAngle}deg, var(--ds-color-effect-1), var(--ds-color-effect-2), var(--ds-color-effect-3), var(--ds-color-effect-4), var(--ds-color-effect-5), var(--ds-color-effect-1))`;

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
    hover.set(1);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div onPointerMove={move} onPointerLeave={leave} className={cx("perspective-distant", className)}>
      <motion.div style={{ rotateX, rotateY }} className="relative overflow-hidden rounded-surface border border-line bg-surface shadow-raised transform-3d">
        {children}
        {holo && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-color-dodge"
            style={{ backgroundImage: foil, backgroundSize: "200% 200%", opacity: foilOpacity }}
          />
        )}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare, opacity: hover }} />
      </motion.div>
    </div>
  );
}
