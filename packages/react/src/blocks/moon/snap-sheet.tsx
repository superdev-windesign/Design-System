"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { focusRingNative } from "../../recipes/focus-ring";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Snap sheet: a bottom sheet that rests at several heights. Drag the handle
 * and it settles at the nearest stop, taking the flick's speed into account;
 * drag it below the lowest stop and it closes.
 *
 * As in Moon's, the top of the sheet is one large drag area, with the title
 * centred under the handle and no close button: tapping the scrim, dragging
 * down or pressing Escape all close it. Dragging can't be the only way to
 * change height, so the handle is also a slider: focus it and ↑ ↓ move
 * between stops, and Home and End jump to the ends. With reduced motion, stops change without the
 * spring. React Aria's Modal traps focus and keeps the page behind inert.
 */

export interface SnapSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  /** Heights to rest at, as fractions of the viewport, lowest first. Default 40% and 90%. */
  snapPoints?: number[];
  /** Index into `snapPoints` to open at. Default 0. */
  defaultSnap?: number;
  onSnapChange?: (index: number) => void;
  /** Footer that stays put while the content scrolls. */
  footer?: ReactNode;
  className?: string;
}

const viewportHeight = () => (typeof window === "undefined" ? 800 : window.innerHeight);

/** The stop a released sheet settles at: where it would coast to, nearest first. */
export function nearestSnap(heights: number[], releasedAt: number, velocity: number, coast = 0.2) {
  const projected = releasedAt - velocity * coast;
  let best = 0;
  heights.forEach((height, index) => {
    if (Math.abs(height - projected) < Math.abs(heights[best]! - projected)) best = index;
  });
  return best;
}

export function SnapSheet({ isOpen, onOpenChange, title, children, snapPoints = [0.4, 0.9], defaultSnap = 0, onSnapChange, footer, className }: SnapSheetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [snap, setSnap] = useState(defaultSnap);
  const [fullHeight, setFullHeight] = useState(viewportHeight);
  const heights = snapPoints.map((fraction) => fraction * fullHeight);
  const tallest = heights[heights.length - 1] ?? fullHeight;

  // Height rather than a transform, so the footer and the scrolling content
  // always fit what's showing, at every stop and mid-drag.
  const height = useMotionValue(0);
  const glide = (to: number) => animate(height, to, reduceMotion ? { duration: 0 } : layoutSpring);

  const moveTo = (index: number) => {
    setSnap(index);
    onSnapChange?.(index);
    glide(heights[index] ?? tallest);
  };

  useEffect(() => {
    const onResize = () => setFullHeight(viewportHeight());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Slide up to the opening stop, and back down while the scrim fades on closing.
  useEffect(() => {
    if (isOpen) {
      setSnap(defaultSnap);
      height.set(0);
      glide(heights[defaultSnap] ?? tallest);
    } else {
      glide(0);
    }
    // Only the opening and closing: dragging and keys move it from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // A rotated phone changes what each stop means.
  useEffect(() => {
    if (isOpen) height.set(heights[snap] ?? tallest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullHeight]);

  const close = () => onOpenChange(false);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const released = height.get();
    const lowest = heights[0] ?? 0;
    // Pulled well below the lowest stop, or flicked down from it: dismiss.
    if (released < lowest * 0.6 || (snap === 0 && info.velocity.y > 600)) {
      close();
      return;
    }
    moveTo(nearestSnap(heights, released, info.velocity.y));
  };

  const onHandleKey = (event: KeyboardEvent) => {
    const last = heights.length - 1;
    const next = { ArrowUp: Math.min(snap + 1, last), ArrowRight: Math.min(snap + 1, last), ArrowDown: Math.max(snap - 1, 0), ArrowLeft: Math.max(snap - 1, 0), Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    moveTo(next);
  };

  const percent = (index: number) => Math.round((snapPoints[index] ?? 1) * 100);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 bg-scrim transition-opacity duration-(--ds-motion-duration-slow) data-[entering]:opacity-0 data-[exiting]:opacity-0 motion-reduce:transition-none"
    >
      <Modal className="fixed inset-x-0 bottom-0 flex justify-center outline-none">
        <motion.div
          style={{ height }}
          className={cx("flex w-full max-w-xl flex-col overflow-hidden rounded-t-panel bg-surface shadow-overlay", className)}
        >
          <Dialog className="flex h-full min-h-0 flex-col outline-none">
            <motion.div
              onPan={(_, info) => height.set(Math.min(tallest, Math.max(0, (heights[snap] ?? tallest) - info.offset.y)))}
              onPanEnd={onDragEnd}
              className="flex shrink-0 cursor-grab touch-none flex-col items-center border-b border-line pb-3 active:cursor-grabbing"
            >
              <div
                role="slider"
                tabIndex={0}
                aria-label="Sheet height"
                aria-orientation="vertical"
                aria-valuemin={percent(0)}
                aria-valuemax={percent(heights.length - 1)}
                aria-valuenow={percent(snap)}
                aria-valuetext={`${percent(snap)}% of the screen`}
                onKeyDown={onHandleKey}
                className={cx("flex w-full justify-center pt-2.5 pb-2", focusRingNative)}
              >
                <span aria-hidden className="h-1 w-10 rounded-full bg-strong" />
              </div>
              <Heading slot="title" className="px-4 text-center text-body-md-strong text-fg">
                {title}
              </Heading>
            </motion.div>

            <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">{children}</div>

            {footer && <footer className="shrink-0 border-t border-line px-4 py-3">{footer}</footer>}
          </Dialog>
        </motion.div>
      </Modal>
    </ModalOverlay>
  );
}
