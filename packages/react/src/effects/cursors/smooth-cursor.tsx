"use client";

import { useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * SmoothCursor: inside this area the pointer becomes a soft dot that glides
 * after the mouse on a spring and swells into a ring over anything you can
 * press. It's scoped to the area it wraps, never the whole page, and it hands
 * back the normal cursor over text fields, on touch, and with reduced motion.
 */

export interface SmoothCursorProps {
  children: ReactNode;
  className?: string;
}

const spring = { stiffness: 520, damping: 36, mass: 0.5 };
const PRESSABLE = "a, button, [role='button'], [role='link'], [role='tab'], label, select, summary";
const TYPING = "input, textarea, [contenteditable='true']";

export function SmoothCursor({ children, className }: SmoothCursorProps) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const [mode, setMode] = useState<"hidden" | "dot" | "ring">("hidden");
  const calm = useCalmMotion();

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - box.left);
    y.set(event.clientY - box.top);
    const target = event.target as Element;
    setMode(target.closest(TYPING) ? "hidden" : target.closest(PRESSABLE) ? "ring" : "dot");
  };

  const custom = !calm && mode !== "hidden";
  return (
    <div onPointerMove={move} onPointerLeave={() => setMode("hidden")} className={cx("relative overflow-hidden", custom && "cursor-none [&_*]:cursor-none", className)}>
      {children}
      <motion.span
        aria-hidden
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: mode === "ring" ? 1 : 0.35, opacity: custom ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={cx(
          "pointer-events-none absolute top-0 left-0 z-50 size-10 rounded-full border-2 transition-colors",
          mode === "ring" ? "border-accent-500 bg-accent-500/10" : "border-transparent bg-fg",
        )}
      />
    </div>
  );
}
