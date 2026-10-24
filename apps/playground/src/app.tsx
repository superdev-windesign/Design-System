import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AgentProgress, Button, DatePicker, DateRangePicker, Select, SelectItem, StatusDot } from "@ds/react";
import { RiAddLine, RiArrowRightLine, RiDeleteBinLine } from "@remixicon/react";

type ThemeChoice = "light" | "dark" | "system";

function useTheme() {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    try {
      const stored = localStorage.getItem("ds-theme");
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      if (theme === "system") localStorage.removeItem("ds-theme");
      else localStorage.setItem("ds-theme", theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

/** Mirrors BoardUI's docs preview frame so screenshots compare like for like. */
function Preview({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      data-preview={id}
      className="flex min-h-81.75 flex-wrap items-center justify-center gap-3 rounded-panel border border-line p-8"
    >
      {children}
    </div>
  );
}

/** BoardUI's demo steps and timing, so the run can be compared side by side. */
const AGENT_STEPS = [
  "Read project files",
  "Update light mode tokens",
  "Implement dark mode tokens",
  "Register the theme toggle",
  "Run lint and production build",
];

function AgentProgressDemo() {
  const [run, setRun] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Preview id="agent-progress">
        <div className="flex min-h-75 w-full items-center justify-center">
          <AgentProgress key={run} steps={AGENT_STEPS} stepDuration={2400} onFinished={() => setIsFinished(true)} />
        </div>
      </Preview>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onPress={() => {
            setIsFinished(false);
            setRun((count) => count + 1);
          }}
        >
          Replay
        </Button>
        <span className="text-body-md text-fg-secondary">{isFinished ? "onFinished fired" : "Running…"}</span>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-body-md-strong text-fg">{title}</h2>
        <p className="text-body-md text-fg-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <main className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-body-md-strong text-fg">Windesign DS · Playground</h1>
            <p className="text-body-md text-fg-secondary">
              Select and Date Range Picker rebuilt for visual parity with BoardUI, on the @ds token system.
            </p>
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Theme">
            {(["light", "dark", "system"] as const).map((choice) => (
              <Button
                key={choice}
                size="sm"
                variant={theme === choice ? "tertiary" : "secondary"}
                aria-pressed={theme === choice}
                onPress={() => setTheme(choice)}
              >
                {choice[0]!.toUpperCase() + choice.slice(1)}
              </Button>
            ))}
          </div>
        </header>

        <Section
          title="Agent Progress"
          description="Multi-step progress with staggered entry, synchronized rings, a gliding active-step outline and minimize."
        >
          <AgentProgressDemo />
        </Section>

        <Section title="Select" description="Single-choice listbox with a non-modal popover and free-form items.">
          <Preview id="select">
            <Select aria-label="Filter by price" defaultSelectedKey="all">
              <SelectItem id="all" textValue="All prices">All prices</SelectItem>
              <SelectItem id="low" textValue="Under $100">Under $100</SelectItem>
              <SelectItem id="high" textValue="Over $100">Over $100</SelectItem>
            </Select>
            <Select aria-label="Filter by region" defaultSelectedKey="all">
              <SelectItem id="all" textValue="All regions">All regions</SelectItem>
              <SelectItem id="eu" textValue="Europe">Europe</SelectItem>
              <SelectItem id="am" textValue="Americas">Americas</SelectItem>
            </Select>
          </Preview>
          <Preview id="select-status">
            {/* w-35.5 = 142px, as in BoardUI's status example */}
            <Select aria-label="Purchase status" defaultSelectedKey="completed" className="w-35.5">
              <SelectItem id="completed" textValue="Completed">
                <StatusDot color="green" />
                Completed
              </SelectItem>
              <SelectItem id="waiting" textValue="Waiting">
                <StatusDot color="yellow" />
                Waiting
              </SelectItem>
              <SelectItem id="processing" textValue="Processing">
                <StatusDot color="indigo" />
                Processing
              </SelectItem>
            </Select>
            <Select aria-label="Density" size="sm" defaultSelectedKey="compact">
              <SelectItem id="compact" textValue="Compact">Compact</SelectItem>
              <SelectItem id="comfortable" textValue="Comfortable">Comfortable</SelectItem>
            </Select>
            <Select aria-label="Disabled example" isDisabled defaultSelectedKey="all">
              <SelectItem id="all" textValue="Disabled">Disabled</SelectItem>
            </Select>
          </Preview>
        </Section>

        <Section
          title="Date Range Picker"
          description="Quick-select presets, two months, editable chips; nothing commits until Apply."
        >
          <Preview id="date-range-picker">
            <DateRangePicker />
          </Preview>
          <Preview id="date-picker">
            <DatePicker />
          </Preview>
        </Section>

        <Section title="Button" description="Dependency of the pickers: four variants, three sizes, icon slots.">
          <Preview id="button">
            <Button>Get started</Button>
            <Button variant="secondary" trailingIcon={RiArrowRightLine}>
              Continue
            </Button>
            <Button variant="tertiary">Mark as done</Button>
            <Button variant="danger">Delete</Button>
          </Preview>
          <Preview id="button-sizes">
            <Button size="md" leadingIcon={RiAddLine}>
              Medium
            </Button>
            <Button size="sm" leadingIcon={RiAddLine}>
              Small
            </Button>
            <Button size="xs">Xs</Button>
            <Button iconOnly leadingIcon={RiDeleteBinLine} variant="secondary" aria-label="Delete item" />
            <Button isDisabled>Disabled</Button>
          </Preview>
        </Section>
      </main>
    </div>
  );
}
