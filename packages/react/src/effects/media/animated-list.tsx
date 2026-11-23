"use client";

import { Children, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * AnimatedList: items arrive one at a time and drop in on top, nudging the rest
 * down, like notifications landing on a lock screen. Use it for activity feeds
 * and "what's happening" panels. Children are the items, oldest first. With
 * reduced motion they're all there from the start.
 */

export interface AnimatedListProps {
  children: ReactNode;
  /** Seconds between arrivals. */
  delay?: number;
  /** Start again after the last item (for demos and ambient feeds). */
  loop?: boolean;
  className?: string;
}

export function AnimatedList({ children, delay = 1.1, loop = false, className }: AnimatedListProps) {
  const items = Children.toArray(children);
  const calm = useCalmMotion();
  const [count, setCount] = useState(calm ? items.length : 1);

  useEffect(() => {
    if (calm) return setCount(items.length);
    const id = setInterval(() => setCount((n) => (n < items.length ? n + 1 : loop ? 1 : n)), delay * 1000);
    return () => clearInterval(id);
  }, [calm, delay, loop, items.length]);

  const shown = items.slice(0, count).reverse();
  return (
    <ul className={cx("flex flex-col gap-3", className)}>
      <AnimatePresence initial={false}>
        {shown.map((item, i) => (
          <motion.li
            key={(item as { key?: string }).key ?? items.length - i}
            layout={!calm}
            initial={{ opacity: 0, scale: 0.92, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={layoutSpring}
          >
            {item}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
