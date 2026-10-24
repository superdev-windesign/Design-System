// Adapted from BoardUI Pro — Agent Progress — under the repository owner's BoardUI Pro
// license. Not covered by the MIT notice; see THIRD_PARTY_NOTICES.md before redistributing.
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { easing, layoutSpring } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Collapsible progress for multi-step AI work, at visual parity with BoardUI's
 * Agent Progress block.
 *
 * Timeline (defaults): the card grows in (650ms), steps enter with a 160ms
 * stagger after 650ms, and processing starts at 1.1s. Each step is then
 * active for `stepDuration` ms; when the last completes, `onFinished` fires
 * after `completionDelay` ms.
 *
 * Choreography:
 * - One overall ring (top-start corner) sweeps linearly across the whole job.
 *   It sits outside the expanded/minimized views, so it keeps its progress
 *   while the card is minimized and restored.
 * - The active step widens into a pill; its outline is a shared-layout
 *   element (`layoutId`), so it glides to the next row on a spring.
 * - The active step's own ring sweeps for one step; on completion a check pops
 *   in (scale + rotate) and a strike-through draws across the label.
 * - The header countdown cross-fades with a small blur and vertical shift.
 * - Minimize collapses the card to 44px and shows the current step; restoring
 *   re-staggers the rows quickly (35ms instead of 160ms).
 *
 * Reduced motion: transform and layout animations are skipped (MotionConfig
 * `reducedMotion="user"`), the shimmer becomes static text, and the progress
 * rings still advance because they carry information.
 */

export const DEFAULT_AGENT_PROGRESS_STEPS = [
  "Read project files",
  "Update and install light mode tokens",
  "Implement dark mode tokens",
  "Add reusable registered theme toggle",
  "Run registry, lint and production build",
] as const;

export interface AgentProgressProps {
  /** Ordered step labels. Height, countdown and progress are derived from this list. */
  steps?: readonly string[];
  /** Milliseconds each step stays active. Default 3000. */
  stepDuration?: number;
  /** Milliseconds the completed state shows before `onFinished`. Default 1000. */
  completionDelay?: number;
  /** Fires once, `completionDelay` ms after the last step completes. */
  onFinished?: () => void;
  /**
   * Holds the step timers (e.g. while the agent waits for input). As in
   * BoardUI, rings that are already sweeping keep their animation.
   */
  isPaused?: boolean;
  className?: string;
  /** Accessible name for the block. Default "Agent progress". */
  "aria-label"?: string;
}

const MINIMIZED_HEIGHT = 44;
/** Header (45px) plus one 32px row and its 6px gap per step. */
const expandedHeightFor = (stepCount: number) => Math.max(MINIMIZED_HEIGHT, 45 + 38 * stepCount);
/** Lets the card and the first rows land before the rings start moving. */
const START_DELAY_MS = 1100;

// ─── Glyphs ────────────────────────────────────────────────────────────────

function ProgressRing({ isRunning, duration }: { isRunning: boolean; duration: number }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" width={16} height={16} className="shrink-0 -rotate-90">
      <circle cx="8" cy="8" r="6.75" fill="none" strokeWidth="2.5" className="stroke-progress-track" />
      <motion.circle
        data-progress-ring
        cx="8"
        cy="8"
        r="6.75"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-progress-fill"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isRunning ? 1 : 0 }}
        transition={{ duration: isRunning ? duration : 0, ease: "linear" }}
      />
    </svg>
  );
}

function StepRing({ isRunning, duration }: { isRunning: boolean; duration: number }) {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className="size-3.5 shrink-0 -rotate-90">
      <circle cx="7" cy="7" r="5.75" fill="none" strokeWidth="1.5" className="stroke-progress-track" />
      <motion.circle
        data-step-progress
        cx="7"
        cy="7"
        r="5.75"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-progress-fill"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isRunning ? 1 : 0 }}
        transition={{ duration: isRunning ? duration : 0, ease: "linear" }}
      />
    </svg>
  );
}

/** 15px glyphs are centred in the 14px slot, overhanging it by half a pixel per side. */
function CheckGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className="size-3.75 shrink-0">
      <circle cx="7" cy="7" r="7" className="fill-strong" />
      <path
        d="M4 7.5 5.646 9.146a.5.5 0 0 0 .708 0L10 5.5"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-icon-secondary"
      />
    </svg>
  );
}

function PendingGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 15 15" className="size-3.75 shrink-0">
      <circle cx="7.5" cy="7.5" r="7" fill="none" strokeDasharray="2 2" className="stroke-strong" />
    </svg>
  );
}

function MinimizeGlyph() {
  return (
    <span aria-hidden className="relative block size-5 shrink-0">
      <span className="absolute start-px top-px size-4.5 rounded-tile bg-strong" />
      <span className="absolute start-1 top-3.25 h-0.5 w-3 rounded-hairline bg-icon-secondary" />
    </span>
  );
}

function ArrowGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className="size-3.5 shrink-0 rtl:-scale-x-100">
      <path
        d="M7.47 2.47a.75.75 0 0 1 1.06 0l4.177 4.176a.5.5 0 0 1 0 .708L8.53 11.53a.75.75 0 0 1-1.06-1.06l2.72-2.72H2a.75.75 0 0 1 0-1.5h8.19L7.47 3.53a.75.75 0 0 1 0-1.06Z"
        className="fill-icon-secondary"
      />
    </svg>
  );
}

function ExpandGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-5">
      <rect x="1" y="1" width="18" height="18" rx="4" className="fill-strong" />
      <path
        d="M7.553 6.109a.75.75 0 0 1 .75-.75h5.907a.5.5 0 0 1 .5.5v5.906a.75.75 0 0 1-1.5 0V7.919l-5.79 5.791a.75.75 0 1 1-1.061-1.06l5.79-5.791H8.303a.75.75 0 0 1-.75-.75Z"
        className="fill-icon-secondary"
      />
    </svg>
  );
}

// ─── Text ──────────────────────────────────────────────────────────────────

function Shimmer({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("text-shimmer inline-block", className)}>{children}</span>;
}

/** Header label: slides with layout changes and cross-fades when the text changes. */
function StatusLabel({ label, className }: { label: string; className?: string }) {
  return (
    <motion.span layout="position" transition={layoutSpring} className={cx("relative inline-flex min-w-0 overflow-hidden", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
          transition={{ duration: 0.26, ease: easing.enter }}
          className="block whitespace-nowrap"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function StepLabel({ label, isComplete, isActive }: { label: string; isComplete: boolean; isActive: boolean }) {
  return (
    <span
      className={cx(
        "relative block min-w-0 max-w-full truncate text-body-md-strong transition-colors duration-300",
        isComplete || !isActive ? "text-fg-secondary" : "text-fg",
      )}
    >
      {isActive ? <Shimmer>{label}</Shimmer> : label}
      <AnimatePresence>
        {isComplete && (
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-px origin-left bg-current rtl:origin-right"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.8 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: easing.enter }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}

// ─── Step row ──────────────────────────────────────────────────────────────

interface StepProps {
  label: string;
  index: number;
  completedCount: number;
  stepCount: number;
  isRunning: boolean;
  isReopening: boolean;
  stepSeconds: number;
}

function Step({ label, index, completedCount, stepCount, isRunning, isReopening, stepSeconds }: StepProps) {
  const isComplete = index < completedCount;
  const isActive = index === completedCount && completedCount < stepCount;

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -4, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: isReopening ? 0.035 * index : 0.65 + 0.16 * index,
        duration: isReopening ? 0.24 : 0.45,
        ease: easing.enter,
        layout: layoutSpring,
      }}
      aria-current={isActive ? "step" : undefined}
      className="h-8 w-full"
    >
      <motion.div
        // Start at the target padding: the row is still invisible during its first frames anyway.
        initial={false}
        animate={{ paddingInlineStart: isActive ? 9 : 4, paddingInlineEnd: isActive ? 13 : 4 }}
        transition={{ duration: 0.36, ease: easing.enter }}
        className="relative flex h-full w-full items-center gap-2 rounded-full"
      >
        {isActive && (
          <motion.span
            layoutId="active-step-border"
            aria-hidden
            transition={layoutSpring}
            className="pointer-events-none absolute inset-0 rounded-full border border-line"
          />
        )}
        <span className="relative z-10 flex size-3.5 shrink-0 items-center justify-center">
          <AnimatePresence initial={false} mode="popLayout">
            {isComplete ? (
              <motion.span
                key="complete"
                initial={{ opacity: 0, scale: 0.72, rotate: -18 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.34, ease: easing.enter }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckGlyph />
              </motion.span>
            ) : isActive ? (
              <motion.span
                key={`active-${index}`}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.82 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <StepRing isRunning={isRunning} duration={stepSeconds} />
              </motion.span>
            ) : (
              <motion.span
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <PendingGlyph />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="relative z-10 flex min-w-0 flex-1 items-center truncate leading-5">
          <StepLabel label={label} isComplete={isComplete} isActive={isActive} />
          {isComplete && <span className="sr-only">, completed</span>}
        </span>
      </motion.div>
    </motion.li>
  );
}

// ─── Block ─────────────────────────────────────────────────────────────────

/** The 24px slot the persistent ring sits over; collapses when the job is done. */
function RingSlot({ isDone }: { isDone: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {!isDone && (
        <motion.span
          key="progress-ring"
          initial={{ width: 24, opacity: 1 }}
          animate={{ width: 24, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: easing.enter }}
          className="flex h-4 w-6 shrink-0 items-center overflow-hidden"
        />
      )}
    </AnimatePresence>
  );
}

export function AgentProgress({
  steps = DEFAULT_AGENT_PROGRESS_STEPS,
  stepDuration = 3000,
  completionDelay = 1000,
  onFinished,
  isPaused = false,
  className,
  "aria-label": ariaLabel = "Agent progress",
}: AgentProgressProps) {
  const groupId = useId();
  const listId = `${groupId}-steps`;
  const list = steps.length > 0 ? steps : DEFAULT_AGENT_PROGRESS_STEPS;
  const stepMs = Math.max(0, stepDuration);
  const stepSeconds = stepMs / 1000;
  const totalSeconds = list.length * stepSeconds;
  const expandedHeight = expandedHeightFor(list.length);

  const [completedCount, setCompletedCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const stepsLeft = list.length - completedCount;
  const isDone = completedCount >= list.length;
  const currentStep = list[Math.min(completedCount, list.length - 1)] ?? "";
  const status = isDone ? "All steps completed" : `${stepsLeft} ${stepsLeft === 1 ? "step" : "steps"} left`;

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setTimeout(() => setIsRunning(true), START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isPaused]);

  useEffect(() => {
    if (!isRunning || isDone || isPaused) return;
    const timer = window.setTimeout(() => setCompletedCount((count) => Math.min(count + 1, list.length)), stepMs);
    return () => window.clearTimeout(timer);
  }, [isDone, completedCount, isPaused, isRunning, list.length, stepMs]);

  useEffect(() => {
    if (!isDone || !onFinished || isPaused) return;
    const timer = window.setTimeout(onFinished, Math.max(0, completionDelay));
    return () => window.clearTimeout(timer);
  }, [isDone, completionDelay, onFinished, isPaused]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        role="group"
        aria-label={ariaLabel}
        data-minimized={isMinimized || undefined}
        data-complete={isDone || undefined}
        initial={{ opacity: 0, y: -12, height: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, height: isMinimized ? MINIMIZED_HEIGHT : expandedHeight, filter: "blur(0px)" }}
        transition={{
          opacity: { duration: 0.35, ease: easing.enter },
          y: { duration: 0.5, ease: easing.enter },
          filter: { duration: 0.4, ease: easing.enter },
          height: { duration: isMinimized ? 0.42 : isReopening ? 0.24 : 0.65, ease: easing.enter },
        }}
        onAnimationComplete={() => {
          if (!isMinimized) setIsReopening(false);
        }}
        // w-85.25 = 341px
        className={cx(
          "relative w-85.25 max-w-full overflow-hidden rounded-surface border border-line bg-surface shadow-raised",
          className,
        )}
      >
        {/* One concise announcement per change, instead of making the whole animated block a live region. */}
        <span role="status" className="sr-only">
          {isDone ? status : `${status}. Current step: ${currentStep}`}
        </span>

        <AnimatePresence initial={false}>
          {!isDone && (
            <motion.span
              key="persistent-progress-ring"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              transition={{ duration: 0.25, ease: easing.enter }}
              className="pointer-events-none absolute start-3.5 top-3.5 z-20 flex size-4 items-center justify-center"
            >
              <ProgressRing isRunning={isRunning} duration={totalSeconds} />
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence mode="sync">
          {isMinimized ? (
            <motion.button
              key="minimized"
              type="button"
              aria-label="Expand steps"
              aria-expanded={false}
              onClick={() => {
                setIsReopening(true);
                setIsMinimized(false);
              }}
              initial={{ opacity: 0, filter: "blur(3px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(3px)" }}
              transition={{ duration: 0.2, delay: 0.12, ease: easing.enter }}
              className={cx(
                "group absolute inset-0 flex cursor-pointer items-center gap-2 rounded-surface px-2.5 py-1.5 text-start",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
              )}
            >
              <span className="flex min-w-0 shrink-0 items-center ps-1">
                <RingSlot isDone={isDone} />
                <StatusLabel label={status} className="text-body-md-strong text-fg-secondary" />
              </span>
              {!isDone && (
                <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden py-1.5 pe-6 group-hover:mask-fade-end">
                  <ArrowGlyph />
                  <span className="block min-w-0 flex-1 truncate text-body-md-strong">
                    <Shimmer className="block max-w-full truncate">{currentStep}</Shimmer>
                  </span>
                </span>
              )}
              <span className="absolute end-2.5 top-1/2 size-5 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <ExpandGlyph />
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, filter: "blur(3px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
              transition={{ duration: isReopening ? 0.16 : 0.22, ease: easing.enter }}
              style={{ height: expandedHeight }}
              className="absolute inset-x-0 top-0 px-2.5 pb-2.5 pt-2"
            >
              <div className="pt-1">
                <div className="flex h-5 w-full items-center ps-1">
                  <RingSlot isDone={isDone} />
                  <StatusLabel label={status} className="flex-1 text-body-md-strong text-fg-secondary" />
                  <button
                    type="button"
                    aria-label="Minimize steps"
                    aria-expanded
                    aria-controls={listId}
                    onClick={() => setIsMinimized(true)}
                    className={cx(
                      "size-5 cursor-pointer rounded-tile transition-opacity duration-200 hover:opacity-80",
                      focusRingNative,
                    )}
                  >
                    <MinimizeGlyph />
                  </button>
                </div>
                <LayoutGroup id={groupId}>
                  {/* mt-2.25 = 9px */}
                  <ol id={listId} className="mt-2.25 flex flex-col gap-1.5">
                    {list.map((label, index) => (
                      <Step
                        key={label}
                        label={label}
                        index={index}
                        completedCount={completedCount}
                        stepCount={list.length}
                        isRunning={isRunning}
                        isReopening={isReopening}
                        stepSeconds={stepSeconds}
                      />
                    ))}
                  </ol>
                </LayoutGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}
