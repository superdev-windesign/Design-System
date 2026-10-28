"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { ComposerPanel } from "../blocks/composer/composer-panel";
import type { ComposerModel, ComposerMode } from "../blocks/composer/composer-panel";
import { ChatThread } from "../blocks/chat/chat-thread";
import type { CodeBlock } from "../blocks/chat/chat-message";
import { useChatSession } from "../blocks/chat/chat-session";
import type { ChatMessageData, ChatRespond } from "../blocks/chat/chat-session";
import { cx } from "../utils/cx";

/** A conversation and its composer, used by the chat templates. */
export function ChatPane({
  initialMessages,
  respond,
  onMessagesChange,
  onSession,
  replyAs,
  renderAvatar,
  onOpenCode,
  suggestions,
  emptyTitle = "What are we working on?",
  emptyDescription,
  placeholder,
  modes,
  models,
  footnote,
  className,
}: {
  initialMessages?: ChatMessageData[];
  respond?: ChatRespond;
  onMessagesChange?: (messages: ChatMessageData[]) => void;
  /** Status and continueAs, for hosts that queue follow-up replies. */
  onSession?: (session: { status: string; continueAs: ReturnType<typeof useChatSession>["continueAs"] }) => void;
  /** Who answers the user directly (multi-agent threads). */
  replyAs?: ChatMessageData["author"];
  renderAvatar?: (message: ChatMessageData) => ReactNode;
  onOpenCode?: (block: CodeBlock) => void;
  suggestions?: string[];
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  placeholder?: string;
  modes?: ComposerMode[];
  models?: ComposerModel[];
  footnote?: ReactNode;
  className?: string;
}) {
  const chat = useChatSession({ respond, initialMessages });

  useEffect(() => {
    onMessagesChange?.(chat.messages);
    // Report every change; the parent decides what to keep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages]);

  useEffect(() => {
    onSession?.({ status: chat.status, continueAs: chat.continueAs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.status, chat.continueAs]);

  return (
    <div className={cx("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      <ChatThread
        messages={chat.messages}
        status={chat.status}
        renderAvatar={renderAvatar}
        onOpenCode={onOpenCode}
        empty={{ title: emptyTitle, description: emptyDescription, suggestions, onSuggest: (s) => chat.send(s, replyAs) }}
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5 px-4 pb-4">
        <ComposerPanel
          isBusy={chat.status !== "idle"}
          onStop={chat.stop}
          onSubmit={({ text }) => chat.send(text, replyAs)}
          placeholder={placeholder}
          modes={modes}
          models={models}
        />
        {footnote && <p className="text-center text-caption text-fg-secondary">{footnote}</p>}
      </div>
    </div>
  );
}
