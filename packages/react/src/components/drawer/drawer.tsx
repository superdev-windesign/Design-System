"use client";

import type { ReactNode } from "react";
import { Modal as AriaModal, ModalOverlay } from "react-aria-components";
import type { ModalOverlayProps } from "react-aria-components";
import { OVERLAY_SCRIM } from "../../recipes/overlay";
import { cx } from "../../utils/cx";
import { DialogFrameContext, type DialogFrame } from "../dialog/dialog";

/**
 * Drawer: a Dialog that slides in from an edge and runs the full height (or
 * width) of the screen. `start` and `end` follow the reading direction, so an
 * `end` drawer opens on the left in right-to-left pages. Put a Dialog inside;
 * it squares the corners that meet the screen edge.
 *
 * ```tsx
 * <DialogTrigger>
 *   <Button>Filters</Button>
 *   <Drawer placement="end">
 *     <Dialog title="Filters" footer={…}>…</Dialog>
 *   </Drawer>
 * </DialogTrigger>
 * ```
 */

export type DrawerPlacement = "start" | "end" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

const WIDTH: Record<DrawerSize, string> = { sm: "max-w-xs", md: "max-w-md", lg: "max-w-2xl" };
const HEIGHT: Record<DrawerSize, string> = { sm: "max-h-2/5", md: "max-h-7/10", lg: "max-h-[calc(100dvh-48px)]" };

const PLACEMENT: Record<DrawerPlacement, { overlay: string; panel: string }> = {
  start: {
    overlay: "justify-start",
    panel: "h-full data-[entering]:-translate-x-full data-[exiting]:-translate-x-full rtl:data-[entering]:translate-x-full rtl:data-[exiting]:translate-x-full",
  },
  end: {
    overlay: "justify-end",
    panel: "h-full data-[entering]:translate-x-full data-[exiting]:translate-x-full rtl:data-[entering]:-translate-x-full rtl:data-[exiting]:-translate-x-full",
  },
  bottom: {
    overlay: "items-end",
    panel: "data-[entering]:translate-y-full data-[exiting]:translate-y-full",
  },
};

export interface DrawerProps extends Omit<ModalOverlayProps, "children" | "className"> {
  placement?: DrawerPlacement;
  /** Width for start/end drawers, height for bottom ones. */
  size?: DrawerSize;
  className?: string;
  children: ReactNode;
}

export function Drawer({ placement = "end", size = "md", isDismissable = true, className, children, ...props }: DrawerProps) {
  const p = PLACEMENT[placement];
  return (
    <ModalOverlay {...props} isDismissable={isDismissable} className={cx(OVERLAY_SCRIM, "flex", p.overlay)}>
      <AriaModal
        className={cx(
          "bui-drawer flex w-full shadow-overlay",
          placement === "bottom" ? HEIGHT[size] : WIDTH[size],
          "transition-transform duration-(--ds-motion-duration-slow) ease-enter data-[exiting]:ease-out motion-reduce:transition-none",
          p.panel,
          className,
        )}
      >
        <DialogFrameContext.Provider value={`drawer-${placement}` as DialogFrame}>{children}</DialogFrameContext.Provider>
      </AriaModal>
    </ModalOverlay>
  );
}
