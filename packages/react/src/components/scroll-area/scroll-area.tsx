"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * ScrollArea: a fixed-size region that scrolls, with thin scrollbars in the
 * control-border colour and a hairline rule that appears along an edge while
 * there's more content past it, like a page running on under a header.
 *
 * Native scrolling is kept (momentum, keyboard, assistive tech). When the
 * content overflows, the region becomes a tab stop so it can be scrolled
 * with the keyboard; name it with `aria-label`.
 */

export interface ScrollAreaProps {
  children: ReactNode;
  orientation?: "vertical" | "horizontal" | "both";
  "aria-label"?: string;
  className?: string;
  /** Classes for the scrolling element itself (padding, gap). */
  viewportClassName?: string;
}

export function ScrollArea({ children, orientation = "vertical", "aria-label": ariaLabel, className, viewportClassName }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false, start: false, end: false, overflows: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = Math.abs(el.scrollLeft);
    const next = {
      top: el.scrollTop > 1,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
      start: left > 1,
      end: left + el.clientWidth < el.scrollWidth - 1,
      overflows: el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
    };
    setEdges((prev) => (Object.keys(next).every((k) => prev[k as keyof typeof next] === next[k as keyof typeof next]) ? prev : next));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure]);

  const vertical = orientation !== "horizontal";
  const horizontal = orientation !== "vertical";
  const rule = "pointer-events-none absolute z-10 bg-line transition-opacity duration-(--ds-motion-duration-base)";

  return (
    <div className={cx("relative flex min-h-0 min-w-0 flex-col", className)}>
      <div
        ref={ref}
        onScroll={measure}
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        tabIndex={edges.overflows ? 0 : undefined}
        className={cx(
          "min-h-0 flex-1 scrollbar-thin rounded-[inherit]",
          vertical ? "overflow-y-auto" : "overflow-y-hidden",
          horizontal ? "overflow-x-auto" : "overflow-x-hidden",
          focusRingNative,
          "focus-visible:-outline-offset-2",
          viewportClassName,
        )}
      >
        {children}
      </div>
      {vertical && (
        <>
          <span aria-hidden className={cx(rule, "inset-x-0 top-0 h-px", edges.top ? "opacity-100" : "opacity-0")} />
          <span aria-hidden className={cx(rule, "inset-x-0 bottom-0 h-px", edges.bottom ? "opacity-100" : "opacity-0")} />
        </>
      )}
      {horizontal && (
        <>
          <span aria-hidden className={cx(rule, "inset-y-0 start-0 w-px", edges.start ? "opacity-100" : "opacity-0")} />
          <span aria-hidden className={cx(rule, "inset-y-0 end-0 w-px", edges.end ? "opacity-100" : "opacity-0")} />
        </>
      )}
    </div>
  );
}
