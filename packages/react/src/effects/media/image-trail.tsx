"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ImageTrail: as the pointer moves across the area, pictures drop behind it one
 * after another, each popping up and fading away, so a gesture leaves a trail
 * of the work. `items` are the pictures (images or any art) used in turn.
 * Decorative: hidden from assistive tech, mouse only, and off with reduced
 * motion. Put the real content in `children`.
 */

export interface ImageTrailProps {
  items: ReactNode[];
  children?: ReactNode;
  /** Pixels the pointer travels between drops. */
  spacing?: number;
  className?: string;
}

type Drop = { id: number; x: number; y: number; item: number; tilt: number };

export function ImageTrail({ items, children, spacing = 70, className }: ImageTrailProps) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const last = useRef({ x: -1e4, y: -1e4 });
  const next = useRef(0);
  const calm = useCalmMotion();

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || event.pointerType !== "mouse" || !items.length) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (Math.hypot(x - last.current.x, y - last.current.y) < spacing) return;
    last.current = { x, y };
    const id = next.current++;
    setDrops((all) => [...all.slice(-6), { id, x, y, item: id % items.length, tilt: (Math.random() - 0.5) * 16 }]);
    setTimeout(() => setDrops((all) => all.filter((d) => d.id !== id)), 900);
  };

  return (
    <div onPointerMove={move} className={cx("relative overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {drops.map((drop) => (
            <motion.div
              key={drop.id}
              className="absolute size-28 overflow-hidden rounded-surface shadow-overlay"
              style={{ left: drop.x, top: drop.y, translateX: "-50%", translateY: "-50%" }}
              initial={{ scale: 0.5, opacity: 0, rotate: drop.tilt * 2 }}
              animate={{ scale: 1, opacity: 1, rotate: drop.tilt }}
              exit={{ scale: 0.7, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              {items[drop.item]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
