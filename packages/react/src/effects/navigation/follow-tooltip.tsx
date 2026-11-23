"use client";

import { cloneElement, isValidElement, useId, useState } from "react";
import type { PointerEvent, ReactElement, ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * FollowTooltip: a tooltip that leans after the pointer, sliding a little
 * toward it and tilting with its speed, so a row of avatars feels alive. It
 * opens on hover and on keyboard focus, and the trigger is described by it, so
 * screen readers hear it as they would any tooltip. With reduced motion it
 * simply appears above the trigger.
 */

export interface FollowTooltipProps {
  content: ReactNode;
  /** One focusable element: an avatar button, a link, an icon button. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
}

const spring = { stiffness: 180, damping: 14 };

export function FollowTooltip({ content, children, className }: FollowTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const calm = useCalmMotion();
  const offset = useMotionValue(0);
  const x = useSpring(useTransform(offset, (v) => v * 0.4), spring);
  const rotate = useSpring(useTransform(offset, [-60, 60], [-14, 14]), spring);

  const move = (event: PointerEvent<HTMLSpanElement>) => {
    if (calm) return;
    const box = event.currentTarget.getBoundingClientRect();
    offset.set(event.clientX - (box.left + box.width / 2));
  };

  return (
    <span
      className={cx("relative inline-flex", className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => {
        setOpen(false);
        offset.set(0);
      }}
      onPointerMove={move}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {isValidElement(children) ? cloneElement(children, { "aria-describedby": open ? id : undefined }) : children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 8, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{ x, rotate }}
            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 rounded-control-sm bg-fg px-2.5 py-1 text-caption-strong whitespace-nowrap text-canvas shadow-overlay"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
