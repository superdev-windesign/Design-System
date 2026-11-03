"use client";

import { ProgressBar as AriaProgressBar } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Spinner: a pen-nib arc turning on a faint track. The arc is drawn the way a
 * broad nib draws a stroke, full width at the head and thinning to a hairline
 * at the tail, so the turning reads as a pen moving round the circle (the
 * same nib as Checkbox's tick).
 *
 * Five sizes from 12 to 40 pixels. On its own the Spinner is announced as an
 * indeterminate progress bar named "Loading" (override with `aria-label`) and
 * takes the accent; set a text colour with `className` to change it. Inside
 * something that already announces the busy state, such as a pending Button,
 * use `SpinnerGlyph` (or pass `aria-hidden`): the bare arc in `currentColor`,
 * which fits Button's `leadingIcon` slot directly.
 *
 * Reduced motion slows the turn instead of stopping it, because the movement
 * is what says the work is still going (see `animate-spinner`).
 */

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE: Record<SpinnerSize, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
  xl: "size-10",
};

const CENTRE = 12;
const RADIUS = 9;

/** Three quarters of a turn, full width (2.8 units) at the head and a hairline at the tail. */
function nibArcPath() {
  const steps = 32;
  const sweep = 1.5 * Math.PI;
  const head = 2.8;
  const point = (angle: number, r: number) =>
    `${(CENTRE + r * Math.cos(angle)).toFixed(2)} ${(CENTRE + r * Math.sin(angle)).toFixed(2)}`;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 at the tail, 1 at the head
    const angle = -Math.PI / 2 + t * sweep; // from 12 o'clock, clockwise
    const half = (head * t ** 1.4) / 2 + 0.1;
    outer.push(point(angle, RADIUS + half));
    inner.push(point(angle, RADIUS - half));
  }
  const cap = head / 2 + 0.1;
  // Outer edge to the head, a round nib end, then back along the inner edge.
  return `M${outer.join("L")}A${cap} ${cap} 0 0 1 ${inner[steps]}L${inner.reverse().join("L")}Z`;
}

const NIB_ARC = nibArcPath();

export interface SpinnerGlyphProps {
  size?: SpinnerSize;
  /** Draw the faint full circle under the arc. Default true. */
  track?: boolean;
  className?: string;
}

/** The bare arc, in `currentColor`, for icon slots and busy controls. Decorative. */
export function SpinnerGlyph({ size, track = true, className }: SpinnerGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cx("animate-spinner shrink-0", size && SIZE[size], className)}>
      {track && <circle cx={CENTRE} cy={CENTRE} r={RADIUS} stroke="currentColor" strokeWidth="1.25" opacity="0.18" />}
      <path d={NIB_ARC} fill="currentColor" />
    </svg>
  );
}

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Draw the faint full circle under the arc. Default true. */
  track?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export function Spinner({ size = "sm", track = true, className, "aria-label": label = "Loading", "aria-hidden": hidden }: SpinnerProps) {
  if (hidden === true || hidden === "true") return <SpinnerGlyph size={size} track={track} className={className} />;
  return (
    <AriaProgressBar isIndeterminate aria-label={label} className="inline-flex">
      <SpinnerGlyph size={size} track={track} className={cx("text-accent-600", className)} />
    </AriaProgressBar>
  );
}
