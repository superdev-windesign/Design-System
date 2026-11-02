"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * DescriptionList: terms and their values (an order's details, a person's
 * profile, a specification sheet), as a real `<dl>`.
 *
 *   inline   term and value side by side on ruled rows (default; stacks on narrow screens)
 *   stacked  term above value
 *   grid     term-over-value cells in columns, for short facts
 */

export type DescriptionListLayout = "inline" | "stacked" | "grid";

export interface DescriptionListProps {
  layout?: DescriptionListLayout;
  /** Columns for the grid layout. Default 3. */
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

const GRID_COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 md:grid-cols-4" } as const;

export function DescriptionList({ layout = "inline", columns = 3, children, className }: DescriptionListProps) {
  return (
    <dl
      data-layout={layout}
      className={cx(
        "group/dl",
        layout === "grid" ? cx("grid grid-cols-1 gap-px overflow-hidden rounded-surface border border-line bg-line", GRID_COLUMNS[columns]) : "flex flex-col border-t border-line",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export interface DescriptionItemProps {
  term: ReactNode;
  children: ReactNode;
  /** Something at the end of the row (a copy or edit button). */
  action?: ReactNode;
  className?: string;
}

export function DescriptionItem({ term, children, action, className }: DescriptionItemProps) {
  return (
    <div
      className={cx(
        "group-data-[layout=inline]/dl:grid group-data-[layout=inline]/dl:grid-cols-1 group-data-[layout=inline]/dl:gap-1 group-data-[layout=inline]/dl:border-b group-data-[layout=inline]/dl:border-line group-data-[layout=inline]/dl:py-3 sm:group-data-[layout=inline]/dl:grid-cols-3 sm:group-data-[layout=inline]/dl:gap-4",
        "group-data-[layout=stacked]/dl:flex group-data-[layout=stacked]/dl:flex-col group-data-[layout=stacked]/dl:gap-1 group-data-[layout=stacked]/dl:border-b group-data-[layout=stacked]/dl:border-line group-data-[layout=stacked]/dl:py-3",
        "group-data-[layout=grid]/dl:flex group-data-[layout=grid]/dl:flex-col group-data-[layout=grid]/dl:gap-1 group-data-[layout=grid]/dl:bg-surface group-data-[layout=grid]/dl:p-4",
        className,
      )}
    >
      <dt className="text-body-sm-strong text-fg-secondary group-data-[layout=grid]/dl:font-mono group-data-[layout=grid]/dl:text-caption group-data-[layout=grid]/dl:tracking-wide group-data-[layout=grid]/dl:uppercase">
        {term}
      </dt>
      <dd className="flex min-w-0 items-start gap-2 text-body-md text-fg sm:group-data-[layout=inline]/dl:col-span-2">
        <span className="min-w-0 flex-1 break-words">{children}</span>
        {action && <span className="-my-1 shrink-0">{action}</span>}
      </dd>
    </div>
  );
}
