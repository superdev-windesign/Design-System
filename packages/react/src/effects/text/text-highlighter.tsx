"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useOnScreen } from "../shared";

/**
 * TextHighlighter: a marker stroke draws itself behind a phrase when it scrolls
 * into view, and wraps cleanly across line breaks. `shape` picks a marker band,
 * an underline or a full box. It's a <mark>, so the emphasis is semantic too.
 * The colour is the selection tint, which reads in both themes.
 */

export type HighlightShape = "marker" | "underline" | "box";

export interface TextHighlighterProps {
  children: ReactNode;
  shape?: HighlightShape;
  /** Draw on scroll into view (default) or immediately. */
  startOnView?: boolean;
  className?: string;
}

export function TextHighlighter({ children, shape = "marker", startOnView = true, className }: TextHighlighterProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useRef(false);
  const onScreen = useOnScreen(ref, "-10% 0px");
  if (onScreen) seen.current = true;
  const on = !startOnView || seen.current;
  return (
    <mark ref={ref} data-shape={shape} data-on={on || undefined} className={cx("highlight-sweep bg-transparent text-inherit", className)}>
      {children}
    </mark>
  );
}
