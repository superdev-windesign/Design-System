"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * Skeleton: grey paper where content is about to appear, so the layout
 * doesn't jump when it loads. A slow sweep shows it's working (still under
 * reduced motion, without the sweep).
 *
 * Skeletons are hidden from screen readers. Mark the region that's loading
 * with `SkeletonGroup` (which sets `aria-busy` and announces a label), or
 * pass `isLoaded` and children to swap in the real content, which arrives
 * through a short blur (a plain cut under reduced motion).
 */

export interface SkeletonProps {
  className?: string;
  /** `text` matches a line of body text, `circle` an avatar. Default `block`. */
  shape?: "block" | "text" | "circle";
  /** Render children instead once loaded. */
  isLoaded?: boolean;
  children?: ReactNode;
}

export function Skeleton({ className, shape = "block", isLoaded, children }: SkeletonProps) {
  // Loaded content comes in from a soft blur rather than snapping into place.
  if (isLoaded) return <div className="animate-reveal">{children}</div>;
  return (
    <span
      aria-hidden
      className={cx(
        "block animate-skeleton",
        shape === "circle" && "size-10 rounded-full",
        shape === "text" && "h-3 w-full rounded-xs",
        shape === "block" && "h-24 w-full rounded-surface",
        className,
      )}
    />
  );
}

export interface SkeletonTextProps {
  /** Number of lines. The last is shorter, like the end of a paragraph. Default 3. */
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <span aria-hidden className={cx("flex w-full flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} shape="text" className={i === lines - 1 && lines > 1 ? "w-3/5" : undefined} />
      ))}
    </span>
  );
}

export interface SkeletonGroupProps {
  /** Announced while loading. Default "Loading". */
  label?: string;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

/** The region that's loading: busy for assistive tech, with a polite status line. */
export function SkeletonGroup({ label = "Loading", isLoading = true, children, className }: SkeletonGroupProps) {
  return (
    <div aria-busy={isLoading || undefined} className={className}>
      <span role="status" className="sr-only">
        {isLoading ? label : ""}
      </span>
      {children}
    </div>
  );
}
