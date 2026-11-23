"use client";

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motion } from "motion/react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { IconButton } from "../../components/buttons/icon-button";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { layoutSpring } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * Coverflow: a carousel in 3D. The current card faces you and the others turn
 * away on either side, stacked into the distance. Drag or swipe, use the arrow
 * buttons or the arrow keys, or press a side card to bring it round. It's a
 * labelled carousel region and the current card is announced.
 */

export interface CoverflowItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface CoverflowProps {
  items: CoverflowItem[];
  "aria-label": string;
  defaultIndex?: number;
  className?: string;
}

export function Coverflow({ items, "aria-label": label, defaultIndex = 0, className }: CoverflowProps) {
  const [active, setActive] = useState(defaultIndex);
  const calm = useCalmMotion();
  const go = (i: number) => setActive(Math.max(0, Math.min(items.length - 1, i)));

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(active - 1);
    if (event.key === "ArrowRight") go(active + 1);
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown} className={cx("flex flex-col items-center gap-4", className)}>
      <motion.div
        className="relative h-56 w-full touch-pan-y perspective-distant transform-3d"
        onPanEnd={(_, info) => {
          if (info.offset.x < -40) go(active + 1);
          if (info.offset.x > 40) go(active - 1);
        }}
      >
        {items.map((item, i) => {
          const offset = i - active;
          const distance = Math.abs(offset);
          return (
            <motion.button
              key={item.id}
              type="button"
              aria-roledescription="slide"
              aria-label={`${item.label}, ${i + 1} of ${items.length}`}
              aria-current={offset === 0 || undefined}
              tabIndex={offset === 0 ? 0 : -1}
              onClick={() => go(i)}
              initial={false}
              animate={{
                x: `${offset * 58}%`,
                rotateY: calm ? 0 : Math.max(-55, Math.min(55, -offset * 48)),
                z: -distance * 110,
                scale: offset === 0 ? 1 : 0.88,
                opacity: distance > 3 ? 0 : 1,
              }}
              transition={layoutSpring}
              style={{ zIndex: 100 - distance }}
              className={cx("absolute top-0 left-1/2 -ms-24 h-56 w-48 cursor-pointer overflow-hidden rounded-surface shadow-overlay", focusRingNative)}
            >
              {item.content}
            </motion.button>
          );
        })}
      </motion.div>
      <div className="flex items-center gap-3">
        <IconButton icon={RiArrowLeftSLine} size="small" aria-label="Previous" disabled={active === 0} onClick={() => go(active - 1)} />
        <span className="min-w-28 text-center text-body-sm text-fg-secondary">{items[active]?.label}</span>
        <IconButton icon={RiArrowRightSLine} size="small" aria-label="Next" disabled={active === items.length - 1} onClick={() => go(active + 1)} />
      </div>
      <VisuallyHidden aria-live="polite">{items[active] ? `${items[active].label}, ${active + 1} of ${items.length}` : ""}</VisuallyHidden>
    </section>
  );
}
