"use client";

import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * TracingBeam: a rule down the side of a long article that fills with light as
 * you read, with a dot that lights up once you've started. It turns a timeline,
 * a changelog or a case study into a visible journey. It follows the window,
 * or `scrollRef` inside its own scrolling panel. Purely decorative.
 */

export interface TracingBeamProps {
  children: ReactNode;
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function TracingBeam({ children, scrollRef, className }: TracingBeamProps) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalmMotion();
  const { scrollYProgress } = useScroll({ target: ref, container: scrollRef, offset: ["start 30%", "end 70%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const dot = useTransform(scrollYProgress, (p) => (p > 0.01 ? 1 : 0));

  return (
    <div ref={ref} className={cx("relative ps-10", className)}>
      <div aria-hidden className="absolute start-3 top-2 bottom-0 w-0.5 rounded-full bg-line">
        <motion.span
          className="absolute inset-0 origin-top rounded-full bg-linear-to-b from-accent-500 via-effect-2 to-effect-1"
          style={{ scaleY: calm ? scrollYProgress : progress }}
        />
        <span className="absolute -start-1.5 -top-2 flex size-3.5 items-center justify-center rounded-full border border-line-control bg-surface shadow-raised">
          <motion.span className="size-1.5 rounded-full bg-accent-500" style={{ opacity: dot }} />
        </span>
      </div>
      {children}
    </div>
  );
}
