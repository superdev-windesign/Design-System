"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * Marquee: a row (or column) of content that scrolls endlessly: logo walls,
 * testimonials, a ticker. The content is repeated to fill the loop; only the
 * first copy is read by assistive tech. It pauses while hovered or while
 * something inside has focus, and with reduced motion it stops and the row can
 * be scrolled by hand instead.
 */

export interface MarqueeProps {
  children: ReactNode;
  vertical?: boolean;
  reverse?: boolean;
  /** Multiplies the pass time: 2 is half as fast. */
  speed?: number;
  /** Gap between items, in spacing units. */
  gap?: number;
  /** Copies of the content in the loop. */
  repeat?: number;
  pauseOnHover?: boolean;
  /** Fade the content out at the edges. */
  fade?: boolean;
  className?: string;
}

export function Marquee({ children, vertical = false, reverse = false, speed = 1, gap = 6, repeat = 2, pauseOnHover = true, fade = true, className }: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  const edge = vertical ? "to bottom" : "to right";
  return (
    <div
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={
        {
          "--marquee-gap": `calc(var(--spacing) * ${gap})`,
          "--marquee-speed": speed,
          gap: "var(--marquee-gap)",
          maskImage: fade ? `linear-gradient(${edge}, transparent, #000 12%, #000 88%, transparent)` : undefined,
        } as CSSProperties
      }
      className={cx("flex overflow-hidden motion-reduce:overflow-auto", vertical ? "flex-col" : "flex-row", className)}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          // The copies only fill the loop: inert keeps their links and controls out of
          // the tab order and the accessibility tree, so each item is reached once.
          aria-hidden={i > 0 || undefined}
          inert={i > 0 || undefined}
          style={{ gap: "var(--marquee-gap)", animationDirection: reverse ? "reverse" : undefined, animationPlayState: paused ? "paused" : undefined }}
          className={cx("flex shrink-0 justify-around", vertical ? "animate-marquee-y flex-col" : "animate-marquee flex-row")}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
