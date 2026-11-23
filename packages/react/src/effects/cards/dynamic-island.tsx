"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easing, layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * DynamicIsland: a dark pill that morphs to fit what it's showing: a sliver
 * when idle, a wider pill for a timer or an upload, a rounded panel for a call
 * with controls. Change `mode` and pass the content for it; the island springs
 * to its new size while the old content fades out and the new one in.
 *
 * It's a status region, so a screen reader hears what it now shows. Put
 * buttons inside freely; they keep their own semantics.
 */

export type DynamicIslandSize = "idle" | "compact" | "wide" | "expanded";

export interface DynamicIslandProps {
  /** A key for what's showing; changing it morphs the island. */
  mode: string;
  size?: DynamicIslandSize;
  children?: ReactNode;
  className?: string;
}

const SIZE: Record<DynamicIslandSize, string> = {
  idle: "h-8 w-28 rounded-full",
  compact: "h-9 w-56 rounded-full",
  wide: "h-11 w-80 rounded-full",
  expanded: "min-h-36 w-88 rounded-3xl",
};

export function DynamicIsland({ mode, size = "compact", children, className }: DynamicIslandProps) {
  const calm = useCalmMotion();
  return (
    <motion.div
      layout={!calm}
      transition={layoutSpring}
      role="status"
      // The inverse of the page, so it reads as a separate layer in either theme.
      className={cx("relative flex max-w-full items-center justify-center overflow-hidden bg-fg text-canvas shadow-overlay", SIZE[size], className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={mode}
          layout={!calm}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: easing.enter }}
          className="flex w-full items-center px-3"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
