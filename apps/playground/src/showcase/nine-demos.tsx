import { useMemo, useRef, useState } from "react";
import {
  RiAddLine,
  RiBookOpenLine,
  RiCodeSSlashLine,
  RiDashboardLine,
  RiPaletteLine,
  RiPencilLine,
  RiSettings3Line,
  RiTeamLine,
} from "@remixicon/react";
import {
  Avatar,
  BackToTop,
  BottomSheet,
  Button,
  Checkbox,
  CheckboxGroup,
  Countdown,
  Dialog,
  DialogTrigger,
  DonutChartCard,
  FloatingActionButton,
  MentionsInput,
  Schedule,
  SideNavigation,
  Stack,
  Stopwatch,
  Switch,
  TableOfContents,
  Text,
  TreeSelect,
  toast,
} from "@windesign-ds/react";
import type { MentionOption, ScheduleEvent, SideNavSection, TreeNode } from "@windesign-ds/react";
import type { CatalogEntry } from "./catalog";

// ─── Data ──────────────────────────────────────────────────────────────────

const NAV: SideNavSection[] = [
  {
    items: [
      { id: "overview", label: "Overview", href: "#/components/side-navigation", icon: RiDashboardLine },
      { id: "team", label: "Team", href: "#/components/side-navigation", icon: RiTeamLine, badge: 12 },
    ],
  },
  {
    title: "Design system",
    items: [
      {
        id: "foundations",
        label: "Foundations",
        icon: RiPaletteLine,
        items: [
          { id: "color", label: "Color", href: "#/components/side-navigation" },
          { id: "type", label: "Typography", href: "#/components/side-navigation" },
          { id: "space", label: "Spacing", href: "#/components/side-navigation" },
        ],
      },
      {
        id: "components",
        label: "Components",
        icon: RiCodeSSlashLine,
        items: [
          { id: "button", label: "Button", href: "#/components/side-navigation" },
          { id: "dialog", label: "Dialog", href: "#/components/side-navigation" },
        ],
      },
      { id: "guides", label: "Guides", href: "#/components/side-navigation", icon: RiBookOpenLine },
    ],
  },
  { title: "Account", items: [{ id: "settings", label: "Settings", href: "#/components/side-navigation", icon: RiSettings3Line }] },
];

const PEOPLE: MentionOption[] = [
  { id: "ada", label: "Ada Lovelace", description: "Engineering", leading: <Avatar size="sm" initials="AL" color="blue" /> },
  { id: "alan", label: "Alan Turing", description: "Research", leading: <Avatar size="sm" initials="AT" color="lime" /> },
  { id: "grace", label: "Grace Hopper", description: "Platform", leading: <Avatar size="sm" initials="GH" color="pink" /> },
  { id: "katherine", label: "Katherine Johnson", description: "Data", leading: <Avatar size="sm" initials="KJ" /> },
  { id: "riley", label: "Riley Chen", description: "Design", leading: <Avatar size="sm" initials="RC" color="blue" /> },
];

const FOLDERS: TreeNode[] = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "brand", label: "Brand", children: [{ id: "logos", label: "Logos" }, { id: "type", label: "Typefaces" }] },
      { id: "product", label: "Product", children: [{ id: "web", label: "Web app" }, { id: "mobile", label: "Mobile" }] },
    ],
  },
  { id: "eng", label: "Engineering", children: [{ id: "frontend", label: "Frontend" }, { id: "platform", label: "Platform" }] },
  { id: "archive", label: "Archive" },
];

function weekEvents(): ScheduleEvent[] {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const at = (day: number, h: number, m = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day, h, m);
  return [
    { id: "1", title: "Standup", start: at(0, 9, 30), end: at(0, 9, 45), tone: "cyan" },
    { id: "2", title: "Design review", start: at(0, 11), end: at(0, 12, 30), location: "Room 2", tone: "orange" },
    { id: "3", title: "Token sync", start: at(1, 10), end: at(1, 11), tone: "purple" },
    { id: "4", title: "Lunch with Sam", start: at(1, 12, 30), end: at(1, 13, 30), tone: "lime" },
    { id: "5", title: "Standup", start: at(2, 9, 30), end: at(2, 9, 45), tone: "cyan" },
    { id: "6", title: "Accessibility audit", start: at(2, 14), end: at(2, 16), location: "Studio", tone: "rose" },
    { id: "7", title: "Interview", start: at(2, 15), end: at(2, 16), tone: "blue" },
    { id: "8", title: "Release", start: at(3, 16), end: at(3, 17), tone: "yellow" },
    { id: "9", title: "Planning", start: at(4, 10), end: at(4, 12), location: "Room 1", tone: "orange" },
  ];
}

// ─── Demos ─────────────────────────────────────────────────────────────────

function SideNavigationDemo() {
  const [current, setCurrent] = useState("type");
  return (
    <div className="w-64 rounded-surface border border-line bg-surface p-3">
      <SideNavigation
        aria-label="Workspace"
        sections={NAV}
        currentId={current}
        onNavigate={(id) => {
          setCurrent(id);
        }}
      />
    </div>
  );
}

const SECTIONS = [
  { id: "toc-overview", label: "Overview", level: 2 as const },
  { id: "toc-install", label: "Installation", level: 2 as const },
  { id: "toc-tokens", label: "Tokens", level: 3 as const },
  { id: "toc-components", label: "Components", level: 3 as const },
  { id: "toc-theming", label: "Theming", level: 2 as const },
  { id: "toc-faq", label: "Questions", level: 2 as const },
];

function TableOfContentsDemo() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
      <div className="flex flex-col gap-6 sm:col-span-2">
        {SECTIONS.map((s) => {
          const Heading = s.level === 2 ? "h2" : "h3";
          return (
            <section key={s.id} className="flex flex-col gap-2">
              <Heading id={s.id} className={s.level === 2 ? "text-title-md-strong text-fg" : "text-body-md-strong text-fg"}>
                {s.label}
              </Heading>
              <Text tone="secondary">
                Scroll the page and the outline follows the section you're reading. Pick an entry and it scrolls there and moves focus to the heading, so a
                keyboard or screen-reader user continues from the right place.
              </Text>
            </section>
          );
        })}
      </div>
      <TableOfContents items={SECTIONS} updateHash={false} className="sm:sticky sm:top-24 sm:self-start" />
    </div>
  );
}

function MentionsDemo() {
  const [mentioned, setMentioned] = useState<MentionOption[]>([]);
  return (
    <Stack gap={3} className="w-full max-w-md">
      <MentionsInput
        label="Comment"
        options={PEOPLE}
        placeholder="Type @ to mention someone"
        description="Mentioned people get a notification."
        onChange={(_, mentions) => setMentioned(mentions)}
      />
      <Text size="caption" mono tone="secondary">
        Will notify: {mentioned.length ? mentioned.map((p) => p.label).join(", ") : "nobody yet"}
      </Text>
    </Stack>
  );
}

function TreeSelectDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <TreeSelect label="Save to folder" items={FOLDERS} defaultValue="logos" description="Any folder, including the parent ones." />
      <TreeSelect label="Team" items={FOLDERS} selectLeavesOnly placeholder="Choose a team" description="Only the innermost folders can be chosen." />
    </div>
  );
}

function FabDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-80 w-full max-w-sm overflow-hidden rounded-panel border border-line bg-canvas">
      <div ref={scrollRef} className="scrollbar-thin h-full overflow-auto p-5">
        <div id="fab-demo-top" className="flex flex-col gap-3">
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="rounded-surface border border-line bg-surface p-3 text-body-sm text-fg-secondary">
              Task {i + 1}: scroll this panel to bring up Back to top.
            </div>
          ))}
        </div>
      </div>
      <FloatingActionButton icon={RiPencilLine} label="New task" extended placement="absolute" position="bottom-start" onPress={() => toast.show("New task")} />
      <BackToTop scrollRef={scrollRef} threshold={160} focusTargetId="fab-demo-top" placement="absolute" />
    </div>
  );
}

function CountdownDemo() {
  const launch = useMemo(() => Date.now() + 2 * 86400_000 + 5 * 3600_000 + 12 * 60_000, []);
  const [soon] = useState(() => Date.now() + 8_000);
  return (
    <Stack gap={8} align="center">
      <Stack gap={2} align="center">
        <Text size="caption" mono tone="secondary">
          LAUNCH IN
        </Text>
        <Countdown to={launch} label="Launch in" />
      </Stack>
      <Stack gap={2} align="center">
        <Text size="caption" mono tone="secondary">
          COMPACT · CALLS onComplete AT ZERO
        </Text>
        <Countdown to={soon} units={["minutes", "seconds"]} size="sm" label="Offer ends in" onComplete={() => toast.show("Offer ended")} />
      </Stack>
      <Stopwatch />
    </Stack>
  );
}

function BottomSheetDemo() {
  return (
    <DialogTrigger>
      <Button>Open filters</Button>
      <BottomSheet snapPoints={[0.45, 0.9]}>
        <Dialog
          title="Filters"
          description="Drag the handle to resize, or down to close."
          footer={({ close }) => (
            <>
              <Button variant="tertiary" onPress={close}>
                Reset
              </Button>
              <Button onPress={close}>Show 18 results</Button>
            </>
          )}
        >
          <div className="flex flex-col gap-5">
            <CheckboxGroup label="Status" defaultValue={["open"]}>
              <Checkbox value="open">Open</Checkbox>
              <Checkbox value="review">In review</Checkbox>
              <Checkbox value="done">Done</Checkbox>
            </CheckboxGroup>
            <Switch defaultSelected>Only mine</Switch>
          </div>
        </Dialog>
      </BottomSheet>
    </DialogTrigger>
  );
}

function ScheduleDemo({ compact = false }: { compact?: boolean }) {
  const events = useMemo(weekEvents, []);
  return (
    <Schedule
      events={events}
      defaultView={compact ? "day" : "week"}
      startHour={compact ? 9 : 8}
      endHour={compact ? 13 : 19}
      onEventPress={(e) => toast.show(e.title)}
      onSlotPress={(start) => toast.show(`New event at ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)}
      className={compact ? "w-full max-w-72" : "w-full"}
    />
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

export const NINE_ENTRIES: CatalogEntry[] = [
  {
    slug: "donut-chart",
    isNew: true,
    name: "Donut Chart",
    group: "Charts",
    summary: "Shares of a whole with the total in the hole; switches to a full pie.",
    imports: ["DonutChartCard"],
    preview: () => <DonutChartCard className="w-full max-w-sm" />,
  },
  {
    slug: "side-navigation",
    isNew: true,
    name: "Side Navigation",
    group: "Navigation",
    summary: "An app's vertical menu in sections, with groups that open on the current page.",
    imports: ["SideNavigation"],
    preview: () => <SideNavigationDemo />,
  },
  {
    slug: "table-of-contents",
    isNew: true,
    name: "Table of Contents",
    group: "Navigation",
    summary: "An “On this page” outline that follows your scroll and moves focus on click.",
    imports: ["TableOfContents"],
    preview: () => (
      <TableOfContents
        updateHash={false}
        className="w-56"
        items={[
          { id: "pv-1", label: "Overview" },
          { id: "pv-2", label: "Installation" },
          { id: "pv-3", label: "Tokens", level: 3 },
          { id: "pv-4", label: "Theming" },
        ]}
      />
    ),
    demo: () => <TableOfContentsDemo />,
  },
  {
    slug: "mentions-input",
    isNew: true,
    name: "Mentions Input",
    group: "Forms",
    summary: "A text area where @ suggests people; returns who was mentioned.",
    imports: ["MentionsInput", "findMentions"],
    preview: () => (
      <div className="w-full max-w-72">
        <MentionsInput label="Comment" options={PEOPLE} defaultValue="Looks good, @Riley Chen " rows={2} />
      </div>
    ),
    demo: () => <MentionsDemo />,
  },
  {
    slug: "tree-select",
    isNew: true,
    name: "Tree Select",
    group: "Selection",
    summary: "Pick one value from a hierarchy; the trigger shows its whole path.",
    imports: ["TreeSelect", "treePath"],
    preview: () => (
      <div className="w-full max-w-64">
        <TreeSelect label="Save to folder" items={FOLDERS} defaultValue="logos" />
      </div>
    ),
    demo: () => <TreeSelectDemo />,
  },
  {
    slug: "floating-action-button",
    isNew: true,
    name: "Floating Action Button",
    group: "Actions",
    summary: "A screen's one primary action in a corner, plus Back to Top. Both are always named.",
    imports: ["FloatingActionButton", "BackToTop"],
    preview: () => (
      <div className="flex items-center gap-4">
        <FloatingActionButton icon={RiAddLine} label="New task" placement="static" />
        <FloatingActionButton icon={RiPencilLine} label="Compose" extended placement="static" />
      </div>
    ),
    demo: () => <FabDemo />,
  },
  {
    slug: "countdown",
    isNew: true,
    name: "Countdown & Stopwatch",
    group: "Data display",
    summary: "Time left to a moment in large mono figures, and a stopwatch with start, pause and reset.",
    imports: ["Countdown", "Stopwatch", "useCountdown", "formatElapsed"],
    preview: () => <Countdown to={Date.now() + 2 * 86400_000 + 5 * 3600_000} units={["days", "hours", "minutes"]} label="Launch in" />,
    demo: () => <CountdownDemo />,
  },
  {
    slug: "bottom-sheet",
    isNew: true,
    name: "Bottom Sheet",
    group: "Overlays",
    summary: "A panel that rises from the bottom, rests at set heights and drags away.",
    imports: ["DialogTrigger", "BottomSheet", "Dialog"],
    preview: () => (
      <div className="relative flex h-44 w-40 flex-col justify-end overflow-hidden rounded-panel border border-line bg-canvas">
        <div aria-hidden className="absolute inset-0 bg-scrim" />
        <div className="relative flex h-3/5 flex-col items-center gap-2 rounded-t-overlay border-t border-line bg-surface px-3 pt-2 shadow-overlay">
          <span className="h-1 w-8 rounded-full bg-line-control" />
          <span className="self-start text-body-sm-strong text-fg">Filters</span>
          <span className="h-1.5 w-full rounded-full bg-muted" />
          <span className="h-1.5 w-2/3 self-start rounded-full bg-muted" />
        </div>
      </div>
    ),
    demo: () => <BottomSheetDemo />,
  },
  {
    slug: "schedule",
    isNew: true,
    name: "Week Schedule",
    group: "Dates",
    summary: "A week or day as a time grid, with overlapping events side by side and the time now.",
    imports: ["Schedule"],
    preview: () => <ScheduleDemo compact />,
    demo: () => <ScheduleDemo />,
  },
];
