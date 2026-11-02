"use client";

import { useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Modal as AriaModal, ModalOverlay, OverlayTriggerStateContext } from "react-aria-components";
import type { ModalOverlayProps } from "react-aria-components";
import { useMove } from "react-aria";
import { focusRingNative } from "../../recipes/focus-ring";
import { OVERLAY_SCRIM } from "../../recipes/overlay";
import { cx } from "../../utils/cx";
import { DialogFrameContext } from "../dialog/dialog";

/**
 * BottomSheet: a phone-style panel that rises from the bottom and rests at
 * set heights (`snapPoints`, as fractions of the screen). Drag the handle to
 * resize it, or drag it down to dismiss. The handle is also a button: press
 * it to step between heights, or use ↑ / ↓; Escape closes the sheet.
 *
 * Put a Dialog inside, like Drawer:
 *
 * ```tsx
 * <DialogTrigger>
 *   <Button>Filters</Button>
 *   <BottomSheet snapPoints={[0.5, 0.92]}>
 *     <Dialog title="Filters">…</Dialog>
 *   </BottomSheet>
 * </DialogTrigger>
 * ```
 */

export interface BottomSheetProps extends Omit<ModalOverlayProps, "children" | "className"> {
  /** Resting heights as fractions of the viewport, smallest first. Default [0.5, 0.92]. */
  snapPoints?: number[];
  /** Index into `snapPoints` to open at. Default 0. */
  defaultSnap?: number;
  children: ReactNode;
  className?: string;
}

function Sheet({ snapPoints, defaultSnap, children, className }: { snapPoints: number[]; defaultSnap: number; children: ReactNode; className?: string }) {
  const state = useContext(OverlayTriggerStateContext);
  const [snap, setSnap] = useState(defaultSnap);
  const [drag, setDrag] = useState<number | null>(null);
  const viewport = useRef(typeof window === "undefined" ? 800 : window.innerHeight);

  useEffect(() => {
    const onResize = () => (viewport.current = window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const resting = snapPoints[snap]! * viewport.current;
  const height = drag === null ? resting : Math.min(snapPoints.at(-1)! * viewport.current, Math.max(48, resting - drag));

  const { moveProps } = useMove({
    onMoveStart: () => setDrag(0),
    onMove: (event) => {
      if (event.pointerType === "keyboard") return;
      setDrag((d) => (d ?? 0) + event.deltaY);
    },
    onMoveEnd: () => {
      const now = height / viewport.current;
      setDrag(null);
      // Dragged well below the lowest height: dismiss.
      if (now < snapPoints[0]! * 0.6) {
        state?.close();
        return;
      }
      const nearest = snapPoints.reduce((best, p, i) => (Math.abs(p - now) < Math.abs(snapPoints[best]! - now) ? i : best), 0);
      setSnap(nearest);
    },
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp") setSnap((s) => Math.min(snapPoints.length - 1, s + 1));
    else if (event.key === "ArrowDown") {
      if (snap === 0) state?.close();
      else setSnap((s) => s - 1);
    } else return;
    event.preventDefault();
  };

  return (
    <AriaModal
      style={{ height }}
      className={cx(
        "relative flex w-full max-w-2xl flex-col shadow-overlay",
        drag === null && "transition-[height,translate] duration-(--ds-motion-duration-slow) ease-enter motion-reduce:transition-none",
        "data-[entering]:translate-y-full data-[exiting]:translate-y-full data-[exiting]:ease-out",
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Resize sheet, ${Math.round(snapPoints[snap]! * 100)}% of the screen`}
        onClick={() => setSnap((s) => (s + 1) % snapPoints.length)}
        onKeyDown={onKeyDown}
        {...moveProps}
        className={cx("absolute inset-x-0 top-0 z-10 mx-auto flex h-6 w-24 cursor-grab touch-none items-center justify-center rounded-full active:cursor-grabbing", focusRingNative)}
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-line-control" />
      </button>
      <DialogFrameContext.Provider value="drawer-bottom">{children}</DialogFrameContext.Provider>
    </AriaModal>
  );
}

export function BottomSheet({ snapPoints = [0.5, 0.92], defaultSnap = 0, isDismissable = true, children, className, ...props }: BottomSheetProps) {
  return (
    <ModalOverlay {...props} isDismissable={isDismissable} className={cx(OVERLAY_SCRIM, "flex items-end justify-center")}>
      <Sheet snapPoints={snapPoints} defaultSnap={defaultSnap} className={className}>
        {children}
      </Sheet>
    </ModalOverlay>
  );
}
