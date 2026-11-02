"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Dialog as AriaDialog, Heading, Popover as AriaPopover } from "react-aria-components";
import type { PopoverProps } from "react-aria-components";
import { Button } from "../button/button";
import { PopoverArrow } from "../popover/popover";
import { focusRingNative } from "../../recipes/focus-ring";
import { FLOATING_SURFACE, POPOVER_MOTION } from "../../recipes/overlay";
import { cx } from "../../utils/cx";

/**
 * Tour: a short guided walk through a screen. Each step points at an element
 * (by ref or CSS selector), outlines it in terracotta, scrolls it into view
 * and explains it in a card with Back / Next. Escape or "Skip tour" ends it.
 *
 * Focus moves into each card and the page behind is inert while the tour
 * runs, so keyboard and screen-reader users follow the same path. Keep tours
 * to a few steps, and don't put anything essential only in a tour.
 */

export interface TourStep {
  target: RefObject<HTMLElement | null> | string;
  title: ReactNode;
  content: ReactNode;
  placement?: PopoverProps["placement"];
}

export interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Fires when the last step's Done is pressed (not when skipped). */
  onFinish?: () => void;
  /** Controlled step index. */
  step?: number;
  onStepChange?: (index: number) => void;
}

const resolve = (target: TourStep["target"]) => (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target.current);

export function Tour({ steps, isOpen, onOpenChange, onFinish, step: controlledStep, onStepChange }: TourProps) {
  const [uncontrolledStep, setUncontrolledStep] = useState(0);
  const index = Math.min(controlledStep ?? uncontrolledStep, steps.length - 1);
  const step = steps[index];
  const anchor = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const go = (next: number) => {
    setUncontrolledStep(next);
    onStepChange?.(next);
  };

  // Restart from the first step each time the tour opens.
  useEffect(() => {
    if (isOpen && controlledStep === undefined) setUncontrolledStep(0);
  }, [isOpen, controlledStep]);

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // Find this step's element, bring it into view and keep the outline on it
  // as the page scrolls or resizes.
  useLayoutEffect(() => {
    const current = stepsRef.current[index];
    if (!isOpen || !current) return;
    const el = resolve(current.target);
    anchor.current = el;
    if (!el) {
      setRect(null);
      return;
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
    };
    setRect(el.getBoundingClientRect());
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [isOpen, index]);

  if (!isOpen || !step) return null;
  const last = index === steps.length - 1;

  return (
    <>
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 rounded-surface outline-2 outline-offset-4 outline-accent-600 transition-[top,left,width,height] duration-(--ds-motion-duration-moderate) ease-out motion-reduce:transition-none"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}
      {anchor.current && (
        <AriaPopover
          key={index}
          triggerRef={anchor}
          isOpen
          onOpenChange={(open) => !open && onOpenChange(false)}
          placement={step.placement ?? "bottom"}
          offset={16}
          className={cx("w-80 max-w-[calc(100vw-24px)]", FLOATING_SURFACE, POPOVER_MOTION)}
        >
          <PopoverArrow />
          <AriaDialog className={cx("flex flex-col gap-3 rounded-overlay p-4", focusRingNative)}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-caption tracking-wide text-accent-600 uppercase">
                Step {String(index + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              <span aria-hidden className="flex gap-1">
                {steps.map((_, i) => (
                  <span key={i} className={cx("h-1 rounded-full transition-[width,background-color] duration-(--ds-motion-duration-base)", i === index ? "w-4 bg-accent-600" : "w-1.5 bg-line-control")} />
                ))}
              </span>
            </div>
            <Heading slot="title" className="text-title-sm-strong text-fg">
              {step.title}
            </Heading>
            <div className="text-body-md text-pretty text-fg-secondary">{step.content}</div>
            <div className="mt-1 flex items-center gap-2 border-t border-line pt-3">
              {!last && (
                <Button variant="tertiary" size="sm" onPress={() => onOpenChange(false)} className="me-auto">
                  Skip tour
                </Button>
              )}
              {index > 0 && (
                <Button variant="secondary" size="sm" onPress={() => go(index - 1)} className={last ? "me-auto" : undefined}>
                  Back
                </Button>
              )}
              <Button
                size="sm"
                autoFocus
                onPress={() => {
                  if (last) {
                    onOpenChange(false);
                    onFinish?.();
                  } else go(index + 1);
                }}
                className={last && index === 0 ? "ms-auto" : undefined}
              >
                {last ? "Done" : "Next"}
              </Button>
            </div>
          </AriaDialog>
        </AriaPopover>
      )}
    </>
  );
}
