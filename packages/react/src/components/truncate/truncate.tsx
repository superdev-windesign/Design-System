"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Focusable } from "react-aria-components";
import { Tooltip, TooltipTrigger } from "../tooltip/tooltip";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Truncate: text cut to one line (or `lines`) with an ellipsis, and the full
 * text in a tooltip, but only when it was actually cut. Then it also becomes
 * focusable, so keyboard users can read the tooltip too. Screen readers
 * always get the whole text.
 */

const CLAMP = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" } as const;

export interface TruncateProps {
  children: string;
  /** Lines before the ellipsis. Default 1. */
  lines?: 1 | 2 | 3 | 4;
  /** Show the full text in a tooltip when cut. Default true. */
  showTooltip?: boolean;
  className?: string;
}

export function Truncate({ children, lines = 1, showTooltip = true, className }: TruncateProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCut(lines === 1 ? el.scrollWidth > el.clientWidth + 1 : el.scrollHeight > el.clientHeight + 1);
  }, [lines]);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, children]);

  const text = (
    <span
      ref={ref}
      tabIndex={cut && showTooltip ? 0 : undefined}
      className={cx("block min-w-0 rounded-xs", lines === 1 ? "truncate" : CLAMP[lines as 2 | 3 | 4], cut && showTooltip && focusRingNative, className)}
    >
      {children}
    </span>
  );

  if (!cut || !showTooltip) return text;
  return (
    <TooltipTrigger delay={400}>
      <Focusable>{text}</Focusable>
      <Tooltip className="max-w-xs">{children}</Tooltip>
    </TooltipTrigger>
  );
}
