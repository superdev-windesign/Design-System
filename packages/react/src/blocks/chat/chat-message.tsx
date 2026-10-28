"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { RiCheckLine, RiFileCopyLine, RiSideBarLine } from "@remixicon/react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import type { ChatMessageData } from "./chat-session";

/**
 * One chat message. User messages are bubbles on the end side; assistant
 * messages sit full-width with light formatting: paragraphs, "- " lists,
 * **bold**, `inline code` and fenced code blocks with copy (and, when the
 * host passes `onOpenCode`, a button to open the block in a side panel).
 * Formatting is parsed into React elements, never injected as HTML.
 */

export interface CodeBlock {
  language: string;
  code: string;
}

/** Splits text into prose and ``` fenced blocks. */
export function parseBlocks(content: string): ({ kind: "text"; text: string } | ({ kind: "code" } & CodeBlock))[] {
  const parts: ({ kind: "text"; text: string } | ({ kind: "code" } & CodeBlock))[] = [];
  const fence = /```([a-z0-9+-]*)\n([\s\S]*?)(```|$)/gi;
  let last = 0;
  for (const m of content.matchAll(fence)) {
    if (m.index! > last) parts.push({ kind: "text", text: content.slice(last, m.index) });
    parts.push({ kind: "code", language: m[1] || "text", code: m[2]!.replace(/\n$/, "") });
    last = m.index! + m[0].length;
  }
  if (last < content.length) parts.push({ kind: "text", text: content.slice(last) });
  return parts;
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((piece, i) => {
    if (piece.startsWith("`") && piece.endsWith("`") && piece.length > 2)
      return (
        <code key={i} className="rounded-md bg-muted px-1 py-0.5 font-mono text-body-sm text-fg">
          {piece.slice(1, -1)}
        </code>
      );
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={i} className="text-body-md-strong text-fg">{piece.slice(2, -2)}</strong>;
    return piece;
  });
}

function Prose({ text }: { text: string }) {
  return (
    <>
      {text
        .trim()
        .split(/\n{2,}/)
        .map((block, i) => {
          const lines = block.split("\n");
          if (lines.every((l) => /^\s*[-*] /.test(l))) {
            return (
              <ul key={i} className="flex list-disc flex-col gap-1 ps-5 marker:text-fg-secondary">
                {lines.map((l, j) => (
                  <li key={j}>{inline(l.replace(/^\s*[-*] /, ""))}</li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{inline(block)}</p>;
        })}
    </>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className={cx("flex size-7 items-center justify-center rounded-lg text-icon-secondary transition-colors hover:bg-surface-hover hover:text-fg", focusRingNative)}
    >
      {copied ? <RiCheckLine aria-hidden className="size-4" /> : <RiFileCopyLine aria-hidden className="size-4" />}
    </button>
  );
}

function CodeFence({ block, onOpen }: { block: CodeBlock; onOpen?: (block: CodeBlock) => void }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-sunken">
      <figcaption className="flex items-center justify-between gap-2 border-b border-line py-1 ps-3 pe-1">
        <span className="font-mono text-caption text-fg-secondary">{block.language}</span>
        <span className="flex items-center">
          {onOpen && (
            <button
              type="button"
              aria-label="Open in panel"
              onClick={() => onOpen({ language: block.language, code: block.code })}
              className={cx("flex size-7 items-center justify-center rounded-lg text-icon-secondary transition-colors hover:bg-surface-hover hover:text-fg", focusRingNative)}
            >
              <RiSideBarLine aria-hidden className="size-4 rtl:-scale-x-100" />
            </button>
          )}
          <CopyButton text={block.code} label="Copy code" />
        </span>
      </figcaption>
      <pre className="overflow-x-auto p-3 font-mono text-body-sm text-fg">
        <code>{block.code}</code>
      </pre>
    </figure>
  );
}

export interface ChatMessageProps {
  message: ChatMessageData;
  /** Shown beside assistant messages. */
  avatar?: ReactNode;
  /** Show copy under the message (assistant only). */
  showActions?: boolean;
  onOpenCode?: (block: CodeBlock) => void;
  /** A cursor at the end while the reply streams. */
  isStreaming?: boolean;
  className?: string;
}

export function ChatMessage({ message, avatar, showActions = false, onOpenCode, isStreaming = false, className }: ChatMessageProps) {
  if (message.role === "user") {
    return (
      <div className={cx("flex justify-end", className)}>
        <p className="max-w-[min(80%,36rem)] rounded-2xl rounded-ee-md bg-muted px-3.5 py-2 text-body-md whitespace-pre-wrap text-fg">{message.content}</p>
      </div>
    );
  }

  return (
    <div className={cx("group flex gap-3", className)}>
      {avatar && <div className="shrink-0 pt-0.5">{avatar}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {message.author && <span className="text-body-sm-strong text-fg-secondary">{message.author.name}</span>}
        <div className="flex flex-col gap-3 text-body-md text-fg">
          {parseBlocks(message.content).map((part, i) =>
            part.kind === "code" ? <CodeFence key={i} block={part} onOpen={onOpenCode} /> : <Prose key={i} text={part.text} />,
          )}
          {isStreaming && <span aria-hidden className="-mt-2 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-fg-secondary motion-reduce:animate-none" />}
        </div>
        {showActions && !isStreaming && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <CopyButton text={message.content} label="Copy reply" />
          </div>
        )}
      </div>
    </div>
  );
}
