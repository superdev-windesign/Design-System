"use client";

import { useState } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ScrollNavbar: a top bar that gets out of the way. At the top of the page it's
 * a full-width bar; once you scroll it gathers into a floating pill, hides
 * while you read downward, and slides back the moment you scroll up. Keyboard
 * focus inside it always brings it back.
 *
 * It follows the window, or `scrollRef` when it sits inside its own scrolling
 * panel. With reduced motion it compacts without sliding away.
 */

export interface ScrollNavbarProps {
  children: ReactNode;
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function ScrollNavbar({ children, scrollRef, className }: ScrollNavbarProps) {
  const { scrollY } = useScroll(scrollRef ? { container: scrollRef } : undefined);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const calm = useCalmMotion();

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setCompact(y > 24);
    setHidden(!calm && y > previous && y > 160);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-150%" : "0%" }}
      transition={layoutSpring}
      onFocusCapture={() => setHidden(false)}
      className={cx("sticky top-3 z-20 flex justify-center px-3", className)}
    >
      <motion.nav
        layout={!calm}
        transition={layoutSpring}
        className={cx(
          "flex items-center gap-2 border transition-colors duration-(--ds-motion-duration-slow)",
          compact
            ? "rounded-full border-line bg-surface/90 px-3 py-1.5 shadow-overlay backdrop-blur-soft"
            : "w-full rounded-surface border-transparent bg-transparent px-2 py-2",
        )}
      >
        {children}
      </motion.nav>
    </motion.header>
  );
}
