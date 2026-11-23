"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { RiCheckLine } from "@remixicon/react";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { effectDuration } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * HoldButton: press and hold to confirm. Colour fills the button from the start
 * edge while it's held; let go early and it drains away and nothing happens.
 * It's the gentler alternative to a confirm dialog for actions that are hard to
 * undo. Space and Enter can be held the same way, and the instruction is read
 * out with the label.
 */

export type HoldButtonTone = "accent" | "danger";

export interface HoldButtonProps {
  children: ReactNode;
  onConfirm: () => void;
  tone?: HoldButtonTone;
  /** Seconds it must be held. */
  duration?: number;
  confirmedLabel?: string;
  isDisabled?: boolean;
  className?: string;
}

const FILL: Record<HoldButtonTone, string> = {
  accent: "bg-accent-600 text-on-action",
  danger: "bg-status-danger-solid text-on-action",
};

export function HoldButton({ children, onConfirm, tone = "danger", duration = effectDuration.hold, confirmedLabel = "Confirmed", isDisabled, className }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hintId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  const start = () => {
    if (done) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      setDone(true);
      onConfirm();
      timer.current = setTimeout(() => setDone(false), 1800);
    }, duration * 1000);
  };
  const stop = () => {
    if (done) return;
    clearTimeout(timer.current);
    setHolding(false);
  };

  const label = done ? (
    <>
      <RiCheckLine aria-hidden className="size-4" />
      {confirmedLabel}
    </>
  ) : (
    children
  );

  return (
    <AriaButton
      onPressStart={start}
      onPressEnd={stop}
      isDisabled={isDisabled}
      aria-describedby={hintId}
      className={cx(
        "relative inline-flex h-control-md cursor-pointer items-center justify-center overflow-hidden rounded-control-md border border-line-control bg-surface px-4 text-body-md-strong text-fg select-none",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
        focusRing,
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">{label}</span>
      {/* The fill carries a copy of the label in the fill's own text colour, clipped to the fill. */}
      <span
        aria-hidden
        className={cx("absolute inset-0 flex items-center justify-center", FILL[tone])}
        style={{
          clipPath: done || holding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path ${holding ? duration : 0.3}s ${holding ? "linear" : "var(--ds-motion-easing-out)"}`,
        }}
      >
        <span className="inline-flex items-center gap-1.5">{label}</span>
      </span>
      <VisuallyHidden id={hintId}>Press and hold to confirm</VisuallyHidden>
      <VisuallyHidden aria-live="polite">{done ? confirmedLabel : ""}</VisuallyHidden>
    </AriaButton>
  );
}
