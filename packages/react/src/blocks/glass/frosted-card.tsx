"use client";

import { type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cx } from "../../utils/cx";
import { glowStyle, sheenHandlers, type GlowTone } from "./liquid-light";

/**
 * Frosted card: a pane of glass laid over a slab of colour, so the blur has
 * something real to work on. The pair tilts toward the pointer, the glass on top
 * of the colour, and a highlight slides across it. With reduced motion, or on
 * touch, it simply lies flat.
 *
 * Text only sits on the glass, never on the bare colour, so it stays readable
 * whichever tone you choose.
 */

export interface FrostedCardProps {
  /** The line at the top of the glass, e.g. a product name. */
  title: ReactNode;
  /** The large line, e.g. a balance. */
  value?: ReactNode;
  /** Bottom left. */
  caption?: ReactNode;
  /** Bottom right, e.g. an expiry date. */
  detail?: ReactNode;
  /** The colour under the glass. Default ember. */
  tone?: GlowTone;
  className?: string;
}

const TILT = 7;
const spring = { stiffness: 220, damping: 22, mass: 0.6 };

export function FrostedCard({ title, value, caption, detail, tone = "ember", className }: FrostedCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    sheenHandlers.onPointerMove(event);
    if (reduceMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - box.left) / box.width - 0.5) * TILT * 2);
    rotateX.set(-((event.clientY - box.top) / box.height - 0.5) * TILT * 2);
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    sheenHandlers.onPointerLeave(event);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={cx("w-full max-w-sm perspective-distant", className)}>
      <motion.div style={{ rotateX, rotateY }} className="relative aspect-8/5 w-full">
        <span
          aria-hidden
          style={{ ...glowStyle(tone), background: "linear-gradient(140deg, var(--glow), color-mix(in srgb, var(--glow) 55%, var(--ds-color-glass-glow-sun)))" }}
          className="absolute start-0 top-1/6 h-4/5 w-5/6 rounded-surface"
        />
        <div className="glass-panel glass-slab glass-sheen absolute end-0 top-0 isolate flex h-5/6 w-11/12 flex-col justify-between overflow-hidden rounded-surface border p-5">
          <p className="text-body-md-strong text-fg">{title}</p>
          {value && <p className="text-display-sm tabular-nums text-fg">{value}</p>}
          {(caption || detail) && (
            <div className="flex items-baseline justify-between gap-3 text-body-sm tabular-nums text-fg-secondary">
              <span className="truncate">{caption}</span>
              <span className="shrink-0">{detail}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
