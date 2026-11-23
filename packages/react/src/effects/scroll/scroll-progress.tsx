"use client";

import type { RefObject } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ScrollProgress: a thin accent bar that fills as you read. It follows the
 * window, or `scrollRef` inside its own scrolling panel; position it with
 * `className` (it's sticky to the top by default). It only shows progress the
 * scrollbar already shows, so it's hidden from assistive tech.
 */

export interface ScrollProgressProps {
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function ScrollProgress({ scrollRef, className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll(scrollRef ? { container: scrollRef } : undefined);
  const smooth = useSpring(scrollYProgress, { stiffness: 180, damping: 32 });
  const calm = useCalmMotion();
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: calm ? scrollYProgress : smooth }}
      className={cx("sticky top-0 z-20 h-1 w-full origin-left bg-linear-to-r from-accent-500 to-effect-2 rtl:origin-right", className)}
    />
  );
}
