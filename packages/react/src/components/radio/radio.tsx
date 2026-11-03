"use client";
// Sizes and the group/dot split were first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.

import type { ReactNode, Ref } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
} from "react-aria-components";
import type {
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
} from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Radio: a paper ring that takes a drop of ink.
 *
 * Two sizes:
 *   md  16×16 ring, 8px drop, label text-body-md-strong
 *   sm  14×14 ring, 6px drop, label text-body-sm-strong
 *
 * States:
 *   default   flat ring on the surface, 1px control border
 *   hover     border darkens and a faint drop shows where the ink will land
 *   selected  the ring takes the accent and an accent drop lands in the
 *             centre with a small overshoot (the checkbox's ink, in a circle)
 *   disabled  50% opacity, not-allowed cursor
 *
 * `RadioGroup` + `Radio` are built on React Aria (keyboard arrows, form
 * semantics, label association). The bare `RadioDot` glyph is also exported
 * for menu rows that manage selection themselves (e.g. Dropdown items acting
 * as a radio group), where a nested focusable radio would be invalid.
 */

export type RadioSize = "sm" | "md";

const dotStyles = {
  sm: { dot: "size-3.5", drop: "size-1.5", gap: "gap-2", label: "text-body-sm-strong" },
  md: { dot: "size-4", drop: "size-2", gap: "gap-2", label: "text-body-md-strong" },
};

export interface RadioDotProps {
  selected?: boolean;
  size?: RadioSize;
  /** Draws the keyboard focus ring around the glyph. */
  focusVisible?: boolean;
  /** Shows the hover preview. */
  hovered?: boolean;
  className?: string;
}

/** The bare radio glyph: presentation only, no interaction or semantics. */
export function RadioDot({ selected = false, size = "sm", focusVisible = false, hovered = false, className }: RadioDotProps) {
  const s = dotStyles[size];
  return (
    <span
      aria-hidden
      data-selected={selected || undefined}
      className={cx(
        "relative flex shrink-0 items-center justify-center rounded-full border bg-surface",
        "transition-[border-color] duration-(--ds-motion-duration-base) ease-standard motion-reduce:transition-none",
        s.dot,
        selected ? "border-accent-600" : hovered ? "border-line-control-hover" : "border-line-control",
        focusVisible && "outline-2 outline-focus outline-offset-2",
        className,
      )}
    >
      {/* The drop: absolutely centred, since flex centring of small sizes can land on a subpixel. */}
      <span
        className={cx(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
          "transition-[scale,background-color] motion-reduce:transition-none",
          s.drop,
          selected
            ? "scale-100 bg-accent-600 duration-(--ds-motion-duration-slow) ease-overshoot"
            : hovered
              ? "scale-50 bg-line-control duration-(--ds-motion-duration-base) ease-standard"
              : "scale-0 bg-line-control duration-(--ds-motion-duration-base) ease-standard",
        )}
      />
    </span>
  );
}

/* ------------------------------------------------------------------- group */

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, "children"> {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/** Wraps a set of Radios: arrow-key navigation, single selection, form value. */
export function RadioGroup({ className, children, ref, ...props }: RadioGroupProps) {
  return (
    <AriaRadioGroup
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "flex flex-col gap-2",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaRadioGroup>
  );
}

/* ------------------------------------------------------------------- radio */

export interface RadioProps extends Omit<AriaRadioProps, "children"> {
  children?: ReactNode;
  size?: RadioSize;
  ref?: Ref<HTMLLabelElement>;
}

export function Radio({ className, children, size = "md", ref, ...props }: RadioProps) {
  const s = dotStyles[size];

  return (
    <AriaRadio
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group inline-flex items-center select-none",
          s.gap,
          state.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(state) => (
        <>
          <RadioDot
            selected={state.isSelected}
            size={size}
            focusVisible={state.isFocusVisible}
            hovered={state.isHovered && !state.isDisabled}
          />
          {children !== undefined && children !== null && (
            <span className={cx(s.label, "text-fg")}>{children}</span>
          )}
        </>
      )}
    </AriaRadio>
  );
}
