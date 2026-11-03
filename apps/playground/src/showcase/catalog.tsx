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
  promptArt,
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
import {
  CommandPaletteDemo,
  CommandPalettePreview,
  StatCardPreview,
  StatCardsDemo,
  StepWizardDemo,
  StepWizardPreview,
  ToastDemo,
  ToastPreview,
} from "./pro-demos";
import {
  ComposerPanelDemo,
  ComposerPanelPreview,
  ComposerAttachmentsDemo,
  ComposerAttachmentsPreview,
  WebSearchDemo,
  WebSearchPreview,
  TaskListDemo,
  TaskListPreview,
  AgentLimitsDemo,
  AgentLimitsPreview,
  QuestionnaireDemo,
  QuestionnairePreview,
  AgentCreatorDemo,
  AgentCreatorPreview,
  AgentProgressDemo,
  AgentProgressPreview,
  CalendarDemo,
  CalendarPreview,
} from "./agent-blocks-demos";
import { ColorFoundation, ColorPreview, TypographyFoundation, TypographyPreview } from "./foundations";
import { TEMPLATES, TemplateFrame, TemplatePreview } from "./templates-demos";
import { ACTION_ENTRIES, NAVIGATION_ENTRIES, OVERLAY_ENTRIES } from "./overlay-demos";
import { DATE_ENTRIES, FORM_ENTRIES, SELECTION_ENTRIES } from "./form-demos";
import { DATA_DISPLAY_ENTRIES, FEEDBACK_ENTRIES, LAYOUT_ENTRIES } from "./display-demos";
import { MORE_ENTRIES } from "./more-demos";
import { NINE_ENTRIES } from "./nine-demos";
import { ALIASES, BreadcrumbDemo, PARITY_ENTRIES, SelectDemo, TableDemo } from "./parity-demos";
import { ActivityDaysDemo, AreaDemo, ContributionsDemo, HeatmapDemo, RadialDemo } from "./chart-demos";
import {
  BreakpointsFoundation,
  BreakpointsPreview,
  ElevationFoundation,
  ElevationPreview,
  IconsFoundation,
  IconsPreview,
  MotionFoundation,
  MotionPreview,
  RadiusFoundation,
  RadiusPreview,
  SpacingFoundation,
  SpacingPreview,
  ThemingFoundation,
  ThemingPreview,
} from "./more-foundations";
import {
  AgentThinkingDemo,
  AuthCardDemo,
  ComposerLoaderDemo,
  ComposerLoaderPreview,
  DataGridDemo,
  DataGridPreview,
  DataTableDemo,
  DataTablePreview,
  Fit,
  NotificationCenterPreview,
  RevenueChartDemo,
  RevenueChartPreview,
  SettingsModalDemo,
  SettingsPreview,
  SidebarDemo,
  SidebarPreview,
  StatCardsBlockDemo,
  StatCardsPreview,
} from "./blocks-demos";
import {
  AuthCard,
  NotificationCenterDemo,
  ActivityRingsCard,
  AreaChartCard,
  BarListCard,
  ComboChartCard,
  ContributionsCard,
  EarningsChartCard,
  FunnelChartCard,
  HeatmapChartCard,
  LineChartCard,
  MostActiveDaysCard,
  RadarChartCard,
  RadialChartCard,
  SankeyChartCard,
  ScatterChartCard,
  SleepScoreCard,
  StageBarsCard,
  StepsChartCard,
} from "@ds/react";

export type Group =
  | "Foundations"
  | "Pro"
  | "Actions"
  | "Forms"
  | "Selection"
  | "Navigation"
  | "Feedback"
  | "Overlays"
  | "Data display"
  | "Layout"
  | "Dates"
  | "Blocks"
  | "Charts"
  | "Templates";

export const GROUPS: { name: Group; blurb: string }[] = [
  { name: "Foundations", blurb: "The tokens everything is built on, and how theming works." },
  { name: "Pro", blurb: "Advanced, animated components designed for this system." },
  { name: "Actions", blurb: "Things people press to make something happen." },
  { name: "Forms", blurb: "Collecting text, codes and files." },
  { name: "Selection", blurb: "Choosing values, options and ranges." },
  { name: "Navigation", blurb: "Moving between pages, sections and levels." },
  { name: "Feedback", blurb: "Messages about what just happened." },
  { name: "Overlays", blurb: "Content that floats above the page." },
  { name: "Data display", blurb: "Showing people, labels and records." },
  { name: "Layout", blurb: "Panels, sections and regions that hold the rest." },
  { name: "Dates", blurb: "Picking days, ranges and meeting slots." },
  { name: "Blocks", blurb: "Larger assemblies, ready to drop into a screen." },
  { name: "Charts", blurb: "Data cards built on the chart palette." },
  { name: "Templates", blurb: "Whole screens assembled from the blocks and charts." },
];

export interface CatalogEntry {
  slug: string;
  name: string;
  group: Group;
  summary: string;
  /** Import names shown on the detail page. */
  imports: string[];
  /** Other names people search by ("Modal" for Dialog). */
  aliases?: string[];
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

/** Plates for the Carousel demos: each title paints its own artwork (promptArt), so no images ship. */
const GALLERY = [
  { title: "Harbour at dusk", medium: "Gouache" },
  { title: "Salt marsh", medium: "Linocut" },
  { title: "Paper lanterns", medium: "Collage" },
  { title: "Night ferry", medium: "Ink wash" },
  { title: "Orchard study", medium: "Pastel" },
  { title: "Tide tables", medium: "Letterpress" },
  { title: "North light", medium: "Oil on board" },
];

function ArtCard({ title, medium }: { title: string; medium: string }) {
  return (
    <figure className="flex w-full flex-col gap-2">
      <div aria-hidden className="aspect-4/5 w-full rounded-surface" style={{ background: promptArt(title) }} />
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="truncate font-display text-body-md-strong text-fg">{title}</span>
        <span className="shrink-0 font-mono text-caption uppercase text-fg-tertiary">{medium}</span>
      </figcaption>
    </figure>
  );
}

function CarouselDemo() {
  return (
    <div className="flex w-full max-w-120 flex-col gap-10">
      <section className="flex flex-col gap-2">
        <p className="text-body-sm text-fg-secondary">One plate per slide, the default.</p>
        <Carousel aria-label="Gallery" className="w-full max-w-72 self-center">
          {GALLERY.map((plate) => (
            <CarouselItem key={plate.title}>
              <ArtCard {...plate} />
            </CarouselItem>
          ))}
        </Carousel>
      </section>
      <section className="flex flex-col gap-2">
        <p className="text-body-sm text-fg-secondary">Narrower items show a peek of the next one.</p>
        <Carousel aria-label="Gallery with a peek" gap={12}>
          {GALLERY.map((plate) => (
            <CarouselItem key={plate.title} className="w-3/5">
              <ArtCard {...plate} />
            </CarouselItem>
          ))}
        </Carousel>
      </section>
      <section className="flex flex-col gap-2">
        <p className="text-body-sm text-fg-secondary">align="center" rests each card in the middle of the track.</p>
        <Carousel aria-label="Centred gallery" align="center" gap={16}>
          {GALLERY.map((plate) => (
            <CarouselItem key={plate.title} className="w-44">
              <ArtCard {...plate} />
            </CarouselItem>
          ))}
        </Carousel>
      </section>
      <section className="flex flex-col gap-2">
        <p className="text-body-sm text-fg-secondary">A bare track: no arrows, no ruler, swipe and scroll only.</p>
        <Carousel aria-label="Mediums" showArrows={false} showDots={false} gap={8}>
          {GALLERY.map((plate) => (
            <CarouselItem key={plate.title} className="w-auto">
              <span className="block rounded-chip border border-line px-2.5 py-1 font-mono text-caption uppercase text-fg-secondary">
                {plate.medium}
              </span>
            </CarouselItem>
          ))}
        </Carousel>
      </section>
    </div>
  );
}

// ─── Catalog ───────────────────────────────────────────────────────────────

const BASE_CATALOG: CatalogEntry[] = [
  // Foundations
  {
    slug: "color",
    isNew: true,
    name: "Color",
    group: "Foundations",
    summary: "Semantic colour tokens by role, component tokens and the primitive ramps, with live values.",
    imports: [],
    preview: () => <ColorPreview />,
    demo: () => <ColorFoundation />,
  },
  {
    slug: "typography",
    isNew: true,
    name: "Typography",
    group: "Foundations",
    summary: "Font families and every named text style, largest first, with sizes from the tokens.",
    imports: [],
    preview: () => <TypographyPreview />,
    demo: () => <TypographyFoundation />,
  },
  {
    slug: "spacing",
    isNew: true,
    name: "Spacing",
    group: "Foundations",
    summary: "The 4px spacing scale and the control and icon sizes built on it.",
    imports: [],
    preview: () => <SpacingPreview />,
    demo: () => <SpacingFoundation />,
  },
  {
    slug: "radius",
    isNew: true,
    name: "Radius",
    group: "Foundations",
    summary: "Corner roles from hairline to panel, and the scale for component internals.",
    imports: [],
    preview: () => <RadiusPreview />,
    demo: () => <RadiusFoundation />,
  },
  {
    slug: "elevation",
    isNew: true,
    name: "Elevation",
    group: "Foundations",
    summary: "Rules first, a soft lift for controls, one shadow for anything floating.",
    imports: [],
    preview: () => <ElevationPreview />,
    demo: () => <ElevationFoundation />,
  },
  {
    slug: "motion",
    isNew: true,
    name: "Motion",
    group: "Foundations",
    summary: "Durations and easing curves, with a side-by-side comparison you can play.",
    imports: [],
    preview: () => <MotionPreview />,
    demo: () => <MotionFoundation />,
  },
  {
    slug: "icons",
    isNew: true,
    name: "Icons",
    group: "Foundations",
    summary: "Remix Icon, line style, in three sizes, with the rules for naming and hiding them.",
    imports: [],
    preview: () => <IconsPreview />,
    demo: () => <IconsFoundation />,
  },
  {
    slug: "breakpoints",
    isNew: true,
    name: "Breakpoints",
    group: "Foundations",
    summary: "Mobile-first viewport breakpoints and container queries, with this window's size.",
    imports: [],
    preview: () => <BreakpointsPreview />,
    demo: () => <BreakpointsFoundation />,
  },
  {
    slug: "theming",
    isNew: true,
    name: "Theming",
    group: "Foundations",
    summary: "ThemeProvider, useTheme, ThemeScope and AccentPicker: light, dark and system, any accent, remembered.",
    imports: ["ThemeProvider", "useTheme", "ThemeScope", "AccentPicker", "ACCENT_PRESETS", "startThemeTransition"],
    preview: () => <ThemingPreview />,
    demo: () => <ThemingFoundation />,
  },

  // Pro
  {
    slug: "command-palette",
    isNew: true,
    name: "Command Palette",
    group: "Pro",
    summary: "Search and run any command from the keyboard, in a modal or inline.",
    imports: ["CommandPalette", "CommandMenu", "CommandGroup", "CommandItem"],
    preview: () => <CommandPalettePreview />,
    demo: () => <CommandPaletteDemo />,
  },
  {
    slug: "toast",
    isNew: true,
    name: "Toast",
    group: "Pro",
    summary: "Queued notifications that stack, fan out on hover and swipe away.",
    imports: ["Toaster", "toast"],
    preview: () => <ToastPreview />,
    demo: () => <ToastDemo />,
  },
  {
    slug: "step-wizard",
    isNew: true,
    name: "Step Wizard",
    group: "Pro",
    summary: "Multi-step form with a progress rail, validation and sliding steps.",
    imports: ["StepWizard", "WizardStep"],
    preview: () => <StepWizardPreview />,
    demo: () => <StepWizardDemo />,
  },
  {
    slug: "stat-card",
    isNew: true,
    name: "Stat Card",
    group: "Pro",
    summary: "A KPI with a rolling number, trend chip and a sparkline you can scrub.",
    imports: ["StatCard", "AnimatedNumber", "Sparkline"],
    preview: () => <StatCardPreview />,
    demo: () => <StatCardsDemo />,
  },

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
    demo: () => <SelectDemo />,
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
    demo: () => <BreadcrumbDemo />,
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
    demo: () => <TableDemo />,
  },
  {
    slug: "carousel",
    isNew: true,
    name: "Carousel",
    group: "Data display",
    summary: "A gallery you slide through on native scroll-snap: arrows, a ruler with a folio, centred or peeking cards.",
    imports: ["Carousel", "CarouselItem"],
    preview: () => (
      <Carousel aria-label="Highlights" className="w-64">
        {GALLERY.slice(0, 4).map((plate) => (
          <CarouselItem key={plate.title}>
            <ArtCard {...plate} />
          </CarouselItem>
        ))}
      </Carousel>
    ),
    demo: () => <CarouselDemo />,
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
  // Blocks (ported from BoardUI's free MIT blocks)
  {
    slug: "agent-thinking",
    isNew: true,
    name: "Agent Thinking",
    group: "Blocks",
    summary: "Four animated indicators for an agent that's working, with an elapsed timer.",
    imports: ["AgentThinking"],
    preview: () => <AgentThinkingDemo timers={false} />,
    demo: () => <AgentThinkingDemo />,
  },
  {
    slug: "composer-loader",
    isNew: true,
    name: "Composer Loader",
    group: "Blocks",
    summary: "A light band that orbits a chat composer while the agent works.",
    imports: ["ComposerLoader"],
    preview: () => <ComposerLoaderPreview />,
    demo: () => <ComposerLoaderDemo />,
  },
  {
    slug: "auth-card",
    isNew: true,
    name: "Auth Card",
    group: "Blocks",
    summary: "Sign-in, sign-up and code verification with social providers.",
    imports: ["AuthCard"],
    preview: () => (
      <Fit width={400}>
        <AuthCard layout="inline" providers={["google", "apple", "github"]} headingLevel={3} />
      </Fit>
    ),
    demo: () => <AuthCardDemo />,
  },
  {
    slug: "data-grid",
    isNew: true,
    name: "Data Grid",
    group: "Blocks",
    summary: "Editable spreadsheet with selection, filters, copy-paste and live summaries.",
    imports: ["DataGrid", "DataGridExample"],
    preview: () => <DataGridPreview />,
    demo: () => <DataGridDemo />,
  },
  {
    slug: "data-table",
    name: "Data Table",
    group: "Blocks",
    summary: "Search, filters, selection, sorting and pagination wired up.",
    imports: ["DataTableExample"],
    preview: () => <DataTablePreview />,
    demo: () => <DataTableDemo />,
  },
  {
    slug: "notification-center",
    name: "Notification Center",
    group: "Blocks",
    summary: "Grouped activity inbox with tabs, unread state and actions.",
    imports: ["NotificationCenter"],
    preview: () => <NotificationCenterPreview />,
    demo: () => <NotificationCenterDemo />,
  },
  {
    slug: "settings-modal",
    name: "Settings Modal",
    group: "Blocks",
    summary: "Multi-page settings in a controlled dialog.",
    imports: ["SettingsModal"],
    preview: () => <SettingsPreview />,
    demo: () => <SettingsModalDemo />,
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    group: "Blocks",
    summary: "Floating app navigation with search, teams menu and collapse.",
    imports: ["DashboardSidebar"],
    preview: () => <SidebarPreview />,
    demo: () => <SidebarDemo />,
  },
  {
    slug: "stat-cards",
    isNew: true,
    name: "Stat Cards",
    group: "Blocks",
    summary: "KPI cards with delta chips or a footer band.",
    imports: ["StatCards"],
    preview: () => <StatCardsPreview />,
    demo: () => <StatCardsBlockDemo />,
  },
  {
    slug: "composer-panel",
    isNew: true,
    name: "Composer Panel",
    group: "Blocks",
    summary: "Two-row chat input with permission modes, model choice and send/stop.",
    imports: ["ComposerPanel"],
    preview: () => <ComposerPanelPreview />,
    demo: () => <ComposerPanelDemo />,
  },
  {
    slug: "composer-attachments",
    isNew: true,
    name: "Composer Attachments",
    group: "Blocks",
    summary: "File chips above the prompt in six kinds, with thumbnails, a pen-rule progress line and an upload queue that lands files one by one.",
    imports: ["ComposerWithAttachments", "ComposerAttachments", "ComposerAttachmentTile", "useUploadQueue", "attachmentFromFile"],
    preview: () => <ComposerAttachmentsPreview />,
    demo: () => <ComposerAttachmentsDemo />,
  },
  {
    slug: "web-search",
    isNew: true,
    name: "Web Search",
    group: "Blocks",
    summary: "The research trail behind an answer: searches and the sources opened.",
    imports: ["WebSearch"],
    preview: () => <WebSearchPreview />,
    demo: () => <WebSearchDemo />,
  },
  {
    slug: "task-list",
    isNew: true,
    name: "Task List",
    group: "Blocks",
    summary: "An agent's work as a log that grows step by step while it runs.",
    imports: ["TaskList"],
    preview: () => <TaskListPreview />,
    demo: () => <TaskListDemo />,
  },
  {
    slug: "agent-progress",
    isNew: true,
    name: "Agent Progress",
    group: "Blocks",
    summary: "A multi-step task as a ledger: a growing rule, a pen stroke under the current step, checks that draw in.",
    imports: ["AgentProgress"],
    preview: () => <AgentProgressPreview />,
    demo: () => <AgentProgressDemo />,
  },
  {
    slug: "agent-limits",
    isNew: true,
    name: "Agent Limits",
    group: "Blocks",
    summary: "Context window by what fills it, plus plan quotas with reset times.",
    imports: ["AgentLimits"],
    preview: () => <AgentLimitsPreview />,
    demo: () => <AgentLimitsDemo />,
  },
  {
    slug: "questionnaire",
    isNew: true,
    name: "Questionnaire",
    group: "Blocks",
    summary: "Questions before planning, one at a time, with a review step.",
    imports: ["Questionnaire"],
    preview: () => <QuestionnairePreview />,
    demo: () => <QuestionnaireDemo />,
  },
  {
    slug: "agent-creator",
    isNew: true,
    name: "Agent Creator",
    group: "Blocks",
    summary: "An agent's identity: name and role, a paper-cutout avatar in six shapes and five expressions, tone, language, notifications and a spoken voice preview; as a card or a sidebar.",
    imports: ["AgentCreator", "AgentAvatar"],
    preview: () => <AgentCreatorPreview />,
    demo: () => <AgentCreatorDemo />,
  },
  {
    slug: "month-calendar",
    isNew: true,
    name: "Calendar",
    group: "Blocks",
    summary: "Full month view with event pills and the selected day's agenda.",
    imports: ["MonthCalendar"],
    preview: () => <CalendarPreview />,
    demo: () => <CalendarDemo />,
  },

  // Charts
  {
    slug: "revenue-chart",
    isNew: true,
    name: "Revenue Chart",
    group: "Charts",
    summary: "This year against last: an area over a dashed line, plus an orders bar card.",
    imports: ["RevenueChartCard"],
    preview: () => <RevenueChartPreview />,
    demo: () => <RevenueChartDemo />,
  },
  {
    slug: "activity-rings",
    isNew: true,
    name: "Activity Rings",
    group: "Charts",
    summary: "Concentric goal rings that draw in; hover a goal to spotlight it.",
    imports: ["ActivityRingsCard"],
    preview: () => (
      <Fit width={480} center>
        <ActivityRingsCard />
      </Fit>
    ),
    demo: () => <ActivityDaysDemo />,
  },
  {
    slug: "area-chart",
    isNew: true,
    name: "Area Chart",
    group: "Charts",
    summary: "Several series over time: stacked, overlapping or as a 100% share.",
    imports: ["AreaChartCard"],
    preview: () => (
      <Fit width={560} center>
        <AreaChartCard />
      </Fit>
    ),
    demo: () => <AreaDemo />,
  },
  {
    slug: "bar-list",
    isNew: true,
    name: "Bar List",
    group: "Charts",
    summary: "Ranked rows with share bars, with tabs for each breakdown.",
    imports: ["BarListCard"],
    preview: () => (
      <Fit width={480} center>
        <BarListCard />
      </Fit>
    ),
    demo: () => <BarListCard className="w-full max-w-2xl" />,
  },
  {
    slug: "combo-chart",
    isNew: true,
    name: "Combo Chart",
    group: "Charts",
    summary: "Bars and a line on independent axes over one time scale.",
    imports: ["ComboChartCard"],
    preview: () => (
      <Fit width={560} center>
        <ComboChartCard />
      </Fit>
    ),
    demo: () => <ComboChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "contributions",
    isNew: true,
    name: "Contributions",
    group: "Charts",
    summary: "Daily activity as a calendar grid, shaded in five steps.",
    imports: ["ContributionsCard"],
    preview: () => (
      <Fit width={560} center>
        <ContributionsCard />
      </Fit>
    ),
    demo: () => <ContributionsDemo />,
  },
  {
    slug: "earnings-chart",
    isNew: true,
    name: "Earnings Chart",
    group: "Charts",
    summary: "Monthly bars paired with the same month last year.",
    imports: ["EarningsChartCard"],
    preview: () => (
      <Fit width={560} center>
        <EarningsChartCard />
      </Fit>
    ),
    demo: () => <EarningsChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "funnel-chart",
    isNew: true,
    name: "Funnel Chart",
    group: "Charts",
    summary: "Stages joined by tapered bands, with step conversion pills.",
    imports: ["FunnelChartCard"],
    preview: () => (
      <Fit width={560} center>
        <FunnelChartCard />
      </Fit>
    ),
    demo: () => <FunnelChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "heatmap-chart",
    isNew: true,
    name: "Heatmap Chart",
    group: "Charts",
    summary: "Weekday by time-of-day grid on a theme-following ramp.",
    imports: ["HeatmapChartCard"],
    preview: () => (
      <Fit width={560} center>
        <HeatmapChartCard />
      </Fit>
    ),
    demo: () => <HeatmapDemo />,
  },
  {
    slug: "line-chart",
    isNew: true,
    name: "Line Chart",
    group: "Charts",
    summary: "Curved or sharp line over a soft area, with a target line.",
    imports: ["LineChartCard"],
    preview: () => (
      <Fit width={560} center>
        <LineChartCard />
      </Fit>
    ),
    demo: () => <LineChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "most-active-days",
    isNew: true,
    name: "Most Active Days",
    group: "Charts",
    summary: "Weekday bars with the busiest day highlighted.",
    imports: ["MostActiveDaysCard"],
    preview: () => (
      <Fit width={480} center>
        <MostActiveDaysCard />
      </Fit>
    ),
    demo: () => <ActivityDaysDemo />,
  },
  {
    slug: "radar-chart",
    isNew: true,
    name: "Radar Chart",
    group: "Charts",
    summary: "Two profiles on shared axes, filled or as outlines.",
    imports: ["RadarChartCard"],
    preview: () => (
      <Fit width={480} center>
        <RadarChartCard />
      </Fit>
    ),
    demo: () => <RadarChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "radial-chart",
    isNew: true,
    name: "Radial Chart",
    group: "Charts",
    summary: "Quota parts as concentric rings or one half gauge.",
    imports: ["RadialChartCard"],
    preview: () => (
      <Fit width={480} center>
        <RadialChartCard />
      </Fit>
    ),
    demo: () => <RadialDemo />,
  },
  {
    slug: "sankey-chart",
    isNew: true,
    name: "Sankey Chart",
    group: "Charts",
    summary: "How a total splits into parts, with tinted links and shares.",
    imports: ["SankeyChartCard"],
    preview: () => (
      <Fit width={560} center>
        <SankeyChartCard />
      </Fit>
    ),
    demo: () => <SankeyChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "scatter-chart",
    isNew: true,
    name: "Scatter Chart",
    group: "Charts",
    summary: "Correlation in two groups; bubbles size by a third measure.",
    imports: ["ScatterChartCard"],
    preview: () => (
      <Fit width={560} center>
        <ScatterChartCard />
      </Fit>
    ),
    demo: () => <ScatterChartCard className="w-full max-w-2xl" />,
  },
  {
    slug: "sleep-score",
    isNew: true,
    name: "Sleep Score",
    group: "Charts",
    summary: "A score on an open arc gauge, with the factors behind it.",
    imports: ["SleepScoreCard"],
    preview: () => (
      <Fit width={480} center>
        <SleepScoreCard />
      </Fit>
    ),
    demo: () => <SleepScoreCard className="w-full max-w-2xl" />,
  },
  {
    slug: "stage-bars",
    isNew: true,
    name: "Stage Bars",
    group: "Charts",
    summary: "Pipeline stages as rounded pills with pass rates.",
    imports: ["StageBarsCard"],
    preview: () => (
      <Fit width={480} center>
        <StageBarsCard />
      </Fit>
    ),
    demo: () => <StageBarsCard className="w-full max-w-2xl" />,
  },
  {
    slug: "steps-chart",
    isNew: true,
    name: "Steps Chart",
    group: "Charts",
    summary: "Daily bars against a dashed goal; goal days light up.",
    imports: ["StepsChartCard"],
    preview: () => (
      <Fit width={560} center>
        <StepsChartCard />
      </Fit>
    ),
    demo: () => <StepsChartCard className="w-full max-w-2xl" />,
  },

  // Templates
  {
    slug: "chat-starter",
    isNew: true,
    name: "Chat Starter",
    group: "Templates",
    summary: "A complete chat app to put your own model behind; demo replies until you connect one.",
    imports: ["ChatStarter"],
    preview: () => <TemplatePreview template={TEMPLATES.ChatStarter} />,
    demo: () => <TemplateFrame template={TEMPLATES.ChatStarter} />,
  },
  {
    slug: "ai-chat",
    isNew: true,
    name: "AI Chat",
    group: "Templates",
    summary: "Chat with a code panel: code in replies opens as files beside the thread.",
    imports: ["AiChat"],
    preview: () => <TemplatePreview template={TEMPLATES.AiChat} />,
    demo: () => <TemplateFrame template={TEMPLATES.AiChat} />,
  },
  {
    slug: "multi-agent-chat",
    isNew: true,
    name: "Multi-agent Chat",
    group: "Templates",
    summary: "A team of agents with animated avatars; talk to one or the team, and edit avatars live.",
    imports: ["MultiAgentChat"],
    preview: () => <TemplatePreview template={TEMPLATES.MultiAgentChat} />,
    demo: () => <TemplateFrame template={TEMPLATES.MultiAgentChat} />,
  },
  {
    slug: "ai-image-generation",
    isNew: true,
    name: "AI Image Generation",
    group: "Templates",
    summary: "Prompts resolving into four variations, with a gallery and large preview.",
    imports: ["AiImageGeneration"],
    preview: () => <TemplatePreview template={TEMPLATES.AiImageGeneration} />,
    demo: () => <TemplateFrame template={TEMPLATES.AiImageGeneration} />,
  },
  {
    slug: "ai-profile",
    isNew: true,
    name: "AI Profile",
    group: "Templates",
    summary: "One person's year with AI tools: activity, strengths, busiest days and favourite tools.",
    imports: ["AiProfile"],
    preview: () => <TemplatePreview template={TEMPLATES.AiProfile} />,
    demo: () => <TemplateFrame template={TEMPLATES.AiProfile} />,
  },
  {
    slug: "home-dashboard",
    isNew: true,
    name: "Home Dashboard",
    group: "Templates",
    summary: "Sidebar, KPIs, revenue against last year, orders and the customers table.",
    imports: ["HomeDashboard"],
    preview: () => <TemplatePreview template={TEMPLATES.HomeDashboard} />,
    demo: () => <TemplateFrame template={TEMPLATES.HomeDashboard} />,
  },
  {
    slug: "finance-dashboard",
    isNew: true,
    name: "Finance Dashboard",
    group: "Templates",
    summary: "Balance and spending trends, cash flow as a Sankey, budget rings and transactions.",
    imports: ["FinanceDashboard"],
    preview: () => <TemplatePreview template={TEMPLATES.FinanceDashboard} />,
    demo: () => <TemplateFrame template={TEMPLATES.FinanceDashboard} />,
  },
  {
    slug: "marketing-dashboard",
    isNew: true,
    name: "Marketing Dashboard",
    group: "Templates",
    summary: "Spend and return, the acquisition funnel, channel traffic, lead stages and campaigns.",
    imports: ["MarketingDashboard"],
    preview: () => <TemplatePreview template={TEMPLATES.MarketingDashboard} />,
    demo: () => <TemplateFrame template={TEMPLATES.MarketingDashboard} />,
  },
  {
    slug: "medical-profile",
    isNew: true,
    name: "Medical Profile",
    group: "Templates",
    summary: "A fictional patient overview: vitals with trends, sleep, activity, alerts and medication.",
    imports: ["MedicalProfile"],
    preview: () => <TemplatePreview template={TEMPLATES.MedicalProfile} />,
    demo: () => <TemplateFrame template={TEMPLATES.MedicalProfile} />,
  },
  {
    slug: "project-board",
    isNew: true,
    name: "Project Board",
    group: "Templates",
    summary: "A sprint as a kanban board with a ticket panel, agent token usage and comments.",
    imports: ["ProjectBoard"],
    preview: () => <TemplatePreview template={TEMPLATES.ProjectBoard} />,
    demo: () => <TemplateFrame template={TEMPLATES.ProjectBoard} />,
  },
];

const groupIndex = (entry: CatalogEntry) => GROUPS.findIndex((g) => g.name === entry.group);

/**
 * Every entry, in book order: by chapter, and within a chapter the originals
 * first. (The sort is stable, so each list keeps its own order.) Previous /
 * next links walk this order.
 */
export const CATALOG: CatalogEntry[] = [
  ...BASE_CATALOG,
  ...ACTION_ENTRIES,
  ...FORM_ENTRIES,
  ...SELECTION_ENTRIES,
  ...NAVIGATION_ENTRIES,
  ...FEEDBACK_ENTRIES,
  ...OVERLAY_ENTRIES,
  ...DATA_DISPLAY_ENTRIES,
  ...LAYOUT_ENTRIES,
  ...DATE_ENTRIES,
  ...MORE_ENTRIES,
  ...NINE_ENTRIES,
  ...PARITY_ENTRIES,
]
  .map((entry) => ({ ...entry, aliases: entry.aliases ?? ALIASES[entry.slug] }))
  .sort((x, y) => groupIndex(x) - groupIndex(y));

// Two entries with one slug would leave one page unreachable; say so while developing.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const entry of CATALOG) {
    if (seen.has(entry.slug)) console.error(`Catalog: duplicate slug "${entry.slug}"`);
    seen.add(entry.slug);
  }
}

export const findEntry =(slug: string) => CATALOG.find((entry) => entry.slug === slug);
