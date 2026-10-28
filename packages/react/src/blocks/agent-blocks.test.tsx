import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { AgentCreator } from "./agent-creator/agent-creator";
import { AgentLimits } from "./agent-limits/agent-limits";
import { ComposerAttachments } from "./composer/composer-attachments";
import { ComposerPanel } from "./composer/composer-panel";
import { MonthCalendar } from "./month-calendar/month-calendar";
import { Questionnaire } from "./questionnaire/questionnaire";
import { TaskList } from "./task-list/task-list";
import { WebSearch } from "./web-search/web-search";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("ComposerPanel", () => {
  it("sends the trimmed message with the chosen mode and model on Enter, then clears", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ComposerPanel onSubmit={onSubmit} />);
    const field = screen.getByRole("textbox", { name: "Message" });

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    await user.type(field, "  Draft the release notes  {Enter}");
    expect(onSubmit).toHaveBeenCalledWith({ text: "Draft the release notes", mode: "ask", model: "balanced" });
    expect(field).toHaveValue("");
  });

  it("adds a line on Shift+Enter instead of sending", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ComposerPanel onSubmit={onSubmit} />);
    await user.type(screen.getByRole("textbox", { name: "Message" }), "one{Shift>}{Enter}{/Shift}two");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("one\ntwo");
  });

  it("swaps send for stop while busy", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(<ComposerPanel isBusy onStop={onStop} />);
    expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledOnce();
  });
});

describe("ComposerAttachments", () => {
  it("lists files with upload progress and remove buttons", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ComposerAttachments
        items={[
          { id: "a", name: "notes.pdf", size: 2048 },
          { id: "b", name: "chart.png", size: 4096, progress: 0.4 },
        ]}
        onRemove={onRemove}
      />,
    );
    expect(screen.getByRole("list", { name: "Attachments" }).children).toHaveLength(2);
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Uploading chart.png" })).toHaveAttribute("aria-valuenow", "40");
    await user.click(screen.getByRole("button", { name: "Remove notes.pdf" }));
    expect(onRemove).toHaveBeenCalledWith("a");
  });
});

describe("WebSearch", () => {
  const steps = [{ query: "container queries", sources: [{ title: "MDN guide", url: "https://developer.mozilla.org/x" }] }];

  it("summarises the searches and links each source by domain and title", () => {
    render(<WebSearch steps={steps} />);
    expect(screen.getByRole("button", { name: /Searched the web/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("1 search · 1 source")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MDN guide (developer.mozilla.org)" })).toHaveAttribute("target", "_blank");
  });

  it("collapses the trail", async () => {
    const user = userEvent.setup();
    render(<WebSearch steps={steps} />);
    await user.click(screen.getByRole("button", { name: /Searched the web/ }));
    await waitFor(() => expect(screen.queryByRole("link")).not.toBeInTheDocument());
  });

  it("says it's still searching", () => {
    render(<WebSearch steps={steps} status="searching" />);
    expect(screen.getByRole("button", { name: /Searching the web/ })).toBeInTheDocument();
    expect(screen.getByText("Reading…")).toBeInTheDocument();
  });
});

describe("TaskList", () => {
  it("counts finished steps and names the one in progress", () => {
    render(
      <TaskList
        tasks={[
          { id: "1", label: "Read the issue", status: "done" },
          { id: "2", label: "Run the tests", status: "running" },
          { id: "3", label: "Write notes", status: "pending" },
        ]}
      />,
    );
    expect(screen.getByText(/1 of 3 done/)).toHaveTextContent("1 of 3 done. Now: Run the tests");
    expect(screen.getByText("Run the tests")).toHaveTextContent("Run the tests, In progress");
  });

  it("reports a failure", () => {
    render(<TaskList tasks={[{ id: "1", label: "Deploy", status: "failed", detail: "Timed out" }]} />);
    expect(screen.getByText("Stopped on an error")).toBeInTheDocument();
    expect(screen.getByText("Timed out")).toBeInTheDocument();
  });
});

describe("AgentLimits", () => {
  const parts = [
    { label: "Conversation", value: 50_000 },
    { label: "Files", value: 20_000 },
  ];

  it("exposes the context window and quotas as meters", () => {
    render(<AgentLimits context={{ parts, limit: 200_000 }} quotas={[{ label: "Messages today", used: 10, limit: 100 }]} />);
    expect(screen.getByRole("meter", { name: "Context window" })).toHaveAttribute("aria-valuenow", "70000");
    expect(screen.getByRole("meter", { name: "Messages today" })).toHaveAttribute("aria-valuenow", "10");
    expect(screen.queryByText(/nearly full/)).not.toBeInTheDocument();
  });

  it("warns and offers the action once the context passes the threshold", () => {
    render(
      <AgentLimits
        context={{ parts: [{ label: "Conversation", value: 170_000 }], limit: 200_000 }}
        contextAction={<button type="button">Compact</button>}
      />,
    );
    expect(screen.getByText(/nearly full/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compact" })).toBeInTheDocument();
  });
});

describe("Questionnaire", () => {
  const questions = [
    { id: "scope", prompt: "What should it cover?", options: [{ id: "a", label: "Settings" }, { id: "b", label: "Dashboard" }] },
    { id: "when", prompt: "Deadline?", optional: true, options: [{ id: "week", label: "This week" }] },
  ];

  it("walks through the questions, reviews, and sends the answers", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Questionnaire questions={questions} onComplete={onComplete} />);

    const next = screen.getByRole("button", { name: "Next" });
    expect(next).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: /Dashboard/ }));
    await user.click(next);

    // Optional question: skip it.
    await user.click(await screen.findByRole("button", { name: "Skip" }));
    expect(await screen.findByText("Look right?")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Skipped")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Send answers" }));
    expect(onComplete).toHaveBeenCalledWith({ scope: { selected: ["b"] } });
    expect(await screen.findByText("Thanks, that's everything.")).toBeInTheDocument();
  });
});

describe("AgentCreator", () => {
  it("creates the agent with what was entered", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<AgentCreator onCreate={onCreate} />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Scout");
    await user.click(screen.getByRole("radio", { name: "Purple" }));
    await user.click(screen.getByRole("button", { name: "Create agent" }));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: "Scout", color: 5, tone: "friendly", voice: "calm" }));
    expect(within(screen.getByRole("complementary", { name: "Preview" })).getByText("Scout")).toBeInTheDocument();
  });
});

describe("MonthCalendar", () => {
  const events = [
    { id: "1", title: "Design review", date: "2026-10-05", time: "10:00" },
    { id: "2", title: "Launch", date: "2026-10-14", category: "deadline" as const },
  ];

  it("shows the selected day's agenda and switches days", async () => {
    const user = userEvent.setup();
    render(<MonthCalendar events={events} defaultDate="2026-10-05" />);
    expect(screen.getByRole("heading", { name: "Monday, October 5" })).toBeInTheDocument();
    expect(screen.getAllByText("Design review").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /October 14, 2026/ }));
    expect(screen.getByRole("heading", { name: "Wednesday, October 14" })).toBeInTheDocument();
    expect(screen.getByText("All day")).toBeInTheDocument();
  });
});
