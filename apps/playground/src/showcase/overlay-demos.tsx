import { useState } from "react";
import type { ReactNode } from "react";
import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiBarChartBoxLine,
  RiBold,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiFileTextLine,
  RiFilter3Line,
  RiItalic,
  RiLinkM,
  RiMailLine,
  RiPencilLine,
  RiPushpinLine,
  RiShareLine,
  RiTeamLine,
  RiUnderline,
  RiWallet3Line,
  RiZoomInLine,
  RiZoomOutLine,
} from "@remixicon/react";
import {
  AlertDialog,
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  ContextMenu,
  ContextMenuArea,
  Dialog,
  DialogTrigger,
  Drawer,
  HoverCard,
  Input,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  Menubar,
  MenubarMenu,
  Modal,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuPanelLink,
  Popover,
  PopoverTrigger,
  RadioGroup,
  Radio,
  Stepper,
  SubmenuTrigger,
  Switch,
  Textarea,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  focusRingNative,
  toast,
} from "@windesign-ds/react";
import type { Selection } from "react-aria-components";
import type { CatalogEntry } from "./catalog";

// ─── Static stand-ins for the index figures ────────────────────────────────
// Overlays only exist once opened, so the contents page shows a drawing of
// one in place, built from the same tokens.

function MockPage({ children, align = "center" }: { children: ReactNode; align?: "center" | "end" }) {
  return (
    <div className="relative flex h-44 w-full max-w-sm overflow-hidden rounded-surface border border-line bg-canvas">
      <div aria-hidden className="flex flex-1 flex-col gap-2 p-4">
        <span className="h-2 w-1/3 rounded-full bg-muted" />
        <span className="h-2 w-2/3 rounded-full bg-muted" />
        <span className="h-2 w-1/2 rounded-full bg-muted" />
      </div>
      <div className={align === "end" ? "absolute inset-0 flex justify-end bg-scrim" : "absolute inset-0 flex items-center justify-center bg-scrim p-4"}>{children}</div>
    </div>
  );
}

function MockMenu({ rows, className }: { rows: { label: string; shortcut?: string; danger?: boolean; checked?: boolean }[]; className?: string }) {
  return (
    <div className={`flex w-48 flex-col gap-0.5 rounded-overlay border glass-panel p-1.5 shadow-overlay ${className ?? ""}`}>
      {rows.map((row, i) =>
        row.label === "—" ? (
          <span key={i} className="mx-1 my-1 h-px bg-line" />
        ) : (
          <span
            key={i}
            className={`flex items-center gap-2 rounded-control-md px-2 py-1.5 text-body-sm-strong ${i === 0 ? "bg-surface-hover" : ""} ${row.danger ? "text-fg-danger" : "text-fg"}`}
          >
            {row.checked !== undefined && <span className="w-3 text-accent-600">{row.checked ? "✓" : ""}</span>}
            <span className="flex-1">{row.label}</span>
            {row.shortcut && <span className="font-mono text-caption text-fg-secondary">{row.shortcut}</span>}
          </span>
        ),
      )}
    </div>
  );
}

// ─── Demos ─────────────────────────────────────────────────────────────────

function DialogDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DialogTrigger>
        <Button>Edit profile</Button>
        <Modal size="md">
          <Dialog
            kicker="Account · Profile"
            title="Edit profile"
            description="Your name and bio appear on every comment you leave."
            footer={({ close }) => (
              <>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    close();
                    toast.success("Profile saved");
                  }}
                >
                  Save changes
                </Button>
              </>
            )}
          >
            <div className="flex flex-col gap-4">
              <Input label="Display name" defaultValue="Riley Chen" />
              <Textarea label="Bio" defaultValue="Designs the paper, inks the type." />
            </div>
          </Dialog>
        </Modal>
      </DialogTrigger>
      <DialogTrigger>
        <Button variant="secondary">Read the terms</Button>
        <Modal size="lg">
          <Dialog title="Terms of service" footer={({ close }) => <Button onPress={close}>I understand</Button>} bodyClassName="max-h-80">
            <div className="flex flex-col gap-3 text-fg-secondary">
              {Array.from({ length: 8 }, (_, i) => (
                <p key={i}>
                  {i + 1}. A long body scrolls on its own while the header and footer stay put, so the actions are always in reach. Escape or the close
                  button dismisses it and focus goes back to the button that opened it.
                </p>
              ))}
            </div>
          </Dialog>
        </Modal>
      </DialogTrigger>
    </div>
  );
}

function AlertDialogDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DialogTrigger>
        <Button variant="danger" leadingIcon={RiDeleteBinLine}>
          Delete project
        </Button>
        <AlertDialog
          variant="danger"
          title="Delete “Atlas”?"
          primaryActionLabel="Delete project"
          onPrimaryAction={() => new Promise((resolve) => setTimeout(resolve, 900)).then(() => toast.success("Project deleted"))}
        >
          Its 24 boards and their history go with it. This can't be undone.
        </AlertDialog>
      </DialogTrigger>
      <DialogTrigger>
        <Button variant="secondary">Leave without saving</Button>
        <AlertDialog title="Save your changes?" primaryActionLabel="Save" secondaryActionLabel="Discard" onPrimaryAction={() => void toast.success("Saved")}>
          You've edited three fields since the last save.
        </AlertDialog>
      </DialogTrigger>
    </div>
  );
}

function DrawerDemo() {
  const [placement, setPlacement] = useState<"end" | "start" | "bottom">("end");
  return (
    <div className="flex flex-col items-center gap-4">
      <RadioGroup aria-label="Placement" orientation="horizontal" value={placement} onChange={(v) => setPlacement(v as typeof placement)} className="flex gap-4">
        <Radio value="start">Start</Radio>
        <Radio value="end">End</Radio>
        <Radio value="bottom">Bottom</Radio>
      </RadioGroup>
      <DialogTrigger>
        <Button leadingIcon={RiFilter3Line}>Filters</Button>
        <Drawer placement={placement} size={placement === "bottom" ? "md" : "sm"}>
          <Dialog
            title="Filters"
            description="Narrow the board to what matters this week."
            footer={({ close }) => (
              <>
                <Button variant="tertiary" onPress={close}>
                  Reset
                </Button>
                <Button onPress={close}>Show 18 tasks</Button>
              </>
            )}
          >
            <div className="flex flex-col gap-5">
              <CheckboxGroup label="Status" defaultValue={["todo", "doing"]}>
                <Checkbox value="todo">To do</Checkbox>
                <Checkbox value="doing">In progress</Checkbox>
                <Checkbox value="review">In review</Checkbox>
                <Checkbox value="done">Done</Checkbox>
              </CheckboxGroup>
              <Switch defaultSelected>Only my tasks</Switch>
            </div>
          </Dialog>
        </Drawer>
      </DialogTrigger>
    </div>
  );
}

function PopoverDemo() {
  return (
    <PopoverTrigger>
      <Button variant="secondary" leadingIcon={RiShareLine}>
        Share
      </Button>
      <Popover title="Share “Q3 plan”" placement="bottom">
        <div className="flex w-64 flex-col gap-3">
          <Input aria-label="Invite by email" placeholder="name@company.com" leadingIcon={RiMailLine} />
          <Switch defaultSelected>Anyone with the link can view</Switch>
          <Button variant="secondary" leadingIcon={RiLinkM} onPress={() => toast.success("Link copied")}>
            Copy link
          </Button>
        </div>
      </Popover>
    </PopoverTrigger>
  );
}

function ProfileCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar size="md" initials="RC" color="blue" />
        <div className="flex flex-col">
          <span className="text-body-md-strong text-fg">Riley Chen</span>
          <span className="text-body-sm text-fg-secondary">Design lead · Lisbon</span>
        </div>
      </div>
      <p className="text-body-sm text-fg-secondary">Looks after the type scale and the paper palette. Usually reviewing on Thursdays.</p>
      <div className="flex gap-4 border-t border-line pt-3 font-mono text-caption text-fg-secondary">
        <span>
          <span className="text-fg">128</span> reviews
        </span>
        <span>
          <span className="text-fg">14</span> projects
        </span>
      </div>
    </div>
  );
}

function HoverCardDemo() {
  return (
    <p className="max-w-sm text-body-md text-fg">
      The new corner scale was proposed by{" "}
      <HoverCard
        trigger={
          <a href="#/components/hover-card" className={`rounded-xs text-accent-600 underline decoration-accent-300 underline-offset-4 hover:decoration-accent-600 ${focusRingNative}`}>
            @riley
          </a>
        }
      >
        <ProfileCard />
      </HoverCard>{" "}
      and approved last week.
    </p>
  );
}

function FileMenu({ onAction }: { onAction: (key: string) => void }) {
  return (
    <Menu aria-label="File actions" onAction={(key) => onAction(String(key))}>
      <MenuItem id="open" icon={RiFileTextLine} shortcut="↵">
        Open
      </MenuItem>
      <MenuItem id="rename" icon={RiPencilLine} shortcut="F2">
        Rename
      </MenuItem>
      <MenuItem id="duplicate" icon={RiFileCopyLine} shortcut="⌘D">
        Duplicate
      </MenuItem>
      <MenuSeparator />
      <MenuItem id="delete" icon={RiDeleteBinLine} variant="danger" shortcut="⌫">
        Move to trash
      </MenuItem>
    </Menu>
  );
}

function ContextMenuDemo() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      {["Quarterly report.pdf", "Brand guide.fig"].map((name) => (
        <ContextMenu key={name}>
          <ContextMenuArea aria-label={name} className="flex flex-col items-center gap-2 rounded-surface border border-line bg-surface p-5 text-center">
            <RiFileTextLine aria-hidden className="size-8 text-icon-secondary" />
            <span className="text-body-sm-strong text-fg">{name}</span>
            <span className="text-caption text-fg-secondary">Right-click, long-press or Shift+F10</span>
          </ContextMenuArea>
          <FileMenu onAction={(key) => toast.show(`${key} · ${name}`)} />
        </ContextMenu>
      ))}
    </div>
  );
}

function MenuDemo() {
  const [view, setView] = useState<Selection>(new Set(["grid"]));
  const [panels, setPanels] = useState<Selection>(new Set(["rulers"]));
  return (
    <div className="flex flex-wrap items-center gap-3">
      <MenuTrigger>
        <Button variant="secondary">Edit</Button>
        <Menu onAction={(key) => toast.show(`${String(key)}`)}>
          <MenuSection title="History">
            <MenuItem id="Undo" shortcut="⌘Z">
              Undo
            </MenuItem>
            <MenuItem id="Redo" shortcut="⇧⌘Z" isDisabled>
              Redo
            </MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuItem id="Duplicate" icon={RiFileCopyLine} description="Copies every layer">
            Duplicate
          </MenuItem>
          <SubmenuTrigger>
            <MenuItem id="share" icon={RiShareLine}>
              Share
            </MenuItem>
            <Menu onAction={(key) => toast.show(`Shared by ${String(key)}`)}>
              <MenuItem id="email" icon={RiMailLine}>
                Email
              </MenuItem>
              <MenuItem id="link" icon={RiLinkM}>
                Copy link
              </MenuItem>
            </Menu>
          </SubmenuTrigger>
          <MenuSeparator />
          <MenuItem id="Deleted" icon={RiDeleteBinLine} variant="danger">
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <MenuTrigger>
        <Button variant="secondary">View</Button>
        <Menu aria-label="View">
          <MenuSection title="Layout" selectionMode="single" selectedKeys={view} onSelectionChange={setView}>
            <MenuItem id="grid">Grid</MenuItem>
            <MenuItem id="list">List</MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuSection title="Panels" selectionMode="multiple" selectedKeys={panels} onSelectionChange={setPanels}>
            <MenuItem id="rulers">Rulers</MenuItem>
            <MenuItem id="guides">Guides</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    </div>
  );
}

function MenubarDemo() {
  const run = (key: string | number) => toast.show(String(key));
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu label="File">
        <Menu onAction={run}>
          <MenuItem id="New" shortcut="⌘N">
            New
          </MenuItem>
          <MenuItem id="Open…" shortcut="⌘O">
            Open…
          </MenuItem>
          <SubmenuTrigger>
            <MenuItem id="recent">Open recent</MenuItem>
            <Menu onAction={run}>
              <MenuItem id="Atlas.fig">Atlas.fig</MenuItem>
              <MenuItem id="Ledger.fig">Ledger.fig</MenuItem>
            </Menu>
          </SubmenuTrigger>
          <MenuSeparator />
          <MenuItem id="Export" shortcut="⇧⌘E">
            Export
          </MenuItem>
        </Menu>
      </MenubarMenu>
      <MenubarMenu label="Edit">
        <Menu onAction={run}>
          <MenuItem id="Undo" shortcut="⌘Z">
            Undo
          </MenuItem>
          <MenuItem id="Redo" shortcut="⇧⌘Z">
            Redo
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="Find" shortcut="⌘F">
            Find
          </MenuItem>
        </Menu>
      </MenubarMenu>
      <MenubarMenu label="View">
        <Menu onAction={run}>
          <MenuItem id="Zoom in" shortcut="⌘+" icon={RiZoomInLine}>
            Zoom in
          </MenuItem>
          <MenuItem id="Zoom out" shortcut="⌘−" icon={RiZoomOutLine}>
            Zoom out
          </MenuItem>
        </Menu>
      </MenubarMenu>
      <MenubarMenu label="Help">
        <Menu onAction={run}>
          <MenuItem id="Keyboard shortcuts" shortcut="?">
            Keyboard shortcuts
          </MenuItem>
        </Menu>
      </MenubarMenu>
    </Menubar>
  );
}

function ToolbarDemo() {
  const [align, setAlign] = useState<Selection>(new Set(["left"]));
  return (
    <Toolbar aria-label="Text formatting">
      <ToggleButtonGroup aria-label="Style" selectionMode="multiple" defaultSelectedKeys={["bold"]}>
        <ToggleButton id="bold" icon={RiBold} aria-label="Bold" size="sm" />
        <ToggleButton id="italic" icon={RiItalic} aria-label="Italic" size="sm" />
        <ToggleButton id="underline" icon={RiUnderline} aria-label="Underline" size="sm" />
      </ToggleButtonGroup>
      <ToolbarSeparator />
      <ToggleButtonGroup aria-label="Alignment" selectionMode="single" disallowEmptySelection selectedKeys={align} onSelectionChange={setAlign}>
        <ToggleButton id="left" icon={RiAlignLeft} aria-label="Align left" size="sm" />
        <ToggleButton id="center" icon={RiAlignCenter} aria-label="Align centre" size="sm" />
        <ToggleButton id="right" icon={RiAlignRight} aria-label="Align right" size="sm" />
      </ToggleButtonGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Insert">
        <Button variant="tertiary" size="sm" leadingIcon={RiLinkM}>
          Link
        </Button>
      </ToolbarGroup>
    </Toolbar>
  );
}

function ToggleButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleButton icon={RiPushpinLine} defaultSelected>
          Pinned
        </ToggleButton>
        <ToggleButton icon={RiBold} aria-label="Bold" />
        <ToggleButton isDisabled>Disabled</ToggleButton>
      </div>
      <ToggleButtonGroup aria-label="Range" selectionMode="single" disallowEmptySelection defaultSelectedKeys={["week"]}>
        <ToggleButton id="day" size="sm">
          Day
        </ToggleButton>
        <ToggleButton id="week" size="sm">
          Week
        </ToggleButton>
        <ToggleButton id="month" size="sm">
          Month
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

function NavigationMenuDemo() {
  return (
    <div className="flex h-72 w-full items-start justify-center">
      <NavigationMenu aria-label="Main">
        <NavigationMenuLink href="#/components/navigation-menu" isCurrent>
          Overview
        </NavigationMenuLink>
        <NavigationMenuItem label="Products" footer={<a href="#/components/navigation-menu" className="text-fg underline underline-offset-4">See every product →</a>}>
          <NavigationMenuPanelLink href="#/components/navigation-menu" icon={RiBarChartBoxLine} title="Analytics" description="Dashboards that read like a broadsheet." />
          <NavigationMenuPanelLink href="#/components/navigation-menu" icon={RiWallet3Line} title="Billing" description="Invoices, plans and receipts." />
          <NavigationMenuPanelLink href="#/components/navigation-menu" icon={RiTeamLine} title="Teams" description="Seats, roles and reviews." />
          <NavigationMenuPanelLink href="#/components/navigation-menu" icon={RiFileTextLine} title="Docs" description="Guides and the API reference." />
        </NavigationMenuItem>
        <NavigationMenuItem label="Company" columns={1}>
          <NavigationMenuPanelLink href="#/components/navigation-menu" title="About" description="Who makes this and why." />
          <NavigationMenuPanelLink href="#/components/navigation-menu" title="Careers" description="Two open roles." />
        </NavigationMenuItem>
        <NavigationMenuLink href="#/components/navigation-menu">Pricing</NavigationMenuLink>
      </NavigationMenu>
    </div>
  );
}

const CHECKOUT = [
  { id: "cart", label: "Cart", description: "3 items" },
  { id: "shipping", label: "Shipping", description: "Address and speed" },
  { id: "payment", label: "Payment", description: "Card or invoice" },
  { id: "review", label: "Review", description: "Check and place" },
];

function StepperDemo() {
  const [current, setCurrent] = useState("payment");
  const index = CHECKOUT.findIndex((s) => s.id === current);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Stepper steps={CHECKOUT} currentStep={current} onStepChange={setCurrent} aria-label="Checkout progress" />
      <div className="flex justify-between border-t border-line pt-4">
        <Button variant="secondary" isDisabled={index === 0} onPress={() => setCurrent(CHECKOUT[index - 1]!.id)}>
          Back
        </Button>
        <Button isDisabled={index === CHECKOUT.length - 1} onPress={() => setCurrent(CHECKOUT[index + 1]!.id)}>
          Continue
        </Button>
      </div>
    </div>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

export const OVERLAY_ENTRIES: CatalogEntry[] = [
  {
    slug: "dialog",
    isNew: true,
    name: "Dialog",
    group: "Overlays",
    summary: "A ruled page over the page: header, scrolling body and an action strip.",
    imports: ["DialogTrigger", "Modal", "Dialog"],
    preview: () => (
      <MockPage>
        <div className="flex w-56 flex-col overflow-hidden rounded-overlay border glass-panel shadow-overlay">
          <span className="border-b border-line px-3 py-2 font-display text-body-md-strong text-fg">Edit profile</span>
          <span className="flex flex-col gap-1.5 px-3 py-3">
            <span className="h-6 rounded-control-sm ring-1 ring-line-control ring-inset" />
            <span className="h-6 rounded-control-sm ring-1 ring-line-control ring-inset" />
          </span>
          <span className="flex justify-end gap-1.5 border-t border-line bg-sunken px-3 py-2">
            <span className="h-5 w-12 rounded-control-xs border border-line-control bg-surface" />
            <span className="h-5 w-12 rounded-control-xs bg-strong" />
          </span>
        </div>
      </MockPage>
    ),
    demo: () => <DialogDemo />,
  },
  {
    slug: "alert-dialog",
    isNew: true,
    name: "Alert Dialog",
    group: "Overlays",
    summary: "Asks for a decision before going on. Destructive ones focus Cancel first.",
    imports: ["DialogTrigger", "AlertDialog"],
    preview: () => (
      <MockPage>
        <div className="flex w-56 flex-col overflow-hidden rounded-overlay border glass-panel shadow-overlay">
          <span className="flex gap-2.5 px-3 pt-3 pb-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-status-danger text-status-danger-text">!</span>
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-body-md-strong text-fg">Delete “Atlas”?</span>
              <span className="text-caption text-fg-secondary">This can't be undone.</span>
            </span>
          </span>
          <span className="flex justify-end gap-1.5 border-t border-line bg-sunken px-3 py-2">
            <span className="h-5 w-12 rounded-control-xs border border-line-control bg-surface" />
            <span className="h-5 w-14 rounded-control-xs bg-status-danger-solid" />
          </span>
        </div>
      </MockPage>
    ),
    demo: () => <AlertDialogDemo />,
  },
  {
    slug: "drawer",
    isNew: true,
    name: "Drawer",
    group: "Overlays",
    summary: "A dialog that slides in from an edge and runs the full height of the screen.",
    imports: ["DialogTrigger", "Drawer", "Dialog"],
    preview: () => (
      <MockPage align="end">
        <div className="flex h-full w-36 flex-col border-s glass-panel shadow-overlay">
          <span className="border-b border-line px-3 py-2 font-display text-body-sm-strong text-fg">Filters</span>
          <span className="flex flex-col gap-2 p-3">
            {["To do", "In progress", "Done"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5 text-caption text-fg">
                <span className={`size-3 rounded-xs ${i < 2 ? "bg-accent-600" : "ring-1 ring-line-control"}`} />
                {s}
              </span>
            ))}
          </span>
        </div>
      </MockPage>
    ),
    demo: () => <DrawerDemo />,
  },
  {
    slug: "popover",
    isNew: true,
    name: "Popover",
    group: "Overlays",
    summary: "A small dialog anchored to its trigger, for settings and short forms.",
    imports: ["PopoverTrigger", "Popover"],
    preview: () => (
      <div className="flex flex-col items-center">
        <div className="flex w-52 flex-col gap-2 rounded-overlay border glass-panel p-3 shadow-overlay">
          <span className="text-body-sm-strong text-fg">Share “Q3 plan”</span>
          <span className="h-6 rounded-control-sm ring-1 ring-line-control ring-inset" />
          <span className="h-6 w-24 rounded-control-sm border border-line-control" />
        </div>
        <svg aria-hidden width={14} height={8} viewBox="0 0 14 8" className="-mt-px fill-surface stroke-line">
          <path d="M0 0 L7 7 L14 0" />
        </svg>
        <Button variant="secondary" size="sm" leadingIcon={RiShareLine} className="mt-1">
          Share
        </Button>
      </div>
    ),
    demo: () => <PopoverDemo />,
  },
  {
    slug: "hover-card",
    isNew: true,
    name: "Hover Card",
    group: "Overlays",
    summary: "A preview that opens while the pointer rests on a link, such as an @mention.",
    imports: ["HoverCard"],
    preview: () => (
      <div className="flex flex-col items-start gap-1">
        <span className="text-body-sm text-fg">
          Proposed by <span className="text-accent-600 underline underline-offset-4">@riley</span>
        </span>
        <div className="w-60 rounded-overlay border glass-panel p-3 shadow-overlay">
          <ProfileCard />
        </div>
      </div>
    ),
    demo: () => <HoverCardDemo />,
  },
  {
    slug: "context-menu",
    isNew: true,
    name: "Context Menu",
    group: "Overlays",
    summary: "A menu that opens where you right-click, long-press or press Shift+F10.",
    imports: ["ContextMenu", "ContextMenuArea", "Menu", "MenuItem"],
    preview: () => (
      <div className="relative h-44 w-64">
        <div className="absolute start-0 top-0 flex w-40 flex-col items-center gap-1 rounded-surface border border-line bg-surface p-4">
          <RiFileTextLine aria-hidden className="size-7 text-icon-secondary" />
          <span className="text-caption-strong text-fg">Report.pdf</span>
        </div>
        <MockMenu
          className="absolute start-20 top-14"
          rows={[{ label: "Open", shortcut: "↵" }, { label: "Rename", shortcut: "F2" }, { label: "—" }, { label: "Move to trash", danger: true }]}
        />
      </div>
    ),
    demo: () => <ContextMenuDemo />,
  },
  {
    slug: "menu",
    isNew: true,
    name: "Menu",
    group: "Overlays",
    summary: "A real ARIA menu: sections, shortcuts, submenus and checkable items.",
    imports: ["MenuTrigger", "Menu", "MenuItem", "MenuSection", "MenuSeparator", "SubmenuTrigger"],
    preview: () => (
      <div className="flex flex-col items-start gap-1.5">
        <Button variant="secondary" size="sm">
          Edit
        </Button>
        <MockMenu rows={[{ label: "Undo", shortcut: "⌘Z" }, { label: "Duplicate", shortcut: "⌘D" }, { label: "Show grid", checked: true }, { label: "—" }, { label: "Delete", danger: true }]} />
      </div>
    ),
    demo: () => <MenuDemo />,
  },
];

export const NAVIGATION_ENTRIES: CatalogEntry[] = [
  {
    slug: "menubar",
    isNew: true,
    name: "Menubar",
    group: "Navigation",
    summary: "An application's row of menus. One tab stop; arrows move along it and between menus.",
    imports: ["Menubar", "MenubarMenu", "Menu", "MenuItem"],
    preview: () => (
      <div className="flex flex-col items-start gap-1">
        <div className="flex gap-0.5 rounded-surface border border-line bg-surface p-1">
          {["File", "Edit", "View", "Help"].map((m, i) => (
            <span key={m} className={`rounded-control-sm px-2.5 py-1 text-body-sm-strong text-fg ${i === 0 ? "bg-surface-pressed" : ""}`}>
              {m}
            </span>
          ))}
        </div>
        <MockMenu rows={[{ label: "New", shortcut: "⌘N" }, { label: "Open…", shortcut: "⌘O" }, { label: "Export", shortcut: "⇧⌘E" }]} />
      </div>
    ),
    demo: () => <MenubarDemo />,
  },
  {
    slug: "navigation-menu",
    isNew: true,
    name: "Navigation Menu",
    group: "Navigation",
    summary: "A site's main navigation, with entries that open panels of links.",
    imports: ["NavigationMenu", "NavigationMenuLink", "NavigationMenuItem", "NavigationMenuPanelLink"],
    preview: () => (
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="flex items-center gap-1 text-body-sm-strong text-fg-secondary">
          <span className="relative px-2.5 py-1 text-fg">
            Overview
            <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-accent-600" />
          </span>
          <span className="rounded-control-sm bg-surface-hover px-2.5 py-1 text-fg">Products ▾</span>
          <span className="px-2.5 py-1">Pricing</span>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-overlay border glass-panel p-2 shadow-overlay">
          {["Analytics", "Billing", "Teams", "Docs"].map((t) => (
            <span key={t} className="flex flex-col gap-0.5 rounded-control-md p-2">
              <span className="text-caption-strong text-fg">{t}</span>
              <span className="h-1.5 w-16 rounded-full bg-muted" />
            </span>
          ))}
        </div>
      </div>
    ),
    demo: () => <NavigationMenuDemo />,
  },
  {
    slug: "stepper",
    isNew: true,
    name: "Stepper",
    group: "Navigation",
    summary: "Where someone is in a sequence of steps, with a way back to finished ones.",
    imports: ["Stepper"],
    preview: () => <Stepper steps={CHECKOUT.slice(0, 3).map(({ id, label }) => ({ id, label }))} currentStep="shipping" className="w-full max-w-sm" />,
    demo: () => <StepperDemo />,
  },
];

export const ACTION_ENTRIES: CatalogEntry[] = [
  {
    slug: "toggle-button",
    isNew: true,
    name: "Toggle Button",
    group: "Actions",
    summary: "A button that stays pressed, alone or joined into a group.",
    imports: ["ToggleButton", "ToggleButtonGroup"],
    preview: () => <ToggleButtonDemo />,
  },
  {
    slug: "toolbar",
    isNew: true,
    name: "Toolbar",
    group: "Actions",
    summary: "A strip of related controls that is one tab stop, with arrow keys inside.",
    imports: ["Toolbar", "ToolbarGroup", "ToolbarSeparator"],
    preview: () => <ToolbarDemo />,
  },
];
