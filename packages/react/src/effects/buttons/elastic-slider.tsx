"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Label, Slider, SliderOutput, SliderThumb, SliderTrack } from "react-aria-components";
import type { SliderProps } from "react-aria-components";
import type { IconComponent } from "../../components/button/button";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ElasticSlider: a slider that stretches like rubber when you drag past either
 * end, and snaps back when you let go, so the limit is something you feel. The
 * track also thickens while held. The end icons ride along with the stretch.
 * It's React Aria's slider underneath: arrow keys, Home/End and the value's
 * announcement all work. With reduced motion it doesn't stretch.
 */

export interface ElasticSliderProps extends Omit<SliderProps<number>, "children" | "className"> {
  label?: string;
  startIcon?: IconComponent;
  endIcon?: IconComponent;
  className?: string;
}

/** How far past the end a drag is felt: it grows ever more slowly, like rubber. */
const give = (overflow: number) => Math.sign(overflow) * Math.sqrt(Math.abs(overflow)) * 2.2;

export function ElasticSlider({ label, startIcon: Start, endIcon: End, className, ...props }: ElasticSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stretch = useMotionValue(0);
  const [held, setHeld] = useState(false);
  const calm = useCalmMotion();
  const scaleX = useTransform(stretch, (s) => 1 + Math.abs(s) / Math.max(1, trackRef.current?.offsetWidth ?? 200));
  const origin = useTransform(stretch, (s) => (s < 0 ? "100% 50%" : "0% 50%"));
  const startShift = useTransform(stretch, (s) => Math.min(0, s));
  const endShift = useTransform(stretch, (s) => Math.max(0, s));

  useEffect(() => {
    if (!held || calm) return;
    const move = (e: PointerEvent) => {
      const box = trackRef.current?.getBoundingClientRect();
      if (!box) return;
      stretch.set(e.clientX < box.left ? give(e.clientX - box.left) : e.clientX > box.right ? give(e.clientX - box.right) : 0);
    };
    const up = () => {
      setHeld(false);
      animate(stretch, 0, layoutSpring);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [held, calm, stretch]);

  return (
    <Slider {...props} className={cx("flex w-72 max-w-full flex-col gap-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-body-md-strong text-fg">{label}</Label>
          <SliderOutput className="text-body-sm text-fg-secondary tabular-nums" />
        </div>
      )}
      <div className="flex items-center gap-3">
        {Start && (
          <motion.span style={{ x: startShift }} className="text-icon-secondary">
            <Start aria-hidden className="size-5" />
          </motion.span>
        )}
        <motion.div ref={trackRef} style={{ scaleX, transformOrigin: origin }} className="flex-1" onPointerDown={() => setHeld(true)}>
          <SliderTrack className="relative flex h-7 w-full items-center">
            {({ state }) => (
              <>
                <span
                  className={cx(
                    "relative w-full overflow-hidden rounded-full bg-muted transition-[height] duration-(--ds-motion-duration-moderate)",
                    held ? "h-3" : "h-1.5",
                  )}
                >
                  <span className="absolute inset-y-0 start-0 bg-accent-600" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
                </span>
                <SliderThumb
                  className={({ isFocusVisible }) =>
                    cx("top-1/2 size-5 -translate-y-1/2 rounded-full border border-line-control bg-surface shadow-slider-thumb", isFocusVisible && "outline-2 outline-offset-2 outline-focus")
                  }
                />
              </>
            )}
          </SliderTrack>
        </motion.div>
        {End && (
          <motion.span style={{ x: endShift }} className="text-icon-secondary">
            <End aria-hidden className="size-5" />
          </motion.span>
        )}
      </div>
    </Slider>
  );
}
