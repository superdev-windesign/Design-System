"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RiCheckLine } from "@remixicon/react";
import { SpinnerGlyph } from "../../components/spinner/spinner";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { easing, effectDuration } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * MultiStepLoader: a waiting state that says what's happening, one step at a
 * time ("Reading your files", "Drafting the summary"…). Finished steps tick
 * off, the current one spins, and the rest wait in grey. Drive it with
 * `current`, or let it advance on its own every `interval` seconds. Each new
 * step is announced politely.
 */

export interface MultiStepLoaderProps {
  steps: string[];
  /** The step in progress. Leave undefined to advance on a timer. */
  current?: number;
  interval?: number;
  /** Start over after the last step (timer mode only). */
  loop?: boolean;
  className?: string;
}

export function MultiStepLoader({ steps, current, interval = effectDuration.sweep / 2, loop = false, className }: MultiStepLoaderProps) {
  const [auto, setAuto] = useState(0);
  const at = current ?? auto;

  useEffect(() => {
    if (current !== undefined) return;
    const id = setInterval(() => setAuto((i) => (i + 1 >= steps.length + (loop ? 1 : 0) ? (loop ? 0 : i) : i + 1)), interval * 1000);
    return () => clearInterval(id);
  }, [current, interval, loop, steps.length]);

  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const state = i < at ? "done" : i === at ? "current" : "waiting";
          return (
            <motion.li
              key={step}
              initial={false}
              animate={{ opacity: state === "waiting" ? 0.45 : 1, x: state === "current" ? 4 : 0 }}
              transition={{ duration: 0.3, ease: easing.enter }}
              className="flex items-center gap-3"
            >
              <span className="relative flex size-6 shrink-0 items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  {state === "done" ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex size-6 items-center justify-center rounded-full bg-accent-600 text-on-action"
                    >
                      <RiCheckLine aria-hidden className="size-4" />
                    </motion.span>
                  ) : state === "current" ? (
                    <motion.span key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex text-accent-600">
                      <SpinnerGlyph size="md" />
                    </motion.span>
                  ) : (
                    <motion.span key="waiting" className="size-4 rounded-full border-2 border-line-control" />
                  )}
                </AnimatePresence>
              </span>
              <span className={cx("text-body-md", state === "current" ? "text-body-md-strong text-fg" : state === "done" ? "text-fg" : "text-fg-secondary")}>
                {step}
              </span>
            </motion.li>
          );
        })}
      </ol>
      <VisuallyHidden role="status">{steps[at] ? `${steps[at]}, step ${at + 1} of ${steps.length}` : ""}</VisuallyHidden>
    </div>
  );
}
