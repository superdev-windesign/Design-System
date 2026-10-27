import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarDate } from "@internationalized/date";
import {
  RiAddLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiNotification3Line,
  RiSettings3Line,
  RiSparklingLine,
} from "@remixicon/react";
import {
  Announcement,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  ButtonGroupItem,
  Carousel,
  CarouselItem,
  Checkbox,
  CheckboxCard,
  Chip,
  CloseButton,
  DatePicker,
  DateRangePicker,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
  FileUpload,
  IconButton,
  Input,
  InputOtp,
  Kbd,
  LinkButton,
  MeetingScheduler,
  Notification,
  Pagination,
  PillTab,
  PillTabList,
  Radio,
  RadioCard,
  RadioGroup,
  RangeSlider,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectItem,
  Slider,
  SocialButton,
  StatusDot,
  Switch,
  SwitchCard,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  TabList,
  Tabs,
  Textarea,
  Tooltip,
  TooltipTrigger,
  TreeView,
  TreeViewItem,
} from "@ds/react";

export type Group =
  | "Actions"
  | "Forms"
  | "Selection"
  | "Navigation"
  | "Feedback"
  | "Overlays"
  | "Data display"
  | "Dates";

export const GROUPS: { name: Group; blurb: string }[] = [
  { name: "Actions", blurb: "Things people press to make something happen." },
  { name: "Forms", blurb: "Collecting text, codes and files." },
  { name: "Selection", blurb: "Choosing values, options and ranges." },
  { name: "Navigation", blurb: "Moving between pages, sections and levels." },
  { name: "Feedback", blurb: "Messages about what just happened." },
  { name: "Overlays", blurb: "Content that floats above the page." },
  { name: "Data display", blurb: "Showing people, labels and records." },
  { name: "Dates", blurb: "Picking days, ranges and meeting slots." },
];

export interface CatalogEntry {
  slug: string;
  name: string;
  group: Group;
  summary: string;
  /** Import names shown on the detail page. */
  imports: string[];
  /** Shows a "New" badge in the sidebar. Clear it a release or two after adding. */
  isNew?: boolean;
  /** Compact demo for the index card. */
  preview: () => ReactNode;
  /** Fuller interactive demo for the detail page. Falls back to `preview`. */
  demo?: () => ReactNode;
}

// ─── Stateful demos ────────────────────────────────────────────────────────

function RangeGroup() {
  const [range, setRange] = useState("week");
  return (
    <ButtonGroup aria-label="Range">
      {["day", "week", "month"].map((id) => (
        <ButtonGroupItem key={id} selected={range === id} onClick={() => setRange(id)}>
          {id[0]!.toUpperCase() + id.slice(1)}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
}

function PagerDemo() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} totalPages={10} onChange={setPage} className="w-full max-w-md" />;
}

function PillTabsDemo() {
  const [tab, setTab] = useState("all");
  return (
    <PillTabList aria-label="Filter">
      {[
        ["all", "All"],
        ["mentions", "Mentions"],
        ["system", "System"],
      ].map(([id, label]) => (
        <PillTab key={id} isSelected={tab === id} onSelect={() => setTab(id!)}>
          {label}
        </PillTab>
      ))}
    </PillTabList>
  );
}

const ORDERS = [
  { id: 1, customer: "Riley Chen", status: "Shipped", total: "$1,240" },
  { id: 2, customer: "Sam Patel", status: "Processing", total: "$389" },
  { id: 3, customer: "Jordan Lee", status: "Delivered", total: "$2,015" },
];

function OrdersTable() {
  return (
    <Table aria-label="Recent orders" className="min-w-80">
      <TableHeader>
        <TableColumn isRowHeader>Customer</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Total</TableColumn>
      </TableHeader>
      <TableBody items={ORDERS}>
        {(order) => (
          <TableRow id={order.id}>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>{order.total}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function SlideCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-32 w-56 flex-col justify-between rounded-surface border border-line bg-surface p-4 shadow-raised">
      <span className="text-body-md-strong text-fg">{title}</span>
      <span className="text-body-sm text-fg-secondary">{body}</span>
    </div>
  );
}

// ─── Catalog ───────────────────────────────────────────────────────────────

export const CATALOG: CatalogEntry[] = [
  // Actions
  {
    slug: "button",
    name: "Button",
    group: "Actions",
    summary: "Primary, secondary, tertiary and danger actions in three sizes.",
    imports: ["Button"],
    preview: () => (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button>Save</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="tertiary">Draft</Button>
      </div>
    ),
    demo: () => (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button leadingIcon={RiAddLine}>New project</Button>
        <Button variant="secondary" trailingIcon={RiArrowRightLine}>
          Continue
        </Button>
        <Button variant="tertiary">Mark as done</Button>
        <Button variant="danger">Delete</Button>
        <Button size="sm">Small</Button>
        <Button size="xs">Extra small</Button>
        <Button iconOnly leadingIcon={RiDeleteBinLine} variant="secondary" aria-label="Delete item" />
        <Button isDisabled>Disabled</Button>
      </div>
    ),
  },
  {
    slug: "icon-button",
    name: "Icon Button",
    group: "Actions",
    summary: "Square action with an icon and a required accessible name.",
    imports: ["IconButton"],
    preview: () => (
      <div className="flex items-center gap-2">
        <IconButton icon={RiSettings3Line} aria-label="Settings" />
        <IconButton icon={RiNotification3Line} aria-label="Notifications" />
        <IconButton icon={RiDownloadLine} size="small" aria-label="Download" />
      </div>
    ),
  },
  {
    slug: "link-button",
    name: "Link Button",
    group: "Actions",
    summary: "A text-weight action that reads like a link.",
    imports: ["LinkButton"],
    preview: () => (
      <div className="flex items-center gap-4">
        <LinkButton href="#/components">Browse components</LinkButton>
        <LinkButton href="#/components" trailingIcon={RiArrowRightLine}>
          Read the guide
        </LinkButton>
      </div>
    ),
  },
  {
    slug: "close-button",
    name: "Close Button",
    group: "Actions",
    summary: "The dismiss control used by banners, toasts and dialogs.",
    imports: ["CloseButton"],
    preview: () => (
      <div className="flex items-center gap-3">
        <CloseButton size="xs" aria-label="Close" />
        <CloseButton size="sm" aria-label="Close" />
        <CloseButton size="md" aria-label="Close" />
      </div>
    ),
  },
  {
    slug: "button-group",
    name: "Button Group",
    group: "Actions",
    summary: "A fused row of buttons for switching between related views.",
    imports: ["ButtonGroup", "ButtonGroupItem"],
    preview: () => <RangeGroup />,
  },
  {
    slug: "social-button",
    name: "Social Button",
    group: "Actions",
    summary: "Sign-in buttons for common identity providers.",
    imports: ["SocialButton"],
    preview: () => (
      <div className="flex w-64 flex-col gap-2">
        <SocialButton brand="google" fullWidth>
          Continue with Google
        </SocialButton>
        <SocialButton brand="github" fullWidth>
          Continue with GitHub
        </SocialButton>
      </div>
    ),
  },

  // Forms
  {
    slug: "input",
    name: "Input",
    group: "Forms",
    summary: "Labelled text field with hint, validation and adornments.",
    imports: ["Input"],
    preview: () => (
      <Input label="Work email" placeholder="you@company.com" hint="We'll send a sign-in link." className="w-64" />
    ),
  },
  {
    slug: "textarea",
    name: "Textarea",
    group: "Forms",
    summary: "Multi-line field that can grow with its content.",
    imports: ["Textarea"],
    preview: () => <Textarea label="Notes" placeholder="Add context for your team…" autoResize className="w-64" />,
  },
  {
    slug: "input-otp",
    isNew: true,
    name: "Input OTP",
    group: "Forms",
    summary: "One-time-code boxes with paste support.",
    imports: ["InputOtp"],
    preview: () => <InputOtp length={6} aria-label="Verification code" />,
  },
  {
    slug: "file-upload",
    isNew: true,
    name: "File Upload",
    group: "Forms",
    summary: "Drop zone with type and size checks and upload progress.",
    imports: ["FileUpload"],
    preview: () => <FileUpload className="w-72" />,
  },

  // Selection
  {
    slug: "select",
    name: "Select",
    group: "Selection",
    summary: "Pick one option from a list in a floating menu.",
    imports: ["Select", "SelectItem"],
    preview: () => (
      <Select aria-label="Team" defaultSelectedKey="design">
        <SelectItem id="design" textValue="Design">Design</SelectItem>
        <SelectItem id="engineering" textValue="Engineering">Engineering</SelectItem>
        <SelectItem id="research" textValue="Research">Research</SelectItem>
      </Select>
    ),
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    group: "Selection",
    summary: "Independent on/off choices, including a mixed state.",
    imports: ["Checkbox"],
    preview: () => (
      <div className="flex flex-col gap-2">
        <Checkbox defaultSelected>Email me a weekly summary</Checkbox>
        <Checkbox>Include archived projects</Checkbox>
        <Checkbox isIndeterminate>Select all</Checkbox>
      </div>
    ),
  },
  {
    slug: "checkbox-card",
    name: "Checkbox Card",
    group: "Selection",
    summary: "A checkbox with a title and description in a card.",
    imports: ["CheckboxCard"],
    preview: () => (
      <CheckboxCard title="Daily digest" description="One summary every morning." defaultSelected className="w-64" />
    ),
  },
  {
    slug: "radio",
    name: "Radio",
    group: "Selection",
    summary: "One choice from a short list of options.",
    imports: ["RadioGroup", "Radio"],
    preview: () => (
      <RadioGroup aria-label="Billing period" defaultValue="monthly">
        <Radio value="weekly">Weekly</Radio>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </RadioGroup>
    ),
  },
  {
    slug: "radio-card",
    name: "Radio Card",
    group: "Selection",
    summary: "Radio options laid out as descriptive cards.",
    imports: ["RadioGroup", "RadioCard"],
    preview: () => (
      <RadioGroup aria-label="Plan" defaultValue="team" className="w-64">
        <RadioCard value="solo" title="Solo" description="For one person." />
        <RadioCard value="team" title="Team" description="Shared projects and roles." />
      </RadioGroup>
    ),
  },
  {
    slug: "switch",
    name: "Switch",
    group: "Selection",
    summary: "Turns a setting on or off immediately.",
    imports: ["Switch"],
    preview: () => (
      <div className="flex flex-col gap-3">
        <Switch defaultSelected>Desktop notifications</Switch>
        <Switch>Sound effects</Switch>
      </div>
    ),
  },
  {
    slug: "switch-card",
    name: "Switch Card",
    group: "Selection",
    summary: "A setting with a description and a switch.",
    imports: ["SwitchCard"],
    preview: () => (
      <SwitchCard title="Auto-save" description="Save drafts while you type." defaultSelected className="w-64" />
    ),
  },
  {
    slug: "segmented-control",
    name: "Segmented Control",
    group: "Selection",
    summary: "A sliding switcher between a few exclusive options.",
    imports: ["SegmentedControl", "SegmentedControlItem"],
    preview: () => (
      <SegmentedControl aria-label="Period" defaultSelectedKeys={["week"]}>
        <SegmentedControlItem id="day">Day</SegmentedControlItem>
        <SegmentedControlItem id="week">Week</SegmentedControlItem>
        <SegmentedControlItem id="month">Month</SegmentedControlItem>
      </SegmentedControl>
    ),
  },
  {
    slug: "slider",
    name: "Slider",
    group: "Selection",
    summary: "Choose a value or a range by dragging.",
    imports: ["Slider", "RangeSlider"],
    preview: () => (
      <div className="flex w-64 flex-col gap-6">
        <Slider label="Volume" defaultValue={62} />
        <RangeSlider label="Price" defaultValue={[20, 80]} />
      </div>
    ),
  },

  // Navigation
  {
    slug: "tabs",
    name: "Tabs",
    group: "Navigation",
    summary: "Switch between views of the same page.",
    imports: ["Tabs", "TabList", "Tab"],
    preview: () => (
      <Tabs defaultSelectedKey="overview">
        <TabList aria-label="Project sections">
          <Tab id="overview">Overview</Tab>
          <Tab id="activity" count={4}>
            Activity
          </Tab>
          <Tab id="settings">Settings</Tab>
        </TabList>
      </Tabs>
    ),
  },
  {
    slug: "pill-tabs",
    name: "Pill Tabs",
    group: "Navigation",
    summary: "Compact filter tabs with a sliding highlight.",
    imports: ["PillTabList", "PillTab"],
    preview: () => <PillTabsDemo />,
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    group: "Navigation",
    summary: "Shows where a page sits and links back up the trail.",
    imports: ["Breadcrumb", "BreadcrumbItem"],
    preview: () => (
      <Breadcrumb>
        <BreadcrumbItem href="#/components">Workspace</BreadcrumbItem>
        <BreadcrumbItem href="#/components">Projects</BreadcrumbItem>
        <BreadcrumbItem current>Roadmap</BreadcrumbItem>
      </Breadcrumb>
    ),
  },
  {
    slug: "pagination",
    name: "Pagination",
    group: "Navigation",
    summary: "Page through long lists; compacts on narrow widths.",
    imports: ["Pagination"],
    preview: () => <PagerDemo />,
  },
  {
    slug: "tree-view",
    isNew: true,
    name: "Tree View",
    group: "Navigation",
    summary: "Nested items with expand, select and keyboard navigation.",
    imports: ["TreeView", "TreeViewItem"],
    preview: () => (
      <TreeView aria-label="Project files" defaultExpandedKeys={["src"]} className="w-64">
        <TreeViewItem id="src" label="src">
          <TreeViewItem id="app" label="app.tsx" />
          <TreeViewItem id="theme" label="theme.css" />
        </TreeViewItem>
        <TreeViewItem id="readme" label="README.md" />
      </TreeView>
    ),
  },

  // Feedback
  {
    slug: "notification",
    name: "Notification",
    group: "Feedback",
    summary: "Status messages with an icon, timestamp and actions.",
    imports: ["Notification"],
    preview: () => (
      <Notification
        title="Deployment finished"
        description="Your changes are live."
        status="success"
        timestamp="2m ago"
        className="w-80"
      />
    ),
  },
  {
    slug: "announcement",
    name: "Announcement",
    group: "Feedback",
    summary: "A dismissible banner for product news.",
    imports: ["Announcement"],
    preview: () => (
      <Announcement
        icon={RiSparklingLine}
        title="Workspace search is here"
        description="Find any file or person in one place."
        actionLabel="Try it"
        dismissible
        className="w-80"
      />
    ),
  },
  {
    slug: "status-dot",
    name: "Status Dot",
    group: "Feedback",
    summary: "A small colored marker to pair with a status label.",
    imports: ["StatusDot"],
    preview: () => (
      <div className="flex flex-col gap-2 text-body-md-strong text-fg">
        <span className="flex items-center gap-2">
          <StatusDot color="green" /> Operational
        </span>
        <span className="flex items-center gap-2">
          <StatusDot color="yellow" /> Degraded
        </span>
        <span className="flex items-center gap-2">
          <StatusDot color="indigo" /> Scheduled
        </span>
      </div>
    ),
  },

  // Overlays
  {
    slug: "tooltip",
    name: "Tooltip",
    group: "Overlays",
    summary: "A short hint on hover or keyboard focus.",
    imports: ["TooltipTrigger", "Tooltip"],
    preview: () => (
      <TooltipTrigger>
        <Button variant="secondary">Hover or focus me</Button>
        <Tooltip>Copies a shareable link</Tooltip>
      </TooltipTrigger>
    ),
  },
  {
    slug: "dropdown",
    name: "Dropdown",
    group: "Overlays",
    summary: "A menu of actions that opens from a trigger.",
    imports: ["Dropdown", "DropdownTrigger", "DropdownPopover", "DropdownItem"],
    preview: () => (
      <Dropdown>
        <DropdownTrigger>Project actions</DropdownTrigger>
        <DropdownPopover aria-label="Project actions">
          <DropdownItem>Rename</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
          <DropdownItem>Archive</DropdownItem>
        </DropdownPopover>
      </Dropdown>
    ),
  },

  // Data display
  {
    slug: "avatar",
    name: "Avatar",
    group: "Data display",
    summary: "A person's photo or initials in four sizes.",
    imports: ["Avatar"],
    preview: () => (
      <div className="flex items-center gap-2">
        <Avatar size="xs" initials="RC" color="blue" />
        <Avatar size="sm" initials="SP" color="lime" />
        <Avatar size="md" initials="JL" color="pink" />
        <Avatar size="lg" initials="AM" />
      </div>
    ),
  },
  {
    slug: "badge",
    name: "Badge",
    group: "Data display",
    summary: "A small label for counts and highlights.",
    imports: ["Badge"],
    preview: () => (
      <div className="flex items-center gap-2">
        <Badge color="primary">New</Badge>
        <Badge color="neutral">Beta</Badge>
      </div>
    ),
  },
  {
    slug: "chip",
    name: "Chip",
    group: "Data display",
    summary: "Colored labels for statuses and categories.",
    imports: ["Chip"],
    preview: () => (
      <div className="flex max-w-72 flex-wrap items-center justify-center gap-2">
        <Chip color="lime">Completed</Chip>
        <Chip color="yellow">Waiting</Chip>
        <Chip color="rose">Failed</Chip>
        <Chip color="blue" variant="subtle">
          In review
        </Chip>
        <Chip color="neutral" variant="caption">
          v2.4.0
        </Chip>
      </div>
    ),
  },
  {
    slug: "kbd",
    name: "Kbd",
    group: "Data display",
    summary: "Keyboard keys inside text and menus.",
    imports: ["Kbd"],
    preview: () => (
      <span className="flex items-center gap-1 text-body-md text-fg-secondary">
        Search with <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    ),
  },
  {
    slug: "divider",
    name: "Divider",
    group: "Data display",
    summary: "Separates content, with an optional label.",
    imports: ["Divider"],
    preview: () => (
      <div className="flex w-64 flex-col gap-4">
        <Divider />
        <Divider>or</Divider>
        <Divider variant="double" />
      </div>
    ),
  },
  {
    slug: "table",
    name: "Table",
    group: "Data display",
    summary: "Rows and columns with keyboard navigation.",
    imports: ["Table", "TableHeader", "TableColumn", "TableBody", "TableRow", "TableCell"],
    preview: () => <OrdersTable />,
  },
  {
    slug: "carousel",
    isNew: true,
    name: "Carousel",
    group: "Data display",
    summary: "A scrolling row of cards with arrows and dots.",
    imports: ["Carousel", "CarouselItem"],
    preview: () => (
      <Carousel aria-label="Highlights" className="w-80">
        <CarouselItem>
          <SlideCard title="Faster search" body="Results as you type." />
        </CarouselItem>
        <CarouselItem>
          <SlideCard title="Shared views" body="Save a filter for the team." />
        </CarouselItem>
        <CarouselItem>
          <SlideCard title="Audit log" body="See who changed what." />
        </CarouselItem>
      </Carousel>
    ),
  },

  // Dates
  {
    slug: "date-range-picker",
    name: "Date Range Picker",
    group: "Dates",
    summary: "Two months, quick presets and Apply to commit.",
    imports: ["DateRangePicker"],
    preview: () => <DateRangePicker />,
  },
  {
    slug: "date-picker",
    name: "Date Picker",
    group: "Dates",
    summary: "One date from a month view, with an editable field.",
    imports: ["DatePicker"],
    preview: () => <DatePicker defaultValue={new CalendarDate(2026, 11, 12)} />,
  },
  {
    slug: "meeting-scheduler",
    isNew: true,
    name: "Meeting Scheduler",
    group: "Dates",
    summary: "Pick a day and a time slot for a meeting.",
    imports: ["MeetingScheduler"],
    preview: () => <MeetingScheduler />,
  },
];

export const findEntry = (slug: string) => CATALOG.find((entry) => entry.slug === slug);
