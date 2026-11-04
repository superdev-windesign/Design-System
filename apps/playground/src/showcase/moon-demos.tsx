import { useState, type ReactNode } from "react";
import { Time, getLocalTimeZone, today } from "@internationalized/date";
import {
  RiBankCardLine,
  RiBarChartBoxLine,
  RiBookOpenLine,
  RiCompass3Line,
  RiCustomerService2Line,
  RiFileList3Line,
  RiGroupLine,
  RiHome5Line,
  RiMoonClearLine,
  RiSettings3Line,
  RiUserLine,
  RiWalletLine,
} from "@remixicon/react";
import {
  AppSidebar,
  AuthFlow,
  Avatar,
  Button,
  DateTimeRangePicker,
  ExpandableTable,
  Leaderboard,
  MetricChart,
  PaymentFields,
  SearchBox,
  SnapSheet,
  StatusDot,
  TagCombobox,
  toast,
  useTheme,
} from "@ds/react";
import type {
  AppSidebarSection,
  ExpandableTableColumn,
  LeaderboardEntry,
  MetricChartMetric,
  PaymentValue,
  SearchResultGroup,
  TagComboboxGroup,
} from "@ds/react";
import type { CatalogEntry } from "./catalog";

// ─── The brand hint ────────────────────────────────────────────────────────

/** These are built for Moon, so offer it to anyone still on the house brand. */
function ViewInMoon() {
  const { brand, setBrand } = useTheme();
  if (brand === "moon") return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-surface bg-sunken px-3 py-2">
      <p className="text-body-sm text-fg-secondary">Built on tokens, so this follows whichever brand is on.</p>
      <Button
        variant="secondary"
        size="xs"
        onPress={(event) => {
          const box = event.target.getBoundingClientRect();
          setBrand("moon", { x: box.left + box.width / 2, y: box.top + box.height / 2 });
        }}
      >
        View in Moon
      </Button>
    </div>
  );
}

function Demo({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <ViewInMoon />
      {children}
    </div>
  );
}

// ─── Date & time range ─────────────────────────────────────────────────────

function DateTimeRangeDemo() {
  const start = today(getLocalTimeZone());
  return (
    <DateTimeRangePicker
      defaultValue={{ start, end: start.add({ days: 4 }), startTime: new Time(9, 0), endTime: new Time(17, 30) }}
      onApply={(range) => toast.success(`${range.start.toString()} to ${range.end.toString()}`)}
      className="max-w-full"
    />
  );
}

// ─── Auth flow ─────────────────────────────────────────────────────────────

function AuthFlowDemo() {
  return (
    <div className="w-full max-w-sm">
      <AuthFlow
        onProvider={(provider) => toast.show(`Continue with ${provider}`)}
        onComplete={() => toast.success("Signed in")}
        // Any code but all zeros goes through, so both paths can be tried here.
        onVerify={(code) => (code === "000000" ? "That code didn't match. Try another." : true)}
      />
    </div>
  );
}

// ─── Leaderboard ───────────────────────────────────────────────────────────

const PLAYERS = ["Mira Okafor", "Jonas Lind", "Priya Raman", "Tomás Vega", "Aiko Tanaka", "Lena Fischer", "Sam Adeyemi", "Noor Haddad", "Ivan Petrov", "Grace Lin", "Omar Farouk", "Eva Novak"];

function board(seed: number): LeaderboardEntry[] {
  return PLAYERS.map((name, index) => ({
    id: name,
    name,
    score: Math.round(98_000 / (index + 1 + (seed % 3)) + ((index * 137 + seed * 53) % 900)),
    change: ((index * 5 + seed) % 7) - 3,
  }));
}

const BOARD_PERIODS = [
  { id: "day", label: "Day", entries: board(1) },
  { id: "week", label: "Week", entries: board(2) },
  { id: "all", label: "All time", entries: board(4) },
];

const LeaderboardDemo = () => <Leaderboard title="Top players" periods={BOARD_PERIODS} currentUserId="Ivan Petrov" scoreLabel="Points" className="w-full max-w-lg" />;

// ─── Metric chart ──────────────────────────────────────────────────────────

/** A steady series with a bit of texture, the same on every render. */
function series(labels: string[], base: number, step: number) {
  return labels.map((label, index) => {
    const wobble = ((index * 37) % 11) - 5;
    return { label, value: base + step * index + wobble * step, previous: base * 0.9 + step * index * 0.7 + (((index * 23) % 9) - 4) * step };
  });
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

const METRICS: MetricChartMetric[] = [
  {
    id: "revenue",
    label: "Revenue",
    formatValue: money,
    points: { week: series(DAYS, 3_200, 120), month: series(WEEKS, 21_000, 650), year: series(MONTHS, 88_000, 2_400) },
  },
  {
    id: "players",
    label: "Active players",
    aggregate: "average",
    points: { week: series(DAYS, 1_180, 22), month: series(WEEKS, 1_240, 30), year: series(MONTHS, 980, 42) },
  },
  {
    id: "churn",
    label: "Refunds",
    lowerIsBetter: true,
    formatValue: money,
    points: { week: series(DAYS, 420, -8), month: series(WEEKS, 2_800, -40), year: series(MONTHS, 12_400, -120) },
  },
];

const CHART_PERIODS = [
  { id: "week", label: "7 days" },
  { id: "month", label: "8 weeks" },
  { id: "year", label: "12 months" },
];

const MetricChartDemo = () => <MetricChart title="Performance" metrics={METRICS} periods={CHART_PERIODS} defaultPeriod="month" className="w-full" />;

// ─── App sidebar ───────────────────────────────────────────────────────────

const SIDEBAR: AppSidebarSection[] = [
  {
    id: "main",
    items: [
      { id: "home", label: "Home", icon: RiHome5Line },
      { id: "discover", label: "Discover", icon: RiCompass3Line, badge: "New" },
      {
        id: "reports",
        label: "Reports",
        icon: RiBarChartBoxLine,
        items: [
          { id: "reports-revenue", label: "Revenue" },
          { id: "reports-players", label: "Players" },
          { id: "reports-refunds", label: "Refunds" },
        ],
      },
      { id: "wallet", label: "Wallet", icon: RiWalletLine },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "team", label: "Team", icon: RiGroupLine, badge: 12 },
      { id: "guides", label: "Guides", icon: RiBookOpenLine },
      { id: "settings", label: "Settings", icon: RiSettings3Line },
    ],
  },
];

function AppSidebarDemo() {
  const [selected, setSelected] = useState("reports-revenue");
  return (
    <div className="flex h-160 w-full overflow-hidden rounded-surface border border-line">
      <AppSidebar
        aria-label="Workspace"
        sections={SIDEBAR}
        selected={selected}
        onSelect={setSelected}
        header={({ collapsed }) => (
          <div className="flex h-10 items-center gap-2 px-1.5 text-body-md-strong text-fg">
            <RiMoonClearLine aria-hidden className="size-6 shrink-0 text-accent-600" />
            {!collapsed && "Northwind"}
          </div>
        )}
        footer={({ collapsed }) => (
          <div className="flex items-center gap-2 px-1 py-1.5">
            <Avatar initials="M" size="sm" />
            {!collapsed && <span className="truncate text-body-sm text-fg">Mira Okafor</span>}
          </div>
        )}
      />
      <div className="hidden min-w-0 flex-1 items-center justify-center bg-sunken p-4 text-center text-body-sm text-fg-secondary sm:flex">{selected}</div>
    </div>
  );
}

// ─── Expandable table ──────────────────────────────────────────────────────

interface Invoice {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: "Paid" | "Open" | "Overdue";
  lines: { item: string; amount: number }[];
}

const CUSTOMERS = ["Halden & Co", "Brightside", "Nordlys", "Tidewater", "Fennel Labs", "Marlowe", "Quillon", "Aster Group", "Kestrel", "Oakline", "Ember Studio", "Vanta Works"];
const PLANS = ["Starter", "Team", "Business"];
const STATUSES: Invoice["status"][] = ["Paid", "Paid", "Open", "Paid", "Overdue"];

const INVOICES: Invoice[] = CUSTOMERS.map((customer, index) => {
  const seats = 120 + ((index * 73) % 500);
  const support = index % 3 === 0 ? 90 : 0;
  return {
    id: `INV-${2041 + index}`,
    customer,
    plan: PLANS[index % PLANS.length]!,
    amount: seats + support,
    status: STATUSES[index % STATUSES.length]!,
    lines: [{ item: "Seats", amount: seats }, ...(support ? [{ item: "Priority support", amount: support }] : [])],
  };
});

const STATUS_COLOR = { Paid: "green", Open: "indigo", Overdue: "yellow" } as const;

const INVOICE_COLUMNS: ExpandableTableColumn<Invoice>[] = [
  { key: "id", label: "Invoice", render: (row) => <span className="whitespace-nowrap text-body-md-strong text-fg">{row.id}</span>, sortValue: (row) => row.id },
  { key: "customer", label: "Customer", render: (row) => row.customer, sortValue: (row) => row.customer },
  { key: "status", label: "Status", render: (row) => <span className="inline-flex items-center gap-1.5"><StatusDot color={STATUS_COLOR[row.status]} />{row.status}</span>, sortValue: (row) => row.status },
  { key: "amount", label: "Amount", align: "end", render: (row) => <span className="tabular-nums">{money(row.amount)}</span>, sortValue: (row) => row.amount },
];

function ExpandableTableDemo() {
  return (
    <ExpandableTable
      aria-label="Invoices"
      columns={INVOICE_COLUMNS}
      rows={INVOICES}
      getRowId={(row) => row.id}
      getRowLabel={(row) => `${row.id}, ${row.customer}`}
      selectable
      defaultSort={{ key: "id", direction: "ascending" }}
      renderBulkActions={(selected, clear) => (
        <Button
          variant="secondary"
          size="xs"
          onPress={() => {
            toast.success(`Sent ${selected.length} reminder${selected.length === 1 ? "" : "s"}`);
            clear();
          }}
        >
          Send reminder
        </Button>
      )}
      renderExpanded={(row) => (
        <dl className="flex max-w-xs flex-col gap-1 text-body-sm">
          {[{ item: "Plan", amount: null }, ...row.lines].map((line) => (
            <div key={line.item} className="flex justify-between gap-6">
              <dt className="text-fg-secondary">{line.item}</dt>
              <dd className="tabular-nums text-fg">{line.amount === null ? row.plan : money(line.amount)}</dd>
            </div>
          ))}
        </dl>
      )}
      className="w-full"
    />
  );
}

// ─── Tag combobox ──────────────────────────────────────────────────────────

const REGIONS: TagComboboxGroup[] = [
  {
    id: "europe",
    label: "Europe",
    options: [
      { id: "de", label: "Germany", keywords: "DE" },
      { id: "fr", label: "France", keywords: "FR" },
      { id: "es", label: "Spain", keywords: "ES" },
      { id: "se", label: "Sweden", keywords: "SE" },
      { id: "pl", label: "Poland", keywords: "PL" },
    ],
  },
  {
    id: "asia",
    label: "Asia",
    options: [
      { id: "in", label: "India", keywords: "IN" },
      { id: "jp", label: "Japan", keywords: "JP" },
      { id: "sg", label: "Singapore", keywords: "SG" },
      { id: "kr", label: "South Korea", keywords: "KR" },
    ],
  },
  {
    id: "americas",
    label: "Americas",
    options: [
      { id: "us", label: "United States", keywords: "US USA" },
      { id: "ca", label: "Canada", keywords: "CA" },
      { id: "br", label: "Brazil", keywords: "BR" },
    ],
  },
];

const TagComboboxDemo = () => <TagCombobox label="Markets" groups={REGIONS} defaultSelectedKeys={["de", "in", "jp", "us", "br", "se"]} description="Past four, the rest fold into a count." />;

// ─── Search box ────────────────────────────────────────────────────────────

const SEARCHABLE: SearchResultGroup[] = [
  {
    id: "pages",
    label: "Pages",
    results: [
      { id: "billing", title: "Billing", description: "Invoices and payment methods", icon: RiBankCardLine },
      { id: "reports", title: "Reports", description: "Revenue, players and refunds", icon: RiFileList3Line },
      { id: "support", title: "Support", description: "Open a ticket with the team", icon: RiCustomerService2Line },
    ],
  },
  {
    id: "people",
    label: "People",
    results: PLAYERS.slice(0, 6).map((name) => ({ id: `person-${name}`, title: name, description: "Member", icon: RiUserLine })),
  },
];

/** Stands in for a request, so the loading state and stale answers are real. */
function findResults(query: string) {
  const needle = query.toLowerCase();
  const matches = (text?: string) => text?.toLowerCase().includes(needle);
  return new Promise<SearchResultGroup[]>((resolve) => {
    setTimeout(() => {
      resolve(SEARCHABLE.map((group) => ({ ...group, results: group.results.filter((result) => matches(result.title) || matches(result.description)) })));
    }, 350);
  });
}

function SearchBoxDemo() {
  const [recent, setRecent] = useState(["Refund policy", "Mira Okafor", "Billing"]);
  return (
    <SearchBox
      aria-label="Search the workspace"
      placeholder="Search pages and people"
      onSearch={findResults}
      onSelect={(result) => toast.show(`Opened ${result.title}`)}
      onSubmit={(query) => toast.show(`Searched for “${query}”`)}
      recent={recent}
      onClearRecent={() => setRecent([])}
    />
  );
}

// ─── Snap sheet ────────────────────────────────────────────────────────────

const ORDER = ["Team plan, 12 seats", "Priority support", "Extra storage, 200 GB", "Audit log", "Single sign-on", "Custom domain", "Usage alerts", "Two regions", "Data export", "Sandbox workspace", "Onboarding call"];

function SnapSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="self-start" onPress={() => setOpen(true)}>
        Open sheet
      </Button>
      <SnapSheet
        isOpen={open}
        onOpenChange={setOpen}
        title="Your order"
        footer={
          <Button className="w-full" onPress={() => setOpen(false)}>
            Continue
          </Button>
        }
      >
        <ul className="flex flex-col divide-y divide-line">
          {ORDER.map((line) => (
            <li key={line} className="py-3 text-body-md text-fg">
              {line}
            </li>
          ))}
        </ul>
      </SnapSheet>
    </>
  );
}

// ─── Payment fields ────────────────────────────────────────────────────────

function PaymentFieldsDemo() {
  const [value, setValue] = useState<PaymentValue | null>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {/* A published test number: it passes the checks but can't be charged. */}
      <PaymentFields defaultValue={{ name: "Mira Okafor", number: "4242424242424242" }} onChange={setValue} />
      <p className="text-body-sm text-fg-secondary">This demo sends nothing. {value?.isValid ? "Details look complete." : "Fill in the rest to pay."}</p>
      <Button isDisabled={!value?.isValid}>Pay $48.00</Button>
    </div>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

const entry = (config: Omit<CatalogEntry, "group" | "isNew" | "demo"> & { demo: () => ReactNode }): CatalogEntry => ({
  ...config,
  group: "Moon",
  isNew: true,
  demo: () => <Demo>{config.demo()}</Demo>,
});

export const MOON_ENTRIES: CatalogEntry[] = [
  entry({
    slug: "date-time-range-picker",
    name: "Date & Time Range",
    summary: "Two months, presets and hour-and-minute columns for a start and an end.",
    imports: ["DateTimeRangePicker"],
    preview: () => <DateTimeRangeDemo />,
    demo: () => <DateTimeRangeDemo />,
  }),
  entry({
    slug: "auth-flow",
    name: "Auth Flow",
    summary: "Sign in, sign up, reset and a one-time code as a single flow.",
    imports: ["AuthFlow"],
    aliases: ["Login", "Sign in", "OTP"],
    preview: () => <AuthFlowDemo />,
    demo: () => <AuthFlowDemo />,
  }),
  entry({
    slug: "leaderboard",
    name: "Leaderboard",
    summary: "A podium and ranked rows, with the current player pinned when they're off the list.",
    imports: ["Leaderboard"],
    aliases: ["Ranking"],
    preview: () => <LeaderboardDemo />,
    demo: () => <LeaderboardDemo />,
  }),
  entry({
    slug: "metric-chart",
    name: "Metric Chart",
    summary: "One chart with metric tabs, periods, line or bars and a comparison.",
    imports: ["MetricChart"],
    aliases: ["Analytics", "KPI chart"],
    preview: () => <MetricChartDemo />,
    demo: () => <MetricChartDemo />,
  }),
  entry({
    slug: "app-sidebar",
    name: "App Sidebar",
    summary: "Grouped navigation with nested rows that folds down to an icon rail.",
    imports: ["AppSidebar"],
    aliases: ["Navigation rail"],
    preview: () => <AppSidebarDemo />,
    demo: () => <AppSidebarDemo />,
  }),
  entry({
    slug: "expandable-table",
    name: "Expandable Table",
    summary: "Sorting, paging, row selection with bulk actions, and rows that open for detail.",
    imports: ["ExpandableTable"],
    preview: () => <ExpandableTableDemo />,
    demo: () => <ExpandableTableDemo />,
  }),
  entry({
    slug: "tag-combobox",
    name: "Tag Combobox",
    summary: "Many choices from a long grouped list, kept to a line or two as tags.",
    imports: ["TagCombobox"],
    aliases: ["Multi select"],
    preview: () => <TagComboboxDemo />,
    demo: () => <TagComboboxDemo />,
  }),
  entry({
    slug: "search-box",
    name: "Search Box",
    summary: "Recent searches, debounced results in groups, and the match picked out.",
    imports: ["SearchBox"],
    aliases: ["Autocomplete", "Typeahead"],
    preview: () => <SearchBoxDemo />,
    demo: () => <SearchBoxDemo />,
  }),
  entry({
    slug: "snap-sheet",
    name: "Snap Sheet",
    summary: "A bottom sheet with resting heights, dragged or moved with the keyboard.",
    imports: ["SnapSheet"],
    aliases: ["Drawer", "Bottom sheet"],
    preview: () => <SnapSheetDemo />,
    demo: () => <SnapSheetDemo />,
  }),
  entry({
    slug: "payment-fields",
    name: "Payment Fields",
    summary: "Card details in one joined group: formatting, network detection and checks.",
    imports: ["PaymentFields"],
    aliases: ["Credit card", "Checkout"],
    preview: () => <PaymentFieldsDemo />,
    demo: () => <PaymentFieldsDemo />,
  }),
];
