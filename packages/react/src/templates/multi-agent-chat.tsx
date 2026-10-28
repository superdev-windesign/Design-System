"use client";

import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { RiEditLine, RiGroupLine } from "@remixicon/react";
import { Button } from "../components/button/button";
import { AgentAvatar, AgentCreator } from "../blocks/agent-creator/agent-creator";
import type { AgentConfig } from "../blocks/agent-creator/agent-creator";
import { demoRespond } from "../blocks/chat/chat-session";
import type { ChatMessageData, ChatRespond } from "../blocks/chat/chat-session";
import { focusRingNative } from "../recipes/focus-ring";
import { cx } from "../utils/cx";
import { ChatPane } from "./chat-pane";
import { TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Multi-agent Chat: a team of agents, each with its own animated avatar.
 * Talk to one, or to the team at once and they answer in turn. "Edit avatar"
 * opens the agent creator in a dialog and changes show up live in the list
 * and the thread.
 */

interface Agent extends Pick<AgentConfig, "name" | "description" | "color" | "tone" | "voice" | "speed"> {
  id: string;
}

const AGENTS: Agent[] = [
  { id: "scout", name: "Scout", description: "Finds sources and checks facts.", color: 6, tone: "concise", voice: "calm", speed: 1 },
  { id: "quill", name: "Quill", description: "Drafts and edits copy.", color: 5, tone: "friendly", voice: "warm", speed: 1 },
  { id: "bolt", name: "Bolt", description: "Writes and reviews code.", color: 7, tone: "neutral", voice: "bright", speed: 1.25 },
];

const VOICE_LINES: Record<string, string> = {
  scout: "I checked three sources; they agree on the numbers. The most recent one is from last month, so it's current.",
  quill: "Here's a tighter version of that line: **Ship the small thing, then make it better.** Want a few more options?",
  bolt: "I can wire that up. It's two components and a hook; I'll keep the state in the parent so it stays testable.",
};

/** Each agent answers in its own voice; one-to-one threads fall back to the demo replies. */
const teamRespond: ChatRespond = async function* (history, signal, author) {
  const id = AGENTS.find((a) => a.name === author?.name)?.id ?? author?.name.toLowerCase();
  if (!id || !VOICE_LINES[id]) {
    yield* demoRespond(history, signal);
    return;
  }
  await new Promise((r) => setTimeout(r, 500));
  for (const word of VOICE_LINES[id]!.split(/(?<=\s)/)) {
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, 24));
    yield word;
  }
};

/** Team thread: after each user message, the agents take turns. */
function TeamPane({ agents }: { agents: Agent[] }) {
  const [pending, setPending] = useState<Agent[]>([]);
  const [chat, setChat] = useState<{ status: string; continueAs: (a?: ChatMessageData["author"]) => boolean } | null>(null);

  useEffect(() => {
    if (!chat || chat.status !== "idle" || pending.length === 0) return;
    const [next, ...rest] = pending;
    // The status here can be a render behind; only advance the queue if the reply really started.
    if (chat.continueAs({ name: next!.name, color: next!.color })) setPending(rest);
  }, [chat, pending]);

  return (
    <ChatPane
      respond={teamRespond}
      replyAs={agents[0] && { name: agents[0].name, color: agents[0].color }}
      renderAvatar={(m) => <AgentAvatar color={m.author?.color ?? 6} size={28} />}
      onMessagesChange={(messages) => {
        const last = messages[messages.length - 1];
        // The first agent answers directly; a new user message queues the rest.
        if (last?.role === "user") setPending(agents.slice(1));
      }}
      onSession={setChat}
      suggestions={["Plan our launch post", "Review this pricing idea"]}
      emptyTitle="Ask the team"
      emptyDescription={`${agents.map((a) => a.name).join(", ")} will each answer in turn.`}
    />
  );
}

export function MultiAgentChat({ className }: TemplateProps) {
  const [agents, setAgents] = useState(AGENTS);
  const [active, setActive] = useState<string>("team");
  const [editing, setEditing] = useState<Agent | null>(null);
  const agent = agents.find((a) => a.id === active);

  return (
    <TemplateRoot className={className}>
      <aside aria-label="Agents" className="hidden w-64 shrink-0 flex-col gap-1 border-e border-line bg-sunken p-3 @3xl:flex">
        <button
          type="button"
          aria-current={active === "team" ? "page" : undefined}
          onClick={() => setActive("team")}
          className={cx("flex items-center gap-3 rounded-xl p-2 text-start transition-colors", active === "team" ? "bg-muted" : "hover:bg-sunken-hover", focusRingNative)}
        >
          <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-surface text-icon-secondary shadow-hairline">
            <RiGroupLine className="size-4.5" />
          </span>
          <span className="flex flex-col">
            <span className="text-body-md-strong text-fg">Team</span>
            <span className="text-body-sm text-fg-secondary">{agents.length} agents</span>
          </span>
        </button>
        <div className="my-1 h-px bg-line" />
        {agents.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-current={active === a.id ? "page" : undefined}
            onClick={() => setActive(a.id)}
            className={cx("flex items-center gap-3 rounded-xl p-2 text-start transition-colors", active === a.id ? "bg-muted" : "hover:bg-sunken-hover", focusRingNative)}
          >
            <AgentAvatar color={a.color} size={36} />
            <span className="flex min-w-0 flex-col">
              <span className="text-body-md-strong text-fg">{a.name}</span>
              <span className="truncate text-body-sm text-fg-secondary">{a.description}</span>
            </span>
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {agent ? <AgentAvatar color={agent.color} size={28} /> : <RiGroupLine aria-hidden className="size-5 text-icon-secondary" />}
            <h2 className="truncate text-body-md-strong text-fg">{agent ? agent.name : "Team"}</h2>
          </div>
          {agent && (
            <Button size="sm" variant="secondary" leadingIcon={RiEditLine} onPress={() => setEditing(agent)}>
              Edit avatar
            </Button>
          )}
        </header>
        {agent ? (
          <ChatPane
            key={agent.id}
            respond={demoRespond}
            renderAvatar={() => <AgentAvatar color={agent.color} size={28} />}
            suggestions={["What can you do?", "Introduce yourself"]}
            emptyTitle={`Chat with ${agent.name}`}
            emptyDescription={agent.description}
          />
        ) : (
          <TeamPane agents={agents} />
        )}
      </div>

      <ModalOverlay
        isOpen={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        isDismissable
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-scrim p-4 transition-opacity data-[entering]:opacity-0 data-[exiting]:opacity-0"
      >
        <Modal className="w-full max-w-3xl">
          <Dialog aria-label="Edit agent">
            {editing && (
              <AgentCreator
                title={`Edit ${editing.name}`}
                submitLabel="Save changes"
                defaultValue={editing}
                onCreate={(config) => {
                  setAgents((list) => list.map((a) => (a.id === editing.id ? { ...a, ...config } : a)));
                  setEditing(null);
                }}
              />
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </TemplateRoot>
  );
}
