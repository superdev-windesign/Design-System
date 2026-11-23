"use client";

import { useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * TargetCursor: inside this area the pointer is a small reticle, and over
 * anything you can press (or anything marked `data-cursor-target`) its four
 * corner brackets leap out and lock around it. Scoped to the area it wraps;
 * the normal cursor comes back over text fields, on touch, and with reduced
 * motion.
 */

export interface TargetCursorProps {
  children: ReactNode;
  className?: string;
}

const spring = { stiffness: 480, damping: 34, mass: 0.6 };
const TARGET = "[data-cursor-target], a, button, [role='button'], [role='tab']";

export function TargetCursor({ children, className }: TargetCursorProps) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const w = useSpring(20, spring);
  const h = useSpring(20, spring);
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const calm = useCalmMotion();

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const target = (event.target as Element).closest(TARGET);
    const typing = (event.target as Element).closest("input, textarea");
    setVisible(!typing);
    if (target && event.currentTarget.contains(target)) {
      const t = target.getBoundingClientRect();
      x.set(t.left - box.left - 6);
      y.set(t.top - box.top - 6);
      w.set(t.width + 12);
      h.set(t.height + 12);
      setLocked(true);
    } else {
      x.set(event.clientX - box.left - 10);
      y.set(event.clientY - box.top - 10);
      w.set(20);
      h.set(20);
      setLocked(false);
    }
  };

  const corner = "absolute size-2.5 border-accent-500";
  const on = visible && !calm;
  return (
    <div onPointerMove={move} onPointerLeave={() => setVisible(false)} className={cx("relative overflow-hidden", on && "cursor-none [&_*]:cursor-none", className)}>
      {children}
      <motion.span
        aria-hidden
        style={{ x, y, width: w, height: h }}
        animate={{ opacity: on ? 1 : 0, rotate: locked ? 0 : 45 }}
        className="pointer-events-none absolute top-0 left-0 z-50"
      >
        <span className={cx(corner, "top-0 left-0 border-t-2 border-l-2")} />
        <span className={cx(corner, "top-0 right-0 border-t-2 border-r-2")} />
        <span className={cx(corner, "bottom-0 left-0 border-b-2 border-l-2")} />
        <span className={cx(corner, "right-0 bottom-0 border-r-2 border-b-2")} />
        {!locked && <span className="absolute top-1/2 left-1/2 size-1 -translate-1/2 rounded-full bg-accent-500" />}
      </motion.span>
    </div>
  );
}
