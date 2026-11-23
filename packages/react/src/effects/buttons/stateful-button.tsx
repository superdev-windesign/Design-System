"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RiCheckLine, RiErrorWarningLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import type { ButtonSize, ButtonVariant } from "../../components/button/button";
import { SpinnerGlyph } from "../../components/spinner/spinner";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { easing } from "../../motion/tokens";

/**
 * StatefulButton: a button that shows its own outcome. Press it and the label
 * gives way to a spinner while `onPress`'s promise runs, then to a tick (or a
 * warning if it rejected), then back to the label. The button can't be pressed
 * again while it's busy, and a polite live region says each state aloud.
 */

export type StatefulButtonState = "idle" | "pending" | "success" | "error";

export interface StatefulButtonProps {
  children: ReactNode;
  /** Return a promise to show pending and its outcome. */
  onPress: () => Promise<unknown> | void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pendingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  /** Seconds the outcome shows before the label returns. */
  resetAfter?: number;
  isDisabled?: boolean;
  className?: string;
}

const swap = {
  initial: { opacity: 0, y: 8, filter: "blur(2px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(2px)" },
  transition: { duration: 0.2, ease: easing.enter },
};

export function StatefulButton({
  children,
  onPress,
  variant = "primary",
  size = "md",
  pendingLabel = "Working…",
  successLabel = "Done",
  errorLabel = "Try again",
  resetAfter = 1.6,
  isDisabled,
  className,
}: StatefulButtonProps) {
  const [state, setState] = useState<StatefulButtonState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const run = async () => {
    if (state === "pending") return;
    clearTimeout(timer.current);
    setState("pending");
    try {
      await onPress();
      setState("success");
    } catch {
      setState("error");
    }
    timer.current = setTimeout(() => setState("idle"), resetAfter * 1000);
  };

  const content =
    state === "pending" ? (
      <>
        <SpinnerGlyph size="sm" track={false} />
        {pendingLabel}
      </>
    ) : state === "success" ? (
      <>
        <RiCheckLine aria-hidden className="size-4" />
        {successLabel}
      </>
    ) : state === "error" ? (
      <>
        <RiErrorWarningLine aria-hidden className="size-4" />
        {errorLabel}
      </>
    ) : (
      children
    );

  return (
    <>
      <Button variant={variant} size={size} onPress={run} isDisabled={isDisabled} aria-disabled={state === "pending" || undefined} className={className}>
        <span className="relative inline-flex overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={state} {...swap} className="inline-flex items-center gap-1.5">
              {content}
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>
      <VisuallyHidden aria-live="polite">{state === "pending" ? pendingLabel : state === "success" ? successLabel : state === "error" ? errorLabel : ""}</VisuallyHidden>
    </>
  );
}
