"use client";

import { useState } from "react";
import { TextArea, TextField } from "react-aria-components";
import { RiAddLine } from "@remixicon/react";
import { Avatar } from "../components/avatar/avatar";
import { Button } from "../components/button/button";
import { CloseButton } from "../components/buttons/close-button";
import { Select, SelectItem } from "../components/select/select";
import { Sparkline } from "../components/stat-card/stat-card";
import { KanbanBoard, moveCards } from "../blocks/kanban/kanban-board";
import type { KanbanCard, KanbanColumn } from "../blocks/kanban/kanban-board";
import { focusRing } from "../recipes/focus-ring";
import { cx } from "../utils/cx";
import { PEOPLE, TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Project Board: a sprint as a kanban board. Drag cards between columns (or
 * move them from the ticket panel); open a card for its details, the tokens
 * agents have spent on it, and comments.
 */

const COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

const CARDS: KanbanCard[] = [
  { id: "WIN-118", ref: "WIN-118", column: "backlog", title: "Audit icon sizes in tables", tag: { label: "Design", tone: "purple" }, priority: "low" },
  { id: "WIN-121", ref: "WIN-121", column: "backlog", title: "Dark mode for charts export", tag: { label: "Charts", tone: "cyan" }, priority: "medium" },
  { id: "WIN-124", ref: "WIN-124", column: "todo", title: "Keyboard reorder in data grid", tag: { label: "A11y", tone: "lime" }, assignee: PEOPLE.sam, comments: 2, priority: "high" },
  { id: "WIN-127", ref: "WIN-127", column: "todo", title: "Toast timing in reduced motion", tag: { label: "Motion", tone: "orange" }, assignee: PEOPLE.priya, priority: "medium" },
  { id: "WIN-130", ref: "WIN-130", column: "doing", title: "Token sync from design files", tag: { label: "Tokens", tone: "blue" }, assignee: PEOPLE.alex, comments: 5, priority: "urgent" },
  { id: "WIN-132", ref: "WIN-132", column: "doing", title: "Calendar week view", tag: { label: "Blocks", tone: "purple" }, assignee: PEOPLE.mia, comments: 1, priority: "medium" },
  { id: "WIN-135", ref: "WIN-135", column: "review", title: "Command palette empty state", tag: { label: "Pro", tone: "rose" }, assignee: PEOPLE.jordan, comments: 3, priority: "low" },
  { id: "WIN-112", ref: "WIN-112", column: "done", title: "Contrast test for tag pills", tag: { label: "A11y", tone: "lime" }, assignee: PEOPLE.priya, comments: 4, priority: "high" },
];

const DETAILS: Record<string, string> = {
  "WIN-130": "Pull colour and type tokens from the design source on merge, open a pull request with the diff, and fail CI when a semantic token has no dark value.",
};

const TOKENS = (id: string) => Array.from({ length: 10 }, (_, i) => Math.round(1200 + Math.sin(i + id.length) * 600 + i * 140));

interface Comment {
  id: number;
  author: { name: string; initials: string };
  text: string;
  when: string;
}

export function ProjectBoard({ className }: TemplateProps) {
  const [cards, setCards] = useState(CARDS);
  const [open, setOpen] = useState<string | undefined>("WIN-130");
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    "WIN-130": [
      { id: 1, author: PEOPLE.sam, text: "The design file export has a rate limit; batch the requests.", when: "2h" },
      { id: 2, author: PEOPLE.alex, text: "Batched. First PR is up for review.", when: "40m" },
    ],
  });
  const [draft, setDraft] = useState("");
  const card = cards.find((c) => c.id === open);
  const thread = (card && comments[card.id]) ?? [];

  return (
    <TemplateRoot className={cx("flex-col", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 @3xl:px-6">
        <div className="flex flex-col">
          <h2 className="text-title-md-strong text-fg">Sprint 14</h2>
          <p className="text-body-sm text-fg-secondary">Design system · ends Nov 7</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {Object.values(PEOPLE).map((p) => (
              <Avatar key={p.name} size="sm" initials={p.initials} alt={p.name} className="ring-2 ring-canvas" />
            ))}
          </div>
          <Button size="sm" leadingIcon={RiAddLine}>
            New ticket
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <KanbanBoard
          columns={COLUMNS}
          cards={cards}
          onMove={(move) => setCards((list) => moveCards(list, move))}
          onOpen={setOpen}
          selectedId={open}
          className="min-w-0 flex-1 p-4 @3xl:px-6"
        />

        {card && (
          <aside
            aria-label={`${card.ref}: ${card.title}`}
            className="absolute inset-y-0 end-0 z-10 flex w-88 max-w-full flex-col border-s border-line bg-surface shadow-overlay @6xl:static @6xl:shadow-none"
          >
            <div className="flex items-start gap-2 border-b border-line p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-mono text-caption text-fg-secondary">{card.ref}</span>
                <h3 className="text-headline-emphasis text-fg">{card.title}</h3>
              </div>
              <CloseButton size="sm" aria-label="Close ticket" onClick={() => setOpen(undefined)} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
              <dl className="grid grid-cols-[6rem_1fr] items-center gap-x-3 gap-y-3 text-body-sm">
                <dt className="text-fg-secondary">Status</dt>
                <dd>
                  <Select
                    aria-label="Status"
                    size="sm"
                    selectedKey={card.column}
                    onSelectionChange={(key) => key !== null && setCards((list) => moveCards(list, { ids: [card.id], column: String(key) }))}
                  >
                    {COLUMNS.map((c) => (
                      <SelectItem key={c.id} id={c.id} textValue={c.title}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </Select>
                </dd>
                <dt className="text-fg-secondary">Assignee</dt>
                <dd className="flex items-center gap-2 text-fg">
                  {card.assignee ? (
                    <>
                      <Avatar size="xs" initials={card.assignee.initials} alt="" /> {card.assignee.name}
                    </>
                  ) : (
                    <span className="text-fg-secondary">Unassigned</span>
                  )}
                </dd>
                <dt className="text-fg-secondary">Label</dt>
                <dd className="text-fg">{card.tag?.label ?? "None"}</dd>
              </dl>

              <p className="text-body-md text-fg">{DETAILS[card.id] ?? "No description yet."}</p>

              <section aria-labelledby="pb-tokens" className="flex flex-col gap-2 rounded-xl bg-sunken p-3">
                <div className="flex items-baseline justify-between">
                  <h4 id="pb-tokens" className="text-body-sm-strong text-fg-secondary">
                    Agent tokens
                  </h4>
                  <span className="text-body-sm-strong text-fg tabular-nums">{(TOKENS(card.id).reduce((a, b) => a + b, 0) / 1000).toFixed(1)}k</span>
                </div>
                <Sparkline data={TOKENS(card.id)} aria-label="Tokens spent per day, last 10 days" />
              </section>

              <section aria-labelledby="pb-comments" className="flex flex-col gap-3">
                <h4 id="pb-comments" className="text-body-md-strong text-fg">
                  Comments <span className="text-body-sm text-fg-secondary tabular-nums">{thread.length}</span>
                </h4>
                <ol className="flex flex-col gap-3">
                  {thread.map((c) => (
                    <li key={c.id} className="flex gap-2.5">
                      <Avatar size="sm" initials={c.author.initials} alt="" />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-body-sm-strong text-fg">
                          {c.author.name} <span className="text-body-sm text-fg-secondary">{c.when}</span>
                        </span>
                        <p className="text-body-sm text-fg">{c.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!draft.trim()) return;
                    setComments((all) => ({ ...all, [card.id]: [...(all[card.id] ?? []), { id: Date.now(), author: PEOPLE.alex, text: draft.trim(), when: "now" }] }));
                    setDraft("");
                  }}
                >
                  <TextField aria-label="Add a comment" value={draft} onChange={setDraft}>
                    <TextArea
                      rows={2}
                      placeholder="Add a comment…"
                      className={cx("w-full resize-none rounded-xl border border-line-control bg-surface px-3 py-2 text-body-sm text-fg placeholder:text-fg-placeholder", focusRing)}
                    />
                  </TextField>
                  <Button type="submit" size="sm" variant="secondary" isDisabled={!draft.trim()} className="self-end">
                    Comment
                  </Button>
                </form>
              </section>
            </div>
          </aside>
        )}
      </div>
    </TemplateRoot>
  );
}
