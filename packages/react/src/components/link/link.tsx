"use client";

import type { ReactNode } from "react";
import { Link as AriaLink, composeRenderProps } from "react-aria-components";
import type { LinkProps as AriaLinkProps } from "react-aria-components";
import { RiArrowRightUpLine } from "@remixicon/react";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Link: a text link, set in ink with a terracotta underline rather than
 * coloured text, so it reads on every surface in both themes.
 *
 *   inline      inside running text: always underlined (default)
 *   standalone  on its own line ("View all invoices"): underlined on hover
 *   quiet       secondary text that darkens and underlines on hover (footers, meta)
 *
 * It's React Aria's Link, so it works with a client router through
 * `RouterProvider`. `isExternal` opens a new tab, adds `rel="noopener
 * noreferrer"`, shows an arrow and tells screen readers it opens a new tab.
 */

export type LinkVariant = "inline" | "standalone" | "quiet";

const VARIANT: Record<LinkVariant, string> = {
  inline: "text-fg underline decoration-accent-600 decoration-1 underline-offset-4 data-[hovered]:decoration-2",
  standalone: "text-body-md-strong text-fg decoration-accent-600 underline-offset-4 data-[hovered]:underline",
  quiet: "text-fg-secondary decoration-line-control underline-offset-4 data-[hovered]:text-fg data-[hovered]:underline",
};

export interface LinkProps extends Omit<AriaLinkProps, "className" | "children"> {
  variant?: LinkVariant;
  /** Opens in a new tab, with an arrow and a screen-reader note. */
  isExternal?: boolean;
  className?: string;
  children: ReactNode;
}

export function Link({ variant = "inline", isExternal = false, className, children, ...props }: LinkProps) {
  return (
    <AriaLink
      {...props}
      target={isExternal ? "_blank" : props.target}
      rel={isExternal ? "noopener noreferrer" : props.rel}
      className={composeRenderProps(className, (className) =>
        cx(
          "cursor-pointer rounded-xs transition-[color,text-decoration-color] duration-(--ds-motion-duration-fast)",
          isExternal && "inline-flex items-baseline gap-0.5",
          VARIANT[variant],
          "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled data-[disabled]:no-underline",
          focusRing,
          className,
        ),
      )}
    >
      {children}
      {isExternal && (
        <>
          <RiArrowRightUpLine aria-hidden className="size-3.5 shrink-0 self-center text-accent-600 rtl:-scale-x-100" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </AriaLink>
  );
}
