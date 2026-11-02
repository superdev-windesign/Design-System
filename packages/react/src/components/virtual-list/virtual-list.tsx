"use client";

import type { ReactNode } from "react";
import { Collection, GridList, GridListLoadMoreItem, ListLayout, Virtualizer } from "react-aria-components";
import type { GridListProps } from "react-aria-components";
import { Spinner } from "../spinner/spinner";
import { cx } from "../../utils/cx";

/**
 * VirtualList: a List for thousands of rows. Only the rows in view (plus a
 * margin) are in the DOM, so scrolling stays smooth; keyboard navigation,
 * selection and typeahead still cover every row, and screen readers are told
 * the full count.
 *
 * Give it a fixed height. Rows are measured as they render, so they can vary;
 * `estimatedRowSize` is the starting guess. With `onLoadMore`, a spinner row
 * at the end fetches the next page as it scrolls into view.
 *
 * Rows are ListItems:
 *
 * ```tsx
 * <VirtualList aria-label="Contacts" items={contacts} className="h-96">
 *   {(c) => <ListItem id={c.id} title={c.name} description={c.email} />}
 * </VirtualList>
 * ```
 */

export interface VirtualListProps<T extends object> extends Omit<GridListProps<T>, "className" | "children" | "layout"> {
  items: Iterable<T>;
  children: (item: T) => ReactNode;
  /** Starting guess for each row's height, in pixels. Default 64. */
  estimatedRowSize?: number;
  /** Called when the end of the list scrolls into view. */
  onLoadMore?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function VirtualList<T extends object>({ items, children, estimatedRowSize = 64, onLoadMore, isLoading = false, className, renderEmptyState, ...props }: VirtualListProps<T>) {
  return (
    <Virtualizer layout={ListLayout} layoutOptions={{ estimatedRowSize, loaderSize: 48 }}>
      <GridList
        {...props}
        renderEmptyState={renderEmptyState ?? (() => <p className="px-4 py-8 text-center text-body-md text-fg-secondary">Nothing here yet.</p>)}
        className={cx("scrollbar-thin relative block overflow-auto rounded-surface border border-line bg-surface outline-none", className)}
      >
        <Collection items={items}>{children}</Collection>
        {onLoadMore && (
          <GridListLoadMoreItem onLoadMore={onLoadMore} isLoading={isLoading} className="flex h-12 items-center justify-center text-fg-secondary">
            <Spinner size="sm" aria-label="Loading more" />
          </GridListLoadMoreItem>
        )}
      </GridList>
    </Virtualizer>
  );
}
