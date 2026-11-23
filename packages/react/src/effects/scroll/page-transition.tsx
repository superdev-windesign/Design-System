"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";
import { easing } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * PageTransition: animates between views when `transitionKey` changes: a
 * route, a step, a tab's content. The old view leaves before the new one
 * enters. `curtain` sweeps a panel of ink across to cover the old view and
 * draws it off to reveal the new one; the others fade, slide, zoom or blur.
 * With reduced motion every variant is a quick cross-fade.
 */

export type PageTransitionVariant = "fade" | "slide" | "zoom" | "blur" | "curtain";

export interface PageTransitionProps {
  transitionKey: string | number;
  variant?: PageTransitionVariant;
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<Exclude<PageTransitionVariant, "curtain">, Variants> = {
  fade: { initial: { opacity: 0 }, enter: { opacity: 1 }, exit: { opacity: 0 } },
  slide: { initial: { opacity: 0, x: 40 }, enter: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } },
  zoom: { initial: { opacity: 0, scale: 0.94 }, enter: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.04 } },
  blur: { initial: { opacity: 0, filter: "blur(8px)" }, enter: { opacity: 1, filter: "blur(0px)" }, exit: { opacity: 0, filter: "blur(8px)" } },
};

export function PageTransition({ transitionKey, variant = "fade", children, className }: PageTransitionProps) {
  const calm = useCalmMotion();
  const kind = calm ? "fade" : variant;
  return (
    <div className={cx("relative overflow-hidden", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {kind === "curtain" ? (
          <motion.div key={transitionKey} className="relative" initial="initial" animate="enter" exit="exit">
            {children}
            {/* Leaving: the curtain grows over the old view. Arriving: it's drawn off the new one. */}
            <motion.span
              aria-hidden
              className="absolute inset-0 z-10 bg-fg"
              variants={{
                initial: { scaleX: 1, originX: 1 },
                enter: { scaleX: 0, originX: 1, transition: { duration: 0.45, ease: easing.enter } },
                exit: { scaleX: [0, 1], originX: 0, transition: { duration: 0.4, ease: easing.standard } },
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key={transitionKey}
            variants={VARIANTS[kind]}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: calm ? 0.12 : 0.3, ease: easing.enter }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
