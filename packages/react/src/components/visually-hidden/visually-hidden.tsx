"use client";

import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Accessibility helpers.
 *
 * `VisuallyHidden` keeps text for screen readers while hiding it on screen
 * (an icon button's extra context, a table caption). With `isFocusable` it
 * appears when something inside it receives keyboard focus.
 *
 * `SkipLink` is the first stop on the page: hidden until tabbed to, then it
 * jumps past the header to the main content and moves focus there.
 */

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  as?: "span" | "div";
  /** Reveal while focus is inside. */
  isFocusable?: boolean;
}

export function VisuallyHidden({ as: Tag = "span", isFocusable = false, className, ...props }: VisuallyHiddenProps) {
  return <Tag {...props} className={cx("sr-only", isFocusable && "focus-within:not-sr-only", className)} />;
}

export interface SkipLinkProps {
  /** The id of the main content, with "#". Default "#main". */
  href?: string;
  children?: ReactNode;
  className?: string;
}

export function SkipLink({ href = "#main", children = "Skip to content", className }: SkipLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(href.replace(/^#/, ""));
    if (!target) return;
    event.preventDefault();
    // Make the target focusable for this jump without adding it to the tab order.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus();
    target.scrollIntoView({ block: "start" });
  };
  return (
    <a
      href={href}
      onClick={onClick}
      className={cx(
        "sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50",
        "focus:rounded-control-md focus:border focus:border-line focus:bg-surface focus:px-3 focus:py-2 focus:text-body-md-strong focus:text-fg focus:shadow-overlay",
        focusRingNative,
        className,
      )}
    >
      {children}
    </a>
  );
}
