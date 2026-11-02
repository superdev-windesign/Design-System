import { useMemo, useRef, useState } from "react";
import { CalendarDate, Time, getLocalTimeZone, isWeekend, today } from "@internationalized/date";
import {
  RiCompass3Fill,
  RiCompass3Line,
  RiHome5Fill,
  RiHome5Line,
  RiInboxFill,
  RiInboxLine,
  RiSearchLine,
  RiUser3Fill,
  RiUser3Line,
} from "@remixicon/react";
import {
  Avatar,
  AvatarGroup,
  Blockquote,
  BottomNavigation,
  Button,
  Calendar,
  Code,
  CodeBlock,
  Container,
  CopyButton,
  DateTimePicker,
  EditableText,
  FormattedNumber,
  Grid,
  Heading,
  Inline,
  Link,
  ListItem,
  PhoneField,
  ProgressCircle,
  Prose,
  RangeCalendar,
  RelativeTime,
  SkipLink,
  Stack,
  Text,
  TimePicker,
  Tour,
  Truncate,
  VirtualList,
  VisuallyHidden,
  toast,
} from "@ds/react";
import type { PhoneValue } from "@ds/react";
import { useLocale } from "react-aria-components";
import type { CatalogEntry } from "./catalog";

// ─── Dates ─────────────────────────────────────────────────────────────────

function CalendarDemo() {
  const { locale } = useLocale();
  const [date, setDate] = useState(new CalendarDate(2026, 11, 12));
  return (
    <Stack gap={3} align="center">
      <Calendar
        aria-label="Delivery day"
        value={date}
        onChange={setDate}
        minValue={today(getLocalTimeZone())}
        isDateUnavailable={(d) => isWeekend(d, locale)}
      />
      <Text size="sm" tone="secondary">
        Weekends are unavailable. Delivery on <strong className="text-body-sm-strong text-fg">{date.toString()}</strong>.
      </Text>
    </Stack>
  );
}

function RangeCalendarDemo({ months = 2 }: { months?: 1 | 2 }) {
  const [range, setRange] = useState({ start: new CalendarDate(2026, 11, 9), end: new CalendarDate(2026, 11, 15) });
  const nights = range.end.compare(range.start);
  return (
    <Stack gap={3} align="center">
      <RangeCalendar aria-label="Stay" value={range} onChange={setRange} visibleMonths={months} />
      <Text size="sm" tone="secondary">
        {nights} {nights === 1 ? "night" : "nights"} · {range.start.toString()} → {range.end.toString()}
      </Text>
    </Stack>
  );
}

function TimePickerDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <TimePicker label="Meeting starts" defaultValue={new Time(9, 30)} interval={15} description="Type it, or pick from 15-minute slots." />
      <TimePicker label="Office hours from" minValue={new Time(8)} maxValue={new Time(18)} interval={60} />
    </div>
  );
}

function DateTimePickerDemo() {
  return (
    <div className="w-full max-w-xs">
      <DateTimePicker label="Publish at" description="The post goes live at this moment, your time." hourCycle={24} />
    </div>
  );
}

// ─── Content ───────────────────────────────────────────────────────────────

function LinkDemo() {
  return (
    <Stack gap={5} className="max-w-md">
      <Text>
        Tokens live in one package and reach components through the <Link href="#/section/foundations">Tailwind bridge</Link>; read the{" "}
        <Link href="https://react-spectrum.adobe.com/react-aria/" isExternal>
          React Aria docs
        </Link>{" "}
        for the behaviour.
      </Text>
      <Link href="#/components/link" variant="standalone">
        View all invoices →
      </Link>
      <Inline gap={4}>
        <Link href="#/components/link" variant="quiet">
          Privacy
        </Link>
        <Link href="#/components/link" variant="quiet">
          Terms
        </Link>
        <Link isDisabled variant="quiet">
          Archived
        </Link>
      </Inline>
    </Stack>
  );
}

const TEAM = [
  { name: "Riley Chen", initials: "RC", color: "blue" as const },
  { name: "Sam Patel", initials: "SP", color: "lime" as const },
  { name: "Jordan Lee", initials: "JL", color: "pink" as const },
  { name: "Ada Lovelace", initials: "AL", color: "neutral" as const },
  { name: "Alan Turing", initials: "AT", color: "blue" as const },
  { name: "Grace Hopper", initials: "GH", color: "lime" as const },
];

function AvatarGroupDemo() {
  return (
    <Stack gap={5} align="start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <AvatarGroup key={size} aria-label="Editors" size={size} max={4} total={size === "lg" ? 48 : undefined}>
          {TEAM.map((p) => (
            <Avatar key={p.name} aria-label={p.name} initials={p.initials} color={p.color} />
          ))}
        </AvatarGroup>
      ))}
    </Stack>
  );
}

function ProgressCircleDemo() {
  const [value, setValue] = useState(64);
  return (
    <Stack gap={5} align="center">
      <Inline gap={6}>
        <ProgressCircle aria-label="Syncing" size="sm" value={value} />
        <ProgressCircle aria-label="Upload" size="md" value={value} showValue />
        <ProgressCircle aria-label="Profile complete" size="lg" value={value} showValue tone="accent" />
        <ProgressCircle aria-label="Loading" size="md" />
      </Inline>
      <Inline gap={2}>
        <Button size="sm" variant="secondary" onPress={() => setValue((v) => Math.max(0, v - 16))}>
          −16
        </Button>
        <Button size="sm" variant="secondary" onPress={() => setValue((v) => Math.min(100, v + 16))}>
          +16
        </Button>
      </Inline>
    </Stack>
  );
}

const SNIPPET = `import { Button } from "@ds/react";
import { RiDownloadLine } from "@remixicon/react";

export function ExportButton() {
  return <Button leadingIcon={RiDownloadLine}>Export</Button>;
}`;

function CodeBlockDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <CodeBlock code={SNIPPET} title="export-button.tsx" language="tsx" showLineNumbers highlightLines={[5]} />
      <CodeBlock code="npm install @ds/react @ds/styles" language="bash" />
    </div>
  );
}

function CopyButtonDemo() {
  return (
    <Stack gap={4} align="center">
      <Inline gap={2} className="rounded-control-md border border-line bg-sunken py-1 ps-3 pe-1">
        <span className="font-mono text-body-sm text-fg">sk_test_4eC39HqLyjWDarjtT1zdp7dc</span>
        <CopyButton value="sk_test_4eC39HqLyjWDarjtT1zdp7dc" iconOnly label="Copy key" />
      </Inline>
      <CopyButton value={() => window.location.href} label="Copy page link" variant="secondary" onCopy={() => toast.success("Link copied")} />
    </Stack>
  );
}

function TypographyDemo() {
  return (
    <Stack gap={6} className="w-full max-w-2xl">
      <Stack gap={2}>
        <Heading level={1}>A design system, set in ink</Heading>
        <Heading level={2}>Section heading</Heading>
        <Heading level={3}>Subsection</Heading>
        <Heading level={4} size="title-sm">
          A level-four heading styled smaller
        </Heading>
      </Stack>
      <Stack gap={2}>
        <Text>Body copy in Instrument Sans. Install it with <Code>npm i @ds/react</Code>, then import what you need.</Text>
        <Text size="sm" tone="secondary">
          Secondary, smaller text for supporting detail.
        </Text>
        <Text size="caption" mono tone="secondary">
          CAPTION · MONO · 12 / 16
        </Text>
        <Inline gap={4}>
          <Text as="span" size="sm" tone="success" strong>
            Published
          </Text>
          <Text as="span" size="sm" tone="warning" strong>
            Draft
          </Text>
          <Text as="span" size="sm" tone="danger" strong>
            Failed
          </Text>
        </Inline>
      </Stack>
      <Blockquote cite="Massimo Vignelli" source="https://www.vignelli.com">
        The life of a designer is a life of fight: fight against the ugliness.
      </Blockquote>
    </Stack>
  );
}

function ProseDemo() {
  return (
    <Prose dropCap className="w-full">
      <p>
        Paper and ink do most of the work. A warm off-white page, near-black type and a single terracotta accent keep the interface calm, so the
        content leads. Corners are crisp and surfaces are ruled rather than floating.
      </p>
      <h2>Why a type pairing</h2>
      <p>
        Fraunces sets headings with a little warmth; Instrument Sans carries the interface; JetBrains Mono marks figures, code and labels such as{" "}
        <code>Fig. 03.2</code>. Read more in the <a href="#/components/typography">typography foundation</a>.
      </p>
      <ul>
        <li>One accent, used for emphasis and selection only.</li>
        <li>Rules before shadows; one shadow for anything floating.</li>
        <li>Every value from a token.</li>
      </ul>
      <blockquote>Make it read like a well-set page before making it move.</blockquote>
    </Prose>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────

function Box({ label }: { label: string }) {
  return <div className="flex h-12 items-center justify-center rounded-control-md border border-line bg-sunken font-mono text-caption text-fg-secondary">{label}</div>;
}

function StackDemo() {
  return (
    <Stack gap={6} className="w-full max-w-xl">
      <Stack gap={2}>
        <Text size="caption" mono tone="secondary">
          Stack gap=2
        </Text>
        <Box label="one" />
        <Box label="two" />
      </Stack>
      <Stack direction="responsive" gap={3}>
        <div className="flex-1">
          <Box label="responsive" />
        </div>
        <div className="flex-1">
          <Box label="column → row at sm" />
        </div>
      </Stack>
      <Inline gap={2}>
        {["Inline", "wraps", "and", "centres", "its", "items"].map((w) => (
          <span key={w} className="rounded-chip border border-line px-2 py-0.5 text-body-sm text-fg">
            {w}
          </span>
        ))}
      </Inline>
    </Stack>
  );
}

function GridDemo() {
  return (
    <Stack gap={6} className="w-full max-w-3xl">
      <Grid columns={3} gap={3}>
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} label={`columns=3 · ${i + 1}`} />
        ))}
      </Grid>
      <Grid minItemWidth={140} gap={2}>
        {Array.from({ length: 8 }, (_, i) => (
          <Box key={i} label={`auto-fill ${i + 1}`} />
        ))}
      </Grid>
    </Stack>
  );
}

function ContainerDemo() {
  return (
    <div className="w-full rounded-surface border border-dashed border-line-control py-4">
      <Container size="sm" className="rounded-control-md bg-sunken py-4">
        <Text size="sm" tone="secondary">
          Container size="sm": centred, max-w-3xl, 20px side padding on phones and 32px from sm. The dashed frame is the page.
        </Text>
      </Container>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function SkipLinkDemo() {
  return (
    <Stack gap={4} className="w-full max-w-md">
      <Text size="sm" tone="secondary">
        Tab into the frame: the skip link appears first and jumps past the navigation to the article.
      </Text>
      <div className="relative overflow-hidden rounded-surface border border-line bg-surface">
        <SkipLink href="#demo-article" className="focus:absolute">
          Skip to article
        </SkipLink>
        <nav aria-label="Demo" className="flex gap-3 border-b border-line px-4 py-3 text-body-sm">
          {["Home", "Shop", "Journal", "About"].map((l) => (
            <a key={l} href="#/components/skip-link" className="rounded-xs text-fg-secondary hover:text-fg">
              {l}
            </a>
          ))}
        </nav>
        <article id="demo-article" className="px-4 py-5 text-body-md text-fg">
          The article starts here.{" "}
          <button type="button" className="rounded-xs text-fg underline decoration-accent-600 underline-offset-4">
            Read more
            <VisuallyHidden> about the article</VisuallyHidden>
          </button>
        </article>
      </div>
    </Stack>
  );
}

function EditableTextDemo() {
  const [title, setTitle] = useState("Q3 launch plan");
  return (
    <Stack gap={5} className="w-full max-w-md">
      <EditableText label="Board title" value={title} onChange={setTitle} textClassName="text-title-lg-strong" validate={(v) => (v ? null : "A board needs a title.")} />
      <Stack gap={1}>
        <Text size="caption" mono tone="secondary">
          FILE NAME
        </Text>
        <EditableText label="File name" defaultValue="brand-guide-v4.fig" maxLength={60} />
      </Stack>
      <Text size="sm" tone="secondary">
        Click or press Enter to edit. Enter saves, Escape cancels.
      </Text>
    </Stack>
  );
}

function PhoneFieldDemo() {
  const [value, setValue] = useState<PhoneValue | null>(null);
  const digits = value?.national.replace(/\D/g, "").length ?? 0;
  const invalid = value !== null && digits > 0 && digits < 6;
  return (
    <Stack gap={3} className="w-full max-w-xs">
      <PhoneField
        label="Mobile number"
        defaultCountry="PT"
        onChange={setValue}
        isInvalid={invalid}
        errorMessage="That number looks too short."
        description="We'll text a sign-in code to this number."
      />
      <Text size="caption" mono tone="secondary">
        E.164: {value?.e164 || "—"}
      </Text>
    </Stack>
  );
}

function TourDemo() {
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLButtonElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  return (
    <Stack gap={5} align="center" className="w-full max-w-lg">
      <div className="flex w-full items-center gap-3 rounded-surface border border-line bg-surface p-3">
        <div ref={searchRef} className="flex flex-1 items-center gap-2 rounded-control-md bg-sunken px-3 py-2 text-body-sm text-fg-secondary">
          <RiSearchLine aria-hidden className="size-4" /> Search boards
        </div>
        <Button ref={newRef} size="sm">
          New board
        </Button>
      </div>
      <div ref={helpRef} className="w-full rounded-surface border border-dashed border-line-control p-4 text-center text-body-sm text-fg-secondary">
        Help and shortcuts live here.
      </div>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        Start the tour
      </Button>
      <Tour
        isOpen={open}
        onOpenChange={setOpen}
        onFinish={() => toast.success("You're all set")}
        steps={[
          { target: searchRef, title: "Find anything", content: "Search boards, cards and people from here, or press Ctrl K anywhere." },
          { target: newRef, title: "Start a board", content: "Boards hold cards in columns. Start from blank or a template.", placement: "bottom end" },
          { target: helpRef, title: "Help is close by", content: "Shortcuts and guides live at the bottom of every page.", placement: "top" },
        ]}
      />
    </Stack>
  );
}

const TABS = [
  { id: "home", label: "Home", icon: RiHome5Line, activeIcon: RiHome5Fill },
  { id: "explore", label: "Explore", icon: RiCompass3Line, activeIcon: RiCompass3Fill },
  { id: "inbox", label: "Inbox", icon: RiInboxLine, activeIcon: RiInboxFill, badge: 3 },
  { id: "you", label: "You", icon: RiUser3Line, activeIcon: RiUser3Fill },
];

function BottomNavigationDemo() {
  const [current, setCurrent] = useState("home");
  return (
    <div className="flex h-96 w-72 flex-col overflow-hidden rounded-panel border border-line bg-canvas shadow-raised">
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Heading level={3} size="title-md">
          {TABS.find((t) => t.id === current)?.label}
        </Heading>
        <Text size="sm" tone="secondary">
          A phone-sized frame. The bar is pinned with fixed in a real app.
        </Text>
      </div>
      <BottomNavigation aria-label="Main" items={TABS} currentId={current} onNavigate={setCurrent} />
    </div>
  );
}

const PEOPLE = Array.from({ length: 5000 }, (_, i) => {
  const first = ["Ada", "Alan", "Grace", "Katherine", "Margaret", "Radia", "Tim", "Barbara", "Edsger", "Frances"][i % 10]!;
  const last = ["Lovelace", "Turing", "Hopper", "Johnson", "Hamilton", "Perlman", "Berners-Lee", "Liskov", "Dijkstra", "Allen"][Math.floor(i / 10) % 10]!;
  return { id: i + 1, name: `${first} ${last}`, email: `${first}.${last}.${i + 1}@example.com`.toLowerCase() };
});

function VirtualListDemo() {
  const [count, setCount] = useState(60);
  const [loading, setLoading] = useState(false);
  const items = useMemo(() => PEOPLE.slice(0, count), [count]);
  return (
    <Stack gap={3} className="w-full max-w-md">
      <VirtualList
        aria-label="Contacts"
        items={items}
        selectionMode="multiple"
        className="h-80"
        isLoading={loading}
        onLoadMore={() => {
          if (loading || count >= PEOPLE.length) return;
          setLoading(true);
          setTimeout(() => {
            setCount((c) => Math.min(PEOPLE.length, c + 200));
            setLoading(false);
          }, 600);
        }}
      >
        {(p) => <ListItem id={p.id} title={p.name} description={p.email} leading={<Avatar size="sm" initials={p.name.split(" ").map((w) => w[0]).join("")} />} />}
      </VirtualList>
      <Text size="caption" mono tone="secondary">
        {count.toLocaleString()} of {PEOPLE.length.toLocaleString()} loaded · only the rows in view are rendered
      </Text>
    </Stack>
  );
}

function TruncateDemo() {
  return (
    <Stack gap={4} className="w-64">
      <div className="rounded-control-md border border-line bg-surface p-3">
        <Truncate className="text-body-md-strong text-fg">Quarterly report — EMEA region, revised after the board review.pdf</Truncate>
        <Text size="caption" tone="secondary">
          Cut to one line; hover or focus it for the rest.
        </Text>
      </div>
      <div className="rounded-control-md border border-line bg-surface p-3">
        <Truncate lines={2} className="text-body-sm text-fg-secondary">
          Two-line clamps suit card descriptions: the paper palette keeps the interface calm so content leads, and the single accent is saved for emphasis and
          selection.
        </Truncate>
      </div>
      <div className="rounded-control-md border border-line bg-surface p-3">
        <Truncate className="text-body-sm text-fg">Short text isn't cut.</Truncate>
      </div>
    </Stack>
  );
}

function FormatDemo() {
  const now = Date.now();
  return (
    <Grid columns={2} gap={4} className="w-full max-w-lg">
      <Stack gap={1.5}>
        <Text size="caption" mono tone="secondary">
          RELATIVE TIME
        </Text>
        {[-40 * 1000, -12 * 60 * 1000, -5 * 3600 * 1000, -26 * 3600 * 1000, 3 * 86400 * 1000, -45 * 86400 * 1000].map((delta) => (
          <Text key={delta} size="sm">
            <RelativeTime date={now + delta} />
          </Text>
        ))}
      </Stack>
      <Stack gap={1.5}>
        <Text size="caption" mono tone="secondary">
          NUMBERS
        </Text>
        <Text size="sm">
          <FormattedNumber value={1284} compact /> followers
        </Text>
        <Text size="sm">
          <FormattedNumber value={3_480_000} compact /> views
        </Text>
        <Text size="sm">
          <FormattedNumber value={1240.5} style="currency" currency="EUR" />
        </Text>
        <Text size="sm">
          <FormattedNumber value={0.184} style="percent" maximumFractionDigits={1} /> conversion
        </Text>
        <Text size="sm">
          <FormattedNumber value={42.195} style="unit" unit="kilometer" />
        </Text>
      </Stack>
    </Grid>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

export const MORE_ENTRIES: CatalogEntry[] = [
  {
    slug: "calendar",
    isNew: true,
    name: "Calendar",
    group: "Dates",
    summary: "A month grid on the page, with unavailable days and keyboard navigation.",
    imports: ["Calendar"],
    preview: () => <Calendar aria-label="Day" defaultValue={new CalendarDate(2026, 11, 12)} className="origin-center scale-75" />,
    demo: () => <CalendarDemo />,
  },
  {
    slug: "range-calendar",
    isNew: true,
    name: "Range Calendar",
    group: "Dates",
    summary: "Pick a start and end on one or more months that stay on the page.",
    imports: ["RangeCalendar"],
    preview: () => <RangeCalendar aria-label="Stay" defaultValue={{ start: new CalendarDate(2026, 11, 9), end: new CalendarDate(2026, 11, 15) }} className="origin-center scale-75" />,
    demo: () => <RangeCalendarDemo />,
  },
  {
    slug: "time-picker",
    isNew: true,
    name: "Time Picker",
    group: "Dates",
    summary: "Type a time, or pick a slot from a list every 15, 30 or 60 minutes.",
    imports: ["TimePicker", "timeSlots"],
    preview: () => (
      <div className="w-full max-w-60">
        <TimePicker label="Meeting starts" defaultValue={new Time(9, 30)} />
      </div>
    ),
    demo: () => <TimePickerDemo />,
  },
  {
    slug: "date-time-picker",
    isNew: true,
    name: "Date-Time Picker",
    group: "Dates",
    summary: "A date and a time in one field, with a calendar and a time row.",
    imports: ["DateTimePicker"],
    preview: () => (
      <div className="w-full max-w-64">
        <DateTimePicker label="Publish at" hourCycle={24} />
      </div>
    ),
    demo: () => <DateTimePickerDemo />,
  },
  {
    slug: "link",
    isNew: true,
    name: "Link",
    group: "Navigation",
    summary: "Ink text with a terracotta underline; inline, standalone and quiet, with external links marked.",
    imports: ["Link"],
    preview: () => (
      <Text className="max-w-60">
        Read the <Link href="#/components/link">token guide</Link> or the{" "}
        <Link href="https://react-spectrum.adobe.com/react-aria/" isExternal>
          React Aria docs
        </Link>
        .
      </Text>
    ),
    demo: () => <LinkDemo />,
  },
  {
    slug: "bottom-navigation",
    isNew: true,
    name: "Bottom Navigation",
    group: "Navigation",
    summary: "The tab bar along the bottom of a phone screen, with badges.",
    imports: ["BottomNavigation"],
    preview: () => (
      <div className="w-72 overflow-hidden rounded-surface border border-line">
        <BottomNavigation aria-label="Main" items={TABS} currentId="home" />
      </div>
    ),
    demo: () => <BottomNavigationDemo />,
  },
  {
    slug: "skip-link",
    isNew: true,
    name: "Skip Link",
    group: "Navigation",
    summary: "The first tab stop: jumps past navigation to the content. With VisuallyHidden.",
    imports: ["SkipLink", "VisuallyHidden"],
    preview: () => (
      <div className="flex flex-col items-start gap-2">
        <span className="rounded-control-md border border-line bg-surface px-3 py-2 text-body-md-strong text-fg shadow-overlay outline-2 outline-offset-2 outline-focus">Skip to content</span>
        <Text size="caption" tone="secondary">
          Hidden until tabbed to.
        </Text>
      </div>
    ),
    demo: () => <SkipLinkDemo />,
  },
  {
    slug: "avatar-group",
    isNew: true,
    name: "Avatar Group",
    group: "Data display",
    summary: "Overlapping avatars with the rest counted as +N.",
    imports: ["AvatarGroup", "Avatar"],
    preview: () => (
      <AvatarGroup aria-label="Editors" size="lg" max={4}>
        {TEAM.map((p) => (
          <Avatar key={p.name} aria-label={p.name} initials={p.initials} color={p.color} />
        ))}
      </AvatarGroup>
    ),
    demo: () => <AvatarGroupDemo />,
  },
  {
    slug: "code-block",
    isNew: true,
    name: "Code Block",
    group: "Data display",
    summary: "Code on sunken paper with a file name, line numbers, highlights and a copy button.",
    imports: ["CodeBlock"],
    preview: () => <CodeBlock code={`<Button leadingIcon={RiDownloadLine}>\n  Export\n</Button>`} title="export.tsx" showLineNumbers className="w-full max-w-72" />,
    demo: () => <CodeBlockDemo />,
  },
  {
    slug: "text",
    isNew: true,
    name: "Text",
    group: "Data display",
    summary: "Heading, Text, Code and Blockquote: the type scale as components.",
    imports: ["Heading", "Text", "Code", "Blockquote"],
    preview: () => (
      <Stack gap={1.5} className="max-w-64">
        <Heading level={2}>Set in ink</Heading>
        <Text size="sm" tone="secondary">
          Body copy with <Code>inline code</Code>.
        </Text>
      </Stack>
    ),
    demo: () => <TypographyDemo />,
  },
  {
    slug: "prose",
    isNew: true,
    name: "Prose",
    group: "Data display",
    summary: "Styles plain HTML (Markdown, CMS content) on the type scale, with a drop cap.",
    imports: ["Prose"],
    preview: () => (
      <Prose dropCap className="max-w-64 text-body-sm">
        <p>Paper and ink do most of the work, so the content leads and the accent stays rare.</p>
      </Prose>
    ),
    demo: () => <ProseDemo />,
  },
  {
    slug: "truncate",
    isNew: true,
    name: "Truncate",
    group: "Data display",
    summary: "Cuts text to a line or two and shows the rest in a tooltip, only when cut.",
    imports: ["Truncate"],
    preview: () => <TruncateDemo />,
  },
  {
    slug: "format",
    isNew: true,
    name: "Relative Time & Numbers",
    group: "Data display",
    summary: "“3 minutes ago”, “1.2K”, currency and units, in the reader's locale.",
    imports: ["RelativeTime", "FormattedNumber", "formatRelativeTime", "formatCompactNumber"],
    preview: () => <FormatDemo />,
  },
  {
    slug: "virtual-list",
    isNew: true,
    name: "Virtual List",
    group: "Data display",
    summary: "Thousands of rows with only the visible ones rendered, and load-more as you scroll.",
    imports: ["VirtualList", "ListItem"],
    preview: () => <VirtualListDemo />,
  },
  {
    slug: "progress-circle",
    isNew: true,
    name: "Progress Circle",
    group: "Feedback",
    summary: "Progress as a ring for tight spots, with the percentage inside at larger sizes.",
    imports: ["ProgressCircle"],
    preview: () => (
      <Inline gap={5}>
        <ProgressCircle aria-label="Upload" value={64} showValue />
        <ProgressCircle aria-label="Profile" size="lg" value={82} showValue tone="accent" />
        <ProgressCircle aria-label="Loading" />
      </Inline>
    ),
    demo: () => <ProgressCircleDemo />,
  },
  {
    slug: "copy-button",
    isNew: true,
    name: "Copy Button",
    group: "Actions",
    summary: "Copies to the clipboard, confirms with a tick and announces it.",
    imports: ["CopyButton", "copyToClipboard"],
    preview: () => <CopyButtonDemo />,
  },
  {
    slug: "editable-text",
    isNew: true,
    name: "Editable Text",
    group: "Forms",
    summary: "Text that becomes a field when clicked. Enter saves, Escape cancels.",
    imports: ["EditableText"],
    preview: () => <EditableText label="Board title" defaultValue="Q3 launch plan" textClassName="text-title-md-strong" />,
    demo: () => <EditableTextDemo />,
  },
  {
    slug: "phone-field",
    isNew: true,
    name: "Phone Field",
    group: "Forms",
    summary: "A phone number with its country calling code, returned in E.164.",
    imports: ["PhoneField", "toE164"],
    preview: () => (
      <div className="w-full max-w-64">
        <PhoneField label="Mobile number" defaultCountry="PT" defaultValue="912 345 678" />
      </div>
    ),
    demo: () => <PhoneFieldDemo />,
  },
  {
    slug: "tour",
    isNew: true,
    name: "Tour",
    group: "Overlays",
    summary: "A short guided walk: each step outlines an element and explains it.",
    imports: ["Tour"],
    preview: () => (
      <div className="flex w-64 flex-col overflow-hidden rounded-overlay border border-line bg-surface p-3 shadow-overlay">
        <span className="font-mono text-caption tracking-wide text-accent-600 uppercase">Step 01 / 03</span>
        <span className="mt-1 text-body-md-strong text-fg">Find anything</span>
        <span className="text-body-sm text-fg-secondary">Search boards, cards and people from here.</span>
        <span className="mt-3 flex justify-end gap-1.5 border-t border-line pt-2.5">
          <span className="h-6 w-12 rounded-control-sm bg-strong" />
        </span>
      </div>
    ),
    demo: () => <TourDemo />,
  },
  {
    slug: "stack",
    isNew: true,
    name: "Stack",
    group: "Layout",
    summary: "Columns and rows on the spacing scale, plus a wrapping Inline row.",
    imports: ["Stack", "Inline"],
    preview: () => (
      <Stack gap={2} className="w-48">
        <Box label="gap 2" />
        <Box label="gap 2" />
      </Stack>
    ),
    demo: () => <StackDemo />,
  },
  {
    slug: "grid",
    isNew: true,
    name: "Grid",
    group: "Layout",
    summary: "Equal columns that collapse on small screens, or as many as fit.",
    imports: ["Grid"],
    preview: () => (
      <Grid columns={3} gap={2} className="w-64">
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} label={String(i + 1)} />
        ))}
      </Grid>
    ),
    demo: () => <GridDemo />,
  },
  {
    slug: "container",
    isNew: true,
    name: "Container",
    group: "Layout",
    summary: "The page column: centred, a max width and side padding.",
    imports: ["Container"],
    preview: () => (
      <div className="w-64 rounded-control-md border border-dashed border-line-control py-3">
        <div className="mx-auto w-40 rounded-control-sm bg-sunken py-3 text-center font-mono text-caption text-fg-secondary">max-w · px</div>
      </div>
    ),
    demo: () => <ContainerDemo />,
  },
];
