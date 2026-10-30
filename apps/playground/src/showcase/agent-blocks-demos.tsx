import { useEffect, useRef, useState } from "react";
import { RiAddLine, RiRestartLine } from "@remixicon/react";
import {
  AgentCreator,
  AgentProgress,
  AgentLimits,
  Button,
  ComposerAttachments,
  ComposerPanel,
  MonthCalendar,
  Questionnaire,
  TaskList,
  WebSearch,
  attachmentKind,
  toast,
} from "@ds/react";
import type { ComposerAttachment, Question, ResearchStep, TaskItem } from "@ds/react";
import { Fit } from "./blocks-demos";

/** Runs `steps` one after another with `delay` ms between them; restarts when `run` changes. */
function useScript(run: number, steps: (() => void)[], delay: number) {
  const latest = useRef(steps);
  latest.current = steps;
  useEffect(() => {
    const timers = latest.current.map((step, i) => setTimeout(step, (i + 1) * delay));
    return () => timers.forEach(clearTimeout);
  }, [run, delay]);
}

// ─── Composer ──────────────────────────────────────────────────────────────

const SAMPLE_FILES: Omit<ComposerAttachment, "id">[] = [
  { name: "q3-revenue.xlsx", size: 284_000 },
  { name: "brand-guidelines.pdf", size: 4_820_000 },
  { name: "hero-shot.png", size: 1_310_000 },
];

/** Attachments that "upload": progress climbs to done over about a second. */
function useAttachments() {
  const [items, setItems] = useState<ComposerAttachment[]>([]);
  const add = (files: { name: string; size: number }[]) => {
    files.forEach((file, i) => {
      const id = `${Date.now()}-${i}-${file.name}`;
      setTimeout(() => {
        setItems((list) => [...list, { ...file, id, kind: attachmentKind(file.name), progress: 0 }]);
        [0.35, 0.7, 1].forEach((p, step) =>
          setTimeout(() => setItems((list) => list.map((a) => (a.id === id ? { ...a, progress: p === 1 ? undefined : p } : a))), 300 * (step + 1)),
        );
      }, i * 260);
    });
  };
  const remove = (id: string) => setItems((list) => list.filter((a) => a.id !== id));
  return { items, add, remove, clear: () => setItems([]) };
}

export function ComposerPanelDemo() {
  const attachments = useAttachments();
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ComposerPanel
        isBusy={busy}
        onStop={() => {
          clearTimeout(timer.current);
          setBusy(false);
          toast.show("Stopped");
        }}
        onAttach={(files) => attachments.add(files.map((f) => ({ name: f.name, size: f.size })))}
        attachments={attachments.items.length > 0 ? <ComposerAttachments items={attachments.items} onRemove={attachments.remove} /> : undefined}
        onSubmit={({ text, mode, model }) => {
          setBusy(true);
          attachments.clear();
          toast.info(`Sent in “${mode}” mode`, { description: `${model} · ${text.slice(0, 60)}` });
          timer.current = setTimeout(() => setBusy(false), 2600);
        }}
      />
      <Button size="sm" variant="tertiary" leadingIcon={RiAddLine} onPress={() => attachments.add(SAMPLE_FILES)} className="self-start">
        Add sample files
      </Button>
    </div>
  );
}

export const ComposerPanelPreview = () => (
  <Fit width={520} center>
    <ComposerPanel
      attachments={<ComposerAttachments items={SAMPLE_FILES.slice(0, 2).map((f, i) => ({ ...f, id: String(i) }))} />}
      defaultMode="plan"
    />
  </Fit>
);

export function ComposerAttachmentsDemo() {
  const attachments = useAttachments();
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="min-h-18 w-full rounded-2xl border border-dashed border-line p-2">
        {attachments.items.length === 0 ? (
          <p className="py-4 text-center text-body-sm text-fg-secondary">No files yet</p>
        ) : (
          <ComposerAttachments items={attachments.items} onRemove={attachments.remove} />
        )}
      </div>
      <div className="flex gap-2">
        <Button leadingIcon={RiAddLine} onPress={() => attachments.add(SAMPLE_FILES)}>
          Attach three files
        </Button>
        <Button variant="secondary" onPress={attachments.clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

export const ComposerAttachmentsPreview = () => (
  <Fit width={460} center>
    <ComposerAttachments items={SAMPLE_FILES.map((f, i) => ({ ...f, id: String(i), progress: i === 2 ? 0.6 : undefined }))} />
  </Fit>
);

// ─── Web search ────────────────────────────────────────────────────────────

const RESEARCH: ResearchStep[] = [
  {
    query: "css container queries browser support",
    sources: [
      { title: "CSS container queries", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries" },
      { title: "Container queries are stable", url: "https://web.dev/blog/cq-stable" },
      { title: "CSS Containment Module Level 3", url: "https://www.w3.org/TR/css-contain-3/" },
    ],
  },
  {
    query: "container query units cqi vs cqw",
    sources: [
      { title: "Container query length units", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries" },
      { title: "Responsive type with cqi", url: "https://example.com/notes/container-units" },
    ],
  },
];

export function WebSearchDemo() {
  const [run, setRun] = useState(0);
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [done, setDone] = useState(false);

  // One beat per query and per source, then done.
  const script: (() => void)[] = [];
  RESEARCH.forEach((step, s) => {
    script.push(() => setSteps((prev) => [...prev.slice(0, s), { query: step.query, sources: [] }]));
    step.sources.forEach((_, i) =>
      script.push(() => setSteps((prev) => prev.map((p, j) => (j === s ? { ...p, sources: step.sources.slice(0, i + 1) } : p)))),
    );
  });
  script.push(() => setDone(true));
  useScript(run, script, 550);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <WebSearch steps={steps} status={done ? "done" : "searching"} />
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={RiRestartLine}
        className="self-start"
        onPress={() => {
          setSteps([]);
          setDone(false);
          setRun((r) => r + 1);
        }}
      >
        Replay
      </Button>
    </div>
  );
}

export const WebSearchPreview = () => (
  <Fit width={460} center>
    <WebSearch steps={RESEARCH} />
  </Fit>
);

// ─── Task list ─────────────────────────────────────────────────────────────

const TASKS = [
  { label: "Read the issue and linked pull requests", detail: "4 files referenced" },
  { label: "Reproduce the failing test" },
  { label: "Patch the date parser", detail: "Edited src/utils/dates.ts" },
  { label: "Run the test suite", detail: "128 passed" },
  { label: "Write the changelog entry" },
];

export function TaskListDemo() {
  const [run, setRun] = useState(0);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const script: (() => void)[] = [];
  TASKS.forEach((t, i) => {
    script.push(() => setTasks((prev) => [...prev.slice(0, i), { id: String(i), label: t.label, status: "running" }]));
    script.push(() => setTasks((prev) => prev.map((p) => (p.id === String(i) ? { ...p, status: "done", detail: t.detail } : p))));
  });
  useScript(run, script, 700);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <TaskList title="Fixing the date bug" tasks={tasks} />
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={RiRestartLine}
        className="self-start"
        onPress={() => {
          setTasks([]);
          setRun((r) => r + 1);
        }}
      >
        Replay
      </Button>
    </div>
  );
}

export const TaskListPreview = () => (
  <Fit width={400} center>
    <TaskList
      title="Fixing the date bug"
      tasks={[
        { id: "1", label: TASKS[0]!.label, status: "done", detail: TASKS[0]!.detail },
        { id: "2", label: TASKS[1]!.label, status: "done" },
        { id: "3", label: TASKS[2]!.label, status: "running" },
        { id: "4", label: TASKS[3]!.label, status: "pending" },
      ]}
    />
  </Fit>
);

// ─── Agent limits ──────────────────────────────────────────────────────────

const QUOTAS = [
  { label: "Messages today", used: 62, limit: 100, resets: "Resets at midnight", format: (v: number) => String(v) },
  { label: "Tokens this month", used: 7_800_000, limit: 10_000_000, resets: "Resets on Nov 1" },
];

export function AgentLimitsDemo() {
  const [conversation, setConversation] = useState(86_000);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <AgentLimits
        plan="Team plan"
        context={{
          limit: 200_000,
          parts: [
            { label: "Instructions", value: 12_000 },
            { label: "Conversation", value: conversation },
            { label: "Files", value: 30_000 },
          ],
        }}
        quotas={QUOTAS}
        contextAction={
          <Button size="xs" variant="secondary" onPress={() => setConversation(24_000)}>
            Compact
          </Button>
        }
      />
      <Button size="sm" variant="secondary" className="self-start" onPress={() => setConversation((c) => Math.min(158_000, c + 36_000))}>
        Paste a long document
      </Button>
    </div>
  );
}

export const AgentLimitsPreview = () => (
  <Fit width={420} center>
    <AgentLimits
      plan="Team plan"
      context={{ limit: 200_000, parts: [{ label: "Instructions", value: 12_000 }, { label: "Conversation", value: 86_000 }, { label: "Files", value: 30_000 }] }}
      quotas={QUOTAS}
    />
  </Fit>
);

// ─── Questionnaire ─────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: "scope",
    prompt: "What should the redesign cover?",
    options: [
      { id: "settings", label: "Settings pages", description: "Account, billing, notifications" },
      { id: "onboarding", label: "Onboarding", description: "First-run flow and empty states" },
      { id: "dashboard", label: "Dashboard", description: "Home screen and widgets" },
    ],
    multiple: true,
  },
  {
    id: "tokens",
    prompt: "Should I change design tokens, or only components?",
    options: [
      { id: "components", label: "Components only", description: "Tokens stay as they are" },
      { id: "both", label: "Tokens and components", description: "Propose token changes too" },
    ],
    allowOther: true,
  },
  {
    id: "deadline",
    prompt: "Is there a deadline I should plan around?",
    optional: true,
    options: [
      { id: "week", label: "This week" },
      { id: "month", label: "This month" },
      { id: "none", label: "No deadline" },
    ],
  },
];

export const QuestionnaireDemo = () => (
  <Questionnaire questions={QUESTIONS} className="max-w-xl" onComplete={(a) => toast.success("Answers sent", { description: `${Object.keys(a).length} questions answered` })} />
);

export const QuestionnairePreview = () => (
  <Fit width={560} center>
    <Questionnaire questions={QUESTIONS} />
  </Fit>
);

// ─── Agent creator ─────────────────────────────────────────────────────────

export const AgentCreatorDemo = () => (
  <AgentCreator
    className="max-w-3xl"
    defaultValue={{ name: "Release helper", description: "Drafts release notes from merged pull requests." }}
    onCreate={(c) => toast.success(`${c.name} created`, { description: `${c.tone} tone · ${c.voice} voice` })}
  />
);

export const AgentCreatorPreview = () => (
  <Fit width={760} center>
    <AgentCreator defaultValue={{ name: "Release helper", description: "Drafts release notes from merged pull requests." }} />
  </Fit>
);

// ─── Calendar ──────────────────────────────────────────────────────────────

export const CalendarDemo = () => <MonthCalendar defaultDate="2026-10-14" className="max-w-3xl" />;

export const CalendarPreview = () => (
  <Fit width={720}>
    <MonthCalendar defaultDate="2026-10-14" />
  </Fit>
);

// ─── Agent progress ────────────────────────────────────────────────────────

export function AgentProgressDemo() {
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <AgentProgress key={run} stepDuration={1800} onFinished={() => setFinished(true)} />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={RiRestartLine}
          onPress={() => {
            setFinished(false);
            setRun((r) => r + 1);
          }}
        >
          Replay
        </Button>
        <span className="text-body-sm text-fg-secondary">{finished ? "onFinished fired" : "Running…"}</span>
      </div>
    </div>
  );
}

export const AgentProgressPreview = () => (
  <Fit width={420} center>
    <AgentProgress isPaused stepDuration={1800} />
  </Fit>
);
