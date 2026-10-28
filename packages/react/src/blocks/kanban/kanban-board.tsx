"use client";

import { useId } from "react";
import { Button as AriaButton, GridList, GridListItem, isTextDropItem, useDragAndDrop } from "react-aria-components";
import type { Key } from "react-aria-components";
import { RiChat3Line, RiDraggable } from "@remixicon/react";
import { Avatar } from "../../components/avatar/avatar";
import { focusRing, focusRingInset } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Kanban Board: cards in columns that you drag between, by pointer or by
 * keyboard (focus a card, press its drag handle with Enter, move with arrows,
 * Enter to drop). Each column is a React Aria GridList, so the board gets
 * drop indicators, screen reader announcements and touch dragging for free.
 * State lives with the host: the board reports moves through `onMove`.
 */

export type Priority = "low" | "medium" | "high" | "urgent";

export interface KanbanCard {
  id: string;
  column: string;
  title: string;
  /** Short reference, e.g. "WIN-142". */
  ref?: string;
  tag?: { label: string; tone: "blue" | "lime" | "purple" | "rose" | "orange" | "cyan" };
  assignee?: { name: string; initials: string };
  comments?: number;
  priority?: Priority;
}

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanMove {
  ids: string[];
  column: string;
  /** Card to drop next to, or none to append to the column. */
  target?: { id: string; position: "before" | "after" };
}

/** Applies a move to a card list. Use it as-is or as a reference for your store. */
export function moveCards(cards: KanbanCard[], { ids, column, target }: KanbanMove): KanbanCard[] {
  const moving = cards.filter((c) => ids.includes(c.id)).map((c) => ({ ...c, column }));
  const rest = cards.filter((c) => !ids.includes(c.id));
  if (!target) return [...rest, ...moving];
  const at = rest.findIndex((c) => c.id === target.id);
  if (at < 0) return [...rest, ...moving];
  const index = target.position === "before" ? at : at + 1;
  return [...rest.slice(0, index), ...moving, ...rest.slice(index)];
}

const TAG: Record<NonNullable<KanbanCard["tag"]>["tone"], string> = {
  blue: "bg-tag-blue text-tag-blue-fg",
  lime: "bg-tag-lime text-tag-lime-fg",
  purple: "bg-tag-purple text-tag-purple-fg",
  rose: "bg-tag-rose text-tag-rose-fg",
  orange: "bg-tag-orange text-tag-orange-fg",
  cyan: "bg-tag-cyan text-tag-cyan-fg",
};

const PRIORITY: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low priority", className: "bg-chart-neutral" },
  medium: { label: "Medium priority", className: "bg-chart-4" },
  high: { label: "High priority", className: "bg-chart-8" },
  urgent: { label: "Urgent", className: "bg-status-danger-solid" },
};

const DRAG_TYPE = "application/x-ds-kanban-card";

function Column({
  column,
  cards,
  selectedId,
  onMove,
  onOpen,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  selectedId?: string;
  onMove: (move: KanbanMove) => void;
  onOpen?: (id: string) => void;
}) {
  const headingId = useId();
  const readIds = async (items: Parameters<NonNullable<Parameters<typeof useDragAndDrop>[0]["onRootDrop"]>>[0]["items"]) =>
    Promise.all(items.filter(isTextDropItem).map(async (item) => JSON.parse(await item.getText(DRAG_TYPE)) as string));

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({ [DRAG_TYPE]: JSON.stringify(String(key)), "text/plain": cards.find((c) => c.id === key)?.title ?? "" })),
    acceptedDragTypes: [DRAG_TYPE],
    getDropOperation: () => "move",
    onInsert: async (e) => onMove({ ids: await readIds(e.items), column: column.id, target: { id: String(e.target.key), position: e.target.dropPosition === "before" ? "before" : "after" } }),
    onRootDrop: async (e) => onMove({ ids: await readIds(e.items), column: column.id }),
    onReorder: (e) => onMove({ ids: [...e.keys].map(String), column: column.id, target: { id: String(e.target.key), position: e.target.dropPosition === "before" ? "before" : "after" } }),
  });

  return (
    <section aria-labelledby={headingId} className="flex w-72 shrink-0 flex-col gap-2 rounded-2xl bg-sunken p-2">
      <header className="flex items-center justify-between px-2 pt-1">
        <h3 id={headingId} className="text-body-md-strong text-fg">
          {column.title}
        </h3>
        <span className="rounded-full bg-muted px-2 text-caption-strong text-fg-secondary tabular-nums">{cards.length}</span>
      </header>
      <GridList
        aria-labelledby={headingId}
        items={cards}
        dragAndDropHooks={dragAndDropHooks}
        selectionMode="none"
        onAction={(key: Key) => onOpen?.(String(key))}
        renderEmptyState={() => (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-line text-body-sm text-fg-secondary">Drop cards here</div>
        )}
        className={cx(
          "flex min-h-24 flex-col gap-2 rounded-xl p-0.5 outline-none transition-colors",
          "data-[drop-target]:bg-muted",
          focusRing,
        )}
      >
        {(card) => (
          <GridListItem
            id={card.id}
            textValue={card.title}
            className={({ isFocusVisible }) =>
              cx(
                "group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-hairline outline-none transition-[box-shadow,opacity]",
                "data-[hovered]:shadow-raised data-[dragging]:opacity-40",
                selectedId === card.id && "border-accent-500",
                isFocusVisible && focusRingInset,
              )
            }
          >
            <div className="flex items-start gap-2">
              <AriaButton
                slot="drag"
                aria-label={`Move ${card.title}`}
                className={cx("-ms-1 mt-0.5 flex cursor-grab rounded text-icon-secondary opacity-60 group-hover:opacity-100", focusRing)}
              >
                <RiDraggable aria-hidden className="size-4" />
              </AriaButton>
              <span className="flex-1 text-body-md-strong text-fg">{card.title}</span>
              {card.priority && (
                <span title={PRIORITY[card.priority].label} className={cx("mt-1.5 size-2 shrink-0 rounded-full", PRIORITY[card.priority].className)}>
                  <span className="sr-only">{PRIORITY[card.priority].label}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ps-5">
              {card.ref && <span className="font-mono text-caption text-fg-secondary">{card.ref}</span>}
              {card.tag && <span className={cx("rounded-md px-1.5 py-0.5 text-caption-strong", TAG[card.tag.tone])}>{card.tag.label}</span>}
              <span className="ms-auto flex items-center gap-2">
                {!!card.comments && (
                  <span className="flex items-center gap-0.5 text-caption text-fg-secondary tabular-nums">
                    <RiChat3Line aria-hidden className="size-3.5" />
                    {card.comments}
                    <span className="sr-only"> comments</span>
                  </span>
                )}
                {card.assignee && <Avatar size="xs" initials={card.assignee.initials} alt={card.assignee.name} />}
              </span>
            </div>
          </GridListItem>
        )}
      </GridList>
    </section>
  );
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onMove: (move: KanbanMove) => void;
  /** Card activated (click or Enter). */
  onOpen?: (id: string) => void;
  selectedId?: string;
  className?: string;
}

export function KanbanBoard({ columns, cards, onMove, onOpen, selectedId, className }: KanbanBoardProps) {
  return (
    <div className={cx("flex items-start gap-3 overflow-x-auto pb-2", className)}>
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          cards={cards.filter((c) => c.column === column.id)}
          selectedId={selectedId}
          onMove={onMove}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
