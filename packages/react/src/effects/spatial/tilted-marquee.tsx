import type { ReactNode } from "react";
import { Marquee } from "../media/marquee";
import { cx } from "../../utils/cx";

/**
 * TiltedMarquee: columns of cards laid on a tilted plane, each column scrolling
 * the opposite way to its neighbour, so a wall of screenshots or testimonials
 * seems to drift past in 3D. Only the first copy of each column is read by
 * assistive tech; with reduced motion the wall holds still.
 */

export interface TiltedMarqueeProps {
  items: ReactNode[];
  /** Columns to deal the items into. */
  columns?: number;
  className?: string;
}

export function TiltedMarquee({ items, columns = 4, className }: TiltedMarqueeProps) {
  const cols = Array.from({ length: columns }, (_, c) => items.filter((_, i) => i % columns === c));
  return (
    <div className={cx("relative h-96 w-full overflow-hidden perspective-midrange", className)}>
      <div className="absolute -inset-1/4 flex rotate-x-40 -rotate-z-20 gap-4 transform-3d">
        {cols.map((col, c) => (
          <Marquee key={c} vertical reverse={c % 2 === 1} speed={0.9 + c * 0.15} gap={4} fade={false} className="h-full flex-1">
            {col}
          </Marquee>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-b from-canvas via-transparent to-canvas" />
    </div>
  );
}
