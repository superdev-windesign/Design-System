"use client";

import type { ReactNode } from "react";
import { RiCheckLine } from "@remixicon/react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Stepper: where someone is in a sequence of steps (checkout, onboarding,
 * an approval chain). Finished steps get a tick, the current one an accent
 * ring and `aria-current="step"`, later ones stay quiet. Numbers are set in
 * mono, like the rest of the system's figures.
 *
 * It only shows progress. Give it `onStepChange` to let people jump back to
 * a finished step (they become buttons); StepWizard is the whole flow with
 * the step content and validation.
 */

export interface StepperStep {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface StepperProps {
  steps: StepperStep[];
  /** The id of the current step. Steps before it count as finished. */
  currentStep: string;
  /** Lets people revisit finished steps. */
  onStepChange?: (id: string) => void;
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepChange, orientation = "horizontal", "aria-label": ariaLabel = "Progress", className }: StepperProps) {
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentStep));
  const vertical = orientation === "vertical";

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className={cx("flex", vertical ? "flex-col" : "flex-col gap-4 sm:flex-row sm:gap-0")}>
        {steps.map((step, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
          const last = index === steps.length - 1;
          const content = (
            <>
              <span
                aria-hidden
                className={cx(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-caption-strong tabular-nums",
                  "transition-[background-color,color,box-shadow] duration-(--ds-motion-duration-moderate)",
                  state === "done" && "bg-accent-600 text-on-action",
                  state === "current" && "bg-surface text-accent-600 ring-2 ring-accent-600",
                  state === "upcoming" && "bg-surface text-fg-secondary ring-1 ring-line-control",
                )}
              >
                {state === "done" ? <RiCheckLine className="size-4" /> : String(index + 1).padStart(2, "0")}
              </span>
              <span className={cx("flex min-w-0 flex-col gap-0.5", vertical ? "pt-1.5" : "pt-1.5 sm:pt-0")}>
                <span className={cx("text-body-md-strong", state === "upcoming" ? "text-fg-secondary" : "text-fg")}>
                  {step.label}
                  {state === "done" && <span className="sr-only">, completed</span>}
                </span>
                {step.description && <span className="text-body-sm text-fg-secondary">{step.description}</span>}
              </span>
            </>
          );
          const layout = cx("group flex gap-3 text-start", vertical ? "" : "sm:flex-col sm:items-start sm:gap-2.5");

          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              className={cx("relative flex-1", vertical ? (last ? "" : "pb-6") : "sm:pe-4")}
            >
              {!last && (
                // The rule to the next step: accent once this step is done.
                <span
                  aria-hidden
                  className={cx(
                    "absolute",
                    vertical ? "start-4 top-8 bottom-0 w-px" : "start-4 top-8 bottom-0 w-px sm:start-8 sm:end-0 sm:top-4 sm:bottom-auto sm:h-px sm:w-auto",
                    state === "done" ? "bg-accent-600" : "bg-line-control",
                  )}
                />
              )}
              {state === "done" && onStepChange ? (
                <button type="button" onClick={() => onStepChange(step.id)} className={cx(layout, "cursor-pointer rounded-control-md", focusRingNative)}>
                  {content}
                </button>
              ) : (
                <div className={layout}>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
