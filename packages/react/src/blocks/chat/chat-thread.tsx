"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AgentThinking } from "../agent-thinking/agent-thinking";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { ChatMessage } from "./chat-message";
import type { ChatCodeBlock } from "./chat-message";
import type { ChatMessageData, ChatStatus } from "./chat-session";

/**
 * The scrolling list of a conversation. Follows new content while you're at
 * the bottom and leaves you alone if you've scrolled up to read. Shows a
 * thinking indicator before the first words arrive, and an empty state with
 * suggestions before the first message.
 */

export interface ChatThreadProps {
  messages: ChatMessageData[];
  status?: ChatStatus;
  /** Avatar for assistant messages; receives the message for multi-agent threads. */
  renderAvatar?: (message: ChatMessageData) => ReactNode;
  onOpenCode?: (block: ChatCodeBlock) => void;
  empty?: { title: ReactNode; description?: ReactNode; suggestions?: string[]; onSuggest?: (text: string) => void };
  /** Label for the thinking indicator. */
  thinkingLabel?: string;
  className?: string;
}

export function ChatThread({ messages, status = "idle", renderAvatar, onOpenCode, empty, thinkingLabel = "Thinking", className }: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div
      ref={scroller}
      onScroll={(event) => {
        const el = event.currentTarget;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      }}
      className={cx("min-h-0 flex-1 overflow-y-auto", className)}
    >
      {messages.length === 0 && empty ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-10 text-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-title-sm-emphasis text-fg">{empty.title}</h3>
            {empty.description && <p className="text-body-md text-fg-secondary">{empty.description}</p>}
          </div>
          {empty.suggestions && (
            <ul className="flex max-w-xl flex-wrap justify-center gap-2">
              {empty.suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => empty.onSuggest?.(s)}
                    className={cx("rounded-full border border-line bg-surface px-3 py-1.5 text-body-sm text-fg transition-colors hover:bg-surface-hover", focusRingNative)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ol aria-label="Conversation" className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
          {messages.map((message) => (
            <li key={message.id}>
              <ChatMessage
                message={message}
                avatar={message.role === "assistant" ? renderAvatar?.(message) : undefined}
                onOpenCode={onOpenCode}
                isStreaming={status === "streaming" && message.id === lastAssistant}
                showActions={message.id === lastAssistant}
              />
            </li>
          ))}
          {status === "thinking" && (
            <li className="ps-1" aria-live="polite">
              <AgentThinking variant="wave" label={thinkingLabel} showTimer={false} />
            </li>
          )}
        </ol>
      )}
    </div>
  );
}
