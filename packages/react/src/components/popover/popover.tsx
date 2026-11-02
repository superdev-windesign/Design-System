"use client";

import type { ReactNode } from "react";
import { Dialog as AriaDialog, DialogTrigger, Heading, OverlayArrow, Popover as AriaPopover } from "react-aria-components";
import type { PopoverProps as AriaPopoverProps } from "react-aria-components";
import { focusRingNative } from "../../recipes/focus-ring";
import { FLOATING_SURFACE, OVERLAY_ARROW_SVG, POPOVER_MOTION } from "../../recipes/overlay";
import { cx } from "../../utils/cx";

/**
 * Popover: a small dialog anchored to its trigger, for settings, details
 * and short forms that shouldn't take over the page. Wrap trigger and
 * popover in `PopoverTrigger` (React Aria's DialogTrigger):
 *
 * ```tsx
 * <PopoverTrigger>
 *   <Button variant="secondary">Share</Button>
 *   <Popover title="Share this page">…</Popover>
 * </PopoverTrigger>
 * ```
 *
 * Focus moves into the popover and returns to the trigger on close. It
 * closes on Escape or a press outside. Give it a `title` or an `aria-label`.
 */

export { DialogTrigger as PopoverTrigger };

export interface PopoverProps extends Omit<AriaPopoverProps, "children" | "className"> {
  title?: ReactNode;
  /** Draw the arrow pointing at the trigger. Default true. */
  showArrow?: boolean;
  className?: string;
  "aria-label"?: string;
  children: ReactNode | ((opts: { close: () => void }) => ReactNode);
}

export function Popover({ title, showArrow = true, className, children, "aria-label": ariaLabel, offset, ...props }: PopoverProps) {
  return (
    <AriaPopover {...props} offset={offset ?? (showArrow ? 10 : 6)} className={cx("max-w-[calc(100vw-24px)]", FLOATING_SURFACE, POPOVER_MOTION, className)}>
      {showArrow && <PopoverArrow />}
      <AriaDialog aria-label={ariaLabel} className={cx("max-h-[inherit] overflow-auto rounded-overlay p-4", focusRingNative)}>
        {({ close }) => (
          <>
            {title && (
              <Heading slot="title" className="mb-2 text-body-md-strong text-fg">
                {title}
              </Heading>
            )}
            {typeof children === "function" ? children({ close }) : children}
          </>
        )}
      </AriaDialog>
    </AriaPopover>
  );
}

/** The arrow under a Popover or HoverCard, rotated to face the trigger. */
export function PopoverArrow() {
  return (
    <OverlayArrow>
      {({ placement }) => (
        <svg
          width={14}
          height={8}
          viewBox="0 0 14 8"
          aria-hidden
          className={cx(
            OVERLAY_ARROW_SVG,
            placement === "bottom" && "rotate-180",
            placement === "left" && "-rotate-90",
            placement === "right" && "rotate-90",
          )}
        >
          <path d="M0 0 L7 7 L14 0" strokeWidth={1} />
        </svg>
      )}
    </OverlayArrow>
  );
}
