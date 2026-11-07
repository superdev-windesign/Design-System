"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button as AriaButton, Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { layoutSpring } from "../../motion/tokens";
import { focusRing, focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { nearestSnap } from "../moon/snap-sheet";
import { GlassMaterial } from "./liquid-glass";

/**
 * Glass sheet: at partial height it floats inset from the screen's edges on
 * glass, so content peeks around it. Pull it to full height and it settles
 * onto the edges and turns opaque, because by then it has become the content.
 * The scrim follows the same way, so a half sheet barely dims the page.
 *
 * The header's two round buttons cancel and confirm. The handle is a slider
 * too: focus it and ↑ ↓ move between heights.
 */

export interface GlassSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  /** Adds a confirm button to the header. */
  onConfirm?: () => void;
  confirmLabel?: string;
  closeLabel?: string;
  /** Heights to rest at, as fractions of the viewport, lowest first. */
  detents?: number[];
  defaultDetent?: number;
  onDetentChange?: (index: number) => void;
  className?: string;
}

const INSET = 8;

const viewportHeight = () => (typeof window === "undefined" ? 800 : window.innerHeight);

const ROUND_BUTTON = cx(
  "glass-rim relative isolate flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[scale] data-[pressed]:scale-95 motion-reduce:transition-none",
  focusRing,
);

export function GlassSheet({
  isOpen,
  onOpenChange,
  title,
  children,
  onConfirm,
  confirmLabel = "Done",
  closeLabel = "Close",
  detents = [0.46, 0.92],
  defaultDetent = 0,
  onDetentChange,
  className,
}: GlassSheetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [snap, setSnap] = useState(defaultDetent);
  const [fullHeight, setFullHeight] = useState(viewportHeight);
  const heights = detents.map((fraction) => fraction * fullHeight);
  const lowest = heights[0] ?? 0;
  const tallest = heights[heights.length - 1] ?? fullHeight;

  const height = useMotionValue(0);
  // 0 at the lowest height and 1 at the tallest: everything about the sheet's state hangs off this.
  const progress = useTransform(height, [lowest, tallest], [0, 1], { clamp: true });
  const inset = useTransform(progress, [0, 1], [INSET, 0]);
  const opaque = useTransform(progress, [0.5, 1], [0, 1]);
  const scrim = useTransform(progress, [0, 1], [0.12, 1]);
  const lowerCorners = useTransform(progress, [0, 1], ["var(--ds-radius-panel)", "0px"]);

  const glide = (to: number) => animate(height, to, reduceMotion ? { duration: 0 } : layoutSpring);

  const moveTo = (index: number) => {
    setSnap(index);
    onDetentChange?.(index);
    glide(heights[index] ?? tallest);
  };

  useEffect(() => {
    const onResize = () => setFullHeight(viewportHeight());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSnap(defaultDetent);
      height.set(0);
      glide(heights[defaultDetent] ?? lowest);
    } else {
      glide(0);
    }
    // Only opening and closing: dragging and keys move it from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) height.set(heights[snap] ?? tallest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullHeight]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const released = height.get();
    if (released < lowest * 0.6 || (snap === 0 && info.velocity.y > 600)) {
      onOpenChange(false);
      return;
    }
    moveTo(nearestSnap(heights, released, info.velocity.y));
  };

  const onHandleKey = (event: KeyboardEvent) => {
    const last = heights.length - 1;
    const next = { ArrowUp: Math.min(snap + 1, last), ArrowDown: Math.max(snap - 1, 0), Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    moveTo(next);
  };

  const percent = (index: number) => Math.round((detents[index] ?? 1) * 100);

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="fixed inset-0 z-50 transition-opacity duration-(--ds-motion-duration-slow) data-[entering]:opacity-0 data-[exiting]:opacity-0 motion-reduce:transition-none">
      <motion.div aria-hidden style={{ opacity: scrim }} className="absolute inset-0 bg-scrim" />
      <Modal className="absolute inset-x-0 bottom-0 flex justify-center outline-none">
        <motion.div
          style={{ height, marginBottom: inset, marginInline: inset, borderBottomLeftRadius: lowerCorners, borderBottomRightRadius: lowerCorners }}
          className={cx("glass-rim relative isolate w-full max-w-xl rounded-t-panel", className)}
        >
          <GlassMaterial />
          <motion.span aria-hidden style={{ opacity: opaque }} className="absolute inset-0 -z-10 rounded-inherit bg-surface" />
          <Dialog className="flex h-full min-h-0 flex-col overflow-hidden rounded-inherit outline-none">
            <motion.div onPan={(_, info) => height.set(Math.min(tallest, Math.max(0, (heights[snap] ?? tallest) - info.offset.y)))} onPanEnd={onDragEnd} className="shrink-0 cursor-grab touch-none active:cursor-grabbing">
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
                className={cx("flex justify-center pt-2 pb-1", focusRingNative)}
              >
                <span aria-hidden className="h-1 w-9 rounded-full bg-strong" />
              </div>
              <header className="flex items-center gap-3 px-3 pb-2">
                <AriaButton slot="close" aria-label={closeLabel} onPress={() => onOpenChange(false)} className={cx(ROUND_BUTTON, "text-fg")}>
                  <GlassMaterial />
                  <RiCloseLine aria-hidden className="size-5" />
                </AriaButton>
                <Heading slot="title" className="min-w-0 flex-1 truncate text-center text-body-md-strong text-fg">
                  {title}
                </Heading>
                {onConfirm ? (
                  <AriaButton aria-label={confirmLabel} onPress={onConfirm} className={cx(ROUND_BUTTON, "bg-accent-600 text-on-action")}>
                    <RiCheckLine aria-hidden className="size-5" />
                  </AriaButton>
                ) : (
                  <span aria-hidden className="size-11 shrink-0" />
                )}
              </header>
            </motion.div>
            <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">{children}</div>
          </Dialog>
        </motion.div>
      </Modal>
    </ModalOverlay>
  );
}
