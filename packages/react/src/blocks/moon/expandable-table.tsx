"use client";

import { Fragment, useId, useMemo, useState, type ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiArrowDownLine, RiArrowDownSLine, RiArrowUpLine, RiExpandUpDownLine } from "@remixicon/react";
import { Checkbox } from "../../components/checkbox/checkbox";
import { Pagination } from "../../components/pagination/pagination";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Expandable table: records you can sort, select in bulk and open for detail
 * in place. Selecting rows brings up an action bar; selection survives paging,
 * so a choice can span pages. Sorting and paging happen here, so pass all the
 * rows. For server-driven data, reach for DataGrid instead.
 *
 * It's a real <table>: rows expand into a full-width row beneath them, which
 * React Aria's grid table can't express, so the header sort buttons, row
 * checkboxes and expand buttons each carry their own semantics
 * (`aria-sort`, a named checkbox, `aria-expanded`).
 */

export interface ExpandableTableColumn<T> {
  key: string;
  label: string;
  /** The cell. Default: `row[key]`. */
  render?: (row: T) => ReactNode;
  /** The value to sort by. Giving one makes the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: "start" | "end";
}

export interface ExpandableTableProps<T> {
  /** Names the table for assistive tech. */
  "aria-label": string;
  columns: ExpandableTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Names a row for its checkbox and expand button, e.g. the customer. */
  getRowLabel: (row: T) => string;
  /** The detail shown when a row opens. Leave out for a table with no expansion. */
  renderExpanded?: (row: T) => ReactNode;
  selectable?: boolean;
  /** Shown over the table while rows are selected. Call `clear` once an action is done. */
  renderBulkActions?: (selected: T[], clear: () => void) => ReactNode;
  pageSize?: number;
  defaultSort?: { key: string; direction: "ascending" | "descending" };
  emptyState?: ReactNode;
  className?: string;
}

/** Each row is its own white card, so its cells round off at the ends. */
const CELL = "h-14 bg-surface px-3 first:rounded-s-item last:rounded-e-item group-data-[selected]:bg-action-tertiary";

export function ExpandableTable<T>({
  "aria-label": ariaLabel,
  columns,
  rows,
  getRowId,
  getRowLabel,
  renderExpanded,
  selectable = false,
  renderBulkActions,
  pageSize = 5,
  defaultSort,
  emptyState = "Nothing to show.",
  className,
}: ExpandableTableProps<T>) {
  const reduceMotion = useReducedMotion() ?? false;
  const baseId = useId();
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  const sorted = useMemo(() => {
    const value = columns.find((column) => column.key === sort?.key)?.sortValue;
    if (!sort || !value) return rows;
    const direction = sort.direction === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const [x, y] = [value(a), value(b)];
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * direction;
    });
  }, [rows, columns, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleIds = visible.map(getRowId);
  const pickedOnPage = visibleIds.filter((id) => selected.has(id)).length;
  const selectedRows = rows.filter((row) => selected.has(getRowId(row)));

  const toggleIn = (set: ReadonlySet<string>, id: string, on: boolean) => {
    const next = new Set(set);
    if (on) next.add(id);
    else next.delete(id);
    return next;
  };

  const togglePage = (on: boolean) => {
    const next = new Set(selected);
    for (const id of visibleIds) {
      if (on) next.add(id);
      else next.delete(id);
    }
    setSelected(next);
  };

  const toggleSort = (key: string) =>
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "ascending" };
      return current.direction === "ascending" ? { key, direction: "descending" } : undefined;
    });

  const span = columns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0);

  return (
    <div className={cx("flex w-full min-w-0 flex-col gap-2", className)}>
      {selectable && selected.size > 0 && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-item bg-action-tertiary px-3 py-2">
          <span className="text-body-sm-strong text-action-tertiary-fg tabular-nums">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            {renderBulkActions?.(selectedRows, () => setSelected(new Set()))}
            <AriaButton onPress={() => setSelected(new Set())} className={cx("cursor-pointer rounded-control-xs text-body-sm text-action-tertiary-fg underline underline-offset-2", focusRing)}>
              Clear
            </AriaButton>
          </div>
        </div>
      )}

      <div className="scrollbar-thin w-full overflow-x-auto">
        <table aria-label={ariaLabel} className="w-full border-separate border-spacing-y-1 text-body-md text-fg">
          <thead>
            <tr className="text-body-sm text-fg-secondary [&>th]:px-3 [&>th]:py-1 [&>th]:font-normal">
              {renderExpanded && <th scope="col" aria-label="Details" className="w-10" />}
              {selectable && (
                <th scope="col" className="w-10">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    isSelected={visibleIds.length > 0 && pickedOnPage === visibleIds.length}
                    isIndeterminate={pickedOnPage > 0 && pickedOnPage < visibleIds.length}
                    onChange={togglePage}
                  />
                </th>
              )}
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const SortIcon = !active ? RiExpandUpDownLine : sort.direction === "ascending" ? RiArrowUpLine : RiArrowDownLine;
                return (
                  <th key={column.key} scope="col" aria-sort={active ? sort.direction : column.sortValue ? "none" : undefined} className={column.align === "end" ? "text-end" : "text-start"}>
                    {column.sortValue ? (
                      <AriaButton
                        onPress={() => toggleSort(column.key)}
                        className={cx("inline-flex cursor-pointer items-center gap-1 rounded-control-xs transition-colors data-[hovered]:text-fg", active && "text-fg", column.align === "end" && "flex-row-reverse", focusRing)}
                      >
                        {column.label}
                        <SortIcon aria-hidden className={cx("size-3.5", !active && "opacity-50")} />
                      </AriaButton>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={span} className="rounded-item bg-surface py-10 text-center text-fg-secondary">
                  {emptyState}
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const id = getRowId(row);
                const label = getRowLabel(row);
                const isOpen = open.has(id);
                const panelId = `${baseId}-${id}`;
                return (
                  <Fragment key={id}>
                    <tr data-selected={selected.has(id) || undefined} className="group">
                      {renderExpanded && (
                        <td className={cx(CELL, "w-10")}>
                          <AriaButton
                            aria-label={`Details for ${label}`}
                            aria-expanded={isOpen}
                            aria-controls={isOpen ? panelId : undefined}
                            onPress={() => setOpen((set) => toggleIn(set, id, !set.has(id)))}
                            className={cx("flex size-7 cursor-pointer items-center justify-center rounded-control-sm text-icon-secondary transition-colors data-[hovered]:bg-muted data-[hovered]:text-fg", focusRing)}
                          >
                            <RiArrowDownSLine aria-hidden className={cx("size-5 transition-transform duration-(--ds-motion-duration-base) motion-reduce:transition-none", isOpen && "rotate-180")} />
                          </AriaButton>
                        </td>
                      )}
                      {selectable && (
                        <td className={cx(CELL, "w-10")}>
                          <Checkbox aria-label={`Select ${label}`} isSelected={selected.has(id)} onChange={(on) => setSelected((set) => toggleIn(set, id, on))} />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className={cx(CELL, column.align === "end" && "text-end")}>
                          {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && (
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.tr id={panelId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }}>
                            <td colSpan={span} className="rounded-item bg-surface p-3">
                              {renderExpanded(row)}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-1">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
