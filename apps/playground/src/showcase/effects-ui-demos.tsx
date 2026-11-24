import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiCameraLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiMicLine,
  RiPhoneFill,
  RiSearchLine,
  RiSparkling2Line,
  RiTimerLine,
  RiUploadCloud2Line,
  RiVolumeDownLine,
  RiVolumeUpLine,
} from "@remixicon/react";
import {
  AnimatedNumber,
  Avatar,
  BorderBeam,
  Button,
  ClickSpark,
  ConfettiButton,
  CurvedText,
  DynamicIsland,
  ElasticSlider,
  ExpandableCards,
  FanMenu,
  FlowingMenu,
  FocusCards,
  FollowTooltip,
  GooeyTabs,
  HaloInput,
  HoldButton,
  IconButton,
  LinkPreview,
  Magnetic,
  MegaMenu,
  MultiStepLoader,
  RotatingText,
  ScanLoader,
  ScrambleText,
  ScrollNavbar,
  SegmentedControl,
  SegmentedControlItem,
  ShimmerText,
  SlideToConfirm,
  SplitFlap,
  SpotlightCard,
  SquishSwitch,
  StatefulButton,
  SwipeDeck,
  Switch,
  Terminal,
  TextGenerate,
  TextHighlighter,
  TiltCard,
  VanishInput,
  VariableFontHover,
} from "@windesign-ds/react";
import type { CatalogEntry } from "./catalog";
import { Art, Filler, ScrollBox, effect } from "./effects-kit";

/* ───────────────────────────── Text and numbers ───────────────────────────── */

function TickingNumber({ big = false }: { big?: boolean }) {
  const [value, setValue] = useState(48213.5);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => Math.round((v + (Math.random() - 0.35) * 900) * 100) / 100), 2200);
    return () => clearInterval(id);
  }, []);
  return <AnimatedNumber value={value} format={{ style: "currency", currency: "USD" }} className={big ? "text-display-md text-fg" : "text-display-sm text-fg"} />;
}

function AnimatedNumberDemo() {
  const [value, setValue] = useState(1240);
  return (
    <div className="flex flex-col items-center gap-5">
      <AnimatedNumber value={value} className="text-display-lg text-fg" />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onPress={() => setValue((v) => v + 70)}>
          Add 70
        </Button>
        <Button variant="secondary" size="sm" onPress={() => setValue(Math.round(Math.random() * 99999))}>
          Random
        </Button>
      </div>
      <TickingNumber />
    </div>
  );
}

function TextGenerateDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex max-w-lg flex-col items-start gap-4">
      <TextGenerate
        key={run}
        className="text-title-md-strong text-fg"
        text="Your quarterly summary is ready: revenue grew 18%, churn fell to its lowest in two years, and three regions beat plan."
      />
      <Button variant="secondary" size="sm" onPress={() => setRun((r) => r + 1)}>
        Play again
      </Button>
    </div>
  );
}

const SPLIT_WORDS = ["LONDON", "TOKYO", "NAIROBI", "LIMA", "OSLO"];

function SplitFlapDemo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SPLIT_WORDS.length), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-caption tracking-wide text-fg-secondary uppercase">Departures · Gate 12</span>
      <SplitFlap text={SPLIT_WORDS[i]!} length={7} />
    </div>
  );
}

const TEXT_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "animated-number",
    name: "Animated Number",
    summary: "Digits roll like an odometer to each new value, formatted for currency, percent or plain counts.",
    imports: ["AnimatedNumber", "StatCard"],
    aliases: ["Number ticker", "Rolling number", "Odometer"],
    preview: () => <TickingNumber />,
    demo: () => <AnimatedNumberDemo />,
  }),
  effect({
    slug: "text-generate",
    name: "Text Generate",
    summary: "Words arrive one by one out of a soft blur, the way a generated answer streams in.",
    imports: ["TextGenerate"],
    aliases: ["Blur fade", "Streaming text", "Word reveal"],
    preview: () => <TextGenerate className="max-w-xs text-center text-title-sm-strong text-fg" text="Drafting a reply from your notes and the thread so far." startOnView={false} />,
    demo: () => <TextGenerateDemo />,
  }),
  effect({
    slug: "shimmer-text",
    name: "Shimmer Text",
    summary: "A highlight sweeps across secondary text to show work in progress.",
    imports: ["ShimmerText"],
    aliases: ["Shiny text", "Thinking text"],
    preview: () => <ShimmerText className="text-title-sm-strong">Thinking…</ShimmerText>,
    demo: () => (
      <div className="flex flex-col items-start gap-3 text-body-md-strong">
        <ShimmerText>Thinking…</ShimmerText>
        <ShimmerText>Searching 24 sources</ShimmerText>
        <ShimmerText className="text-title-md-strong">Generating preview</ShimmerText>
      </div>
    ),
  }),
  effect({
    slug: "scramble-text",
    name: "Scramble Text",
    summary: "Random glyphs settle, left to right, into the real text on view or on hover.",
    imports: ["ScrambleText"],
    aliases: ["Decrypted text", "Hyper text", "Encrypted text"],
    preview: () => <ScrambleText text="ACCESS GRANTED" trigger="mount" className="font-mono text-title-md-strong text-fg" />,
    demo: () => (
      <div className="flex flex-col items-center gap-4">
        <ScrambleText text="Hover to scramble" trigger="hover" className="cursor-default font-mono text-title-lg-strong text-fg" />
        <ScrambleText text="DECRYPTING PAYLOAD" trigger="view" className="font-mono text-body-md text-fg-secondary" />
      </div>
    ),
  }),
  effect({
    slug: "rotating-text",
    name: "Rotating Text",
    summary: "One word in a sentence cycles through alternatives, the slot easing to each word's width.",
    imports: ["RotatingText"],
    aliases: ["Flip words", "Word rotate", "Text rotate"],
    preview: () => (
      <p className="text-title-md-strong text-fg">
        Built for <RotatingText words={["teams", "makers", "agencies", "students"]} className="text-accent-600" />
      </p>
    ),
    demo: () => (
      <p className="text-display-sm text-fg">
        Design for <RotatingText words={["product teams", "makers", "agencies", "students"]} className="text-accent-600" />
      </p>
    ),
  }),
  effect({
    slug: "split-flap",
    name: "Split Flap",
    summary: "A departures-board display whose cells flip through the alphabet to each new word.",
    imports: ["SplitFlap"],
    aliases: ["Text flipping board", "Flap display"],
    preview: () => <SplitFlapDemo />,
    demo: () => <SplitFlapDemo />,
  }),
  effect({
    slug: "text-highlighter",
    name: "Text Highlighter",
    summary: "A marker stroke draws behind a phrase as it scrolls into view, across line breaks.",
    imports: ["TextHighlighter"],
    aliases: ["Marker", "Highlight"],
    preview: () => (
      <p className="max-w-xs text-center text-body-lg text-fg">
        Ship <TextHighlighter startOnView={false}>twice as fast</TextHighlighter> with one set of tokens.
      </p>
    ),
    demo: () => (
      <p className="max-w-lg text-body-lg text-fg">
        Components take <TextHighlighter>every colour from tokens</TextHighlighter>, so a brand can restyle the system{" "}
        <TextHighlighter shape="underline">without touching component code</TextHighlighter>, and every pairing is{" "}
        <TextHighlighter shape="box">checked for contrast</TextHighlighter>.
      </p>
    ),
  }),
  effect({
    slug: "variable-font-hover",
    name: "Variable Font Hover",
    summary: "Letters thicken as the pointer nears them, using the variable font's weight axis.",
    imports: ["VariableFontHover"],
    aliases: ["Text cursor proximity", "Weight hover"],
    preview: () => <VariableFontHover text="Proximity" className="text-display-md text-fg" />,
    demo: () => <VariableFontHover text="Move across me" as="h3" className="text-display-lg text-fg" />,
  }),
  effect({
    slug: "curved-text",
    name: "Curved Text",
    summary: "Text set around a circle like a stamp, turning slowly around an icon or logo.",
    imports: ["CurvedText"],
    aliases: ["Circular text", "Spinning text", "Text along path"],
    preview: () => (
      <CurvedText text="Windesign · Design System · Since 2026 · " size="sm">
        <RiSparkling2Line aria-hidden className="size-6 text-accent-600" />
      </CurvedText>
    ),
    demo: () => (
      <div className="flex items-center gap-10">
        <CurvedText text="Windesign · Design System · Since 2026 · " size="md">
          <RiSparkling2Line aria-hidden className="size-8 text-accent-600" />
        </CurvedText>
        <CurvedText text="Scroll to explore · Scroll to explore · " size="lg" spin={false}>
          <span className="text-title-lg-strong text-fg">↓</span>
        </CurvedText>
      </div>
    ),
  }),
];

/* ─────────────────────────── Buttons and micro-interactions ─────────────────────────── */

const wait = (ms: number, fail = false) => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Failed")) : resolve()), ms));

function SquishDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <SquishSwitch isSelected={on} onChange={setOn}>
        Wi-Fi
      </SquishSwitch>
      <SquishSwitch defaultSelected={false}>Low power mode</SquishSwitch>
    </div>
  );
}

const BUTTON_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "stateful-button",
    name: "Stateful Button",
    summary: "Shows its own outcome: a spinner while the work runs, then a tick or a warning.",
    imports: ["StatefulButton"],
    aliases: ["Loading button", "Async button"],
    preview: () => <StatefulButton onPress={() => wait(1400)}>Save changes</StatefulButton>,
    demo: () => (
      <div className="flex flex-wrap items-center gap-3">
        <StatefulButton onPress={() => wait(1400)} successLabel="Saved">
          Save changes
        </StatefulButton>
        <StatefulButton variant="secondary" onPress={() => wait(1200, true)} errorLabel="Couldn't publish">
          Publish (fails)
        </StatefulButton>
      </div>
    ),
  }),
  effect({
    slug: "hold-button",
    name: "Hold Button",
    summary: "Press and hold to confirm; colour fills the button while it's held.",
    imports: ["HoldButton"],
    aliases: ["Hold to confirm", "Long press"],
    preview: () => <HoldButton onConfirm={() => {}}>Hold to delete</HoldButton>,
    demo: () => (
      <div className="flex flex-wrap items-center gap-3">
        <HoldButton onConfirm={() => {}} confirmedLabel="Deleted">
          Hold to delete project
        </HoldButton>
        <HoldButton tone="accent" onConfirm={() => {}} confirmedLabel="Deploying">
          Hold to deploy
        </HoldButton>
      </div>
    ),
  }),
  effect({
    slug: "slide-to-confirm",
    name: "Slide to Confirm",
    summary: "Drag the thumb to the end of the track to confirm; Enter does it from the keyboard.",
    imports: ["SlideToConfirm"],
    aliases: ["Swipe button", "Slide to pay", "Slide to unlock"],
    preview: () => <SlideToConfirm label="Slide to pay $24.00" onConfirm={() => {}} />,
    demo: () => <SlideToConfirm label="Slide to pay $24.00" confirmedLabel="Paid" onConfirm={() => {}} />,
  }),
  effect({
    slug: "magnetic",
    name: "Magnetic",
    summary: "Whatever it wraps drifts toward the pointer and springs home when it leaves.",
    imports: ["Magnetic"],
    aliases: ["Magnetic button", "Magnet"],
    preview: () => (
      <Magnetic>
        <Button>Get started</Button>
      </Magnetic>
    ),
    demo: () => (
      <div className="flex items-center gap-10">
        <Magnetic>
          <Button size="md">Get started</Button>
        </Magnetic>
        <Magnetic strength={0.6}>
          <IconButton icon={RiAddLine} aria-label="New" />
        </Magnetic>
      </div>
    ),
  }),
  effect({
    slug: "click-spark",
    name: "Click Spark",
    summary: "A ring of sparks flies out from wherever you click inside it.",
    imports: ["ClickSpark"],
    aliases: ["Ripple", "Click burst"],
    preview: () => (
      <ClickSpark>
        <Button variant="secondary">Click me</Button>
      </ClickSpark>
    ),
    demo: () => (
      <ClickSpark className="w-full max-w-md">
        <div className="flex h-48 w-full items-center justify-center rounded-surface border border-dashed border-line-control text-body-md text-fg-secondary">
          Click anywhere in here
        </div>
      </ClickSpark>
    ),
  }),
  effect({
    slug: "confetti",
    name: "Confetti",
    summary: "A burst of paper in the brand's colours for a moment worth celebrating.",
    imports: ["ConfettiButton", "fireConfetti"],
    aliases: ["Celebration", "Party"],
    preview: () => <ConfettiButton>Celebrate</ConfettiButton>,
    demo: () => (
      <div className="flex flex-col items-center gap-3">
        <ConfettiButton>Finish onboarding</ConfettiButton>
        <p className="text-body-sm text-fg-secondary">Nothing happens with reduced motion, so pair it with a message.</p>
      </div>
    ),
  }),
  effect({
    slug: "squish-switch",
    name: "Squish Switch",
    summary: "A switch whose knob stretches when pressed and squashes as it lands.",
    imports: ["SquishSwitch"],
    aliases: ["Jelly switch", "Toggle"],
    preview: () => <SquishSwitch defaultSelected>Wi-Fi</SquishSwitch>,
    demo: () => <SquishDemo />,
  }),
  effect({
    slug: "elastic-slider",
    name: "Elastic Slider",
    summary: "A slider that stretches like rubber when dragged past either end.",
    imports: ["ElasticSlider"],
    aliases: ["Rubber band slider", "Volume slider"],
    preview: () => <ElasticSlider aria-label="Volume" defaultValue={60} startIcon={RiVolumeDownLine} endIcon={RiVolumeUpLine} />,
    demo: () => <ElasticSlider label="Volume" defaultValue={60} startIcon={RiVolumeDownLine} endIcon={RiVolumeUpLine} />,
  }),
];

/* ─────────────────────────────── Cards and surfaces ─────────────────────────────── */

function BeamDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex flex-col items-center gap-4">
      <BorderBeam isActive={on} className="w-72">
        <div className="flex flex-col gap-1 rounded-surface border border-line bg-surface p-5">
          <span className="flex items-center gap-2 text-body-md-strong text-fg">
            <RiSparkling2Line aria-hidden className="size-4 text-accent-600" /> Research agent
          </span>
          {on ? <ShimmerText className="text-body-sm">Reading 12 sources…</ShimmerText> : <span className="text-body-sm text-fg-secondary">Paused</span>}
        </div>
      </BorderBeam>
      <Switch isSelected={on} onChange={setOn}>
        Running
      </Switch>
    </div>
  );
}

const FEATURES = [
  { title: "Tokens", text: "Every colour, radius and shadow comes from one source.", icon: RiCodeSSlashLine },
  { title: "Brands", text: "Switch the whole look without touching components.", icon: RiSparkling2Line },
  { title: "Access", text: "React Aria behaviour and one focus ring everywhere.", icon: RiFlashlightLine },
];

const STORIES = [
  { id: "north", title: "Northern lights", description: "A week under the aurora", content: "Five nights in Tromsø chasing the aurora, with a guide who reads the forecast like a novel." },
  { id: "dunes", title: "Desert dunes", description: "Crossing the Erg Chebbi", content: "Camels at dawn, tea at dusk, and a sky with more stars than dark." },
  { id: "reef", title: "Coral reef", description: "Diving the outer reef", content: "Three dives a day along a wall of coral that drops into blue." },
  { id: "peaks", title: "High peaks", description: "A hut-to-hut traverse", content: "Six days on foot between mountain huts, each with a better view than the last." },
];

const PLACES = ["Kyoto", "Lisbon", "Reykjavík", "Cape Town", "Oaxaca"];

const ISLAND_MODES = ["idle", "timer", "upload", "call"] as const;
type IslandMode = (typeof ISLAND_MODES)[number];

function IslandContent({ mode }: { mode: IslandMode }) {
  if (mode === "idle") return <span className="mx-auto text-caption-strong text-canvas">9:41</span>;
  if (mode === "timer")
    return (
      <span className="flex w-full items-center justify-between text-body-sm-strong">
        <RiTimerLine aria-hidden className="size-4 text-accent-400" />
        <span className="tabular-nums">04:59</span>
      </span>
    );
  if (mode === "upload")
    return (
      <span className="flex w-full items-center gap-2 text-body-sm-strong">
        <RiUploadCloud2Line aria-hidden className="size-4 text-accent-400" />
        <span className="flex-1 truncate">Uploading brand-kit.zip</span>
        <span className="tabular-nums opacity-70">72%</span>
      </span>
    );
  return (
    <div className="flex w-full flex-col gap-3 py-3">
      <div className="flex items-center gap-3">
        <Avatar initials="AM" color="pink" size="lg" />
        <div className="flex flex-col">
          <span className="text-body-md-strong">Ada Morgan</span>
          <span className="text-caption opacity-70">Incoming call</span>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-status-danger-solid text-on-action">
          <RiPhoneFill aria-hidden className="size-4 rotate-135" />
        </span>
        <span className="flex size-9 items-center justify-center rounded-full bg-status-success-solid text-on-action">
          <RiPhoneFill aria-hidden className="size-4" />
        </span>
      </div>
    </div>
  );
}

const ISLAND_SIZE = { idle: "idle", timer: "compact", upload: "wide", call: "expanded" } as const;

function IslandDemo({ auto = false }: { auto?: boolean }) {
  const [mode, setMode] = useState<IslandMode>("timer");
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setMode((m) => ISLAND_MODES[(ISLAND_MODES.indexOf(m) + 1) % ISLAND_MODES.length]!), 2200);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div className="flex flex-col items-center gap-6">
      <DynamicIsland mode={mode} size={ISLAND_SIZE[mode]}>
        <IslandContent mode={mode} />
      </DynamicIsland>
      {!auto && (
        <SegmentedControl aria-label="Island state" selectedKeys={[mode]} onSelectionChange={(keys) => setMode([...keys][0] as IslandMode)}>
          {ISLAND_MODES.map((m) => (
            <SegmentedControlItem key={m} id={m}>
              {m[0]!.toUpperCase() + m.slice(1)}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      )}
    </div>
  );
}

const CARD_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "border-beam",
    name: "Border Beam",
    summary: "A beam of light laps the border of a surface to mark it as live or working.",
    imports: ["BorderBeam"],
    aliases: ["Moving border", "Shine border", "Glowing border"],
    preview: () => (
      <BorderBeam className="w-64">
        <div className="flex flex-col gap-1 rounded-surface border border-line bg-surface p-4">
          <span className="text-body-md-strong text-fg">Research agent</span>
          <ShimmerText className="text-body-sm">Reading 12 sources…</ShimmerText>
        </div>
      </BorderBeam>
    ),
    demo: () => <BeamDemo />,
  }),
  effect({
    slug: "spotlight-card",
    name: "Spotlight Card",
    summary: "A card lit by a soft pool of the accent that follows the pointer, rim and all.",
    imports: ["SpotlightCard"],
    aliases: ["Magic card", "Card spotlight", "Glow card"],
    preview: () => (
      <SpotlightCard className="w-64 p-5">
        <span className="text-body-md-strong text-fg">Tokens</span>
        <p className="text-body-sm text-fg-secondary">Every colour comes from one source.</p>
      </SpotlightCard>
    ),
    demo: () => (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map(({ title, text, icon: Icon }) => (
          <SpotlightCard key={title} className="flex flex-col gap-2 p-5">
            <Icon aria-hidden className="size-5 text-accent-600" />
            <span className="text-body-md-strong text-fg">{title}</span>
            <p className="text-body-sm text-fg-secondary">{text}</p>
          </SpotlightCard>
        ))}
      </div>
    ),
  }),
  effect({
    slug: "tilt-card",
    name: "Tilt Card",
    summary: "Tips toward the pointer in 3D with a sliding glare; `holo` adds a shifting foil.",
    imports: ["TiltCard"],
    aliases: ["3D card", "Holo card", "Glare card", "Comet card"],
    preview: () => (
      <TiltCard holo className="w-40">
        <Art seed="holo-1" className="h-32" />
      </TiltCard>
    ),
    demo: () => (
      <div className="flex flex-wrap items-center justify-center gap-8">
        <TiltCard className="w-56">
          <Art seed="tilt-plain" className="h-36" />
          <div className="p-4">
            <span className="text-body-md-strong text-fg">Plain tilt</span>
          </div>
        </TiltCard>
        <TiltCard holo className="w-56">
          <Art seed="tilt-holo" className="h-36" />
          <div className="p-4">
            <span className="text-body-md-strong text-fg">Holographic</span>
          </div>
        </TiltCard>
      </div>
    ),
  }),
  effect({
    slug: "expandable-cards",
    name: "Expandable Cards",
    summary: "A card grows in place into a dialog with the full story, App Store style.",
    imports: ["ExpandableCards"],
    aliases: ["Expandable card", "Shared layout card"],
    preview: () => <ExpandableCards className="w-80" items={STORIES.slice(0, 2).map((s) => ({ ...s, media: <Art seed={s.id} /> }))} />,
    demo: () => <ExpandableCards className="w-full max-w-xl" items={STORIES.map((s) => ({ ...s, media: <Art seed={s.id} /> }))} />,
  }),
  effect({
    slug: "swipe-deck",
    name: "Swipe Deck",
    summary: "A stack of cards to sort one at a time: fling left or right, or use the buttons.",
    imports: ["SwipeDeck"],
    aliases: ["Card stack", "Card swap", "Tinder cards"],
    preview: () => (
      <div className="scale-60">
        <SwipeDeck
          items={PLACES}
          getKey={(p) => p}
          getLabel={(p) => p}
          renderItem={(p) => (
            <Art seed={p} className="overflow-hidden rounded-surface shadow-overlay">
              <span className="absolute bottom-4 left-4 text-title-md-strong text-on-action">{p}</span>
            </Art>
          )}
        />
      </div>
    ),
    demo: () => (
      <SwipeDeck
        items={PLACES}
        getKey={(p) => p}
        getLabel={(p) => p}
        renderItem={(p) => (
          <Art seed={p} className="overflow-hidden rounded-surface shadow-overlay">
            <span className="absolute bottom-4 left-4 text-title-md-strong text-on-action">{p}</span>
          </Art>
        )}
      />
    ),
  }),
  effect({
    slug: "focus-cards",
    name: "Focus Cards",
    summary: "Pointing at one card brings it forward while the others soften and blur.",
    imports: ["FocusCards"],
    aliases: ["Hover focus", "Gallery"],
    preview: () => <FocusCards className="w-96 scale-75" items={STORIES.slice(0, 3).map((s) => ({ title: s.title, href: "#/section/pro", media: <Art seed={s.id} /> }))} />,
    demo: () => <FocusCards className="w-full" items={STORIES.slice(0, 3).map((s) => ({ title: s.title, href: "#/section/pro", media: <Art seed={s.id} /> }))} />,
  }),
  effect({
    slug: "dynamic-island",
    name: "Dynamic Island",
    summary: "A pill that morphs to fit what it shows: a timer, an upload, a call with controls.",
    imports: ["DynamicIsland"],
    aliases: ["Morph surface", "Live activity", "Status pill"],
    preview: () => <IslandDemo auto />,
    demo: () => <IslandDemo />,
  }),
];

/* ──────────────────────────── Navigation and overlays ──────────────────────────── */

const NAV_LINKS = ["Product", "Pricing", "Docs"];

function NavbarDemo() {
  return (
    <ScrollBox>
      {(ref) => (
        <>
          <ScrollNavbar scrollRef={ref}>
            <span className="px-2 text-body-md-strong text-fg">Windesign</span>
            <span className="ms-auto flex gap-1">
              {NAV_LINKS.map((l) => (
                <a key={l} href="#/section/pro" className="rounded-full px-3 py-1 text-body-sm text-fg-secondary hover:text-fg">
                  {l}
                </a>
              ))}
            </span>
            <Button size="sm">Sign up</Button>
          </ScrollNavbar>
          <div className="flex flex-col gap-4 p-6">
            <h3 className="text-title-lg-strong text-fg">Scroll down, then back up</h3>
            <Filler count={6} />
          </div>
        </>
      )}
    </ScrollBox>
  );
}

const TAB_ITEMS = [
  { id: "overview", label: "Overview", content: <p className="text-body-md text-fg-secondary">Everything at a glance: usage, health and the last deploy.</p> },
  { id: "activity", label: "Activity", content: <p className="text-body-md text-fg-secondary">Every change, who made it and when.</p> },
  { id: "settings", label: "Settings", content: <p className="text-body-md text-fg-secondary">Names, domains and who can see what.</p> },
  { id: "billing", label: "Billing", content: <p className="text-body-md text-fg-secondary">Plan, invoices and payment method.</p> },
];

const MENU_ITEMS = [
  { label: "Work", href: "#/section/pro", meta: "24 projects" },
  { label: "Studio", href: "#/section/pro", meta: "Since 2014" },
  { label: "Journal", href: "#/section/pro", meta: "Weekly" },
  { label: "Contact", href: "#/section/pro", meta: "Say hello" },
];

const PEOPLE = [
  { initials: "AM", name: "Ada Morgan", role: "Design lead", color: "pink" as const },
  { initials: "KO", name: "Kwame Osei", role: "Engineer", color: "blue" as const },
  { initials: "LF", name: "Lucía Fernández", role: "Research", color: "lime" as const },
  { initials: "RS", name: "Ravi Shah", role: "Product", color: "neutral" as const },
];

function AvatarTooltips() {
  return (
    <div className="flex -space-x-2">
      {PEOPLE.map((p) => (
        <FollowTooltip
          key={p.initials}
          content={
            <span className="flex flex-col">
              <span>{p.name}</span>
              <span className="opacity-70">{p.role}</span>
            </span>
          }
        >
          <button type="button" aria-label={p.name} className="rounded-full ring-2 ring-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            <Avatar initials={p.initials} color={p.color} size="lg" />
          </button>
        </FollowTooltip>
      ))}
    </div>
  );
}

const FAN_ACTIONS = [
  { id: "note", label: "New note", icon: RiFileTextLine, onAction: () => {} },
  { id: "photo", label: "Take photo", icon: RiCameraLine, onAction: () => {} },
  { id: "voice", label: "Voice memo", icon: RiMicLine, onAction: () => {} },
];

function MegaLinks({ links }: { links: [string, string][] }) {
  return (
    <ul className="grid w-max grid-cols-2 gap-1">
      {links.map(([title, text]) => (
        <li key={title}>
          <a href="#/section/pro" className="flex w-56 flex-col gap-0.5 rounded-control-md p-3 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus">
            <span className="text-body-md-strong text-fg">{title}</span>
            <span className="text-body-sm text-fg-secondary">{text}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const MEGA_ITEMS = [
  {
    id: "product",
    label: "Product",
    content: (
      <MegaLinks
        links={[
          ["Components", "The controls everything is made from"],
          ["Blocks", "Assemblies, ready to drop in"],
          ["Charts", "Data cards on one palette"],
          ["Templates", "Whole screens"],
        ]}
      />
    ),
  },
  {
    id: "resources",
    label: "Resources",
    content: (
      <MegaLinks
        links={[
          ["Docs", "Guides and API"],
          ["Changelog", "What's new"],
        ]}
      />
    ),
  },
  {
    id: "company",
    label: "Company",
    content: (
      <MegaLinks
        links={[
          ["About", "Who we are"],
          ["Careers", "Join the team"],
          ["Press", "News and assets"],
          ["Contact", "Get in touch"],
          ["Partners", "Agencies and integrators"],
          ["Legal", "Terms and privacy"],
        ]}
      />
    ),
  },
];

const NAV_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "scroll-navbar",
    name: "Scroll Navbar",
    summary: "A top bar that gathers into a floating pill, hides as you read and returns on scroll up.",
    imports: ["ScrollNavbar"],
    aliases: ["Floating navbar", "Resizable navbar", "Hide on scroll"],
    preview: () => (
      <div className="flex w-80 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 shadow-overlay">
        <span className="text-body-sm-strong text-fg">Windesign</span>
        <span className="ms-auto text-caption text-fg-secondary">Product · Docs</span>
        <Button size="xs">Sign up</Button>
      </div>
    ),
    demo: () => <NavbarDemo />,
  }),
  effect({
    slug: "gooey-tabs",
    name: "Gooey Tabs",
    summary: "Tabs whose selection pill stretches across the gap like a drop of liquid.",
    imports: ["GooeyTabs"],
    aliases: ["Fluid tabs", "Elastic tabs", "Animated tabs"],
    preview: () => <GooeyTabs aria-label="Sections" items={TAB_ITEMS.slice(0, 3)} />,
    demo: () => <GooeyTabs aria-label="Project" items={TAB_ITEMS} />,
  }),
  effect({
    slug: "flowing-menu",
    name: "Flowing Menu",
    summary: "A big list of links with a band of ink gliding from row to row under the pointer.",
    imports: ["FlowingMenu"],
    aliases: ["Hover menu", "Editorial menu"],
    preview: () => <FlowingMenu aria-label="Menu" items={MENU_ITEMS.slice(0, 3)} className="w-72 scale-75" />,
    demo: () => <FlowingMenu aria-label="Site" items={MENU_ITEMS} className="w-full max-w-xl" />,
  }),
  effect({
    slug: "follow-tooltip",
    name: "Follow Tooltip",
    summary: "A tooltip that leans after the pointer, tilting with its speed.",
    imports: ["FollowTooltip"],
    aliases: ["Animated tooltip", "Avatar tooltip"],
    preview: () => <AvatarTooltips />,
    demo: () => <AvatarTooltips />,
  }),
  effect({
    slug: "link-preview",
    name: "Link Preview",
    summary: "An inline link that springs open a card showing where it goes.",
    imports: ["LinkPreview"],
    aliases: ["Link card", "Hover preview"],
    preview: () => (
      <p className="max-w-xs text-center text-body-md text-fg">
        Read the <LinkPreview href="https://example.com/brand" title="Brand guide" media={<Art seed="brand" />}>brand guide</LinkPreview> first.
      </p>
    ),
    demo: () => (
      <p className="max-w-md text-body-lg text-fg">
        Start with the{" "}
        <LinkPreview href="#/components/color" title="Color" description="Semantic colour tokens by role, with live values." media={<Art seed="color-page" />}>
          colour tokens
        </LinkPreview>
        , then see how{" "}
        <LinkPreview href="#/components/theming" title="Theming" description="How light, dark and each brand remap the same tokens." media={<Art seed="theming-page" />}>
          theming
        </LinkPreview>{" "}
        works.
      </p>
    ),
  }),
  effect({
    slug: "fan-menu",
    name: "Fan Menu",
    summary: "A floating action button that blooms into its actions, as an arc or a stack.",
    imports: ["FanMenu"],
    aliases: ["Speed dial", "Flower menu", "FAB menu"],
    preview: () => (
      <div className="flex h-40 w-56 items-end justify-end">
        <FanMenu actions={FAN_ACTIONS} />
      </div>
    ),
    demo: () => (
      <div className="flex w-full max-w-lg justify-between">
        <div className="flex h-52 w-56 items-end justify-end rounded-surface border border-dashed border-line-control p-4">
          <FanMenu actions={FAN_ACTIONS} />
        </div>
        <div className="flex h-52 w-56 items-end justify-end rounded-surface border border-dashed border-line-control p-4">
          <FanMenu actions={FAN_ACTIONS} layout="stack" />
        </div>
      </div>
    ),
  }),
  effect({
    slug: "mega-menu",
    name: "Mega Menu",
    summary: "One shared dropdown that glides between items and reshapes to fit each one.",
    imports: ["MegaMenu"],
    aliases: ["Morphing dropdown", "Navigation dropdown"],
    preview: () => (
      <div className="flex items-center gap-1 text-body-md text-fg-secondary">
        {MEGA_ITEMS.map((m, i) => (
          <span key={m.id} className={i === 0 ? "rounded-control-sm bg-muted px-3 py-1.5 text-fg" : "px-3 py-1.5"}>
            {m.label}
          </span>
        ))}
      </div>
    ),
    demo: () => (
      <div className="flex h-80 w-full items-start justify-center">
        <MegaMenu aria-label="Main" items={MEGA_ITEMS} />
      </div>
    ),
  }),
];

/* ──────────────────────────────── Inputs and AI ──────────────────────────────── */

const PROMPTS = ["Summarise this thread", "Draft a reply to Ada", "Find last week's invoices", "Plan a three-day offsite"];

function VanishDemo() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <VanishInput aria-label="Ask the assistant" placeholders={PROMPTS} onSubmit={(v) => setSent((s) => [v, ...s].slice(0, 3))} />
      {sent.length > 0 && <p className="text-body-sm text-fg-secondary">Sent: {sent.join(" · ")}</p>}
    </div>
  );
}

function ScanDemo() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (progress >= 1) return;
    const id = setTimeout(() => setProgress((p) => Math.min(1, p + 0.08)), 350);
    return () => clearTimeout(id);
  }, [progress]);
  return (
    <div className="flex flex-col items-center gap-3">
      <ScanLoader progress={progress} done={progress >= 1}>
        <Art seed="a lighthouse at dusk" />
      </ScanLoader>
      <Button variant="secondary" size="sm" onPress={() => setProgress(0)}>
        Generate again
      </Button>
    </div>
  );
}

const STEPS = ["Reading your files", "Finding the key numbers", "Drafting the summary", "Checking the sources", "Formatting the report"];

const INPUT_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "vanish-input",
    name: "Vanish Input",
    summary: "A prompt field that cycles example questions and dissolves the text on submit.",
    imports: ["VanishInput"],
    aliases: ["Placeholders and vanish input", "Prompt input"],
    preview: () => <VanishInput aria-label="Ask" placeholders={PROMPTS} onSubmit={() => {}} className="w-72" />,
    demo: () => <VanishDemo />,
  }),
  effect({
    slug: "halo-input",
    name: "Halo Input",
    summary: "A field ringed by a turning halo of effect colours that wakes on focus.",
    imports: ["HaloInput"],
    aliases: ["Glow input", "Gooey input", "AI input"],
    preview: () => <HaloInput aria-label="Search" placeholder="Search everything…" icon={RiSearchLine} className="w-72" />,
    demo: () => <HaloInput label="Ask anything" description="Focus the field to light the halo." placeholder="What should we build today?" icon={RiSparkling2Line} />,
  }),
  effect({
    slug: "multi-step-loader",
    name: "Multi-step Loader",
    summary: "A waiting state that says what's happening, ticking off one step at a time.",
    imports: ["MultiStepLoader"],
    aliases: ["Step loader", "Progress steps"],
    preview: () => <MultiStepLoader steps={STEPS.slice(0, 4)} loop interval={1} />,
    demo: () => <MultiStepLoader steps={STEPS} loop />,
  }),
  effect({
    slug: "scan-loader",
    name: "Scan Loader",
    summary: "Pixels flicker into being under a sweeping scan line while an image is made.",
    imports: ["ScanLoader"],
    aliases: ["Image generation loader", "Pixel loader"],
    preview: () => <ScanLoader className="w-40" />,
    demo: () => <ScanDemo />,
  }),
  effect({
    slug: "terminal",
    name: "Terminal",
    summary: "A terminal window that plays a session, typing commands and printing output.",
    imports: ["Terminal"],
    aliases: ["Typewriter", "CLI demo", "Code window"],
    preview: () => (
      <Terminal
        className="w-80 scale-90"
        loop
        lines={[
          { kind: "command", text: "npm run build" },
          { kind: "output", text: "✓ built in 13.7s" },
        ]}
      />
    ),
    demo: () => (
      <Terminal
        title="zsh — windesign"
        loop
        lines={[
          { kind: "command", text: "npm install" },
          { kind: "output", text: "added 345 packages in 26s" },
          { kind: "command", text: "npm test -w @windesign-ds/tokens" },
          { kind: "output", text: "✓ 1,644 tests passed" },
          { kind: "command", text: "npm run build" },
          { kind: "output", text: "✓ built in 13.7s" },
        ]}
      />
    ),
  }),
];

export const EFFECT_UI_ENTRIES: CatalogEntry[] = [...TEXT_ENTRIES, ...BUTTON_ENTRIES, ...CARD_ENTRIES, ...NAV_ENTRIES, ...INPUT_ENTRIES];
