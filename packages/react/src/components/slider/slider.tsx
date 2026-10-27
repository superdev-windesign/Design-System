"use client";
// Adapted from BoardUI (MIT) — components/base/slider/slider.tsx. See THIRD_PARTY_NOTICES.md.

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
 * keyboard controls, RTL handling, and collision rules. BoardUI owns the
 * visual track, selected range, thumbs, and exact-value bubbles.
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
                showTooltip && "mt-8",
              )}
            >
              {({ isHovered }) => (
                <>
                  <span
                    aria-hidden
                    className={cx(
                      "absolute top-1/2 end-0 start-0 h-1.5 -translate-y-1/2 rounded-full",
                      "bg-muted shadow-slider-track",
                      "transition-colors duration-150 ease",
                      isHovered && "bg-muted-hover",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cx(
                      "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full",
                      "bg-linear-to-r from-accent-500 to-accent-600",
                      "shadow-slider-fill",
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
                        className={({
                          isDragging,
                          isHovered: isThumbHovered,
                          isFocusVisible,
                          isDisabled,
                        }) =>
                          cx(
                            "top-1/2 size-5 rounded-full border border-line outline-none",
                            "flex items-center justify-center bg-control-knob",
                            "shadow-slider-thumb",
                            "transition-[scale,box-shadow,border-color] duration-150 ease",
                            isThumbHovered && !isDragging && "scale-105 border-line-hover",
                            isDragging && "z-20 scale-110 border-accent-500 shadow-slider-thumb-active",
                            isFocusVisible && "outline-2 outline-focus outline-offset-2",
                            isDisabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                          )
                        }
                      >
                        {({ isDragging, isFocused }) => (
                          <>
                            {showTooltip && (
                              <span
                                aria-hidden
                                className={cx(
                                  "pointer-events-none absolute bottom-[calc(100%+9px)] left-1/2 -translate-x-1/2",
                                  "flex h-7 min-w-8 items-center justify-center rounded-lg border border-line",
                                  "bg-surface px-2 text-caption-strong whitespace-nowrap text-fg shadow-raised",
                                  "transition-[translate,box-shadow] duration-150 ease",
                                  (isDragging || isFocused) && "-translate-y-0.5 shadow-overlay",
                                )}
                              >
                                {valueLabel}
                                <span
                                  aria-hidden
                                  className="absolute -bottom-[4.5px] left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b border-line bg-surface"
                                />
                              </span>
                            )}
                            <span
                              aria-hidden
                              className={cx(
                                "size-2 rounded-full bg-linear-to-b from-accent-500 to-accent-600",
                                "shadow-slider-highlight transition-[filter] duration-150 ease",
                                (isDragging || isFocused) && "brightness-110",
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
