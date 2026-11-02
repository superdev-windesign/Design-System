"use client";

import type { ReactNode } from "react";
import type { IconComponent } from "../button/button";
import { cx } from "../../utils/cx";

/**
 * EmptyState: what a list, table or page shows when there's nothing in it
 * yet, or nothing matches. Say what would be here and how to get it there;
 * give one primary action and, at most, one way out.
 *
 * `variant="ruled"` frames it in a dashed rule, for empty areas inside a
 * page (a drop zone, an empty column).
 */

export interface EmptyStateProps {
  icon?: IconComponent;
  /** An illustration in place of the icon. */
  media?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or links, primary first. */
  actions?: ReactNode;
  size?: "sm" | "md";
  variant?: "plain" | "ruled";
  /** Heading level for the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function EmptyState({ icon: Icon, media, title, description, actions, size = "md", variant = "plain", headingLevel = 3, className }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      className={cx(
        "flex flex-col items-center text-center",
        size === "md" ? "gap-4 px-6 py-12" : "gap-3 px-4 py-8",
        variant === "ruled" && "rounded-surface border border-dashed border-line-control",
        className,
      )}
    >
      {media ??
        (Icon && (
          <span aria-hidden className={cx("flex items-center justify-center rounded-full border border-line bg-sunken text-icon-secondary", size === "md" ? "size-14" : "size-11")}>
            <Icon className={size === "md" ? "size-6" : "size-5"} />
          </span>
        ))}
      <div className="flex max-w-sm flex-col gap-1.5">
        <Heading className={cx("text-balance text-fg", size === "md" ? "text-title-md-strong" : "text-title-sm-strong")}>{title}</Heading>
        {description && <p className="text-body-md text-pretty text-fg-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}
