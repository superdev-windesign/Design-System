"use client";

import { Children, isValidElement, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, ReactElement, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiErrorWarningFill } from "@remixicon/react";
import { Button } from "../button/button";
import { useDirection } from "../../foundations/direction";
import { easing, layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Step wizard: a multi-step form with a progress rail.
 *
 * Steps slide in from the side you're heading towards (mirrored in RTL) while
 * the panel eases to the new step's height. Each step can validate before the
 * wizard moves on; finished steps stay clickable so people can go back and
 * edit. Focus stays on the Back/Next buttons and a polite live region
 * announces the new step, so keyboard and screen reader users don't lose
 * their place.
 */

/** `true` or nothing to continue; `false` to stay put; a string to stay and show it as an error. */
export type StepValidation = boolean | string | void;

export interface WizardStepProps {
  title: string;
  description?: ReactNode;
  /** Runs when leaving this step forwards. May be async. */
  validate?: () => StepValidation | Promise<StepValidation>;
  children?: ReactNode;
}

/** Declares one step. `StepWizard` reads its props and renders the active step's children. */
export function WizardStep(_props: WizardStepProps) {
  return null;
}

export interface StepWizardProps {
  children: ReactNode;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Called after the last step validates. May be async; the Finish button waits for it. */
  onComplete?: () => void | Promise<void>;
  /** Shown in place of the steps once `onComplete` has finished. */
  renderComplete?: () => ReactNode;
  nextLabel?: string;
  backLabel?: string;
  completeLabel?: string;
  "aria-label"?: string;
  className?: string;
}

// Arrows point the way you're going, so they mirror in RTL.
const BackIcon = ({ className }: { className?: string }) => <RiArrowLeftLine aria-hidden className={cx(className, "rtl:rotate-180")} />;
const NextIcon = ({ className }: { className?: string }) => <RiArrowRightLine aria-hidden className={cx(className, "rtl:rotate-180")} />;

const SLIDE = 40;

export function StepWizard({
  children,
  step: controlledStep,
  defaultStep = 0,
  onStepChange,
  onComplete,
  renderComplete,
  nextLabel = "Continue",
  backLabel = "Back",
  completeLabel = "Finish",
  "aria-label": ariaLabel = "Setup",
  className,
}: StepWizardProps) {
  const steps = Children.toArray(children).filter((child): child is ReactElement<WizardStepProps> => isValidElement(child));
  const [uncontrolledStep, setUncontrolledStep] = useState(defaultStep);
  const index = Math.max(0, Math.min(controlledStep ?? uncontrolledStep, steps.length - 1));
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const isRtl = useDirection() === "rtl";
  const nextRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();

  // The panel animates to the height of whichever step is showing.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    if (!panel) return;
    const update = () => setHeight(panel.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [panel]);

  const current = steps[index];
  if (!current) return null;
  const isLast = index === steps.length - 1;

  const goTo = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setError(null);
    if (controlledStep === undefined) setUncontrolledStep(next);
    onStepChange?.(next);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || isComplete) return;
    setIsBusy(true);
    try {
      const result = await current.props.validate?.();
      if (result === false || typeof result === "string") {
        setError(typeof result === "string" ? result : null);
        return;
      }
      if (!isLast) return goTo(index + 1);
      await onComplete?.();
      if (renderComplete) {
        setDirection(1);
        setIsComplete(true);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const goBack = () => {
    goTo(index - 1);
    // Back disables itself on the first step; keep focus somewhere useful.
    if (index === 1) requestAnimationFrame(() => nextRef.current?.focus());
  };

  const sign = isRtl ? -1 : 1;
  const variants: Variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir * sign * SLIDE, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : -dir * sign * SLIDE, opacity: 0 }),
  };
  const transition = {
    x: reduceMotion ? { duration: 0 } : layoutSpring,
    opacity: { duration: 0.18, ease: easing.standard },
  };

  return (
    <section
      aria-label={ariaLabel}
      className={cx("flex flex-col gap-6 rounded-panel border border-line bg-surface p-5 shadow-raised sm:p-6", className)}
    >
      <nav aria-label="Progress">
        <ol className="flex items-center gap-2">
          {steps.map((step, i) => {
            const isDone = isComplete || i < index;
            const isCurrent = !isComplete && i === index;
            const isFinal = i === steps.length - 1;
            return (
              <li key={i} aria-current={isCurrent ? "step" : undefined} className={cx("flex min-w-0 items-center gap-2", !isFinal && "flex-1")}>
                <AriaButton
                  isDisabled={!isDone || isComplete || isBusy}
                  onPress={() => goTo(i)}
                  className={cx(
                    "group flex shrink-0 cursor-pointer items-center gap-2 rounded-full text-start data-[disabled]:cursor-default",
                    focusRing,
                  )}
                >
                  <StepIndicator number={i + 1} state={isDone ? "done" : isCurrent ? "current" : "upcoming"} reduceMotion={reduceMotion} />
                  <span
                    className={cx(
                      "text-body-sm-strong whitespace-nowrap transition-colors",
                      isDone || isCurrent ? "text-fg" : "text-fg-tertiary",
                      isDone && "group-data-[hovered]:text-fg-secondary",
                      // Narrow screens keep only the current step's label.
                      !isCurrent && "max-sm:sr-only",
                    )}
                  >
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.props.title}
                    {isDone && <span className="sr-only"> (completed)</span>}
                  </span>
                </AriaButton>
                {!isFinal && (
                  <span aria-hidden className="relative h-0.5 min-w-3 flex-1 overflow-hidden rounded-full bg-line">
                    <motion.span
                      className="absolute inset-0 origin-left rounded-full bg-accent-500 rtl:origin-right"
                      initial={false}
                      animate={{ scaleX: isDone ? 1 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: easing.enter }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div aria-live="polite" className="sr-only">
        {isComplete ? "All steps complete" : `Step ${index + 1} of ${steps.length}: ${current.props.title}`}
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {/* Negative margin + matching padding give focus rings room inside the clipped panel. */}
        <motion.div
          className="relative -m-1.5 overflow-hidden"
          initial={false}
          animate={{ height }}
          transition={reduceMotion ? { duration: 0 } : layoutSpring}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={isComplete ? "complete" : index}
              ref={(el) => {
                if (el) setPanel(el);
              }}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col gap-5 p-1.5"
            >
              {isComplete ? (
                renderComplete?.()
              ) : (
                <>
                  <header className="flex flex-col gap-1">
                    <p className="text-caption-strong text-fg-secondary">
                      Step {index + 1} of {steps.length}
                    </p>
                    <h3 className="text-title-sm-emphasis text-fg">{current.props.title}</h3>
                    {current.props.description && <p className="text-body-md text-fg-secondary">{current.props.description}</p>}
                  </header>
                  <div className="flex flex-col gap-4">{current.props.children}</div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              id={errorId}
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: easing.enter }}
              className="-mt-2 flex items-center gap-1.5 text-body-sm text-status-danger-text"
            >
              <RiErrorWarningFill aria-hidden className="size-4 shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {!isComplete && (
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <Button type="button" variant="secondary" leadingIcon={BackIcon} isDisabled={index === 0 || isBusy} onPress={goBack}>
              {backLabel}
            </Button>
            <span aria-hidden className="text-body-sm text-fg-secondary max-sm:hidden">
              {index + 1} / {steps.length}
            </span>
            <Button
              ref={nextRef}
              type="submit"
              trailingIcon={isLast ? undefined : NextIcon}
              isDisabled={isBusy}
              aria-describedby={error ? errorId : undefined}
            >
              {isLast ? completeLabel : nextLabel}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}

function StepIndicator({
  number,
  state,
  reduceMotion,
}: {
  number: number;
  state: "done" | "current" | "upcoming";
  reduceMotion: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative flex size-7 shrink-0 items-center justify-center rounded-full text-body-sm-strong transition-[background-color,border-color,color,box-shadow] duration-(--ds-motion-duration-moderate)",
        state === "done" && "bg-accent-600 text-on-action group-data-[hovered]:bg-accent-700",
        state === "current" && "border-2 border-accent-500 bg-surface text-fg",
        state === "upcoming" && "border border-line-control bg-surface text-fg-tertiary",
      )}
    >
      {state === "done" ? (
        <motion.span
          initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: easing.overshoot }}
          className="flex"
        >
          <RiCheckLine className="size-4" />
        </motion.span>
      ) : (
        number
      )}
    </span>
  );
}
