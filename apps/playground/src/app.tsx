import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import {
  AgentProgress,
  Button,
  DatePicker,
  DateRangePicker,
  IconButton,
  Select,
  SelectItem,
  StatusDot,
  Toaster,
} from "@ds/react";
import { RiAddLine, RiArrowRightLine, RiDeleteBinLine, RiMenuLine } from "@remixicon/react";
import { ShowcaseDetail, ShowcaseIndex, useHashRoute } from "./showcase/showcase";
import { Sidebar } from "./showcase/sidebar";

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

/** Side-by-side parity checks against BoardUI's docs previews. */
function ParityLab() {
  return (
    <div className="flex flex-col gap-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-title-sm-strong text-fg">Parity lab</h1>
          <p className="text-body-md text-fg-secondary">
            Hand-built components measured against BoardUI's docs previews, on the @ds token system.
          </p>
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
    </div>
  );
}

function ThemeSwitch() {
  const [theme, setTheme] = useTheme();
  return (
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
  );
}

const DESKTOP = "(min-width: 64rem)";

export function App() {
  const route = useHashRoute();
  const detail = /^\/components\/([a-z0-9-]+)$/.exec(route);
  const onComponents = route.startsWith("/components") || route === "/";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const desktopSearch = useRef<HTMLInputElement>(null);
  const drawerSearch = useRef<HTMLInputElement>(null);
  const [focusDrawerSearch, setFocusDrawerSearch] = useState(false);

  // Close the drawer whenever the page changes (including back/forward).
  useEffect(() => setDrawerOpen(false), [route]);

  // ⌘K / Ctrl+K: focus search in the sidebar, opening the drawer on small screens.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (window.matchMedia(DESKTOP).matches) desktopSearch.current?.focus();
      else {
        setFocusDrawerSearch(true);
        setDrawerOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (drawerOpen && focusDrawerSearch) {
      // Wait a frame so the drawer's own focus handling runs first.
      requestAnimationFrame(() => drawerSearch.current?.focus());
      setFocusDrawerSearch(false);
    }
  }, [drawerOpen, focusDrawerSearch]);

  return (
    <div className="flex min-h-dvh bg-canvas text-fg">
      {/* Desktop: a floating sidebar that stays put while the page scrolls. */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 p-3 lg:block">
        <Sidebar route={route} searchRef={desktopSearch} />
      </aside>

      {/* Small screens: the same sidebar in a slide-in drawer. */}
      <ModalOverlay
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        isDismissable
        className="fixed inset-0 z-50 bg-scrim transition-opacity duration-(--ds-motion-duration-moderate) data-[entering]:opacity-0 data-[exiting]:opacity-0 lg:hidden"
      >
        <Modal className="fixed inset-y-0 start-0 w-80 max-w-[calc(100vw-48px)] p-3 transition-transform duration-(--ds-motion-duration-slow) ease-enter data-[entering]:-translate-x-full data-[exiting]:-translate-x-full rtl:data-[entering]:translate-x-full rtl:data-[exiting]:translate-x-full motion-reduce:transition-none">
          <Dialog aria-label="Navigation" className="h-full outline-none">
            <Sidebar route={route} searchRef={drawerSearch} onNavigate={() => setDrawerOpen(false)} />
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* One app-wide toast region; anything can call toast.success(…). */}
      <Toaster />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-canvas px-4 py-3 lg:border-none">
          <div className="flex items-center gap-2 lg:hidden">
            <IconButton icon={RiMenuLine} aria-label="Open navigation" onClick={() => setDrawerOpen(true)} />
            <span className="text-body-md-strong text-fg">Windesign DS</span>
          </div>
          <div className="ms-auto">
            <ThemeSwitch />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
          {detail ? <ShowcaseDetail slug={detail[1]!} /> : onComponents ? <ShowcaseIndex /> : <ParityLab />}
        </main>
      </div>
    </div>
  );
}
