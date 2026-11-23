"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { effectDuration } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ClickSpark: a ring of sparks flies out from wherever you click inside it.
 * Wrap a button, a card or a whole panel. Purely decorative: the sparks are
 * hidden from assistive tech and skipped with reduced motion.
 */

export interface ClickSparkProps {
  children: ReactNode;
  /** Sparks per click. */
  count?: number;
  className?: string;
}

type Burst = { id: number; x: number; y: number };

export function ClickSpark({ children, count = 8, className }: ClickSparkProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const next = useRef(0);
  const calm = useCalmMotion();

  const fire = (event: PointerEvent<HTMLDivElement>) => {
    if (calm) return;
    const box = event.currentTarget.getBoundingClientRect();
    const burst = { id: next.current++, x: event.clientX - box.left, y: event.clientY - box.top };
    setBursts((all) => [...all, burst]);
    setTimeout(() => setBursts((all) => all.filter((b) => b.id !== burst.id)), effectDuration.reveal * 1000 + 50);
  };

  return (
    <div onPointerDownCapture={fire} className={cx("relative inline-flex", className)}>
      {children}
      {bursts.map((burst) => (
        <span key={burst.id} aria-hidden className="pointer-events-none absolute" style={{ left: burst.x, top: burst.y }}>
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className="animate-spark absolute h-3 w-0.5 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-accent-500"
              style={{ "--spark-angle": `${(360 / count) * i}deg` } as CSSProperties}
            />
          ))}
        </span>
      ))}
    </div>
  );
}
