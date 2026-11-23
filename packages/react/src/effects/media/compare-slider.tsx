"use client";

import type { ReactNode } from "react";
import { Slider, SliderThumb, SliderTrack } from "react-aria-components";
import { RiArrowLeftRightLine } from "@remixicon/react";
import { cx } from "../../utils/cx";

/**
 * CompareSlider: two versions of a picture, one over the other, with a handle
 * to wipe between them: before and after an edit, light and dark, old and new.
 * Drag anywhere, or focus the handle and use the arrow keys; it's a React Aria
 * slider whose value is how much of the "before" side shows.
 */

export interface CompareSliderProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  defaultValue?: number;
  className?: string;
}

export function CompareSlider({ before, after, beforeLabel = "Before", afterLabel = "After", defaultValue = 50, className }: CompareSliderProps) {
  return (
    <Slider
      aria-label={`${beforeLabel} and ${afterLabel}: how much of ${beforeLabel.toLowerCase()} shows`}
      defaultValue={defaultValue}
      className={cx("relative aspect-video w-full max-w-xl overflow-hidden rounded-surface border border-line select-none", className)}
    >
      {({ state }) => {
        const v = state.getThumbPercent(0) * 100;
        return (
          <>
            <div className="absolute inset-0">{after}</div>
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
              {before}
            </div>
            <span aria-hidden className="absolute top-3 left-3 rounded-full bg-scrim px-2.5 py-1 text-caption-strong text-on-action">
              {beforeLabel}
            </span>
            <span aria-hidden className="absolute top-3 right-3 rounded-full bg-scrim px-2.5 py-1 text-caption-strong text-on-action">
              {afterLabel}
            </span>
            <SliderTrack className="absolute inset-0 cursor-ew-resize">
              <span aria-hidden className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-on-action shadow-raised" style={{ left: `${v}%` }} />
              <SliderThumb
                className={({ isFocusVisible, isDragging }) =>
                  cx(
                    "top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-overlay transition-transform",
                    isDragging && "scale-110",
                    isFocusVisible && "outline-2 outline-offset-2 outline-focus",
                  )
                }
              >
                <RiArrowLeftRightLine aria-hidden className="size-5" />
              </SliderThumb>
            </SliderTrack>
          </>
        );
      }}
    </Slider>
  );
}
