import { useEffect, useState } from "react";
import { RiFolder3Line, RiHome5Line } from "@remixicon/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  CalendarTemplate,
  Composer,
  OrdersChartCard,
  Select,
  SelectItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Text,
  toast,
} from "@windesign-ds/react";
import type { ComposerMessage } from "@windesign-ds/react";
import type { CatalogEntry } from "./catalog";
import { TemplateFrame, TemplatePreview } from "./templates-demos";

/**
 * Entries and demos that close the gaps found against the reference
 * component list: the Composer block, the Orders Chart, the Calendar
 * template, and fuller demos for Breadcrumb, Select and Table.
 */

// ─── Fuller demos for existing entries ────────────────────────────────────

export function BreadcrumbDemo() {
  return (
    <Stack gap={6} className="w-full max-w-xl">
      <Breadcrumb>
        <BreadcrumbItem href="#/components/breadcrumb" icon={RiHome5Line}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#/components/breadcrumb">Projects</BreadcrumbItem>
        <BreadcrumbItem current>Roadmap</BreadcrumbItem>
      </Breadcrumb>
      <Stack gap={2}>
        <Text size="caption" mono tone="secondary">
          COLLAPSED · maxItems=3
        </Text>
        <Breadcrumb maxItems={3}>
          <BreadcrumbItem href="#/components/breadcrumb" icon={RiHome5Line}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="#/components/breadcrumb">Workspace</BreadcrumbItem>
          <BreadcrumbItem href="#/components/breadcrumb">Design</BreadcrumbItem>
          <BreadcrumbItem href="#/components/breadcrumb" icon={RiFolder3Line}>
            Brand
          </BreadcrumbItem>
          <BreadcrumbItem href="#/components/breadcrumb">Logos</BreadcrumbItem>
          <BreadcrumbItem current>Primary mark.svg</BreadcrumbItem>
        </Breadcrumb>
        <Text size="sm" tone="secondary">
          The middle levels fold into the … menu, which lists them as links.
        </Text>
      </Stack>
    </Stack>
  );
}

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "Colombia", "Denmark", "Egypt", "Finland", "France",
  "Germany", "Ghana", "Greece", "India", "Indonesia", "Ireland", "Italy", "Japan", "Kenya", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Peru", "Poland", "Portugal", "Singapore", "South Africa", "South Korea", "Spain", "Sweden",
  "Switzerland", "Thailand", "Turkey", "United Kingdom", "United States", "Vietnam",
];

export function SelectDemo() {
  return (
    <Stack gap={5} className="w-full max-w-xs">
      <Stack gap={2}>
        <Text size="sm" strong>
          Team
        </Text>
        <Select aria-label="Team" defaultSelectedKey="design">
          <SelectItem id="design" textValue="Design">
            Design
          </SelectItem>
          <SelectItem id="engineering" textValue="Engineering">
            Engineering
          </SelectItem>
          <SelectItem id="research" textValue="Research">
            Research
          </SelectItem>
        </Select>
      </Stack>
      <Stack gap={2}>
        <Text size="sm" strong>
          Country, with search
        </Text>
        <Select aria-label="Country" isSearchable searchPlaceholder="Search countries" defaultSelectedKey="Portugal">
          {COUNTRIES.map((c) => (
            <SelectItem key={c} id={c} textValue={c}>
              {c}
            </SelectItem>
          ))}
        </Select>
        <Text size="sm" tone="secondary">
          Type in the list to filter it; arrow keys still move through what's left.
        </Text>
      </Stack>
    </Stack>
  );
}

const ORDERS = Array.from({ length: 24 }, (_, i) => ({
  id: 1040 + i,
  customer: ["Riley Chen", "Sam Patel", "Jordan Lee", "Ada Lovelace", "Alan Turing", "Grace Hopper"][i % 6]!,
  status: ["Shipped", "Processing", "Delivered"][i % 3]!,
  total: `$${(120 + ((i * 137) % 1900)).toLocaleString()}`,
}));

export function TableDemo() {
  return (
    <Stack gap={2} className="w-full max-w-xl">
      <div className="overflow-hidden rounded-surface border border-line">
        <Table aria-label="Orders" stickyHeader containerClassName="max-h-80">
          <TableHeader>
            <TableColumn isRowHeader>Order</TableColumn>
            <TableColumn>Customer</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn className="text-end">Total</TableColumn>
          </TableHeader>
          <TableBody items={ORDERS}>
            {(order) => (
              <TableRow id={order.id}>
                <TableCell className="font-mono">#{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell className="text-end tabular-nums">{order.total}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Text size="sm" tone="secondary">
        With stickyHeader, the column names stay put while the rows scroll.
      </Text>
    </Stack>
  );
}

// ─── Composer ──────────────────────────────────────────────────────────────

function ComposerDemo({ compact = false }: { compact?: boolean }) {
  const [working, setWorking] = useState(false);
  const [last, setLast] = useState<ComposerMessage | null>(null);
  useEffect(() => {
    if (!working) return;
    const id = setTimeout(() => setWorking(false), 3500);
    return () => clearTimeout(id);
  }, [working]);
  return (
    <Stack gap={3} className={compact ? "w-full max-w-md" : "w-full max-w-2xl"}>
      <Composer
        isWorking={working}
        onStop={() => setWorking(false)}
        onSubmit={(message) => {
          setLast(message);
          setWorking(true);
        }}
        onVoiceChange={(listening) => listening && toast.show("Listening…")}
        status={compact ? undefined : { branch: "main", project: "windesign", mode: "Ask before edits", context: 0.42 }}
      />
      {!compact && (
        <Text size="caption" mono tone="secondary">
          {last ? `Sent “${last.text || "(files only)"}” to ${last.model}${last.files.length ? ` with ${last.files.length} file(s)` : ""}` : "Enter sends · Shift+Enter adds a line · + attaches files"}
        </Text>
      )}
    </Stack>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

export const PARITY_ENTRIES: CatalogEntry[] = [
  {
    slug: "composer",
    isNew: true,
    name: "Composer",
    group: "Blocks",
    summary: "The one-line chat input: attach, pick a model, dictate, send; a light band while the agent works.",
    imports: ["Composer"],
    preview: () => <ComposerDemo compact />,
    demo: () => <ComposerDemo />,
  },
  {
    slug: "orders-chart",
    isNew: true,
    name: "Orders Chart",
    group: "Charts",
    summary: "A year of monthly orders as bars, this year beside last, with a counting headline.",
    imports: ["OrdersChartCard"],
    preview: () => <OrdersChartCard className="w-full max-w-md" />,
  },
  {
    slug: "calendar-template",
    isNew: true,
    name: "Calendar",
    group: "Templates",
    summary: "A calendar app: a month to jump around in, calendars to show or hide, and month, week or day views.",
    imports: ["CalendarTemplate"],
    preview: () => <TemplatePreview template={CalendarTemplate} />,
    demo: () => <TemplateFrame template={CalendarTemplate} />,
  },
];

/** Other names people search by. Matched by the site search and shown on each page. */
export const ALIASES: Record<string, string[]> = {
  dialog: ["Modal"],
  "alert-dialog": ["Modal", "Confirm dialog"],
  drawer: ["Sheet", "Side panel"],
  "bottom-sheet": ["Sheet"],
  "progress-bar": ["Progress"],
  "progress-circle": ["Progress", "Progress ring"],
  calendar: ["Date Calendar"],
  "range-calendar": ["Date Calendar", "Date range"],
  combobox: ["Autocomplete"],
  "multi-select": ["Token field"],
  menu: ["Dropdown menu"],
  "tag-group": ["Tags"],
  accordion: ["Disclosure", "Collapsible", "FAQ"],
  schedule: ["Week view", "Agenda"],
  text: ["Typography", "Heading"],
  "toggle-button": ["Toggle"],
  link: ["Anchor"],
  alert: ["Callout", "Banner"],
  "empty-state": ["Blank slate"],
  spinner: ["Loader"],
  "floating-action-button": ["FAB", "Back to top"],
  "side-navigation": ["Sidebar navigation"],
  "date-time-picker": ["Datetime"],
  countdown: ["Timer"],
};
