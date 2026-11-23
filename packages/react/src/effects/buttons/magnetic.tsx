"use client";

import type { PointerEvent, ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * Magnetic: whatever it wraps (usually a button) drifts toward the pointer while
 * the pointer is near, and springs home when it leaves. Only a mouse pulls it;
 * touch has nothing to hover. With reduced motion it stays put.
 */

export interface MagneticProps {
  children: ReactNode;
  /** How far it follows, as a share of the pointer's offset from its centre. */
  strength?: number;
  className?: string;
}

const spring = { stiffness: 220, damping: 18, mass: 0.6 };

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const calm = useCalmMotion();

  const move = (event: PointerEvent<HTMLSpanElement>) => {
    if (calm || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (box.left + box.width / 2)) * strength);
    y.set((event.clientY - (box.top + box.height / 2)) * strength);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    // The padding widens the area that pulls, so the pull starts before the pointer arrives.
    <span onPointerMove={move} onPointerLeave={leave} className={cx("-m-4 inline-flex p-4", className)}>
      <motion.span style={{ x, y }} className="inline-flex">
        {children}
      </motion.span>
    </span>
  );
}
