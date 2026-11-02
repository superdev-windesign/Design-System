"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * Card: a ruled panel that groups one subject (a project, a plan, a person).
 *
 *   outline  paper surface with a hairline rule (default)
 *   sunken   recessed paper, for cards on a white surface
 *   raised   lifted with the raised shadow, for cards that move or float
 *
 * Make a whole card clickable by giving `CardTitle` an `href`: the title's
 * link stretches over the card, so there's one link to tab to and one name
 * read out, and buttons inside the card keep working above it.
 */

export type CardVariant = "outline" | "sunken" | "raised";

const VARIANT: Record<CardVariant, string> = {
  outline: "border border-line bg-surface",
  sunken: "border border-line bg-sunken",
  raised: "border border-line bg-surface shadow-raised",
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  /** Render as `article` for self-contained content, `section` for a titled region. Default `div`. */
  as?: "div" | "article" | "section" | "li";
}

export function Card({ variant = "outline", as: Tag = "div", className, ...props }: CardProps) {
  return (
    <Tag
      {...props}
      className={cx(
        "group/card relative flex flex-col overflow-hidden rounded-surface text-fg",
        VARIANT[variant],
        // A stretched title link draws the focus ring around the whole card.
        "has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-focus",
        "has-[[data-card-link]]:transition-[border-color,box-shadow] has-[[data-card-link]]:duration-(--ds-motion-duration-base) has-[[data-card-link]]:hover:border-line-control",
        className,
      )}
    />
  );
}

export interface CardHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  /** A small mono label above the title. */
  kicker?: ReactNode;
  /** A button or menu at the end of the header. */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ title, description, kicker, action, className, children }: CardHeaderProps) {
  return (
    <div className={cx("flex items-start gap-3 px-5 pt-5", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {kicker && <p className="font-mono text-caption tracking-wide text-fg-secondary uppercase">{kicker}</p>}
        {typeof title === "string" ? <CardTitle>{title}</CardTitle> : title}
        {description && <p className="text-body-md text-pretty text-fg-secondary">{description}</p>}
        {children}
      </div>
      {action && <div className="relative z-10 -me-1.5 -mt-1 shrink-0">{action}</div>}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  /** Makes the whole card a link to this address. */
  href?: string;
  /** Heading level. Default 3. */
  level?: 2 | 3 | 4;
  className?: string;
}

export function CardTitle({ children, href, level = 3, className }: CardTitleProps) {
  const Heading = `h${level}` as const;
  return (
    <Heading className={cx("text-title-sm-strong text-balance text-fg", className)}>
      {href ? (
        <a href={href} data-card-link="" className="outline-none after:absolute after:inset-0 group-hover/card:underline group-hover/card:decoration-line-control group-hover/card:underline-offset-4">
          {children}
        </a>
      ) : (
        children
      )}
    </Heading>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("flex-1 px-5 py-4 text-body-md text-fg", className)} />;
}

/** The ruled strip at the bottom: actions, a timestamp, a link. Buttons stay clickable over a stretched title. */
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("relative z-10 flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 text-body-sm text-fg-secondary", className)} />;
}

/** Media flush with the card's top edge. */
export function CardMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("relative overflow-hidden border-b border-line bg-sunken", className)} />;
}
