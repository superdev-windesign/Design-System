"use client";
// Sizes, shapes and the track/card split were first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.

import type { ReactNode, Ref } from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx, sortCx } from "../../utils/cx";
import { CHECK_TICK_PATH, useInkIn } from "../checkbox/checkbox-glyph";

/**
 * Switch: an outlined paper track that fills with ink behind the knob.
 *
 * Two shapes × three sizes:
 *   shape   pill (rounded-full) or rectangle (2px corners)
 *   size    sm 28×16 · md 42×24 · lg 56×32   (track w×h)
 *
 *   off   flat paper track with a 1px control border; the knob is a solid
 *         control-ink disc sitting at the start
 *   on    accent ink floods the track from the start edge as the knob
 *         slides across; the knob turns to paper and carries the pen-nib
 *         tick from Checkbox, so on reads without relying on colour
 *   hover the border and the off knob darken
 *
 * The track lives in `SwitchTrack` so `Switch`, `SwitchCard` and ThemeToggle
 * share it. Built on react-aria Switch: native toggle semantics, keyboard
 * support, focus-visible ring, optional label via `children`.
 */

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchShape = "pill" | "rectangle";

// The track has a 1px border; the knob sits inside it with an even gap and
// travels the remaining width.
export const switchSizes = sortCx({
  sm: {
    track: "h-4 w-7",
    thumb: "size-3",
    offset: "start-px top-px",
    travel: "translate-x-3 rtl:-translate-x-3",
    tick: "size-2",
  },
  md: {
    track: "h-6 w-10.5",
    thumb: "size-4.5",
    offset: "start-0.5 top-0.5",
    travel: "translate-x-4.5 rtl:-translate-x-4.5",
    tick: "size-3",
  },
  lg: {
    track: "h-8 w-14",
    thumb: "size-6",
    offset: "start-0.75 top-0.75",
    travel: "translate-x-6 rtl:-translate-x-6",
    tick: "size-4",
  },
});

const shapes = {
  pill: { track: "rounded-full", thumb: "rounded-full" },
  rectangle: { track: "rounded-control-xs", thumb: "rounded-hairline" },
};

export interface SwitchVisualState {
  isSelected: boolean;
  isDisabled: boolean;
  isFocusVisible: boolean;
  isHovered?: boolean;
}

/**
 * The track, ink and knob. Pure presentation: the react-aria Switch (in
 * `Switch` or `SwitchCard`) owns the input and passes its render state in.
 */
export function SwitchTrack({
  state,
  size = "md",
  shape = "pill",
}: {
  state: SwitchVisualState;
  size?: SwitchSize;
  shape?: SwitchShape;
}) {
  const s = switchSizes[size];
  const r = shapes[shape];
  const on = state.isSelected;
  const hover = state.isHovered && !state.isDisabled;
  const inkIn = useInkIn(on);
  const motion = "duration-(--ds-motion-duration-moderate) ease-standard motion-reduce:transition-none";

  return (
    <span
      aria-hidden
      data-selected={on || undefined}
      className={cx(
        "bui-switch-track relative shrink-0 overflow-hidden border bg-surface transition-[border-color]",
        motion,
        s.track,
        r.track,
        on ? (hover ? "border-accent-700" : "border-accent-600") : hover ? "border-line-control-hover" : "border-line-control",
        state.isDisabled && "opacity-50",
        state.isFocusVisible && "outline-2 outline-focus outline-offset-2",
      )}
    >
      {/* The ink: floods from the start edge as the knob moves across. */}
      <span
        className={cx(
          "bui-switch-ink absolute inset-0 origin-left transition-[scale,background-color] rtl:origin-right",
          motion,
          hover ? "bg-accent-700" : "bg-accent-600",
          on ? "scale-x-100" : "scale-x-0",
        )}
      />
      {/* Knob */}
      <span
        className={cx(
          "bui-switch-knob absolute flex items-center justify-center transition-[translate,background-color]",
          motion,
          s.thumb,
          s.offset,
          r.thumb,
          on ? cx("bg-surface text-accent-600", s.travel) : hover ? "bg-line-control-hover" : "bg-line-control",
        )}
      >
        {on && (
          <svg viewBox="0 0 16 16" className={cx("bui-switch-tick", s.tick)}>
            <path d={CHECK_TICK_PATH} fill="currentColor" className={cx(inkIn && "animate-check-ink")} />
          </svg>
        )}
      </span>
    </span>
  );
}

export interface SwitchProps extends Omit<AriaSwitchProps, "children"> {
  children?: ReactNode;
  size?: SwitchSize;
  shape?: SwitchShape;
  ref?: Ref<HTMLLabelElement>;
}

export function Switch({ className, children, size = "md", shape = "pill", ref, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group inline-flex items-center gap-2 select-none",
          state.isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(state) => (
        <>
          <SwitchTrack state={state} size={size} shape={shape} />
          {children != null && children !== false && (
            <span className="text-body-md-strong text-fg">{children}</span>
          )}
        </>
      )}
    </AriaSwitch>
  );
}
