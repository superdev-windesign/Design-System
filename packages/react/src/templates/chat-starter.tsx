"use client";

import { useState } from "react";
import { RiChatNewLine, RiMenuLine, RiSparkling2Fill } from "@remixicon/react";
import { Button } from "../components/button/button";
import { IconButton } from "../components/buttons/icon-button";
import type { ChatMessageData, ChatRespond } from "../blocks/chat/chat-session";
import { focusRingNative } from "../recipes/focus-ring";
import { cx } from "../utils/cx";
import { ChatPane } from "./chat-pane";
import { TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Chat Starter: a complete chat app to put your own model behind. Threads
 * down the side, the conversation and composer in the middle. Pass
 * `respond` to connect a model (stream its text deltas from your API);
 * without it, a demo responder streams canned replies so the whole flow
 * (thinking, streaming, stop, new chat) works out of the box.
 *
 *   <ChatStarter respond={async function* (history, signal) {
 *     const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify(history), signal });
 *     const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
 *     for (;;) { const { value, done } = await reader.read(); if (done) return; yield value; }
 *   }} />
 */

interface Thread {
  id: string;
  title: string;
  messages: ChatMessageData[];
}

const titleOf = (messages: ChatMessageData[]) => {
  const first = messages.find((m) => m.role === "user")?.content ?? "New chat";
  return first.length > 40 ? `${first.slice(0, 40)}…` : first;
};

export function AssistantMark() {
  return (
    <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-action-primary text-on-action">
      <RiSparkling2Fill className="size-4" />
    </span>
  );
}

export interface ChatStarterProps extends TemplateProps {
  respond?: ChatRespond;
  /** Product name in the sidebar. */
  name?: string;
}

export function ChatStarter({ respond, name = "Assistant", className }: ChatStarterProps) {
  const [threads, setThreads] = useState<Thread[]>([{ id: "t-1", title: "New chat", messages: [] }]);
  const [active, setActive] = useState("t-1");
  const [railOpen, setRailOpen] = useState(false);
  const current = threads.find((t) => t.id === active) ?? threads[0]!;

  const newChat = () => {
    const id = `t-${Date.now()}`;
    setThreads((list) => [{ id, title: "New chat", messages: [] }, ...list]);
    setActive(id);
    setRailOpen(false);
  };

  return (
    <TemplateRoot className={cx("relative", className)}>
      <aside
        aria-label="Chats"
        className={cx(
          "absolute inset-y-0 start-0 z-20 flex w-64 shrink-0 flex-col gap-3 border-e border-line bg-sunken p-3 @3xl:static",
          railOpen ? "flex shadow-overlay" : "hidden @3xl:flex",
        )}
      >
        <div className="flex items-center gap-2 px-1">
          <AssistantMark />
          <span className="text-headline-emphasis text-fg">{name}</span>
        </div>
        <Button variant="secondary" size="sm" leadingIcon={RiChatNewLine} onPress={newChat}>
          New chat
        </Button>
        <nav aria-label="Recent chats" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-current={t.id === active ? "page" : undefined}
              onClick={() => {
                setActive(t.id);
                setRailOpen(false);
              }}
              className={cx(
                "truncate rounded-lg px-2.5 py-2 text-start text-body-sm transition-colors",
                t.id === active ? "bg-muted text-fg" : "text-fg-secondary hover:bg-sunken-hover hover:text-fg",
                focusRingNative,
              )}
            >
              {t.title}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line px-3 py-2 @3xl:hidden">
          <IconButton icon={RiMenuLine} size="small" aria-label="Show chats" onClick={() => setRailOpen((o) => !o)} />
          <span className="truncate text-body-md-strong text-fg">{current.title}</span>
        </header>
        <ChatPane
          key={current.id}
          initialMessages={current.messages}
          respond={respond}
          renderAvatar={() => <AssistantMark />}
          onMessagesChange={(messages) =>
            setThreads((list) => list.map((t) => (t.id === current.id ? { ...t, messages, title: messages.length ? titleOf(messages) : t.title } : t)))
          }
          suggestions={["Write a launch plan", "Explain design tokens", "Build a React component"]}
          footnote={respond ? undefined : "Demo replies. Pass respond to connect a model."}
        />
      </div>
    </TemplateRoot>
  );
}
