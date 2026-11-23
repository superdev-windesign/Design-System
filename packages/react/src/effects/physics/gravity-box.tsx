"use client";

import { Children, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useCalmMotion, useOnScreen } from "../shared";
import { usePhysicsBodies } from "./use-physics-bodies";

/**
 * GravityBox: a box of things (tags, skills, logos) that fall the moment it
 * scrolls into view, pile up at the bottom, and can be picked up and thrown
 * around. The items stay in document order for assistive tech; only their
 * picture moves. With reduced motion they stay neatly where they were laid out.
 */

export interface GravityBoxProps {
  children: ReactNode;
  className?: string;
}

export function GravityBox({ children, className }: GravityBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const onScreen = useOnScreen(ref, "-20% 0px");
  const calm = useCalmMotion();
  if (onScreen && !seen) setSeen(true);
  usePhysicsBodies(ref, seen && !calm);

  return (
    <div ref={ref} className={cx("relative flex h-72 flex-wrap content-start justify-center gap-2 overflow-hidden rounded-surface border border-line bg-surface p-4", className)}>
      {Children.toArray(children).map((child, i) => (
        <span key={i} data-body className="inline-flex cursor-grab touch-none select-none active:cursor-grabbing">
          {child}
        </span>
      ))}
    </div>
  );
}
