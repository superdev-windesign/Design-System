import { useRef } from "react";
import type { ReactNode } from "react";
import {
  RiCloudLine,
  RiCodeSSlashLine,
  RiDatabase2Line,
  RiFileTextLine,
  RiGitBranchLine,
  RiImageLine,
  RiMailLine,
  RiRobot2Line,
  RiShieldCheckLine,
  RiChat3Line,
  RiSparkling2Line,
  RiTerminalBoxLine,
} from "@remixicon/react";
import {
  AnimatedBeam,
  AuroraBackground,
  BackgroundBeams,
  Ballpit,
  Button,
  Chip,
  DitherBackground,
  FallingText,
  FlickeringGrid,
  Globe,
  GravityBox,
  Hyperspeed,
  IconCloud,
  Lanyard,
  LightRays,
  LiquidBackground,
  Meteors,
  OrbitingCircles,
  PixelTrail,
  RetroGrid,
  ShootingStars,
  SmoothCursor,
  SplashCursor,
  TargetCursor,
  TiltedMarquee,
  WorldMap,
} from "@windesign/react";
import type { IconComponent } from "@windesign/react";
import type { CatalogEntry } from "./catalog";
import { Art, Stage, StageTitle, effect } from "./effects-kit";

/* ──────────────────────────────── Backgrounds ──────────────────────────────── */

const background = (slug: string, name: string, summary: string, imports: string[], aliases: string[], layer: () => ReactNode, note: string): CatalogEntry =>
  effect({
    slug,
    name,
    summary,
    imports,
    aliases,
    preview: () => <Stage effect={layer()} className="h-full" />,
    demo: () => (
      <Stage effect={layer()} className="h-80">
        <StageTitle title={name} note={note} />
      </Stage>
    ),
  });

const BACKGROUND_ENTRIES: CatalogEntry[] = [
  background("aurora-background", "Aurora Background", "Soft pools of the brand's effect colours drifting slowly behind a hero.", ["AuroraBackground"], ["Aurora", "Gradient background"], () => <AuroraBackground />, "Light through fog"),
  background("flickering-grid", "Flickering Grid", "A field of tiny squares that blink on and off at random.", ["FlickeringGrid"], ["Dot grid", "Pixel grid"], () => <FlickeringGrid />, "Quiet enough for text"),
  background("retro-grid", "Retro Grid", "A floor of grid lines rolling toward you, out to the horizon.", ["RetroGrid"], ["Synthwave grid", "Perspective grid"], () => <RetroGrid tone="accent" />, "Synthwave, on tokens"),
  background("meteors", "Meteors", "Thin streaks of light falling diagonally across a panel.", ["Meteors"], ["Shooting lines"], () => <Meteors />, "A small flourish"),
  background("background-beams", "Background Beams", "Curved paths with dashes of light travelling along them.", ["BackgroundBeams"], ["Beams", "Signal lines"], () => <BackgroundBeams />, "Signals through fibre"),
  background("light-rays", "Light Rays", "Shafts of light falling from the top and rocking slowly.", ["LightRays"], ["God rays", "Spotlight"], () => <LightRays />, "As if through a high window"),
  background("dither-background", "Dither Background", "A slow field of light and shade drawn with ordered dithering.", ["DitherBackground"], ["Dither", "Bayer"], () => <DitherBackground />, "Texture rather than colour"),
  background("liquid-background", "Liquid Background", "Blobs of effect colour swirling into each other; one follows the pointer.", ["LiquidBackground"], ["Liquid ether", "Fluid background", "Mesh gradient"], () => <LiquidBackground />, "Move the pointer through it"),
  background("hyperspeed", "Hyperspeed", "Stars streaming from the centre; hold to jump to light speed.", ["Hyperspeed"], ["Warp", "Starfield"], () => <Hyperspeed />, "Press and hold"),
  background("shooting-stars", "Shooting Stars", "A night sky of twinkling stars crossed by the odd shooting star.", ["ShootingStars"], ["Stars", "Night sky"], () => <ShootingStars />, "Wait for one"),
];

/* ─────────────────────────────────── Cursors ─────────────────────────────────── */

function CursorPanel({ title }: { title: string }) {
  return (
    <div className="flex h-72 w-full flex-col items-center justify-center gap-4">
      <span className="text-title-lg-strong text-fg">{title}</span>
      <div className="flex gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
      </div>
      <a href="#/section/pro" className="text-body-sm text-fg-secondary underline underline-offset-4">
        A link
      </a>
    </div>
  );
}

const CURSOR_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "smooth-cursor",
    name: "Smooth Cursor",
    summary: "Inside its area the pointer becomes a gliding dot that swells into a ring over controls.",
    imports: ["SmoothCursor"],
    aliases: ["Custom cursor", "Blob cursor"],
    preview: () => (
      <div className="relative flex items-center gap-3">
        <Button variant="secondary">Hover</Button>
        <span className="absolute -top-2 -right-4 size-10 rounded-full border-2 border-accent-500 bg-accent-500/10" />
      </div>
    ),
    demo: () => (
      <SmoothCursor className="w-full rounded-surface border border-line bg-canvas">
        <CursorPanel title="Move the pointer in here" />
      </SmoothCursor>
    ),
  }),
  effect({
    slug: "target-cursor",
    name: "Target Cursor",
    summary: "A reticle whose corner brackets leap out and lock around whatever you can press.",
    imports: ["TargetCursor"],
    aliases: ["Reticle cursor", "Focus brackets"],
    preview: () => (
      <div className="relative p-2">
        <Button variant="secondary">Locked on</Button>
        <span className="absolute top-0 left-0 size-2.5 border-t-2 border-l-2 border-accent-500" />
        <span className="absolute top-0 right-0 size-2.5 border-t-2 border-r-2 border-accent-500" />
        <span className="absolute bottom-0 left-0 size-2.5 border-b-2 border-l-2 border-accent-500" />
        <span className="absolute right-0 bottom-0 size-2.5 border-r-2 border-b-2 border-accent-500" />
      </div>
    ),
    demo: () => (
      <TargetCursor className="w-full rounded-surface border border-line bg-canvas">
        <CursorPanel title="Point at the buttons" />
      </TargetCursor>
    ),
  }),
  effect({
    slug: "splash-cursor",
    name: "Splash Cursor",
    summary: "The pointer trails ink in the effect colours, and a click throws a splash.",
    imports: ["SplashCursor"],
    aliases: ["Ink cursor", "Fluid cursor"],
    preview: () => (
      <div className="relative flex h-32 w-56 items-center justify-center">
        <span className="absolute size-16 translate-x-6 rounded-full bg-effect-2 opacity-50 blur-soft" />
        <span className="absolute size-12 -translate-x-8 translate-y-3 rounded-full bg-effect-1 opacity-50 blur-soft" />
        <span className="relative text-title-sm-strong text-fg">Ink trail</span>
      </div>
    ),
    demo: () => (
      <SplashCursor className="w-full rounded-surface border border-line bg-canvas">
        <div className="flex h-72 items-center justify-center text-title-lg-strong text-fg">Move, then click</div>
      </SplashCursor>
    ),
  }),
  effect({
    slug: "pixel-trail",
    name: "Pixel Trail",
    summary: "Square pixels light up in the accent under the pointer and fade, 8-bit style.",
    imports: ["PixelTrail"],
    aliases: ["Pixel cursor", "Grid trail"],
    preview: () => (
      <div className="grid grid-cols-6 gap-px">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className="size-6 bg-accent-500" style={{ opacity: [0, 0, 0.3, 0.6, 0, 0, 0, 0.5, 0.9, 0.7, 0.2, 0, 0, 0, 0, 0.4, 1, 0.6][i] }} />
        ))}
      </div>
    ),
    demo: () => (
      <PixelTrail className="w-full rounded-surface border border-line bg-canvas">
        <div className="flex h-72 items-center justify-center text-title-lg-strong text-fg">Draw with the pointer</div>
      </PixelTrail>
    ),
  }),
];

/* ──────────────────────────────── 3D and data ──────────────────────────────── */

const CITIES = [
  { lat: 51.5, lon: -0.1, label: "London" },
  { lat: 40.7, lon: -74, label: "New York" },
  { lat: 35.7, lon: 139.7, label: "Tokyo" },
  { lat: -33.9, lon: 151.2, label: "Sydney" },
  { lat: 19.1, lon: 72.9, label: "Mumbai" },
  { lat: -23.5, lon: -46.6, label: "São Paulo" },
  { lat: 1.3, lon: 103.8, label: "Singapore" },
];
const ROUTES: [number, number][] = [
  [0, 1],
  [0, 4],
  [4, 6],
  [6, 2],
  [6, 3],
  [1, 5],
];

const TOOL_ICONS: IconComponent[] = [RiCodeSSlashLine, RiDatabase2Line, RiCloudLine, RiGitBranchLine, RiShieldCheckLine, RiTerminalBoxLine, RiMailLine, RiImageLine, RiFileTextLine, RiChat3Line, RiRobot2Line, RiSparkling2Line];

const Bubble = ({ icon: Icon, size = "size-10" }: { icon: IconComponent; size?: string }) => (
  <span className={`flex ${size} items-center justify-center rounded-full border border-line bg-surface text-fg shadow-raised`}>
    <Icon aria-hidden className="size-1/2" />
  </span>
);

function Orbits({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "relative size-44" : "relative size-96"}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-600 text-on-action shadow-overlay">
          <RiSparkling2Line aria-hidden className="size-7" />
        </span>
      </div>
      <OrbitingCircles radius={compact ? 12 : 22}>
        {TOOL_ICONS.slice(0, 4).map((icon, i) => (
          <Bubble key={i} icon={icon} size={compact ? "size-7" : "size-10"} />
        ))}
      </OrbitingCircles>
      {!compact && (
        <OrbitingCircles radius={40} reverse speed={1.6}>
          {TOOL_ICONS.slice(4, 10).map((icon, i) => (
            <Bubble key={i} icon={icon} />
          ))}
        </OrbitingCircles>
      )}
    </div>
  );
}

function BeamHub() {
  const box = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const left = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const right = useRef<HTMLDivElement>(null);
  const sources: IconComponent[] = [RiMailLine, RiDatabase2Line, RiFileTextLine];
  return (
    <div ref={box} className="relative flex h-64 w-full max-w-lg items-center justify-between px-6">
      <div className="flex flex-col gap-8">
        {sources.map((icon, i) => (
          <div key={i} ref={left[i]} className="relative z-10">
            <Bubble icon={icon} size="size-12" />
          </div>
        ))}
      </div>
      <div ref={hub} className="relative z-10 flex size-16 items-center justify-center rounded-full bg-accent-600 text-on-action shadow-overlay">
        <RiRobot2Line aria-hidden className="size-8" />
      </div>
      <div ref={right} className="relative z-10">
        <Bubble icon={RiChat3Line} size="size-12" />
      </div>
      {left.map((ref, i) => (
        <AnimatedBeam key={i} containerRef={box} fromRef={ref} toRef={hub} curvature={(i - 1) * -40} delay={i * 0.4} />
      ))}
      <AnimatedBeam containerRef={box} fromRef={hub} toRef={right} delay={1.2} />
    </div>
  );
}

const WALL = Array.from({ length: 16 }, (_, i) => (
  <div key={i} className="h-36 overflow-hidden rounded-surface border border-line shadow-raised">
    <Art seed={`wall ${i}`} />
  </div>
));

const SPATIAL_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "globe",
    name: "Globe",
    summary: "A dotted Earth turning slowly, with markers and arcs of light between places.",
    imports: ["Globe"],
    aliases: ["3D globe", "World globe", "Network globe"],
    preview: () => <Globe aria-label="Globe with seven offices" markers={CITIES} arcs={ROUTES} className="w-44" />,
    demo: () => <Globe aria-label="Offices in London, New York, Tokyo, Sydney, Mumbai, São Paulo and Singapore, connected by routes" markers={CITIES} arcs={ROUTES} className="w-96" />,
  }),
  effect({
    slug: "world-map",
    name: "World Map",
    summary: "A dotted map of the world with arcs of light travelling between places.",
    imports: ["WorldMap"],
    aliases: ["Dotted map", "Connection map"],
    preview: () => <WorldMap aria-label="Map of seven offices" places={CITIES.map(({ lat, lon }) => ({ lat, lon }))} routes={ROUTES} className="w-80" />,
    demo: () => <WorldMap aria-label="Offices in London, New York, Tokyo, Sydney, Mumbai, São Paulo and Singapore, connected by routes" places={CITIES} routes={ROUTES} className="w-full max-w-3xl" />,
  }),
  effect({
    slug: "icon-cloud",
    name: "Icon Cloud",
    summary: "Icons spread over a slowly turning sphere; drag to spin it.",
    imports: ["IconCloud"],
    aliases: ["Tag sphere", "3D icon cloud"],
    preview: () => <IconCloud aria-label="Twelve tool icons" icons={TOOL_ICONS.map((icon, i) => <Bubble key={i} icon={icon} size="size-8" />)} className="w-44" />,
    demo: () => <IconCloud aria-label="Tools: code, database, cloud, git, security, terminal, mail, images, documents, chat, agents and AI" icons={TOOL_ICONS.map((icon, i) => <Bubble key={i} icon={icon} />)} />,
  }),
  effect({
    slug: "orbiting-circles",
    name: "Orbiting Circles",
    summary: "Icons travelling round a centre on faint circular paths.",
    imports: ["OrbitingCircles"],
    aliases: ["Orbit", "Ecosystem"],
    preview: () => <Orbits compact />,
    demo: () => <Orbits />,
  }),
  effect({
    slug: "tilted-marquee",
    name: "Tilted Marquee",
    summary: "Columns of cards on a tilted plane, each scrolling the opposite way to its neighbour.",
    imports: ["TiltedMarquee"],
    aliases: ["3D marquee", "Screenshot wall"],
    preview: () => <TiltedMarquee items={WALL} columns={3} className="h-44 w-80" />,
    demo: () => <TiltedMarquee items={WALL} />,
  }),
  effect({
    slug: "animated-beam",
    name: "Animated Beam",
    summary: "A curved line between two elements with a pulse of light travelling along it.",
    imports: ["AnimatedBeam"],
    aliases: ["Connector", "Integration diagram", "Flow line"],
    preview: () => (
      <div className="scale-75">
        <BeamHub />
      </div>
    ),
    demo: () => <BeamHub />,
  }),
];

/* ─────────────────────────────────── Physics ─────────────────────────────────── */

const SKILLS = ["React", "Tokens", "Motion", "Aria", "Figma", "Charts", "Glass", "Moon", "Themes", "Tests", "Docs", "Blocks"];

const SKILL_CHIPS = SKILLS.map((s, i) => (
  <Chip key={s} color={(["orange", "lime", "rose", "yellow", "cyan", "blue", "purple"] as const)[i % 7]} className="px-3 py-1.5">
    {s}
  </Chip>
));

const PHYSICS_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "gravity-box",
    name: "Gravity Box",
    summary: "Tags that fall when the box scrolls into view, pile up, and can be thrown around.",
    imports: ["GravityBox"],
    aliases: ["Gravity", "Physics tags", "Drag elements"],
    preview: () => (
      <div className="flex w-72 flex-wrap items-end justify-center gap-1.5">
        {SKILL_CHIPS.slice(0, 8)}
      </div>
    ),
    demo: () => <GravityBox className="w-full max-w-lg">{SKILL_CHIPS}</GravityBox>,
  }),
  effect({
    slug: "falling-text",
    name: "Falling Text",
    summary: "A sentence whose words come loose and tumble into a pile you can throw about.",
    imports: ["FallingText"],
    aliases: ["Physics text", "Tumbling words"],
    preview: () => (
      <p className="max-w-xs text-center text-title-md-strong text-fg">
        Tokens make the <span className="inline-block translate-y-3 rotate-12 text-accent-600">whole</span> system{" "}
        <span className="inline-block translate-y-5 -rotate-6">move</span>
      </p>
    ),
    demo: () => <FallingText className="w-full max-w-lg" text="Tokens make every brand and theme move together, without a single fork." highlight={["brand", "theme", "together"]} />,
  }),
  effect({
    slug: "ballpit",
    name: "Ballpit",
    summary: "Soft balls tumbling under gravity, shoved by the pointer; press to throw them up.",
    imports: ["Ballpit"],
    aliases: ["Physics balls", "Ball pit"],
    preview: () => <Stage effect={<Ballpit count={24} />} className="h-full" />,
    demo: () => (
      <Stage effect={<Ballpit />} className="h-80">
        <StageTitle title="Ballpit" note="Move through them, press to throw" />
      </Stage>
    ),
  }),
  effect({
    slug: "lanyard",
    name: "Lanyard",
    summary: "A badge hanging on a strap that you can grab and swing.",
    imports: ["Lanyard"],
    aliases: ["Badge", "Swinging card", "Conference pass"],
    preview: () => (
      <div className="flex flex-col items-center">
        <span className="h-16 w-2.5 rounded-full bg-accent-600" />
        <span className="-mt-1 h-3 w-7 rounded-xs border-2 border-line-control bg-muted" />
        <div className="w-28 overflow-hidden rounded-surface border border-line bg-surface shadow-overlay">
          <Art seed="badge" className="h-12" />
          <div className="p-2 text-caption-strong text-fg">Ada Morgan</div>
        </div>
      </div>
    ),
    demo: () => (
      <Lanyard className="max-w-md">
        <Art seed="conference badge" className="h-24" />
        <div className="flex flex-col gap-0.5 p-4">
          <span className="text-body-md-strong text-fg">Ada Morgan</span>
          <span className="text-body-sm text-fg-secondary">Design lead · Speaker</span>
          <span className="mt-3 font-mono text-caption tracking-wide text-fg-secondary uppercase">Windesign Conf 2026</span>
        </div>
      </Lanyard>
    ),
  }),
];

export const EFFECT_SCENE_ENTRIES: CatalogEntry[] = [...BACKGROUND_ENTRIES, ...CURSOR_ENTRIES, ...SPATIAL_ENTRIES, ...PHYSICS_ENTRIES];
