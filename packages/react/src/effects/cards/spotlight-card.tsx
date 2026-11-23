"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * SpotlightCard: a card lit by a soft pool of the accent that follows the
 * pointer, with a brighter rim where the light meets the border. It suits
 * feature grids and pricing tables. The position is written to CSS variables,
 * so following the pointer never re-renders. Touch and keyboard see a plain
 * card; nothing depends on the light.
 */

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

const pool = (size: string, mix: number): string =>
  `radial-gradient(${size} circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--ds-color-accent-500) ${mix}%, transparent), transparent 70%)`;

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const { style } = event.currentTarget;
    style.setProperty("--spot-x", `${event.clientX - box.left}px`);
    style.setProperty("--spot-y", `${event.clientY - box.top}px`);
    style.setProperty("--spot-on", "1");
  };
  const leave = (event: PointerEvent<HTMLDivElement>) => event.currentTarget.style.setProperty("--spot-on", "0");

  return (
    <div
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ "--spot-on": 0 } as CSSProperties}
      className={cx("relative isolate overflow-hidden rounded-surface border border-line bg-surface", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-(--spot-on) transition-opacity duration-(--ds-motion-duration-moderate)"
        style={{ background: pool("22rem", 14) }}
      />
      {/* The rim: the same light, masked to a one-pixel ring. */}
      <span
        aria-hidden
        className="rounded-inherit pointer-events-none absolute inset-0 opacity-(--spot-on) transition-opacity duration-(--ds-motion-duration-moderate)"
        style={{
          background: pool("12rem", 70),
          padding: 1,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      />
      {children}
    </div>
  );
}
