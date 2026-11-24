import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import {
  RiBarChartBoxLine,
  RiCheckLine,
  RiCommandLine,
  RiFileTextLine,
  RiHome5Line,
  RiLogoutBoxRLine,
  RiMoneyDollarCircleLine,
  RiMoonLine,
  RiSettings3Line,
  RiShuffleLine,
  RiUserAddLine,
  RiUserHeartLine,
  RiUserUnfollowLine,
} from "@remixicon/react";
import {
  Button,
  CommandGroup,
  CommandItem,
  CommandMenu,
  CommandPalette,
  Input,
  Kbd,
  RadioCard,
  RadioGroup,
  StatCard,
  StepWizard,
  Textarea,
  Toaster,
  WizardStep,
  createToastQueue,
  toast,
} from "@windesign/react";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const isApplePlatform = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

// ─── Command palette ───────────────────────────────────────────────────────

const COMMAND_LABELS: Record<string, string> = {
  home: "Go to dashboard",
  reports: "Open reports",
  settings: "Settings",
  "new-doc": "New document",
  invite: "Invite teammate",
  theme: "Toggle theme",
  logout: "Log out",
};

function Commands() {
  return (
    <>
      <CommandGroup title="Navigate">
        <CommandItem id="home" icon={RiHome5Line} shortcut={["G", "H"]}>
          {COMMAND_LABELS.home!}
        </CommandItem>
        <CommandItem id="reports" icon={RiBarChartBoxLine} keywords={["analytics", "charts"]}>
          {COMMAND_LABELS.reports!}
        </CommandItem>
        <CommandItem id="settings" icon={RiSettings3Line} keywords={["preferences"]} shortcut={["⌘", ","]}>
          {COMMAND_LABELS.settings!}
        </CommandItem>
      </CommandGroup>
      <CommandGroup title="Create">
        <CommandItem id="new-doc" icon={RiFileTextLine} description="A blank page in this workspace" shortcut={["⌘", "N"]}>
          {COMMAND_LABELS["new-doc"]!}
        </CommandItem>
        <CommandItem id="invite" icon={RiUserAddLine} keywords={["team", "member", "share"]}>
          {COMMAND_LABELS.invite!}
        </CommandItem>
      </CommandGroup>
      <CommandGroup title="Account">
        <CommandItem id="theme" icon={RiMoonLine} keywords={["dark", "light", "appearance"]}>
          {COMMAND_LABELS.theme!}
        </CommandItem>
        <CommandItem id="logout" icon={RiLogoutBoxRLine} keywords={["sign out"]}>
          {COMMAND_LABELS.logout!}
        </CommandItem>
      </CommandGroup>
    </>
  );
}

export function CommandPalettePreview() {
  return (
    <CommandMenu hideFooter aria-label="Commands preview" className="w-full max-w-72 shadow-raised">
      <CommandItem id="home" icon={RiHome5Line} shortcut={["G", "H"]}>
        Go to dashboard
      </CommandItem>
      <CommandItem id="new-doc" icon={RiFileTextLine} shortcut={["⌘", "N"]}>
        New document
      </CommandItem>
    </CommandMenu>
  );
}

export function CommandPaletteDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button leadingIcon={RiCommandLine} onPress={() => setIsOpen(true)}>
        Open command palette
      </Button>
      <p className="flex items-center gap-1.5 text-body-sm text-fg-secondary">
        or press <Kbd className="px-1.5">{isApplePlatform() ? "⌘J" : "Ctrl J"}</Kbd> anywhere on this page
      </p>
      <CommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        shortcut="j"
        onAction={(key: Key) => toast.show(`Ran “${COMMAND_LABELS[String(key)] ?? key}”`)}
      >
        <Commands />
      </CommandPalette>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────

// A resting stack for the index card; timeout 0 keeps these toasts on screen.
const previewToasts = createToastQueue();
previewToasts.toast.info("Export started", { timeout: 0 });
previewToasts.toast.error("Couldn't sync", { timeout: 0 });
previewToasts.toast.success("Changes saved", { timeout: 0 });

export function ToastPreview() {
  return (
    <div className="relative size-full">
      <Toaster
        queue={previewToasts.queue}
        inline
        position="bottom-center"
        aria-label="Toast preview"
        className="bottom-6 w-auto max-w-none"
      />
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="flex max-w-md flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" onPress={() => toast.success("Changes saved", { description: "Your profile is up to date." })}>
          Success
        </Button>
        <Button
          variant="secondary"
          onPress={() => toast.error("Couldn't sync", { description: "Check your connection and try again." })}
        >
          Error
        </Button>
        <Button variant="secondary" onPress={() => toast.info("New version available", { description: "Reload to get the latest." })}>
          Info
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            toast.show("Project archived", { action: { label: "Undo", onAction: () => toast.success("Project restored") } })
          }
        >
          With action
        </Button>
        <Button
          onPress={() =>
            void toast.promise(
              wait(1800).then(() => "v2.4.0"),
              { loading: "Deploying…", success: (version) => `Deployed ${version}`, error: "Deploy failed" },
            )
          }
        >
          Promise
        </Button>
      </div>
      <p className="text-center text-body-sm text-fg-secondary">
        Fire a few, then hover the stack to fan it out, or swipe one sideways to dismiss it.
      </p>
    </div>
  );
}

// ─── Step wizard ───────────────────────────────────────────────────────────

export function StepWizardPreview() {
  return (
    <StepWizard className="w-80 shrink-0 scale-60" completeLabel="Create workspace">
      <WizardStep title="Workspace" description="Name the space your team will share." />
      <WizardStep title="Team" />
      <WizardStep title="Plan" />
    </StepWizard>
  );
}

export function StepWizardDemo() {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [plan, setPlan] = useState("team");
  const [run, setRun] = useState(0);

  return (
    <StepWizard
      key={run}
      className="w-full max-w-lg"
      completeLabel="Create workspace"
      onComplete={() => wait(900)}
      renderComplete={() => (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-status-success text-status-success-text">
            <RiCheckLine aria-hidden className="size-6" />
          </span>
          <h3 className="text-title-sm-emphasis text-fg">{name.trim() || "Your workspace"} is ready</h3>
          <p className="text-body-md text-fg-secondary">
            {emails.trim() ? "Invites are on their way. " : ""}You're on the {plan === "solo" ? "Solo" : "Team"} plan.
          </p>
          <Button
            variant="secondary"
            onPress={() => {
              setName("");
              setEmails("");
              setPlan("team");
              setRun((count) => count + 1);
            }}
          >
            Start over
          </Button>
        </div>
      )}
    >
      <WizardStep
        title="Workspace"
        description="Name the space your team will share."
        validate={() => (name.trim() ? true : "Give your workspace a name to continue.")}
      >
        <Input label="Workspace name" placeholder="Acme Inc." value={name} onChange={setName} />
      </WizardStep>
      <WizardStep title="Team" description="Invite people now, or skip this and do it later.">
        <Textarea label="Email addresses" placeholder="sam@acme.com, riley@acme.com" value={emails} onChange={setEmails} />
      </WizardStep>
      <WizardStep title="Plan" description="You can change this at any time.">
        <RadioGroup aria-label="Plan" value={plan} onChange={setPlan} className="grid gap-2 sm:grid-cols-2">
          <RadioCard value="solo" title="Solo" description="For one person." />
          <RadioCard value="team" title="Team" description="Shared projects and roles." />
        </RadioGroup>
      </WizardStep>
    </StepWizard>
  );
}

// ─── Stat cards ────────────────────────────────────────────────────────────

/** Small seeded PRNG so "Shuffle" gives new but repeatable series. */
function random(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function series(seed: number, start: number, drift: number, noise: number, length = 14) {
  const next = random(seed);
  const out: number[] = [];
  let value = start;
  for (let i = 0; i < length; i++) {
    value = Math.max(0, value * (1 + drift + (next() - 0.5) * noise));
    out.push(value);
  }
  return out;
}

const DAY_LABELS = Array.from({ length: 14 }, (_, i) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(2026, 9, 14 + i)),
);

const change = (data: number[]) => data[data.length - 1]! / data[0]! - 1;

export function StatCardPreview() {
  const data = series(7, 38000, 0.02, 0.08);
  return (
    <StatCard
      className="w-60 shrink-0 scale-85"
      label="Revenue"
      icon={RiMoneyDollarCircleLine}
      value={data[data.length - 1]!}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      change={change(data)}
      data={data}
    />
  );
}

export function StatCardsDemo() {
  const [seed, setSeed] = useState(1);
  const data = useMemo(
    () => ({
      revenue: series(seed, 38000, 0.02, 0.08).map(Math.round),
      users: series(seed + 11, 2400, 0.01, 0.1).map(Math.round),
      churn: series(seed + 23, 0.031, -0.02, 0.12),
    }),
    [seed],
  );

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Revenue"
          icon={RiMoneyDollarCircleLine}
          value={data.revenue[data.revenue.length - 1]!}
          format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
          change={change(data.revenue)}
          comparison="vs 2 weeks ago"
          data={data.revenue}
          dataLabels={DAY_LABELS}
        />
        <StatCard
          label="Active users"
          icon={RiUserHeartLine}
          value={data.users[data.users.length - 1]!}
          change={change(data.users)}
          comparison="vs 2 weeks ago"
          data={data.users}
          dataLabels={DAY_LABELS}
        />
        <StatCard
          label="Churn rate"
          icon={RiUserUnfollowLine}
          value={data.churn[data.churn.length - 1]!}
          format={{ style: "percent", maximumFractionDigits: 1 }}
          change={change(data.churn)}
          invertTrend
          comparison="vs 2 weeks ago"
          data={data.churn}
          dataLabels={DAY_LABELS}
        />
      </div>
      <Button variant="secondary" leadingIcon={RiShuffleLine} onPress={() => setSeed((s) => s + 1)}>
        Shuffle data
      </Button>
      <p className="text-center text-body-sm text-fg-secondary">Hover or drag across a sparkline to read each day.</p>
    </div>
  );
}
