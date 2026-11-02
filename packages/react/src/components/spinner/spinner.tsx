"use client";

import { ProgressBar as AriaProgressBar } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Spinner: a quarter arc turning on a faint ring, drawn in `currentColor` so
 * it takes the colour of whatever it sits in (a button label, a status line).
 *
 * On its own it is an indeterminate progress bar named "Loading" (override
 * with `aria-label`). Inside something that already announces the busy state,
 * such as a pending Button, pass `aria-hidden` and it renders only the glyph.
 * It also fits the `leadingIcon` slot of Button directly.
 */

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

const SIZE: Record<SpinnerSize, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
};

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

function Glyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cx("animate-spinner", className)}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Spinner({ size = "sm", className, "aria-label": label = "Loading", "aria-hidden": hidden }: SpinnerProps) {
  const glyph = cx("shrink-0", SIZE[size], className);
  if (hidden === true || hidden === "true") return <Glyph className={glyph} />;
  return (
    <AriaProgressBar isIndeterminate aria-label={label} className="inline-flex">
      <Glyph className={glyph} />
    </AriaProgressBar>
  );
}
