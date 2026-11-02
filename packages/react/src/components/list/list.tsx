"use client";

import type { ReactNode } from "react";
import { GridList, GridListItem, Text } from "react-aria-components";
import type { GridListItemProps, GridListProps } from "react-aria-components";
import { Checkbox } from "../checkbox/checkbox";
import { focusRingInset } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * List: an interactive list of rows, ruled like a ledger (people, files,
 * notifications). Rows can be selected (`selectionMode`, with checkboxes for
 * `"multiple"`), opened (`onAction`), and can hold their own buttons, which
 * ← / → reach. ↑ / ↓ move between rows, typing jumps to one.
 *
 * ```tsx
 * <List aria-label="Team" items={people} selectionMode="multiple">
 *   {(p) => <ListItem id={p.id} title={p.name} description={p.role} leading={<Avatar … />} />}
 * </List>
 * ```
 */

export interface ListProps<T extends object> extends Omit<GridListProps<T>, "className"> {
  className?: string;
  /** Draw the list inside a ruled frame. Default true. */
  framed?: boolean;
}

export function List<T extends object>({ className, framed = true, renderEmptyState, ...props }: ListProps<T>) {
  return (
    <GridList
      {...props}
      renderEmptyState={renderEmptyState ?? (() => <p className="px-4 py-8 text-center text-body-md text-fg-secondary">Nothing here yet.</p>)}
      className={cx("flex flex-col overflow-auto outline-none", framed && "rounded-surface border border-line bg-surface", className)}
    />
  );
}

export interface ListItemProps extends Omit<GridListItemProps, "children" | "className"> {
  title: ReactNode;
  description?: ReactNode;
  /** An avatar, icon or thumbnail before the text. */
  leading?: ReactNode;
  /** Meta text or buttons at the end of the row. */
  trailing?: ReactNode;
  className?: string;
}

export function ListItem({ title, description, leading, trailing, className, textValue, ...props }: ListItemProps) {
  return (
    <GridListItem
      {...props}
      textValue={textValue ?? (typeof title === "string" ? title : undefined)}
      className={(state) =>
        cx(
          "relative flex cursor-default items-center gap-3 border-b border-line px-4 py-3 outline-none last:border-b-0",
          "transition-colors duration-(--ds-motion-duration-fast)",
          (state.selectionMode !== "none" || state.allowsDragging) && "cursor-pointer",
          state.isHovered && "bg-surface-hover",
          state.isPressed && "bg-surface-pressed",
          state.isSelected && "bg-sunken",
          state.isDisabled && "cursor-not-allowed text-fg-disabled",
          state.isFocusVisible && focusRingInset,
          className,
        )
      }
    >
      {({ selectionMode, selectionBehavior, isSelected }) => (
        <>
          {selectionMode === "multiple" && selectionBehavior === "toggle" && <Checkbox slot="selection" />}
          {isSelected && selectionMode === "single" && <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 bg-accent-600" />}
          {leading && <span className="flex shrink-0 items-center">{leading}</span>}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-body-md-strong text-fg">{title}</span>
            {description && (
              <Text slot="description" className="truncate text-body-sm text-fg-secondary">
                {description}
              </Text>
            )}
          </span>
          {trailing && <span className="flex shrink-0 items-center gap-1 text-body-sm text-fg-secondary">{trailing}</span>}
        </>
      )}
    </GridListItem>
  );
}
