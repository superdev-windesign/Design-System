"use client";
// The sliding-thumb measurement was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.

import { useDirection } from "../../foundations/direction";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
} from "react-aria-components";
import type {
  ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  ToggleButtonProps as AriaToggleButtonProps,
} from "react-aria-components";
import { cx } from "../../utils/cx";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Lets each item pick text that reads on the ink (solid) or on the paper (plain).
const SegmentedVariantContext = createContext<SegmentedControlVariant>("solid");

/**
 * Single-select segmented control, set like a printed index: an outlined
 * paper track, and a block of ink that slides under the chosen segment.
 *   track    surface fill, 1px line border, p 2, rounded-control-md
 *   segment  px 10, py 4, rounded-control-sm
 *     selected    canvas-coloured text on the ink (the body-text pairing,
 *                 reversed), text-body-md-strong
 *     unselected  fg-secondary, darkening to fg on hover
 *
 * Built on react-aria ToggleButtonGroup with single selection that can't be
 * emptied — arrow keys move focus, Space/Enter selects.
 */

/**
 * `solid` (default) draws the track and the ink. `plain` drops both; the
 * selected segment reads through its weight and colour, with a short accent
 * rule beneath it.
 */
export type SegmentedControlVariant = "solid" | "plain";

export interface SegmentedControlProps
  extends Omit<AriaToggleButtonGroupProps, "selectionMode" | "disallowEmptySelection"> {
  children?: ReactNode;
  variant?: SegmentedControlVariant;
  ref?: Ref<HTMLDivElement>;
}

type Thumb = { left: number; top: number; width: number; height: number };

export function SegmentedControl({ className, children, variant = "solid", ref, ...props }: SegmentedControlProps) {
  const direction = useDirection();
  const innerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      const selected = el.querySelector<HTMLElement>("[data-selected]");
      if (selected) {
        setThumb({
          left: selected.offsetLeft,
          top: selected.offsetTop,
          width: selected.offsetWidth,
          height: selected.offsetHeight,
        });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const observeItems = () => el.querySelectorAll("button").forEach(item => ro.observe(item));
    observeItems();
    const mo = new MutationObserver(() => { observeItems(); measure(); });
    mo.observe(el, { attributes: true, childList: true, characterData: true, subtree: true, attributeFilter: ["data-selected"] });
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [direction]);

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  return (
    <AriaToggleButtonGroup
      ref={setRefs}
      selectionMode="single"
      disallowEmptySelection
      {...props}
      className={(state) =>
        cx(
          "relative inline-flex items-start gap-0.5 rounded-control-md",
          variant === "solid" && "border border-line bg-surface p-0.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {variant === "solid" && thumb && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-control-sm bg-fg transition-[transform,width,height] duration-(--ds-motion-duration-moderate) ease-standard motion-reduce:transition-none"
          style={{
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      )}
      <SegmentedVariantContext.Provider value={variant}>{children}</SegmentedVariantContext.Provider>
    </AriaToggleButtonGroup>
  );
}

export interface SegmentedControlItemProps extends Omit<AriaToggleButtonProps, "children"> {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function SegmentedControlItem({
  className,
  children,
  ref,
  ...props
}: SegmentedControlItemProps) {
  const variant = useContext(SegmentedVariantContext);
  return (
    <AriaToggleButton
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "relative z-10 inline-flex cursor-pointer items-center justify-center rounded-control-sm px-2.5 py-1 text-center whitespace-nowrap",
          "transition-colors duration-(--ds-motion-duration-moderate) ease-standard motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          state.isSelected
            ? cx("text-body-md-strong", variant === "solid" ? "text-canvas" : "text-fg")
            : "text-body-md text-fg-secondary hover:text-fg",
          // Plain segments mark the choice with a short accent rule.
          variant === "plain" &&
            "after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent-600 after:transition-[scale] after:duration-(--ds-motion-duration-moderate)",
          variant === "plain" && (state.isSelected ? "after:scale-x-100" : "after:scale-x-0"),
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaToggleButton>
  );
}
