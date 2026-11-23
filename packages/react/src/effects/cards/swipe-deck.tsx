"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { RiArrowGoBackLine, RiCloseLine, RiHeartLine } from "@remixicon/react";
import { IconButton } from "../../components/buttons/icon-button";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * SwipeDeck: a stack of cards to sort one at a time. Fling the top card left or
 * right; it tips as it goes, flies off, and the next card rises to the top.
 * The buttons underneath do the same for anyone not dragging, and a polite live
 * region names the card that's now on top. At the end the deck can start over.
 */

export type SwipeDirection = "left" | "right";

export interface SwipeDeckProps<T> {
  items: T[];
  getKey: (item: T) => string;
  /** Short name for the card, for the buttons and announcements. */
  getLabel: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onSwipe?: (item: T, direction: SwipeDirection) => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

const THRESHOLD = 110;

function TopCard({ children, onSwipe }: { children: ReactNode; onSwipe: (dir: SwipeDirection) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  return (
    <motion.div
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      style={{ x, rotate }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > THRESHOLD || Math.abs(info.velocity.x) > 600) onSwipe(info.offset.x < 0 ? "left" : "right");
      }}
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
    >
      {children}
    </motion.div>
  );
}

export function SwipeDeck<T>({ items, getKey, getLabel, renderItem, onSwipe, leftLabel = "Pass", rightLabel = "Keep", className }: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const [exit, setExit] = useState<SwipeDirection>("left");
  const calm = useCalmMotion();
  const remaining = items.slice(index, index + 3);
  const top = items[index];

  const swipe = (direction: SwipeDirection) => {
    if (!top) return;
    setExit(direction);
    onSwipe?.(top, direction);
    setIndex((i) => i + 1);
  };

  return (
    <div className={cx("flex flex-col items-center gap-5", className)}>
      <div className="relative h-80 w-64">
        <AnimatePresence custom={exit}>
          {remaining
            .map((item, depth) => (
              <motion.div
                key={getKey(item)}
                className="absolute inset-0"
                initial={false}
                animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 1 ? 0.6 : 1 }}
                exit={calm ? { opacity: 0 } : { x: exit === "left" ? -420 : 420, rotate: exit === "left" ? -24 : 24, opacity: 0 }}
                transition={layoutSpring}
                style={{ zIndex: 10 - depth }}
              >
                {depth === 0 ? <TopCard onSwipe={swipe}>{renderItem(item)}</TopCard> : <div className="absolute inset-0">{renderItem(item)}</div>}
              </motion.div>
            ))
            .reverse()}
        </AnimatePresence>
        {!top && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-surface border border-dashed border-line-control text-body-md text-fg-secondary">
            That's everything
            <IconButton icon={RiArrowGoBackLine} size="small" aria-label="Start over" onClick={() => setIndex(0)} />
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <IconButton icon={RiCloseLine} aria-label={top ? `${leftLabel}: ${getLabel(top)}` : leftLabel} disabled={!top} onClick={() => swipe("left")} />
        <IconButton icon={RiHeartLine} aria-label={top ? `${rightLabel}: ${getLabel(top)}` : rightLabel} disabled={!top} onClick={() => swipe("right")} />
      </div>
      <VisuallyHidden aria-live="polite">{top ? `${getLabel(top)}, ${index + 1} of ${items.length}` : "No cards left"}</VisuallyHidden>
    </div>
  );
}
