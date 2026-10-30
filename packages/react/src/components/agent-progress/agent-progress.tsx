"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiContractUpDownLine, RiExpandUpDownLine } from "@remixicon/react";
import { easing, layoutSpring } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Agent Progress: a multi-step task as a ledger. Steps are numbered in roman
 * numerals; a terracotta rule along the top grows as steps complete; the
 * current step is underlined by a stroke that keeps writing itself, and
 * finished steps get a check that draws in. Collapse it to a single line that
 * keeps counting. A polite status line narrates progress for screen readers.
 */

export const DEFAULT_AGENT_PROGRESS_STEPS = [
  "Read project files",
  "Update light mode tokens",
  "Implement dark mode tokens",
  "Register the theme toggle",
  "Run lint and production build",
] as const;

export interface AgentProgressProps {
  /** Ordered step labels. An empty list falls back to the defaults. */
  steps?: readonly string[];
  /** Milliseconds each step stays active. Default 3000. */
  stepDuration?: number;
  /** Milliseconds the finished ledger shows before `onFinished`. Default 1000. */
  completionDelay?: number;
  /** Fires once, `completionDelay` ms after the last step completes. */
  onFinished?: () => void;
  /** Holds the timeline where it is. */
  isPaused?: boolean;
  className?: string;
  /** Accessible name for the block. Default "Agent progress". */
  "aria-label"?: string;
}

/** A beat for the rows to land before the first step starts counting. */
const START_DELAY = 600;

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];
const numeral = (i: number) => ROMAN[i] ?? String(i + 1);

function Check({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-accent-600">
      <motion.path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: easing.enter }}
      />
    </svg>
  );
}

export function AgentProgress({
  steps: given,
  stepDuration = 3000,
  completionDelay = 1000,
  onFinished,
  isPaused = false,
  className,
  "aria-label": ariaLabel = "Agent progress",
}: AgentProgressProps) {
  const steps = given && given.length > 0 ? given : DEFAULT_AGENT_PROGRESS_STEPS;
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const listId = useId();
  const finished = useRef(false);
  const started = useRef(false);

  const done = active >= steps.length;
  const left = steps.length - Math.min(active, steps.length);

  // The timeline: wait for the rows, then one step per `stepDuration`.
  useEffect(() => {
    if (isPaused || done) return;
    const delay = (started.current ? 0 : START_DELAY) + stepDuration;
    const timer = setTimeout(() => {
      started.current = true;
      setActive((a) => a + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [active, done, isPaused, stepDuration]);

  useEffect(() => {
    if (!done || isPaused || finished.current) return;
    const timer = setTimeout(() => {
      finished.current = true;
      onFinished?.();
    }, completionDelay);
    return () => clearTimeout(timer);
  }, [done, isPaused, completionDelay, onFinished]);

  const current = steps[Math.min(active, steps.length - 1)];
  const progress = Math.min(active, steps.length) / steps.length;
  const leftLabel = `${left} ${left === 1 ? "step" : "steps"} left`;

  return (
    <section aria-label={ariaLabel} className={cx("flex w-full max-w-md flex-col overflow-hidden rounded-surface border border-line bg-surface", className)}>
      <header className="flex items-center gap-3 px-4 pt-3.5 pb-3">
        <p className="flex-1 font-mono text-caption tracking-wide text-fg-secondary uppercase">
          {done ? "Done" : "Working"} <span aria-hidden>·</span> <span className="tabular-nums">{done ? `${steps.length} of ${steps.length}` : leftLabel}</span>
        </p>
        <button
          type="button"
          aria-label={collapsed ? "Expand steps" : "Minimize steps"}
          aria-expanded={!collapsed}
          aria-controls={listId}
          onClick={() => setCollapsed((c) => !c)}
          className={cx(
            "flex max-w-[60%] items-center gap-2 rounded-control-sm px-1.5 py-1 text-body-sm text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg",
            focusRingNative,
          )}
        >
          {collapsed && <span className="truncate font-display text-body-md text-fg italic">{done ? "All steps completed" : current}</span>}
          {collapsed ? <RiExpandUpDownLine aria-hidden className="size-4 shrink-0" /> : <RiContractUpDownLine aria-hidden className="size-4 shrink-0" />}
        </button>
      </header>

      {/* The rule: grows with each finished step. */}
      <div aria-hidden className="mx-4 h-0.5 overflow-hidden rounded-full bg-chart-track">
        <motion.div
          className="h-full origin-left rounded-full bg-accent-500 rtl:origin-right"
          initial={false}
          animate={{ scaleX: progress }}
          transition={reduceMotion ? { duration: 0 } : layoutSpring}
        />
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            id={listId}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easing.standard }}
            className="overflow-hidden"
          >
            <ol className="flex flex-col px-4 pt-2 pb-3">
              {steps.map((step, i) => {
                const isDone = i < active;
                const isCurrent = i === active && !done;
                return (
                  <motion.li
                    key={`${i}-${step}`}
                    aria-current={isCurrent ? "step" : undefined}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.07, ease: easing.enter }}
                    className="grid grid-cols-[2rem_1fr_1rem] items-baseline gap-2 border-b border-line py-2.5 last:border-b-0"
                  >
                    <span className={cx("font-mono text-caption", isCurrent ? "text-accent-600" : "text-fg-secondary")}>{numeral(i)}.</span>
                    <span className="relative justify-self-start">
                      <span
                        className={cx(
                          "text-body-md transition-colors duration-(--ds-motion-duration-moderate)",
                          isCurrent && "font-display text-fg italic",
                          isDone && "text-fg-secondary",
                          !isDone && !isCurrent && "text-fg-secondary",
                        )}
                      >
                        {step}
                      </span>
                      {isDone && <span className="sr-only">, completed</span>}
                      {isCurrent && !isPaused && (
                        // The pen stroke: writes under the active step, lifts, and writes again.
                        <motion.span
                          aria-hidden
                          className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent-500 rtl:origin-right"
                          initial={{ scaleX: 0, opacity: 1 }}
                          animate={reduceMotion ? { scaleX: 1 } : { scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
                          transition={reduceMotion ? { duration: 0 } : { duration: 1.6, times: [0, 0.7, 1], repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </span>
                    <span className="flex justify-end">{isDone && <Check reduceMotion={reduceMotion} />}</span>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      <p role="status" className="sr-only">
        {done ? "All steps completed" : `${leftLabel}. Current step: ${current}`}
      </p>
    </section>
  );
}
