"use client";
// Sizes and the shared-glyph split were first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion below are Windesign's own.
import { useRef } from "react";
import { cx } from "../../utils/cx";

export type CheckboxSize = "sm" | "md";

export const checkboxSizes: Record<
  CheckboxSize,
  { box: string; glyph: string; label: string; gap: string }
> = {
  md: { box: "size-4", glyph: "size-4", label: "text-body-md-strong", gap: "gap-2" },
  sm: { box: "size-3.5", glyph: "size-3.5", label: "text-body-sm-strong", gap: "gap-1.5" },
};

export interface CheckboxGlyphState {
  isSelected: boolean;
  isIndeterminate: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isHovered: boolean;
  isPressed?: boolean;
}

/**
 * A pen-nib tick: a thick short stroke into the corner, then a long stroke
 * that thins to a point, the way a broad nib held at 45° draws a check.
 */
export const CHECK_TICK_PATH = "M2.65 9.25Q2.65 7.55 4.35 7.55L6.5 9.7L12.5 3.74Q13.45 3.24 13.1 4.26L7.34 12.11Q6.5 13.1 5.65 12.25Z";

/** The same nib drawing a dash: full width on the left, thinning to the right. */
const DASH = "M4.6 6.85L11.6 7.4Q12.4 8 11.6 8.6L4.6 9.15Q3.45 8 4.6 6.85Z";

/**
 * Whether a mark should ink in: only once someone has turned it on, so marks
 * that load already set (a saved form, table rows scrolling into view) just
 * appear.
 */
export function useInkIn(isOn: boolean) {
  const onSinceMount = useRef(isOn);
  if (!isOn) onSinceMount.current = false;
  return isOn && !onSinceMount.current;
}

/**
 * The checkbox box and its mark. Shared by Checkbox and CheckboxCard so they
 * stay identical.
 *
 * A crisp ledger box on the paper. Checking it spreads the accent out from
 * the centre as a circle (the same motif as the accent and theme reveal),
 * then inks the tick in from the left. Unchecking draws the ink back in.
 * Hover deepens the ink; a press presses the box in slightly.
 */
export function CheckboxGlyph({
  state,
  size = "md",
}: {
  state: CheckboxGlyphState;
  size?: CheckboxSize;
}) {
  const { isSelected, isIndeterminate, isFocusVisible, isDisabled, isHovered, isPressed } = state;
  const s = checkboxSizes[size];
  const isMarked = isSelected || isIndeterminate;
  const hover = isHovered && !isDisabled;
  const inkIn = useInkIn(isMarked);

  return (
    <span
      aria-hidden
      data-marked={isMarked || undefined}
      className={cx(
        "bui-control-mark relative flex shrink-0 items-center justify-center overflow-hidden rounded-control-xs border bg-surface",
        "transition-[border-color,scale] duration-(--ds-motion-duration-base) ease-standard motion-reduce:transition-none",
        s.box,
        isMarked
          ? hover ? "border-accent-700" : "border-accent-600"
          : hover ? "border-line-control-hover" : "border-line-control",
        isPressed && !isDisabled && "scale-90",
        isDisabled && "opacity-50",
        isFocusVisible && "outline-2 outline-focus outline-offset-2",
      )}
    >
      {/* The ink: a circle wider than the box, so at full size it covers the corners. */}
      <span
        className={cx(
          "absolute -inset-1 rounded-full transition-transform duration-(--ds-motion-duration-moderate) ease-out motion-reduce:transition-none",
          hover ? "bg-accent-700" : "bg-accent-600",
          isMarked ? "scale-100" : "scale-0",
        )}
      />
      {isMarked && (
        <svg viewBox="0 0 16 16" className={cx("relative text-on-action", s.glyph)}>
          <path d={isIndeterminate ? DASH : CHECK_TICK_PATH} fill="currentColor" className={cx(inkIn && "animate-check-ink")} />
        </svg>
      )}
    </span>
  );
}
