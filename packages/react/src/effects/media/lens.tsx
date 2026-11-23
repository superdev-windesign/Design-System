"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "../../utils/cx";

/**
 * Lens: a round magnifier that follows the pointer over a picture (or any
 * content) and shows it enlarged, for product shots, maps and fine print. The
 * magnified copy is decorative and inert; the content underneath is untouched.
 * Mouse only: touch and keyboard see the content as it is.
 */

export interface LensProps {
  children: ReactNode;
  zoom?: number;
  /** Lens diameter in spacing units. */
  size?: number;
  className?: string;
}

export function Lens({ children, zoom = 2.2, size = 40, className }: LensProps) {
  const box = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setAt({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };
  const diameter = `calc(var(--spacing) * ${size})`;
  const half = `calc(var(--spacing) * ${size / 2})`;

  return (
    <div ref={box} onPointerMove={move} onPointerLeave={() => setAt(null)} className={cx("relative cursor-none overflow-hidden", className)}>
      {children}
      <AnimatePresence>
        {at && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-none absolute overflow-hidden rounded-full border-2 border-surface shadow-overlay"
            style={{ left: at.x, top: at.y, width: diameter, height: diameter, translateX: "-50%", translateY: "-50%" }}
          >
            <div
              inert
              className="absolute origin-top-left"
              style={{
                width: box.current?.offsetWidth,
                height: box.current?.offsetHeight,
                transform: `translate(calc(${half} - ${at.x * zoom}px), calc(${half} - ${at.y * zoom}px)) scale(${zoom})`,
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
