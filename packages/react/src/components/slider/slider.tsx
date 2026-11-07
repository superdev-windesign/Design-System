"use client";
// The value model wiring was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.

import type { ReactNode } from "react";
import {
  Label as AriaLabel,
  Slider as AriaSlider,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
} from "react-aria-components";
import type { SliderProps as AriaSliderProps } from "react-aria-components";
import { cx } from "../../utils/cx";

type SliderValue = number | number[];

type SliderBaseProps<T extends SliderValue> = Omit<
  AriaSliderProps<T>,
  "children" | "className" | "orientation"
> & {
  /** Optional visible label associated with every thumb. */
  label?: ReactNode;
  /** Show the exact value in a persistent bubble above each thumb. Default `true`. */
  showTooltip?: boolean;
  /** Custom visual formatter for the value bubbles. */
  formatValue?: (value: number, index: number) => ReactNode;
  className?: string;
};

export type SliderProps = SliderBaseProps<number> & {
  /** Accessible name for the single thumb. */
  thumbLabel?: string;
};

export type RangeSliderProps = SliderBaseProps<number[]> & {
  /** Accessible names for the lower and upper thumbs. */
  thumbLabels?: [string, string];
};

type SliderBaseInternalProps<T extends SliderValue> = SliderBaseProps<T> & {
  thumbLabels: string[];
};

/**
 * Shared single and multi-thumb slider presentation.
 *
 * React Aria owns the value model, drag behavior, hidden range inputs,
 * keyboard controls, RTL handling, and collision rules. This draws a ruler:
 * a fine rule with end ticks, an accent ink stroke (swelling towards a single
 * thumb, an even band for a range), paper thumbs ringed in the accent that
 * take an ink drop on hover and fill while dragged, and the value in mono
 * numerals on a hairline leader above each thumb.
 */
function SliderBase<T extends SliderValue>({
  className,
  label,
  showTooltip = true,
  formatValue,
  thumbLabels,
  ...props
}: SliderBaseInternalProps<T>) {
  return (
    <AriaSlider
      {...props}
      orientation="horizontal"
      className={({ isDisabled }) =>
        cx(
          "group flex w-full min-w-0 flex-col gap-2",
          isDisabled && "cursor-not-allowed opacity-50",
          className,
        )
      }
    >
      {({ state }) => {
        const isRange = state.values.length > 1;
        const startPercent = isRange ? state.getThumbPercent(0) : 0;
        const endPercent = state.getThumbPercent(state.values.length - 1);

        return (
          <>
            {label != null && (
              <AriaLabel className="text-body-md-strong text-fg">
                {label}
              </AriaLabel>
            )}

            <AriaSliderTrack
              className={cx(
                "relative h-8 w-full touch-none",
                showTooltip && "mt-6",
              )}
            >
              {({ isHovered }) => (
                <>
                  {/* The rule, with a short tick at each end like a ruler. */}
                  <span
                    aria-hidden
                    className={cx(
                      "bui-slider-rail absolute top-1/2 end-0 start-0 h-0.5 -translate-y-1/2 rounded-full",
                      "transition-colors duration-(--ds-motion-duration-base) ease-standard",
                      isHovered ? "bg-line-control-hover" : "bg-line-control",
                    )}
                  />
                  {(["start-0", "end-0"] as const).map((edge) => (
                    <span
                      key={edge}
                      aria-hidden
                      className={cx("bui-slider-tick absolute top-1/2 h-2 w-px -translate-y-1/2", edge, isHovered ? "bg-line-control-hover" : "bg-line-control")}
                    />
                  ))}
                  {/* The ink: one value swells from a hairline to full width
                      under the thumb, like a nib gathering pressure; a range
                      is an even band between its thumbs. */}
                  <span
                    aria-hidden
                    className={cx(
                      "bui-slider-fill absolute top-1/2 -translate-y-1/2 bg-accent-600",
                      isRange ? "h-1 rounded-full" : "h-1.5 ink-swell",
                    )}
                    style={{
                      insetInlineStart: `${startPercent * 100}%`,
                      insetInlineEnd: `${(1 - endPercent) * 100}%`,
                    }}
                  />

                  {state.values.map((value, index) => {
                    const valueLabel =
                      formatValue?.(value, index) ??
                      state.getThumbValueLabel(index);

                    return (
                      <AriaSliderThumb
                        key={index}
                        index={index}
                        aria-label={
                          thumbLabels[index] ??
                          (isRange ? `Value ${index + 1}` : "Value")
                        }
                        className={({ isDragging, isFocusVisible, isDisabled }) =>
                          cx(
                            "bui-slider-thumb top-1/2 flex size-4.5 items-center justify-center rounded-full border-2 border-accent-600 bg-surface outline-none",
                            "transition-[scale] duration-(--ds-motion-duration-base) ease-standard motion-reduce:transition-none",
                            isDragging && "z-20 scale-110",
                            isFocusVisible && "outline-2 outline-focus outline-offset-2",
                            isDisabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                          )
                        }
                      >
                        {({ isDragging, isFocused, isHovered: isThumbHovered }) => (
                          <>
                            {showTooltip && (
                              <span
                                aria-hidden
                                className="pointer-events-none absolute bottom-full left-1/2 mb-0.5 flex -translate-x-1/2 flex-col items-center gap-0.5"
                              >
                                <span
                                  className={cx(
                                    "font-mono tabular-nums whitespace-nowrap transition-colors duration-(--ds-motion-duration-base)",
                                    isDragging || isFocused ? "text-caption-strong text-fg" : "text-caption text-fg-secondary",
                                  )}
                                >
                                  {valueLabel}
                                </span>
                                <span className="bui-slider-leader h-1.5 w-px bg-line-control" />
                              </span>
                            )}
                            {/* The radio's ink drop: shows on hover, fills while held. */}
                            <span
                              aria-hidden
                              className={cx(
                                "bui-slider-dot size-2 rounded-full bg-accent-600 transition-[scale] duration-(--ds-motion-duration-base) ease-overshoot motion-reduce:transition-none",
                                isDragging ? "scale-150" : isThumbHovered || isFocused ? "scale-100" : "scale-0",
                              )}
                            />
                          </>
                        )}
                      </AriaSliderThumb>
                    );
                  })}
                </>
              )}
            </AriaSliderTrack>
          </>
        );
      }}
    </AriaSlider>
  );
}

/** A single-value slider with an exact-value bubble above the thumb. */
export function Slider({ thumbLabel = "Value", ...props }: SliderProps) {
  return <SliderBase {...props} thumbLabels={[thumbLabel]} />;
}

/** A two-thumb slider for selecting a minimum and maximum value. */
export function RangeSlider({
  thumbLabels = ["Minimum", "Maximum"],
  ...props
}: RangeSliderProps) {
  return <SliderBase {...props} thumbLabels={thumbLabels} />;
}
