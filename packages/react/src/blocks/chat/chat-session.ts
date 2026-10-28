"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Chat state without a model attached. `respond` receives the history and an
 * AbortSignal and yields text chunks; wire it to any model API (fetch a
 * streaming endpoint and yield its deltas) or use `demoRespond` for a canned
 * reply that streams word by word.
 */

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** For multi-agent threads: who wrote it. */
  author?: { name: string; color?: number };
}

/** Yields reply text in chunks. `author` is set when a specific agent is answering (multi-agent threads). */
export type ChatRespond = (history: ChatMessageData[], signal: AbortSignal, author?: ChatMessageData["author"]) => AsyncIterable<string>;

export type ChatStatus = "idle" | "thinking" | "streaming";

let counter = 0;
const nextId = () => `msg-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

const DEMO_ANSWERS: { match: RegExp; reply: string }[] = [
  {
    match: /code|component|react|button|function/i,
    reply:
      "Here's a small component that uses the system's Button and reads its label from props:\n\n```tsx\nimport { Button } from \"@ds/react\";\n\nexport function SaveBar({ onSave }: { onSave: () => void }) {\n  return (\n    <div className=\"flex justify-end gap-2\">\n      <Button variant=\"secondary\">Cancel</Button>\n      <Button onPress={onSave}>Save changes</Button>\n    </div>\n  );\n}\n```\n\nThe secondary button comes first so the primary action sits at the end of the row.",
  },
  {
    match: /plan|steps|launch|roadmap/i,
    reply:
      "A simple plan, in order:\n\n- **Scope it.** Write down what's in and what's out.\n- **Ship a thin slice.** One flow end to end, behind a flag.\n- **Measure.** Pick one number that tells you it worked.\n- **Widen.** Roll out to everyone once the number moves.\n\nWant me to turn this into tasks?",
  },
  {
    match: /token|color|colour|theme|dark/i,
    reply:
      "Use the semantic utilities rather than raw colours: `bg-surface` for cards, `text-fg-secondary` for supporting text, `border-line` for dividers. The light and dark themes remap the same names, so a component never needs a `dark:` variant.",
  },
];

const FALLBACK =
  "This is a demo reply, streamed a word at a time so the thread behaves like a real model. Connect `respond` to your model's streaming API to get real answers; everything else (stop, history, the thinking state) already works.";

/** A canned reply chosen by keyword, after a short think, one word at a time. */
export async function* demoRespond(history: ChatMessageData[], signal: AbortSignal): AsyncIterable<string> {
  const last = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const reply = DEMO_ANSWERS.find((a) => a.match.test(last))?.reply ?? FALLBACK;
  await sleep(650, signal);
  for (const word of reply.split(/(?<=\s)/)) {
    await sleep(22, signal);
    yield word;
  }
}

export interface ChatSessionOptions {
  respond?: ChatRespond;
  initialMessages?: ChatMessageData[];
}

export function useChatSession({ respond = demoRespond, initialMessages = [] }: ChatSessionOptions = {}) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const controller = useRef<AbortController | null>(null);
  // The latest messages, so send() can build history without a side effect inside a state updater.
  const latest = useRef(messages);
  latest.current = messages;

  const run = useCallback(
    async (history: ChatMessageData[], author?: ChatMessageData["author"]) => {
      const abort = new AbortController();
      controller.current = abort;
      setStatus("thinking");
      const id = nextId();
      let started = false;
      try {
        for await (const chunk of respond(history, abort.signal, author)) {
          if (!started) {
            started = true;
            setStatus("streaming");
            setMessages((list) => (latest.current = [...list, { id, role: "assistant", content: chunk, author }]));
          } else {
            setMessages((list) => (latest.current = list.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m))));
          }
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
      } finally {
        if (controller.current === abort) controller.current = null;
        setStatus("idle");
      }
    },
    [respond],
  );

  const send = useCallback(
    (text: string, author?: ChatMessageData["author"]) => {
      const content = text.trim();
      if (!content || controller.current) return;
      const history = [...latest.current, { id: nextId(), role: "user" as const, content }];
      latest.current = history;
      setMessages(history);
      void run(history, author);
    },
    [run],
  );

  /**
   * Another reply with no new user message, e.g. the next agent in a group
   * thread. Returns false (and does nothing) while a reply is still running.
   */
  const continueAs = useCallback(
    (author?: ChatMessageData["author"]) => {
      if (controller.current) return false;
      void run(latest.current, author);
      return true;
    },
    [run],
  );

  const stop = useCallback(() => controller.current?.abort(), []);
  const reset = useCallback(() => {
    controller.current?.abort();
    setMessages([]);
  }, []);

  return { messages, status, send, continueAs, stop, reset, setMessages };
}
