"use client";

import type { ReactNode } from "react";
import { cx } from "../utils/cx";

/**
 * Templates are whole screens assembled from the system's blocks and charts:
 * starting points to copy into an app, not components to configure. They fill
 * their container (give it a height) and lay out with container queries, so
 * they adapt to the space they're given rather than to the window.
 */

export interface TemplateProps {
  className?: string;
}

/** Scrolling page body with a title row. */
export function TemplatePage({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cx("@container flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto", className)}>
      <div className="flex flex-col gap-5 p-4 @3xl:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-title-md-strong text-fg">{title}</h2>
            {description && <p className="text-body-md text-fg-secondary">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    </main>
  );
}

/** Root of a template: a framed app area that fills its container. */
export function TemplateRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("@container flex size-full min-h-0 overflow-hidden bg-canvas text-fg", className)}>{children}</div>;
}

/** Fictional people for template data. */
export const PEOPLE = {
  alex: { name: "Alex Morgan", initials: "AM" },
  sam: { name: "Sam Rivera", initials: "SR" },
  priya: { name: "Priya Nair", initials: "PN" },
  jordan: { name: "Jordan Lee", initials: "JL" },
  mia: { name: "Mia Chen", initials: "MC" },
} as const;
