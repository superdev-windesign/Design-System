"use client";

import { useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { easing } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * StickyScrollReveal: a feature tour where the text scrolls and the picture
 * stays. Each section's heading and copy pass by on one side while a pinned
 * panel on the other cross-fades to that section's visual. The section being
 * read is full strength and the rest recede. Everything is ordinary content,
 * in order, for assistive tech.
 */

export interface StickyScrollItem {
  title: string;
  description: ReactNode;
  visual: ReactNode;
}

export interface StickyScrollRevealProps {
  items: StickyScrollItem[];
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function StickyScrollReveal({ items, scrollRef, className }: StickyScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, container: scrollRef, offset: ["start 40%", "end 60%"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(items.length - 1, Math.max(0, Math.floor(p * items.length)))));

  return (
    <div ref={ref} className={cx("grid grid-cols-1 gap-10 md:grid-cols-2", className)}>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <section
            key={item.title}
            className={cx("flex min-h-72 flex-col justify-center gap-3 transition-opacity duration-(--ds-motion-duration-slow)", i === active ? "opacity-100" : "opacity-35")}
          >
            <h3 className="text-title-md-strong text-fg">{item.title}</h3>
            <div className="text-body-md text-fg-secondary">{item.description}</div>
          </section>
        ))}
      </div>
      <div className="relative hidden md:block">
        <div className="sticky top-16 h-64 overflow-hidden rounded-surface border border-line bg-surface shadow-raised">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              aria-hidden
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: easing.enter }}
            >
              {items[active]?.visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
