import { useContext, useRef, useState, type ReactNode } from "react";
import {
  RiAddLine,
  RiAirplayFill,
  RiApps2Line,
  RiArrowLeftSLine,
  RiBluetoothFill,
  RiBookmarkLine,
  RiCalculatorLine,
  RiCalendar2Line,
  RiCameraLine,
  RiChat3Fill,
  RiCompass3Fill,
  RiDeleteBinLine,
  RiEditLine,
  RiFileCopyLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiFolder3Fill,
  RiFolderLine,
  RiGlobalFill,
  RiHeartLine,
  RiHome5Fill,
  RiImageFill,
  RiMailFill,
  RiMapPin2Fill,
  RiMoonClearFill,
  RiMoreFill,
  RiMusic2Fill,
  RiPencilFill,
  RiPlaneFill,
  RiPlayCircleFill,
  RiSearch2Line,
  RiSendPlaneFill,
  RiSettings3Fill,
  RiShareForwardLine,
  RiSignalTowerFill,
  RiSunLine,
  RiTerminalBoxLine,
  RiUser3Fill,
  RiVolumeUpLine,
  RiWifiFill,
} from "@remixicon/react";
import {
  Button,
  ControlCenter,
  GlassBackdrop,
  GlassDock,
  GlassSheet,
  GlassTabBar,
  GlassToolbar,
  MorphMenu,
  NotificationStack,
  NowPlaying,
  SpotlightSearch,
  WheelPicker,
  promptArt,
  toast,
  useMinimizeOnScroll,
  useTheme,
} from "@windesign-ds/react";
import type { DockItem, GlassTab, GlassToolbarGroup, MorphMenuSection, NowPlayingTrack, SpotlightGroup, StackNotification, WheelColumn } from "@windesign-ds/react";
import type { CatalogEntry } from "./catalog";
import { FitPreview, InPreview } from "./fit-preview";

// ─── Shared stage ──────────────────────────────────────────────────────────

/** These are made for the glass material, so offer it to anyone on another brand. */
function ViewInGlass() {
  const { brand, setBrand } = useTheme();
  if (brand === "glass") return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-surface bg-sunken px-3 py-2">
      <p className="text-body-sm text-fg-secondary">Other brands show this on solid surfaces. The glass needs the Glass theme.</p>
      <Button
        variant="secondary"
        size="xs"
        onPress={(event) => {
          const box = event.target.getBoundingClientRect();
          setBrand("glass", { x: box.left + box.width / 2, y: box.top + box.height / 2 });
        }}
      >
        View in Glass
      </Button>
    </div>
  );
}

function Demo({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <ViewInGlass />
      {children}
    </div>
  );
}

/** Something colourful for the glass to work on. */
function Wallpaper({ name = "evening harbour", className, children }: { name?: string; className?: string; children: ReactNode }) {
  const compact = useContext(InPreview);
  return (
    <div className={`flex w-full items-center justify-center overflow-hidden rounded-panel ${compact ? "min-h-44 p-3" : "min-h-96 p-4 sm:p-8"} ${className ?? ""}`} style={{ background: promptArt(name) }}>
      {children}
    </div>
  );
}

const FEED = ["Salt flats at dawn", "Harbour lights", "Forest after rain", "Glasshouse", "Night market", "Tide pools", "Red canyon", "Northern lights", "Paper lanterns", "Sea stacks", "Moss garden", "Desert bloom"];

/** A scrolling page of pictures, so glass has real content passing beneath it. */
function PhotoFeed({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-2 p-2 ${className ?? ""}`}>
      {FEED.map((title, index) => (
        <figure key={title} className={index % 5 === 0 ? "col-span-2 m-0" : "m-0"}>
          <div aria-hidden className={`w-full rounded-tile ${index % 5 === 0 ? "aspect-video" : "aspect-square"}`} style={{ background: promptArt(title) }} />
          <figcaption className="px-1 pt-1 text-body-sm text-fg">{title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const QUEUE: NowPlayingTrack[] = [
  { id: "tide", title: "Slow Tide", artist: "Mira Okafor", artwork: promptArt("Slow Tide"), duration: 214 },
  { id: "glass", title: "Thin Glass", artist: "Jonas Lind", artwork: promptArt("Thin Glass"), duration: 187 },
  { id: "north", title: "North Window", artist: "Priya Raman", artwork: promptArt("North Window"), duration: 243 },
];

// ─── Tab bar ───────────────────────────────────────────────────────────────

const TABS: GlassTab[] = [
  { id: "home", label: "Home", icon: RiHome5Fill },
  { id: "explore", label: "Explore", icon: RiCompass3Fill },
  { id: "library", label: "Library", icon: RiPlayCircleFill, badge: 3 },
  { id: "you", label: "You", icon: RiUser3Fill },
];

function TabBarDemo() {
  const scroller = useRef<HTMLDivElement>(null);
  const minimized = useMinimizeOnScroll(scroller);
  return (
    <div className="relative mx-auto h-140 w-full max-w-sm overflow-hidden rounded-panel bg-canvas">
      <div ref={scroller} className="scrollbar-none h-full overflow-y-auto pb-40">
        <PhotoFeed />
      </div>
      <div className="absolute inset-x-3 bottom-3">
        <GlassTabBar
          tabs={TABS}
          minimized={minimized}
          onExpand={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })}
          onSearch={() => toast.show("Search")}
          accessory={<NowPlaying variant="mini" queue={QUEUE} />}
        />
      </div>
    </div>
  );
}

// ─── Toolbar ───────────────────────────────────────────────────────────────

function ToolbarDemo() {
  const [liked, setLiked] = useState(false);
  const leading: GlassToolbarGroup[] = [{ id: "back", actions: [{ id: "back", label: "Back", icon: RiArrowLeftSLine, onPress: () => toast.show("Back") }] }];
  const trailing: GlassToolbarGroup[] = [
    {
      id: "item",
      actions: [
        { id: "like", label: "Like", icon: RiHeartLine, isSelected: liked, onSelectedChange: setLiked },
        { id: "save", label: "Save", icon: RiBookmarkLine, onPress: () => toast.show("Saved") },
        { id: "share", label: "Share", icon: RiShareForwardLine, onPress: () => toast.show("Shared") },
      ],
    },
    { id: "edit", actions: [{ id: "edit", label: "Edit", icon: RiEditLine, onPress: () => toast.show("Edit"), isProminent: true }] },
  ];
  return (
    <div className="relative h-120 w-full overflow-hidden rounded-panel bg-canvas">
      <div className="scrollbar-none h-full overflow-y-auto pt-16">
        <PhotoFeed />
      </div>
      <div className="absolute inset-x-0 top-2">
        <GlassToolbar aria-label="Photo actions" title="Tide pools" leading={leading} trailing={trailing} />
      </div>
    </div>
  );
}

// ─── Morph menu ────────────────────────────────────────────────────────────

const MENU: MorphMenuSection[] = [
  {
    id: "main",
    items: [
      { id: "new", label: "New note", icon: RiAddLine, shortcut: "⌘N" },
      { id: "copy", label: "Duplicate", icon: RiFileCopyLine, shortcut: "⌘D" },
      { id: "move", label: "Move to folder", icon: RiFolderLine },
    ],
  },
  { id: "danger", items: [{ id: "delete", label: "Delete", icon: RiDeleteBinLine, isDestructive: true }] },
];

const MorphMenuDemo = () => (
  <Wallpaper name="coral reef">
    <div className="flex w-full max-w-md items-start justify-between gap-4">
      <MorphMenu aria-label="Note actions" sections={MENU} onAction={(id) => toast.show(id)}>
        <RiAddLine aria-hidden className="size-5" />
        New
      </MorphMenu>
      <MorphMenu aria-label="More" align="end" sections={MENU} onAction={(id) => toast.show(id)} className="w-11 px-0">
        <RiMoreFill aria-hidden className="size-5" />
      </MorphMenu>
    </div>
  </Wallpaper>
);

// ─── Sheet ─────────────────────────────────────────────────────────────────

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Wallpaper name="glacier bay">
      <Button onPress={() => setOpen(true)}>Open sheet</Button>
      <GlassSheet isOpen={open} onOpenChange={setOpen} title="Add to album" onConfirm={() => setOpen(false)}>
        <ul className="flex flex-col gap-2">
          {FEED.map((title) => (
            <li key={title} className="flex items-center gap-3 py-1 text-body-md text-fg">
              <span aria-hidden className="size-12 shrink-0 rounded-item" style={{ background: promptArt(title) }} />
              {title}
            </li>
          ))}
        </ul>
      </GlassSheet>
    </Wallpaper>
  );
}

// ─── Control center ────────────────────────────────────────────────────────

const ControlCenterDemo = () => (
  <GlassBackdrop image={promptArt("sunset ridge")} className="flex w-full justify-center rounded-panel p-4 sm:p-8">
    <ControlCenter
      connectivity={[
        { id: "airplane", label: "Airplane mode", icon: RiPlaneFill },
        { id: "cellular", label: "Mobile data", icon: RiSignalTowerFill, defaultSelected: true },
        { id: "wifi", label: "Wi-Fi", icon: RiWifiFill, defaultSelected: true },
        { id: "bluetooth", label: "Bluetooth", icon: RiBluetoothFill, defaultSelected: true },
      ]}
      media={{ title: "Slow Tide", artist: "Mira Okafor", artwork: promptArt("Slow Tide") }}
      focus={{ id: "focus", label: "Focus", detail: "Do not disturb", icon: RiMoonClearFill }}
      shortcuts={[
        { id: "torch", label: "Torch", icon: RiFlashlightLine },
        { id: "camera", label: "Camera", icon: RiCameraLine },
      ]}
      brightness={{ label: "Brightness", icon: RiSunLine, defaultValue: 65 }}
      volume={{ label: "Volume", icon: RiVolumeUpLine, defaultValue: 40 }}
    />
  </GlassBackdrop>
);

// ─── Now playing ───────────────────────────────────────────────────────────

const NowPlayingDemo = () => (
  <div className="flex w-full flex-col items-center gap-4">
    <NowPlaying queue={QUEUE} defaultPlaying />
    <Wallpaper name="Thin Glass" className="min-h-0">
      <NowPlaying variant="mini" queue={QUEUE} className="w-full max-w-sm" />
    </Wallpaper>
  </div>
);

// ─── Notifications ─────────────────────────────────────────────────────────

const NOTIFICATIONS: StackNotification[] = [
  { id: "m1", app: "Messages", icon: RiChat3Fill, title: "Mira Okafor", body: "The photos from the harbour came out so well.", time: "now" },
  { id: "m2", app: "Messages", icon: RiChat3Fill, title: "Jonas Lind", body: "Are we still on for Thursday?", time: "4m" },
  { id: "m3", app: "Messages", icon: RiChat3Fill, title: "Priya Raman", body: "Sent you the draft.", time: "12m" },
  { id: "c1", app: "Calendar", icon: RiCalendar2Line, title: "Design review", body: "Starts in 15 minutes in Room 4.", time: "9:45" },
  { id: "e1", app: "Mail", icon: RiMailFill, title: "Your invoice is ready", body: "Invoice INV-2041 for November is ready to view.", time: "8:02" },
];

const NotificationsDemo = () => (
  <Wallpaper name="lavender fields">
    <NotificationStack notifications={NOTIFICATIONS} onOpen={(item) => toast.show(item.title)} />
  </Wallpaper>
);

// ─── Dock ──────────────────────────────────────────────────────────────────

const tile = (a: number, b: number) => `linear-gradient(160deg, var(--ds-color-chart-${a}), var(--ds-color-chart-${b}))`;

const DOCK: DockItem[] = [
  { id: "files", label: "Files", icon: RiFolder3Fill, tile: tile(1, 5), isRunning: true },
  { id: "browser", label: "Browser", icon: RiGlobalFill, tile: tile(2, 1), isRunning: true },
  { id: "mail", label: "Mail", icon: RiMailFill, tile: tile(1, 2), badge: 2 },
  { id: "maps", label: "Maps", icon: RiMapPin2Fill, tile: tile(6, 2) },
  { id: "photos", label: "Photos", icon: RiImageFill, tile: tile(4, 3) },
  { id: "music", label: "Music", icon: RiMusic2Fill, tile: tile(4, 8), isRunning: true },
  { id: "notes", label: "Notes", icon: RiPencilFill, tile: tile(3, 9) },
];

const DockDemo = () => (
  <Wallpaper name="high desert" className="items-end">
    <GlassDock items={DOCK} trailing={[{ id: "settings", label: "Settings", icon: RiSettings3Fill, tile: tile(7, 7) }]} onSelect={(id) => toast.show(id)} />
  </Wallpaper>
);

// ─── Spotlight ─────────────────────────────────────────────────────────────

const SEARCHABLE: (SpotlightGroup & { category: string })[] = [
  {
    id: "apps",
    category: "apps",
    label: "Apps",
    results: [
      { id: "a-mail", title: "Mail", subtitle: "Application", icon: RiMailFill },
      { id: "a-maps", title: "Maps", subtitle: "Application", icon: RiMapPin2Fill },
      { id: "a-music", title: "Music", subtitle: "Application", icon: RiMusic2Fill },
    ],
  },
  {
    id: "files",
    category: "files",
    label: "Files",
    results: [
      { id: "f-brief", title: "Marketing brief.pdf", subtitle: "Documents", icon: RiFileTextLine },
      { id: "f-mood", title: "Moodboard", subtitle: "Design", icon: RiFolderLine },
    ],
  },
  {
    id: "actions",
    category: "actions",
    label: "Actions",
    results: [
      { id: "x-mail", title: "Send a new email", subtitle: "Mail", icon: RiSendPlaneFill },
      { id: "x-term", title: "Run a shortcut", subtitle: "Shortcuts", icon: RiTerminalBoxLine },
    ],
  },
];

function findEverywhere(query: string, category?: string) {
  const needle = query.toLowerCase();
  return new Promise<SpotlightGroup[]>((resolve) => {
    setTimeout(() => {
      resolve(
        SEARCHABLE.filter((group) => !category || group.category === category).map((group) => ({
          ...group,
          results: group.results.filter((result) => `${result.title} ${result.subtitle}`.toLowerCase().includes(needle)),
        })),
      );
    }, 220);
  });
}

const SpotlightDemo = () => (
  <Wallpaper name="deep ocean" className="min-h-120 items-start">
    <SpotlightSearch
      aria-label="Search everything"
      placeholder="Search"
      categories={[
        { id: "apps", label: "Apps", icon: RiApps2Line },
        { id: "files", label: "Files", icon: RiFileTextLine },
        { id: "actions", label: "Actions", icon: RiSearch2Line },
      ]}
      onSearch={findEverywhere}
      onSelect={(result) => toast.show(`Opened ${result.title}`)}
    />
  </Wallpaper>
);

// ─── Wheel picker ──────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
const option = (value: string) => ({ value, label: value });

const TIME: WheelColumn[] = [
  { id: "hour", label: "Hour", align: "end", options: Array.from({ length: 12 }, (_, i) => option(String(i + 1))) },
  { id: "minute", label: "Minute", options: Array.from({ length: 60 }, (_, i) => option(pad(i))) },
  { id: "period", label: "AM or PM", align: "start", options: ["AM", "PM"].map(option) },
];

function WheelDemo() {
  const [value, setValue] = useState({ hour: "9", minute: "41", period: "AM" });
  return (
    <Wallpaper name="morning fog">
      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <WheelPicker aria-label="Time" columns={TIME} value={value} onChange={(next) => setValue(next as typeof value)} />
        <p className="rounded-full bg-glass-lens px-3 py-1 text-body-sm tabular-nums text-fg">
          {value.hour}:{value.minute} {value.period}
        </p>
      </div>
    </Wallpaper>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

const entry = (config: Omit<CatalogEntry, "group" | "isNew" | "demo"> & { demo: () => ReactNode }): CatalogEntry => ({
  ...config,
  group: "Glass",
  isNew: true,
  demo: () => <Demo>{config.demo()}</Demo>,
});

export const GLASS_ENTRIES: CatalogEntry[] = [
  entry({
    slug: "glass-tab-bar",
    name: "Glass Tab Bar",
    summary: "Floating tabs with a gliding lens that minimize on scroll, with an accessory and a search tab.",
    imports: ["GlassTabBar", "useMinimizeOnScroll"],
    aliases: ["Tabs", "Bottom navigation"],
    preview: () => <FitPreview><TabBarDemo /></FitPreview>,
    demo: () => <TabBarDemo />,
  }),
  entry({
    slug: "glass-toolbar",
    name: "Glass Toolbar",
    summary: "Actions grouped on capsules over content, folding into a menu when there's no room.",
    imports: ["GlassToolbar"],
    aliases: ["Action bar"],
    preview: () => <FitPreview><ToolbarDemo /></FitPreview>,
    demo: () => <ToolbarDemo />,
  }),
  entry({
    slug: "morph-menu",
    name: "Morph Menu",
    summary: "A glass button that grows into its own menu and shrinks back when it closes.",
    imports: ["MorphMenu"],
    aliases: ["Context menu", "Dropdown"],
    preview: () => <FitPreview><MorphMenuDemo /></FitPreview>,
    demo: () => <MorphMenuDemo />,
  }),
  entry({
    slug: "glass-sheet",
    name: "Glass Sheet",
    summary: "Floats inset on glass at partial height, then settles onto the edges and turns opaque.",
    imports: ["GlassSheet"],
    aliases: ["Bottom sheet", "Modal"],
    preview: () => <FitPreview><SheetDemo /></FitPreview>,
    demo: () => <SheetDemo />,
  }),
  entry({
    slug: "control-center",
    name: "Control Center",
    summary: "Quick settings on clear glass: toggles, a media tile, shortcuts and tall sliders.",
    imports: ["ControlCenter", "GlassBackdrop"],
    aliases: ["Quick settings"],
    preview: () => <FitPreview><ControlCenterDemo /></FitPreview>,
    demo: () => <ControlCenterDemo />,
  }),
  entry({
    slug: "now-playing",
    name: "Now Playing",
    summary: "A media player that glows with its artwork, with a scrubber knob that turns to glass.",
    imports: ["NowPlaying"],
    aliases: ["Media player", "Audio player"],
    preview: () => <FitPreview><NowPlayingDemo /></FitPreview>,
    demo: () => <NowPlayingDemo />,
  }),
  entry({
    slug: "notification-stack",
    name: "Notification Stack",
    summary: "Notifications piled by app that spring open, with swipe to dismiss.",
    imports: ["NotificationStack"],
    aliases: ["Toasts", "Notification center"],
    preview: () => <FitPreview><NotificationsDemo /></FitPreview>,
    demo: () => <NotificationsDemo />,
  }),
  entry({
    slug: "glass-dock",
    name: "Glass Dock",
    summary: "A shelf of apps whose icons swell near the pointer and bounce when pressed.",
    imports: ["GlassDock"],
    aliases: ["App launcher"],
    preview: () => <FitPreview><DockDemo /></FitPreview>,
    demo: () => <DockDemo />,
  }),
  entry({
    slug: "spotlight-search",
    name: "Spotlight Search",
    summary: "A floating capsule with category shortcuts that opens grouped results.",
    imports: ["SpotlightSearch"],
    aliases: ["Command bar", "Global search"],
    preview: () => <FitPreview><SpotlightDemo /></FitPreview>,
    demo: () => <SpotlightDemo />,
  }),
  entry({
    slug: "wheel-picker",
    name: "Wheel Picker",
    summary: "Spinning columns on a drum, with the chosen row under a lens.",
    imports: ["WheelPicker"],
    aliases: ["Time picker", "Date wheel"],
    preview: () => <FitPreview><WheelDemo /></FitPreview>,
    demo: () => <WheelDemo />,
  }),
];
