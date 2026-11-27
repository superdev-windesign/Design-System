import { useEffect, useState } from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiFolderOpenLine,
  RiGitCommitLine,
  RiInboxLine,
  RiMoreLine,
  RiSearchLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import {
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  DescriptionItem,
  DescriptionList,
  Disclosure,
  EmptyState,
  Image,
  AspectRatio,
  List,
  ListItem,
  Meter,
  ProgressBar,
  ResizablePanel,
  ResizablePanels,
  ScrollArea,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
  Spinner,
  SpinnerGlyph,
  Timeline,
  TimelineItem,
  toast,
} from "@windesign-ds/react";
import type { Selection } from "react-aria-components";
import type { CatalogEntry } from "./catalog";

// A generated picture, so the image demos need no network: paper, a sun and two hills.
// The hex values are the picture's own content, not interface styling.
export const PICTURE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#efe7da"/><circle cx="470" cy="130" r="56" fill="#c2410c"/><path d="M0 300 C140 200 260 220 380 290 S560 330 640 260 V400 H0Z" fill="#7c6f64"/><path d="M0 340 C160 280 300 300 420 350 S580 380 640 340 V400 H0Z" fill="#1f1a17"/></svg>`,
)}`;

// ─── Demos ─────────────────────────────────────────────────────────────────

function ProgressDemo() {
  const [value, setValue] = useState(18);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 8 : v + 7)), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <ProgressBar label="Uploading 12 files" value={value} hint={`${Math.round((value / 100) * 12)} of 12 · about ${Math.max(1, Math.round((100 - value) / 14))}s left`} />
      <ProgressBar label="Preparing export" />
      <ProgressBar aria-label="Profile completion" value={60} size="sm" />
    </div>
  );
}

function MeterDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Meter label="Storage" value={42} valueLabel="4.2 of 10 GB" />
      <Meter label="Seats" value={8} maxValue={10} valueLabel="8 of 10" />
      <Meter label="API quota" value={96} segments={20} hint="Resets in 3 days." />
    </div>
  );
}

function SpinnerDemo() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-end gap-5">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </div>
      <div className="flex items-center gap-5">
        <Spinner size="lg" className="text-fg-secondary" aria-label="Loading, muted" />
        <Spinner size="lg" track={false} aria-label="Loading, no track" />
      </div>
      <Button
        isPending={busy}
        leadingIcon={busy ? SpinnerGlyph : undefined}
        onPress={() => {
          setBusy(true);
          setTimeout(() => setBusy(false), 1600);
        }}
      >
        {busy ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex w-72 flex-col gap-3 rounded-surface border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton shape="text" className="w-2/3" />
          <Skeleton shape="text" className="h-2.5 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <SkeletonGroup label="Loading comment" isLoading={!loaded}>
        {loaded ? (
          <div className="flex w-72 flex-col gap-3 rounded-surface border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <Avatar size="md" initials="RC" color="blue" />
              <div className="flex flex-col">
                <span className="text-body-md-strong text-fg">Riley Chen</span>
                <span className="text-caption text-fg-secondary">2 hours ago</span>
              </div>
            </div>
            <p className="text-body-md text-fg">The new corners read crisper at small sizes. Let's ship the 4px control radius and keep 6 for surfaces.</p>
          </div>
        ) : (
          <SkeletonCard />
        )}
      </SkeletonGroup>
      <Button variant="secondary" size="sm" onPress={() => setLoaded((l) => !l)}>
        {loaded ? "Show loading" : "Finish loading"}
      </Button>
    </div>
  );
}

function EmptyStateDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <EmptyState
        icon={RiInboxLine}
        title="No projects yet"
        description="Projects hold your boards, docs and their history. Start one, or import from a file."
        actions={
          <>
            <Button onPress={() => toast.success("Project created")}>New project</Button>
            <Button variant="secondary" leadingIcon={RiUploadCloud2Line}>
              Import
            </Button>
          </>
        }
        variant="ruled"
      />
      <EmptyState
        icon={RiSearchLine}
        size="sm"
        title="Nothing matches “brutalist”"
        description="Try fewer words, or clear the filters."
        actions={
          <Button variant="tertiary" size="sm">
            Clear filters
          </Button>
        }
        variant="ruled"
      />
    </div>
  );
}

function AlertDemo() {
  const [shown, setShown] = useState(true);
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <Alert tone="info" title="Scheduled maintenance">
        Exports are paused on Sunday from 02:00 to 03:00 UTC.
      </Alert>
      <Alert tone="success" title="Domain verified">
        atlas.studio now serves your published pages.
      </Alert>
      <Alert
        tone="warning"
        title="Your trial ends in 3 days"
        actions={
          <>
            <Button size="sm">Choose a plan</Button>
            <Button size="sm" variant="tertiary">
              Remind me later
            </Button>
          </>
        }
      >
        Keep your boards and history by picking a plan before Thursday.
      </Alert>
      {shown && (
        <Alert tone="danger" title="Couldn't save “Q3 plan”" announce="assertive" onDismiss={() => setShown(false)}>
          The connection dropped. Your changes are kept on this device.
        </Alert>
      )}
      <Alert tone="neutral">
        <strong className="text-body-md-strong">Note.</strong> Tokens change in one place; components never branch on the theme.
      </Alert>
    </div>
  );
}

const TEAM = [
  { id: "ada", name: "Ada Lovelace", role: "Engineering · Lisbon", initials: "AL", color: "blue" as const, badge: "Owner" },
  { id: "alan", name: "Alan Turing", role: "Research · Manchester", initials: "AT", color: "lime" as const },
  { id: "grace", name: "Grace Hopper", role: "Platform · Arlington", initials: "GH", color: "pink" as const },
  { id: "katherine", name: "Katherine Johnson", role: "Data · Hampton", initials: "KJ", color: undefined },
];

function ListDemo({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<Selection>(new Set(["alan"]));
  return (
    <List
      aria-label="Team"
      items={compact ? TEAM.slice(0, 3) : TEAM}
      selectionMode={compact ? "none" : "multiple"}
      selectedKeys={selected}
      onSelectionChange={setSelected}
      onAction={compact ? undefined : (key) => toast.show(`Open ${String(key)}`)}
      className="w-full max-w-md"
    >
      {(person) => (
        <ListItem
          id={person.id}
          title={person.name}
          description={person.role}
          leading={<Avatar size="sm" initials={person.initials} color={person.color} />}
          trailing={person.badge ? <Badge>{person.badge}</Badge> : <span className="font-mono text-caption">Member</span>}
        />
      )}
    </List>
  );
}

function DescriptionListDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <DescriptionList>
        <DescriptionItem term="Order">#1042</DescriptionItem>
        <DescriptionItem term="Customer">Riley Chen</DescriptionItem>
        <DescriptionItem term="Status">
          <Badge>Shipped</Badge>
        </DescriptionItem>
        <DescriptionItem
          term="Tracking"
          action={
            <Button size="xs" variant="tertiary" leadingIcon={RiFileCopyLine} onPress={() => toast.success("Copied")}>
              Copy
            </Button>
          }
        >
          <span className="font-mono">PT 4410 9921 LX</span>
        </DescriptionItem>
      </DescriptionList>
      <DescriptionList layout="grid" columns={3}>
        <DescriptionItem term="Weight">1.2 kg</DescriptionItem>
        <DescriptionItem term="Paper">120 gsm</DescriptionItem>
        <DescriptionItem term="Pages">288</DescriptionItem>
      </DescriptionList>
    </div>
  );
}

function TimelineDemo() {
  return (
    <Timeline aria-label="Activity" className="w-full max-w-md">
      <TimelineItem title="Riley approved the corner scale" time="2h ago" dateTime="2026-11-02T09:40" avatar={<Avatar size="xs" initials="RC" color="blue" />}>
        “4px for controls, 6 for surfaces. Ship it.”
      </TimelineItem>
      <TimelineItem title="Build passed" time="3h ago" tone="success" icon={RiCheckLine} />
      <TimelineItem title="Sam pushed 3 commits to main" time="3h ago" icon={RiGitCommitLine}>
        Re-theme tokens, add the warning status, fix the chart legend.
      </TimelineItem>
      <TimelineItem title="Contrast check flagged chart 8" time="Yesterday" tone="warning" />
      <TimelineItem title="Project created" time="12 Oct" tone="accent" />
    </Timeline>
  );
}

function ImageDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <Image src={PICTURE} alt="A red sun over two hills" ratio={16 / 10} caption="A landscape in warm light: sun, hills and sky." figureLabel="Fig. 1" />
      <Image src="/does-not-exist.jpg" alt="Harbour at dawn" ratio={16 / 10} caption="A failed load keeps its frame and shows the alt text." figureLabel="Fig. 2" />
      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="font-mono text-caption tracking-wide text-fg-secondary uppercase">AspectRatio · 1, 4 / 3, 21 / 9</span>
        <div className="grid grid-cols-3 items-start gap-3">
          {[1, 4 / 3, 21 / 9].map((ratio) => (
            <AspectRatio key={ratio} ratio={ratio} className="rounded-surface border border-line bg-sunken">
              <span className="flex items-center justify-center font-mono text-caption text-fg-secondary">{ratio === 1 ? "1 : 1" : ratio > 2 ? "21 : 9" : "4 : 3"}</span>
            </AspectRatio>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3">
      <Card as="article">
        <CardMedia>
          <Image src={PICTURE} alt="" ratio={16 / 9} rounded={false} />
        </CardMedia>
        <CardHeader kicker="Project" title={<CardTitle href="#/components/card">Atlas design system</CardTitle>} description="Tokens, components and the docs site." />
        <CardFooter>
          <span>Updated 2h ago</span>
        </CardFooter>
      </Card>
      <Card variant="sunken">
        <CardHeader title="Team plan" description="For studios up to 10 people." action={<Button size="sm" variant="tertiary" iconOnly leadingIcon={RiMoreLine} aria-label="More" />} />
        <CardContent>
          <p className="font-display text-display-sm text-fg">
            €48<span className="text-body-md text-fg-secondary"> / month</span>
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" onPress={() => toast.success("Plan chosen")}>
            Choose plan
          </Button>
        </CardFooter>
      </Card>
      <Card variant="raised">
        <CardHeader kicker="Storage" title="4.2 of 10 GB" />
        <CardContent>
          <Meter aria-label="Storage" value={42} showValue={false} />
        </CardContent>
        <CardFooter>
          <span>Files · Images · Exports</span>
        </CardFooter>
      </Card>
    </div>
  );
}

const FAQ = [
  ["How are themes switched?", "Set data-theme on any element. Components read only semantic tokens, so nothing inside branches on the theme."],
  ["Can I change the accent?", "Point the accent ramp at another primitive in the tokens package; checked controls, fills and selections follow."],
  ["Is it accessible?", "Interactive pieces are built on React Aria, so keyboard, focus and screen reader behaviour come with them."],
] as const;

function AccordionDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Accordion numbered defaultExpandedKeys={["0"]}>
        {FAQ.map(([q, a], i) => (
          <AccordionItem key={q} id={String(i)} title={q}>
            {a}
          </AccordionItem>
        ))}
      </Accordion>
      <Disclosure title="Show technical details" className="border-b-0">
        <span className="font-mono text-caption">react-aria-components 1.22 · tailwind 4.3 · tokens via Style Dictionary</span>
      </Disclosure>
    </div>
  );
}

function ResizableDemo({ compact = false }: { compact?: boolean }) {
  return (
    <ResizablePanels className={compact ? "h-40 w-full max-w-sm rounded-surface border border-line bg-surface" : "h-80 w-full max-w-3xl rounded-surface border border-line bg-surface"}>
      <ResizablePanel label="Files" defaultSize={compact ? 42 : 28} minSize={18} maxSize={compact ? 60 : 45}>
        <div className="flex flex-col gap-1 p-3 text-body-sm text-fg-secondary">
          {["tokens/", "styles/", "react/", "playground/"].map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <RiFolderOpenLine aria-hidden className="size-4 text-icon-tertiary" />
              {f}
            </span>
          ))}
        </div>
      </ResizablePanel>
      <ResizablePanel label="Editor">
        {compact ? (
          <div className="flex flex-col gap-2 p-3">
            <span className="h-2 w-3/4 rounded-full bg-muted" />
            <span className="h-2 w-1/2 rounded-full bg-muted" />
            <span className="h-2 w-2/3 rounded-full bg-muted" />
          </div>
        ) : (
          <ResizablePanels orientation="vertical" className="h-full">
            <ResizablePanel label="Source" defaultSize={65} minSize={25}>
              <pre className="p-4 font-mono text-caption text-fg">{`--ds-radius-control-md: 10px;\n--ds-radius-surface: 16px;\n--ds-color-accent-600: lagoon;`}</pre>
            </ResizablePanel>
            <ResizablePanel label="Console" minSize={20}>
              <p className="p-4 font-mono text-caption text-fg-secondary">✓ 598 token tests passed</p>
            </ResizablePanel>
          </ResizablePanels>
        )}
      </ResizablePanel>
    </ResizablePanels>
  );
}

const RELEASES = Array.from({ length: 14 }, (_, i) => ({
  version: `0.${14 - i}.0`,
  note: ["Warning status tokens", "Menu and Menubar", "Resizable panels", "Editorial re-theme", "Charts on ChartCard", "Templates", "Command palette"][i % 7],
}));

function ScrollAreaDemo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ScrollArea aria-label="Changelog" className={compact ? "h-40 rounded-surface border border-line bg-surface" : "h-64 rounded-surface border border-line bg-surface"}>
        <ol className="flex flex-col">
          {RELEASES.map((r) => (
            <li key={r.version} className="flex items-baseline gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
              <span className="w-12 font-mono text-caption text-fg-secondary">{r.version}</span>
              <span className="text-body-md text-fg">{r.note}</span>
            </li>
          ))}
        </ol>
      </ScrollArea>
      {!compact && (
        <ScrollArea aria-label="Swatches" orientation="horizontal" className="rounded-surface border border-line bg-surface">
          <div className="flex w-max gap-3 p-4">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="flex w-24 flex-col gap-1.5">
                <span className="h-14 rounded-control-md" style={{ background: `var(--ds-color-chart-${i + 1})` }} />
                <span className="font-mono text-caption text-fg-secondary">chart.{i + 1}</span>
              </span>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

export const FEEDBACK_ENTRIES: CatalogEntry[] = [
  {
    slug: "progress-bar",
    isNew: true,
    name: "Progress Bar",
    group: "Feedback",
    summary: "How far along a task is, or a sweep while the length isn't known.",
    imports: ["ProgressBar"],
    preview: () => (
      <div className="flex w-full max-w-64 flex-col gap-5">
        <ProgressBar label="Uploading" value={64} />
        <ProgressBar aria-label="Preparing" />
      </div>
    ),
    demo: () => <ProgressDemo />,
  },
  {
    slug: "meter",
    isNew: true,
    name: "Meter",
    group: "Feedback",
    summary: "A quantity in a known range that turns amber, then red, and says so in words.",
    imports: ["Meter"],
    preview: () => (
      <div className="flex w-full max-w-64 flex-col gap-5">
        <Meter label="Storage" value={42} />
        <Meter label="API quota" value={92} segments={16} />
      </div>
    ),
    demo: () => <MeterDemo />,
  },
  {
    slug: "spinner",
    isNew: true,
    name: "Spinner",
    group: "Feedback",
    summary: "A pen-nib arc turning on a faint track: five sizes, the accent by default, and a bare glyph for Button's icon slot.",
    imports: ["Spinner", "SpinnerGlyph"],
    preview: () => (
      <div className="flex items-end gap-5">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="lg" className="text-fg-secondary" aria-label="Loading, muted" />
      </div>
    ),
    demo: () => <SpinnerDemo />,
  },
  {
    slug: "skeleton",
    isNew: true,
    name: "Skeleton",
    group: "Feedback",
    summary: "Placeholder paper where content is about to land, so nothing jumps.",
    imports: ["Skeleton", "SkeletonText", "SkeletonGroup"],
    preview: () => <SkeletonCard />,
    demo: () => <SkeletonDemo />,
  },
  {
    slug: "empty-state",
    isNew: true,
    name: "Empty State",
    group: "Feedback",
    summary: "What to show when there's nothing yet, and how to get started.",
    imports: ["EmptyState"],
    preview: () => <EmptyState icon={RiInboxLine} size="sm" title="No projects yet" actions={<Button size="sm">New project</Button>} />,
    demo: () => <EmptyStateDemo />,
  },
  {
    slug: "alert",
    isNew: true,
    name: "Alert",
    group: "Feedback",
    summary: "An inline callout in five tones, each with its own icon, optionally announced.",
    imports: ["Alert"],
    preview: () => (
      <div className="flex w-full max-w-72 flex-col gap-2">
        <Alert tone="warning" title="Trial ends in 3 days" />
        <Alert tone="success" title="Domain verified" />
      </div>
    ),
    demo: () => <AlertDemo />,
  },
];

export const DATA_DISPLAY_ENTRIES: CatalogEntry[] = [
  {
    slug: "list",
    isNew: true,
    name: "List",
    group: "Data display",
    summary: "Ruled rows that can be selected, opened and hold their own actions.",
    imports: ["List", "ListItem"],
    preview: () => <ListDemo compact />,
    demo: () => <ListDemo />,
  },
  {
    slug: "description-list",
    isNew: true,
    name: "Description List",
    group: "Data display",
    summary: "Terms and values on ruled rows, stacked, or as a grid of facts.",
    imports: ["DescriptionList", "DescriptionItem"],
    preview: () => (
      <DescriptionList className="w-full max-w-72">
        <DescriptionItem term="Order">#1042</DescriptionItem>
        <DescriptionItem term="Status">Shipped</DescriptionItem>
        <DescriptionItem term="Total">€86.00</DescriptionItem>
      </DescriptionList>
    ),
    demo: () => <DescriptionListDemo />,
  },
  {
    slug: "timeline",
    isNew: true,
    name: "Timeline",
    group: "Data display",
    summary: "Events along a ruled spine: an activity feed, a changelog, an order's history.",
    imports: ["Timeline", "TimelineItem"],
    preview: () => (
      <Timeline className="w-full max-w-64">
        <TimelineItem title="Approved" time="2h" tone="accent" />
        <TimelineItem title="Build passed" time="3h" tone="success" />
        <TimelineItem title="Project created" time="12 Oct" />
      </Timeline>
    ),
    demo: () => <TimelineDemo />,
  },
  {
    slug: "image",
    isNew: true,
    name: "Image",
    group: "Data display",
    summary: "An image that loads on skeleton paper, falls back quietly, and takes a figure caption. With AspectRatio.",
    imports: ["Image", "AspectRatio"],
    preview: () => (
      <div className="w-56">
        <Image src={PICTURE} alt="A red sun over two hills" ratio={16 / 10} caption="Sun, hills and sky." figureLabel="Fig. 1" />
      </div>
    ),
    demo: () => <ImageDemo />,
  },
];

export const LAYOUT_ENTRIES: CatalogEntry[] = [
  {
    slug: "card",
    isNew: true,
    name: "Card",
    group: "Layout",
    summary: "A ruled panel for one subject, with a title link that makes the whole card clickable.",
    imports: ["Card", "CardHeader", "CardTitle", "CardContent", "CardFooter", "CardMedia"],
    preview: () => (
      <Card className="w-64">
        <CardHeader kicker="Project" title="Atlas design system" description="Tokens, components, docs." />
        <CardFooter>Updated 2h ago</CardFooter>
      </Card>
    ),
    demo: () => <CardDemo />,
  },
  {
    slug: "accordion",
    isNew: true,
    name: "Accordion",
    group: "Layout",
    summary: "Ruled sections that open under their headings, numbered like a printed document.",
    imports: ["Accordion", "AccordionItem", "Disclosure"],
    preview: () => (
      <Accordion numbered className="w-full max-w-72">
        {FAQ.map(([q, a], i) => (
          <AccordionItem key={q} id={String(i)} title={q}>
            {a}
          </AccordionItem>
        ))}
      </Accordion>
    ),
    demo: () => <AccordionDemo />,
  },
  {
    slug: "resizable",
    isNew: true,
    name: "Resizable Panels",
    group: "Layout",
    summary: "Panes with draggable, keyboard-operable handles between them.",
    imports: ["ResizablePanels", "ResizablePanel"],
    preview: () => <ResizableDemo compact />,
    demo: () => <ResizableDemo />,
  },
  {
    slug: "scroll-area",
    isNew: true,
    name: "Scroll Area",
    group: "Layout",
    summary: "A scrolling region with thin scrollbars and a rule along any edge with more past it.",
    imports: ["ScrollArea"],
    preview: () => <ScrollAreaDemo compact />,
    demo: () => <ScrollAreaDemo />,
  },
];
