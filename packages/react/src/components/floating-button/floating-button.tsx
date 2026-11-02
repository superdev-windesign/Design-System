"use client";

import { useEffect, useState, type RefObject } from "react";
import { Button as AriaButton, composeRenderProps } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { RiArrowUpLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * FloatingActionButton: the one primary action of a screen, floating in a
 * corner (compose, new task). Round with just an icon, or `extended` with a
 * label. It's always named: the label is its accessible name either way.
 *
 * BackToTop: a small floating button that appears once the page (or a
 * scrolling panel) is scrolled past `threshold`, and takes you back up,
 * moving focus to the top of the content.
 */

const POSITION = {
  "bottom-end": "bottom-6 end-6",
  "bottom-start": "bottom-6 start-6",
  "bottom-center": "bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2",
} as const;

export interface FloatingActionButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  icon: IconComponent;
  label: string;
  /** Show the label beside the icon. */
  extended?: boolean;
  position?: keyof typeof POSITION;
  /** `fixed` (default) floats over the viewport; `absolute` within the nearest positioned parent; `static` lays out normally. */
  placement?: "fixed" | "absolute" | "static";
  className?: string;
}

export function FloatingActionButton({ icon: Icon, label, extended = false, position = "bottom-end", placement = "fixed", className, ...props }: FloatingActionButtonProps) {
  return (
    <AriaButton
      {...props}
      aria-label={extended ? undefined : label}
      className={composeRenderProps(className, (className) =>
        cx(
          "z-30 inline-flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-action-primary text-body-md-strong text-on-action shadow-overlay press-motion",
          extended ? "ps-4 pe-5" : "px-0",
          placement !== "static" && placement,
          placement !== "static" && POSITION[position],
          "data-[disabled]:cursor-not-allowed data-[disabled]:text-action-primary-fg-disabled",
          focusRing,
          className,
        ),
      )}
    >
      <Icon aria-hidden className="size-6 shrink-0" />
      {extended && <span>{label}</span>}
    </AriaButton>
  );
}

export interface BackToTopProps {
  /** Pixels scrolled before it appears. Default 480. */
  threshold?: number;
  /** A scrolling element to watch instead of the window. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** The id of the element to focus afterwards. Default "main". */
  focusTargetId?: string;
  label?: string;
  placement?: "fixed" | "absolute";
  className?: string;
}

export function BackToTop({ threshold = 480, scrollRef, focusTargetId = "main", label = "Back to top", placement = "fixed", className }: BackToTopProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = scrollRef?.current;
    const target: HTMLElement | Window = el ?? window;
    const read = () => setShown((el ? el.scrollTop : window.scrollY) > threshold);
    read();
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [scrollRef, threshold]);

  if (!shown) return null;

  const goTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    (scrollRef?.current ?? window).scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const focus = document.getElementById(focusTargetId);
    if (focus) {
      if (!focus.hasAttribute("tabindex")) focus.setAttribute("tabindex", "-1");
      focus.focus({ preventScroll: true });
    }
  };

  return (
    <AriaButton
      aria-label={label}
      onPress={goTop}
      className={cx(
        placement,
        "end-6 bottom-6 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-control bg-surface text-fg shadow-overlay",
        "animate-row-slide-in transition-colors duration-(--ds-motion-duration-base) data-[hovered]:bg-surface-hover",
        focusRing,
        className,
      )}
    >
      <RiArrowUpLine aria-hidden className="size-5" />
    </AriaButton>
  );
}
