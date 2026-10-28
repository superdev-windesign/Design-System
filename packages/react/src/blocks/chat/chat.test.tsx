import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { CodePanel } from "../code-panel/code-panel";
import { GeneratedImage, promptArt } from "../image-generation/generated-image";
import { KanbanBoard, moveCards } from "../kanban/kanban-board";
import type { KanbanCard } from "../kanban/kanban-board";
import { ChatMessage, parseBlocks } from "./chat-message";
import { useChatSession } from "./chat-session";
import type { ChatRespond } from "./chat-session";
import { ChatThread } from "./chat-thread";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

/** A responder that yields the given chunks, then waits until released. */
function scripted(chunks: string[]) {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const respond: ChatRespond = async function* (_history, signal) {
    for (const c of chunks) yield c;
    await Promise.race([gate, new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))))]);
  };
  return { respond, release: () => release() };
}

describe("useChatSession", () => {
  it("adds the user message, streams the reply, and returns to idle", async () => {
    const { respond, release } = scripted(["Hello", " there"]);
    const { result } = renderHook(() => useChatSession({ respond }));

    act(() => result.current.send("  Hi  "));
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "Hi" });
    await waitFor(() => expect(result.current.messages[1]?.content).toBe("Hello there"));
    expect(result.current.status).toBe("streaming");

    // Busy: a follow-up can't start yet.
    let started = true;
    act(() => {
      started = result.current.continueAs({ name: "Bolt" });
    });
    expect(started).toBe(false);

    await act(async () => release());
    await waitFor(() => expect(result.current.status).toBe("idle"));
  });

  it("stops a reply mid-stream and keeps what arrived", async () => {
    const { respond } = scripted(["Partial"]);
    const { result } = renderHook(() => useChatSession({ respond }));
    act(() => result.current.send("Go"));
    await waitFor(() => expect(result.current.messages[1]?.content).toBe("Partial"));
    act(() => result.current.stop());
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages).toHaveLength(2);
  });

  it("ignores empty messages", () => {
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.send("   "));
    expect(result.current.messages).toHaveLength(0);
  });
});

describe("ChatMessage", () => {
  it("splits prose and fenced code", () => {
    expect(parseBlocks("Intro\n\n```ts\nconst a = 1;\n```\nOutro")).toEqual([
      { kind: "text", text: "Intro\n\n" },
      { kind: "code", language: "ts", code: "const a = 1;" },
      { kind: "text", text: "\nOutro" },
    ]);
  });

  it("renders lists, bold and inline code as elements, not HTML", () => {
    render(<ChatMessage message={{ id: "1", role: "assistant", content: "- **Scope** it\n- Use `bg-surface`\n\n<b>not bold</b>" }} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Scope").tagName).toBe("STRONG");
    expect(screen.getByText("bg-surface").tagName).toBe("CODE");
    expect(screen.getByText("<b>not bold</b>")).toBeInTheDocument();
  });

  it("offers to open code blocks in a panel", async () => {
    const user = userEvent.setup();
    const onOpenCode = vi.fn();
    render(<ChatMessage message={{ id: "1", role: "assistant", content: "```tsx\nexport const x = 1;\n```" }} onOpenCode={onOpenCode} />);
    await user.click(screen.getByRole("button", { name: "Open in panel" }));
    expect(onOpenCode).toHaveBeenCalledWith({ language: "tsx", code: "export const x = 1;" });
  });
});

describe("ChatThread", () => {
  it("shows suggestions before the first message", async () => {
    const user = userEvent.setup();
    const onSuggest = vi.fn();
    render(<ChatThread messages={[]} empty={{ title: "Ask anything", suggestions: ["Plan a launch"], onSuggest }} />);
    await user.click(screen.getByRole("button", { name: "Plan a launch" }));
    expect(onSuggest).toHaveBeenCalledWith("Plan a launch");
  });

  it("shows the thinking indicator while waiting for the first words", () => {
    render(<ChatThread messages={[{ id: "1", role: "user", content: "Hi" }]} status="thinking" thinkingLabel="Thinking" />);
    expect(screen.getByRole("list", { name: "Conversation" })).toHaveTextContent("Thinking");
  });
});

describe("moveCards", () => {
  const cards: KanbanCard[] = [
    { id: "a", column: "todo", title: "A" },
    { id: "b", column: "todo", title: "B" },
    { id: "c", column: "done", title: "C" },
  ];

  it("moves cards to another column, before a target", () => {
    const next = moveCards(cards, { ids: ["a"], column: "done", target: { id: "c", position: "before" } });
    expect(next.map((c) => `${c.id}:${c.column}`)).toEqual(["b:todo", "a:done", "c:done"]);
  });

  it("appends when there's no target", () => {
    expect(moveCards(cards, { ids: ["c"], column: "todo" }).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });
});

describe("KanbanBoard", () => {
  it("renders a labelled list per column with its cards", () => {
    render(
      <KanbanBoard
        columns={[
          { id: "todo", title: "To do" },
          { id: "done", title: "Done" },
        ]}
        cards={[{ id: "a", column: "todo", title: "Write tests", comments: 2 }]}
        onMove={() => {}}
      />,
    );
    expect(screen.getByRole("grid", { name: "To do" })).toHaveTextContent("Write tests");
    expect(screen.getByRole("grid", { name: "Done" })).toHaveTextContent("Drop cards here");
    expect(screen.getByRole("button", { name: "Move Write tests" })).toBeInTheDocument();
  });
});

describe("CodePanel", () => {
  it("switches files with tabs and numbers lines", async () => {
    const user = userEvent.setup();
    render(
      <CodePanel
        files={[
          { name: "a.ts", code: "const a = 1;\nconst b = 2;" },
          { name: "b.css", code: ".x { color: red; }" },
        ]}
      />,
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("const b = 2;");
    await user.click(screen.getByRole("tab", { name: "b.css" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent(".x { color: red; }");
  });
});

describe("GeneratedImage", () => {
  it("turns the same prompt into the same art, and different prompts into different art", () => {
    expect(promptArt("a red fox")).toBe(promptArt("a red fox"));
    expect(promptArt("a red fox")).not.toBe(promptArt("a blue whale"));
  });

  it("announces progress while generating", () => {
    render(<GeneratedImage prompt="koi pond" progress={0.4} />);
    expect(screen.getByText("Generating 40%")).toBeInTheDocument();
    expect(screen.getByText("Generating: koi pond")).toBeInTheDocument();
  });
});
