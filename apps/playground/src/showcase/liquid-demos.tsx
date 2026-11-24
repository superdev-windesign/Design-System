import { useState, type ReactNode } from "react";
import {
  RiAddLine,
  RiArrowUpLine,
  RiBitCoinLine,
  RiCalendar2Line,
  RiCloudLine,
  RiCompass3Fill,
  RiDropLine,
  RiHome5Fill,
  RiMailFill,
  RiMicFill,
  RiSunFill,
  RiUser3Fill,
  RiWalletLine,
  RiWindyLine,
} from "@remixicon/react";
import {
  Button,
  CameraBar,
  FlightWidget,
  FrostedCard,
  GLASS_SCENES,
  SCENE_THEME,
  GlassClock,
  GlassColorWheel,
  GlassDial,
  GlassMetricCard,
  GlassSignIn,
  LensBar,
  LiquidButton,
  LiquidOrb,
  ProfileDeck,
  PromptBar,
  SwapBox,
  WaveformPlayer,
  WeatherWidget,
  promptArt,
  toast,
  useTheme,
} from "@windesign/react";
import type { DeckProfile, GlassScene, LensBarItem } from "@windesign/react";
import type { CatalogEntry } from "./catalog";
import { FitPreview } from "./fit-preview";
import { GoogleSession, useProviderHandler } from "../site/google-auth";

// ─── Shared stage ──────────────────────────────────────────────────────────

/** A card's preview: the scene fills the card, and only the component shrinks to fit. */
function CardStage({ scene, children }: { scene: GlassScene; children: ReactNode }) {
  return (
    <div data-theme={SCENE_THEME[scene]} className="absolute inset-0 p-3 text-fg" style={{ background: GLASS_SCENES[scene] }}>
      <FitPreview>{children}</FitPreview>
    </div>
  );
}

/** Glass needs something behind it, so these always sit on a scene. */
function Stage({ scene, children, className }: { scene: GlassScene; children: ReactNode; className?: string }) {
  return (
    <div data-theme={SCENE_THEME[scene]} className={`flex min-h-64 w-full items-center justify-center overflow-hidden rounded-panel p-4 text-fg sm:p-8 ${className ?? ""}`} style={{ background: GLASS_SCENES[scene] }}>
      {children}
    </div>
  );
}

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

function OnScene({ scene, children }: { scene: GlassScene; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <ViewInGlass />
      <Stage scene={scene}>{children}</Stage>
    </div>
  );
}

// ─── Sample data ───────────────────────────────────────────────────────────

const BAR_ITEMS: LensBarItem[] = [
  { id: "home", label: "Home", icon: RiHome5Fill },
  { id: "explore", label: "Explore", icon: RiCompass3Fill },
  { id: "messages", label: "Inbox", icon: RiMailFill },
  { id: "you", label: "You", icon: RiUser3Fill },
];

const PEOPLE: DeckProfile[] = [
  { id: "ines", name: "Ines Moreau", role: "Product design" },
  { id: "tomas", name: "Tomás Rey", role: "Engineering" },
  { id: "amara", name: "Amara Osei", role: "Research" },
  { id: "kenji", name: "Kenji Arai", role: "Motion" },
  { id: "lena", name: "Lena Holt", role: "Writing" },
];

const SWATCHES = ["#FF6A2B", "#FFB340", "#30D6A0", "#4FC3FF", "#0071E3", "#A78BFA", "#FF375F"];

const NODES = [4, 7, 5, 8, 6, 9, 7, 11, 8, 10, 12, 9, 13, 11, 14, 12, 15, 13, 16, 14, 17, 15, 18, 16, 19, 17, 20, 22];
const SCORE = [30, 32, 31, 34, 33, 36, 35, 37, 34, 36, 33, 35, 32, 34, 31, 33, 30, 32, 29, 31, 28, 30, 27, 29, 26, 28, 25, 27];

const TRACK = { title: "Tidewater", artist: "The Low Hours", duration: 214 };

// ─── Small stateful demos ──────────────────────────────────────────────────

function VoiceOrb() {
  const [listening, setListening] = useState(false);
  return <LiquidOrb icon={RiMicFill} tone="iris" iris aria-label={listening ? "Stop listening" : "Start listening"} isActive={listening} onPress={() => setListening((on) => !on)} />;
}

const CalendarButton = () => (
  <LiquidButton size="lg" icon={RiCalendar2Line} iconTile tone="sun" eyebrow="Add to">
    My Calendar
  </LiquidButton>
);

function ClockDemo() {
  return <GlassClock greeting="Morning. Rise and shine." time={new Date(2026, 10, 7, 6, 0)} onSnooze={() => toast.show("Snoozed for 9 minutes")} onStop={() => toast.show("Alarm off")} />;
}

const Dial = () => <GlassDial label="Living room temperature" defaultValue={22} min={10} max={30} unit="°" caption="Living room" />;
const Wheel = () => <GlassColorWheel swatches={SWATCHES} size={192} />;
const Metric = () => <GlassMetricCard label="Active nodes" value="77" unit="live" delta="+17.4%" series={NODES} seriesLabel="Active nodes rising through the month" axis={["1", "14", "28"]} />;
const AgeCard = () => <GlassMetricCard label="Resting heart rate" value="58" unit="bpm" delta="Steady" series={SCORE} seriesLabel="Resting heart rate falling through the month" axis={["Oct", "Nov"]} />;
const Weather = () => (
  <WeatherWidget
    place="Toronto"
    day="Today"
    temperature={21}
    condition="Mostly clear"
    icon={RiSunFill}
    high={24}
    low={15}
    stats={[
      { id: "wind", label: "Wind", value: "6 km/h", icon: RiWindyLine },
      { id: "cloud", label: "Cloud", value: "45%", icon: RiCloudLine },
      { id: "rain", label: "Rain", value: "12%", icon: RiDropLine },
    ]}
  />
);
const Flight = () => <FlightWidget flight="KL 861" status="Landing in 3h 24m" from={{ code: "AMS", city: "Amsterdam", time: "9:40" }} to={{ code: "HND", city: "Tokyo", time: "7:25" }} progress={0.68} />;
const Card = () => <FrostedCard title="Making money more human" value="$12,480.00" caption="Jo Marsh" detail="09/29" />;
const Deck = () => <ProfileDeck aria-label="Team" profiles={PEOPLE} />;
const Player = () => <WaveformPlayer track={TRACK} />;
const Swap = () => (
  <SwapBox
    from={{ id: "btc", symbol: "BTC", icon: RiBitCoinLine }}
    to={{ id: "usd", symbol: "USD", icon: RiWalletLine }}
    rate={68420}
    defaultAmount={0.25}
    onSwap={({ amount, pay, received, receive }) => toast.show(`${amount} ${pay.symbol} for ${received.toLocaleString()} ${receive.symbol}`)}
  />
);
const Prompt = () => <PromptBar placeholder="Ask anything" onAttach={() => toast.show("Attach a file")} onVoice={() => undefined} onSubmit={(text) => toast.show(text)} />;
const Camera = () => (
  <CameraBar
    modes={[
      { id: "cinematic", label: "Cinematic" },
      { id: "video", label: "Video" },
      { id: "photo", label: "Photo" },
    ]}
    defaultMode="photo"
    lastShot={promptArt("harbour at dusk")}
    onCapture={() => toast.show("Captured")}
  />
);
function SignIn() {
  const onProvider = useProviderHandler();
  return (
    <div className="flex flex-col items-center gap-4">
      <GlassSignIn title="Welcome back" providers={["google", "github"]} onSubmit={() => toast.show("Submitted")} onProvider={onProvider} />
      <GoogleSession />
    </div>
  );
}

// ─── Catalogue entries ─────────────────────────────────────────────────────

const entry = (fields: Omit<CatalogEntry, "group" | "isNew">): CatalogEntry => ({ ...fields, group: "Glass", isNew: true });
const on = (scene: GlassScene, node: () => ReactNode) => ({ preview: () => <CardStage scene={scene}>{node()}</CardStage>, demo: () => <OnScene scene={scene}>{node()}</OnScene> });

export const LIQUID_ENTRIES: CatalogEntry[] = [
  entry({
    slug: "liquid-button",
    name: "Liquid Button",
    summary: "A pressable piece of thick glass, frosted, clear or with light held inside it.",
    imports: ["LiquidButton"],
    preview: () => <CardStage scene="mist"><CalendarButton /></CardStage>,
    demo: () => (
      <div className="flex w-full flex-col gap-4">
        <ViewInGlass />
        <div className="grid w-full gap-4 md:grid-cols-3">
          <Stage scene="paper"><CalendarButton /></Stage>
          <Stage scene="mist"><LiquidButton variant="glow" tone="sky" size="lg" icon={RiArrowUpLine}>Upload</LiquidButton></Stage>
          <Stage scene="orchid"><LiquidButton variant="glass" icon={RiAddLine}>New button</LiquidButton></Stage>
        </div>
      </div>
    ),
  }),
  entry({
    slug: "liquid-orb",
    name: "Liquid Orb",
    summary: "A round control with light inside it and an iridescent rim that turns while it listens.",
    imports: ["LiquidOrb"],
    preview: () => <CardStage scene="mist"><VoiceOrb /></CardStage>,
    demo: () => (
      <div className="flex w-full flex-col gap-4">
        <ViewInGlass />
        <div className="grid w-full gap-4 md:grid-cols-2">
          <Stage scene="mist"><VoiceOrb /></Stage>
          <Stage scene="paper"><LiquidOrb icon={RiSunFill} tone="sun" aria-label="Brightness" /></Stage>
        </div>
      </div>
    ),
  }),
  entry({ slug: "lens-bar", name: "Lens Bar", summary: "A short row of destinations, with the current one under a lens that stands proud of the bar.", imports: ["LensBar"], aliases: ["Tab bar", "Navigation"], ...on("dune", () => <LensBar aria-label="Sections" items={BAR_ITEMS} tone="ink" defaultSelectedId="explore" />) }),
  entry({ slug: "glass-dial", name: "Glass Dial", summary: "A value set by turning, on a disc of glass, with a ring of ticks that fills with light.", imports: ["GlassDial"], aliases: ["Thermostat", "Knob"], ...on("lagoon", () => <Dial />) }),
  entry({ slug: "glass-color-wheel", name: "Glass Colour Wheel", summary: "A hue ring set in glass, with the current colour held in a lens at its centre.", imports: ["GlassColorWheel"], aliases: ["Color picker"], ...on("mist", () => <Wheel />) }),
  entry({
    slug: "glass-metric-card",
    name: "Glass Metric Card",
    summary: "One number on a pane of glass, with a fine rule of bars showing how it got there.",
    imports: ["GlassMetricCard"],
    aliases: ["Stat", "Widget"],
    preview: () => <CardStage scene="lagoon"><Metric /></CardStage>,
    demo: () => (
      <div className="flex w-full flex-col gap-4">
        <ViewInGlass />
        <div className="grid w-full gap-4 md:grid-cols-2">
          <Stage scene="lagoon"><Metric /></Stage>
          <Stage scene="ember"><AgeCard /></Stage>
        </div>
      </div>
    ),
  }),
  entry({ slug: "weather-widget", name: "Weather Widget", summary: "Today's weather on a pane of glass, readable at arm's length.", imports: ["WeatherWidget"], ...on("dune", () => <Weather />) }),
  entry({ slug: "flight-widget", name: "Flight Widget", summary: "A flight's route and progress at a glance.", imports: ["FlightWidget"], ...on("aurora", () => <Flight />) }),
  entry({ slug: "glass-clock", name: "Glass Clock", summary: "The time in lit segments on glass, with optional snooze and stop.", imports: ["GlassClock"], aliases: ["Alarm"], ...on("lagoon", () => <ClockDemo />) }),
  entry({ slug: "frosted-card", name: "Frosted Card", summary: "A pane of glass over a slab of colour that tilts toward the pointer.", imports: ["FrostedCard"], aliases: ["Payment card"], ...on("noir", () => <Card />) }),
  entry({ slug: "profile-deck", name: "Profile Deck", summary: "People as overlapping cards, with one drawn forward.", imports: ["ProfileDeck"], aliases: ["Carousel"], ...on("mist", () => <Deck />) }),
  entry({ slug: "waveform-player", name: "Waveform Player", summary: "A track on glass, scrubbed along its own waveform.", imports: ["WaveformPlayer"], aliases: ["Audio", "Music"], ...on("lagoon", () => <Player />) }),
  entry({ slug: "swap-box", name: "Swap Box", summary: "Exchange one thing for another, with a lens that flips the direction.", imports: ["SwapBox"], aliases: ["Exchange"], ...on("aurora", () => <Swap />) }),
  entry({ slug: "prompt-bar", name: "Prompt Bar", summary: "One floating capsule for asking something, by typing or by voice.", imports: ["PromptBar"], aliases: ["AI input"], ...on("noir", () => <Prompt />) }),
  entry({ slug: "camera-bar", name: "Camera Bar", summary: "Capture controls floating over a live picture.", imports: ["CameraBar"], ...on("dune", () => <Camera />) }),
  entry({ slug: "glass-sign-in", name: "Glass Sign In", summary: "Signing in and joining on one pane, a switch apart.", imports: ["GlassSignIn"], aliases: ["Login", "Auth"], ...on("noir", () => <SignIn />) }),
];
