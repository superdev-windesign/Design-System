"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Button as AriaButton } from "react-aria-components";
import { RiArrowRightLine, RiCheckLine } from "@remixicon/react";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * SlideToConfirm: drag the thumb to the end of the track to confirm, like a
 * phone's slide-to-pay. Let go short of the end and it springs back. The thumb
 * is a real button: from the keyboard, Enter or Space confirms, since dragging
 * isn't something everyone can do. A click alone doesn't, which is the point.
 */

export interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  confirmedLabel?: string;
  className?: string;
}

export function SlideToConfirm({ label, onConfirm, confirmedLabel = "Confirmed", className }: SlideToConfirmProps) {
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(0);
  const [done, setDone] = useState(false);
  const fill = useTransform(x, (v) => `${v + (thumb.current?.offsetWidth ?? 0)}px`);
  const labelOpacity = useTransform(x, [0, Math.max(1, max * 0.6)], [1, 0]);

  useEffect(() => {
    const measure = () => setMax((track.current?.clientWidth ?? 0) - (thumb.current?.offsetWidth ?? 0) - 8);
    measure();
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, []);

  const confirm = () => {
    if (done) return;
    setDone(true);
    animate(x, max, layoutSpring);
    onConfirm();
  };

  return (
    <div
      ref={track}
      className={cx("relative flex h-12 w-72 max-w-full items-center overflow-hidden rounded-full bg-muted p-1 select-none", className)}
    >
      <motion.span aria-hidden className="absolute inset-y-1 start-1 rounded-full bg-accent-600/20" style={{ width: fill }} />
      <motion.span aria-hidden style={{ opacity: labelOpacity }} className="text-shimmer pointer-events-none absolute inset-0 flex items-center justify-center ps-10 text-body-md-strong">
        {done ? confirmedLabel : label}
      </motion.span>
      <motion.div
        ref={thumb}
        drag={done ? false : "x"}
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => (x.get() >= max * 0.92 ? confirm() : animate(x, 0, layoutSpring))}
        className="relative z-10 touch-none"
      >
        <AriaButton
          aria-label={done ? confirmedLabel : `${label}. Press Enter to confirm`}
          // Only keyboard and assistive tech confirm by pressing; a pointer has to slide.
          onPress={(e) => (e.pointerType === "keyboard" || e.pointerType === "virtual") && confirm()}
          className={cx("flex size-10 cursor-grab items-center justify-center rounded-full bg-accent-600 text-on-action shadow-raised active:cursor-grabbing", focusRing)}
        >
          {done ? <RiCheckLine aria-hidden className="size-5" /> : <RiArrowRightLine aria-hidden className="size-5 rtl:-scale-x-100" />}
        </AriaButton>
      </motion.div>
      <VisuallyHidden aria-live="polite">{done ? confirmedLabel : ""}</VisuallyHidden>
    </div>
  );
}
