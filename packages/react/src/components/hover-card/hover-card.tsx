"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Popover as AriaPopover } from "react-aria-components";
import type { Placement } from "react-aria";
import { FLOATING_SURFACE, POPOVER_MOTION } from "../../recipes/overlay";
import { cx } from "../../utils/cx";
import { PopoverArrow } from "../popover/popover";

/**
 * HoverCard: a preview that opens while a pointer rests on a link (or the
 * link has keyboard focus), such as a profile card behind an @mention. It
 * stays open while the pointer moves onto the card, so links inside it can be
 * clicked, and closes on Escape or when both are left.
 *
 * It is a supplement, not the only path to its content: screen readers skip
 * it, and touch users never see it, so the trigger itself should lead to the
 * same information (the profile page, the full document). For a hint that
 * must be announced, use Tooltip.
 */

export interface HoverCardProps {
  /** The link or button that shows the card. */
  trigger: ReactNode;
  children: ReactNode;
  placement?: Placement;
  /** Milliseconds of hover before opening. Default 500. */
  delay?: number;
  /** Milliseconds before closing once the pointer leaves. Default 250. */
  closeDelay?: number;
  showArrow?: boolean;
  className?: string;
  /** Fires when the card opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export function HoverCard({
  trigger,
  children,
  placement = "bottom",
  delay = 500,
  closeDelay = 250,
  showArrow = true,
  className,
  onOpenChange,
}: HoverCardProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const set = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };
  const clear = () => clearTimeout(timer.current);
  const show = (after = delay) => {
    clear();
    timer.current = setTimeout(() => set(true), after);
  };
  const hide = () => {
    clear();
    timer.current = setTimeout(() => set(false), closeDelay);
  };

  useEffect(() => clear, []);
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clear();
        set(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onPointerEnter={(event) => event.pointerType === "mouse" && show()}
        onPointerLeave={(event) => event.pointerType === "mouse" && hide()}
        onFocus={(event) => event.target.matches(":focus-visible") && show(Math.min(delay, 300))}
        onBlur={hide}
      >
        {trigger}
      </span>
      <AriaPopover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={set}
        isNonModal
        placement={placement}
        offset={showArrow ? 10 : 6}
        className={cx("w-72 max-w-[calc(100vw-24px)]", FLOATING_SURFACE, POPOVER_MOTION, className)}
      >
        {showArrow && <PopoverArrow />}
        <div className="p-4" onPointerEnter={clear} onPointerLeave={hide}>
          {children}
        </div>
      </AriaPopover>
    </>
  );
}
