import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiCodeSSlashLine,
  RiReactjsLine,
  RiShieldCheckLine,
  RiTailwindCssFill,
  RiBox3Line,
  RiRobot2Line,
  RiSparkling2Line,
  RiTerminalBoxLine,
} from "@remixicon/react";
import {
  AnimatedNumber,
  BRANDS,
  BorderBeam,
  Button,
  CodeBlock,
  CopyButton,
  LightRays,
  LinkButton,
  Marquee,
  RotatingText,
  SegmentedControl,
  SegmentedControlItem,
  cx,
  focusRingNative,
  useTheme,
} from "@windesign-ds/react";
import type { Brand, IconComponent } from "@windesign-ds/react";
import { CATALOG, findEntry } from "../showcase/catalog";
import { AccentSection } from "./accent-section";
import { InstallCommand, cliCommand, installCommand } from "./install-command";
import { HeroSpecimen, NewChip, Page, Principles, QuickStart, SectionHeading } from "./pages";

/**
 * The home page: an animated hero, a bento of live components, every component
 * name on a marquee, the brand switch as a demo, the effects, the three ways to
 * install, then the quick start. Everything on it is the system itself.
 */

const go = (hash: string) => () => {
  window.location.hash = hash;
};

/** The Pro group is the four original Pro components plus the effects. */
const PRO_COMPONENTS = ["command-palette", "toast", "step-wizard", "stat-card"];
const effectCount = CATALOG.filter((e) => e.group === "Pro" && !PRO_COMPONENTS.includes(e.slug)).length;

/* ── Motion helpers ──────────────────────────────────────────────────────── */

/** Rises into place the first time it scrolls into view. Still for reduced motion. */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cx(
        "transition-[opacity,translate] duration-(--ds-motion-duration-slow) ease-enter motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A live catalogue demo in a tile, with its name linking to its page. */
function Tile({
  slug,
  className,
  beam = false,
  demo = false,
  fixed = false,
}: {
  slug: string;
  className?: string;
  beam?: boolean;
  demo?: boolean;
  /** In a fixed-height card: the demo fits the space above the name bar and clips, never pushing it out. */
  fixed?: boolean;
}) {
  const entry = findEntry(slug);
  if (!entry) return null;
  const Render = demo ? (entry.demo ?? entry.preview) : entry.preview;
  const body = (
    <div className="flex h-full flex-col overflow-hidden rounded-surface border border-line bg-surface">
      <div className={cx("flex flex-1 items-center justify-center p-5 sm:p-6", fixed ? "min-h-0 overflow-hidden" : "min-h-56")}>
        <Render />
      </div>
      <a
        href={`#/components/${entry.slug}`}
        className={cx(
          "group flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-body-sm-strong text-fg transition-colors hover:bg-surface-hover",
          focusRingNative,
        )}
      >
        {entry.name}
        <RiArrowRightUpLine aria-hidden className="size-4 text-icon-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
  return <div className={cx("min-w-0", className)}>{beam ? <BorderBeam className="h-full rounded-surface">{body}</BorderBeam> : body}</div>;
}

/* ── 1. Hero ─────────────────────────────────────────────────────────────── */

const TECH: { label: string; icon: IconComponent }[] = [
  { label: "React 19", icon: RiReactjsLine },
  { label: "Tailwind CSS v4", icon: RiTailwindCssFill },
  { label: "React Aria", icon: RiShieldCheckLine },
  { label: "TypeScript", icon: RiCodeSSlashLine },
];
const INSTALL = "npx windesign-ds@latest add dynamic-island";

const HERO_STATS: { value: number; label: string }[] = [
  { value: CATALOG.length, label: "components" },
  { value: effectCount, label: "effects" },
  { value: BRANDS.length, label: "brands" },
  { value: BRANDS.length * 2, label: "themes" },
];

/** The hero's numbers. AnimatedNumber counts each up from zero on first render. */
function HeroStats() {
  return (
    <dl className="grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-surface border border-line bg-line sm:grid-cols-4">
      {HERO_STATS.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-0.5 bg-surface px-4 py-3">
          <dt className="order-2 text-body-sm text-fg-secondary">{label}</dt>
          <dd className="order-1 text-title-lg-strong text-fg">
            <AnimatedNumber value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero" className="relative isolate overflow-hidden border-b border-line">
      <LightRays className="-z-10 opacity-70" />
      {/* A pool of the brand's accent behind the headline, then the rays fade out into the page. */}
      <div aria-hidden className="absolute inset-x-0 top-1/4 -z-10 mx-auto h-96 max-w-4xl bg-radial from-accent-500/15 to-transparent to-70% blur-glow" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-b from-transparent to-canvas" />

      <Page className="items-center gap-8 py-20 text-center sm:py-28 lg:py-32">
        <a
          href="#/ai"
          className={cx(
            "group flex items-center gap-2 rounded-full border border-line bg-surface py-1 ps-1 pe-3 text-body-sm text-fg-secondary shadow-raised transition-colors hover:border-line-control hover:text-fg",
            focusRingNative,
          )}
        >
          <NewChip />
          Build with your AI tools: the Windesign MCP server
          <RiArrowRightLine aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
        </a>

        <h1 id="hero" className="max-w-4xl text-display-md font-semibold tracking-tight text-balance text-fg sm:text-display-lg">
          The design system for{" "}
          <span className="block text-accent-600">
            <RotatingText words={["dashboards", "AI products", "editorial sites", "every brand"]} interval={2600} />
          </span>
        </h1>

        <p className="max-w-2xl text-body-lg text-pretty text-fg-secondary">
          {CATALOG.length} accessible React components, charts, templates and effects on one set of tokens. Three brands, light and dark, any accent,
          and not one component rewritten to switch.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button size="md" trailingIcon={RiArrowRightLine} onPress={() => document.getElementById("ways-in")?.scrollIntoView({ behavior: "smooth" })}>
            Get started
          </Button>
          <Button size="md" variant="secondary" onPress={go("#/components")}>
            Browse components
          </Button>
        </div>

        <div className="flex max-w-full items-center gap-2 rounded-control-md border border-line bg-surface py-1.5 ps-4 pe-1.5 shadow-raised">
          <RiTerminalBoxLine aria-hidden className="size-4 shrink-0 text-icon-secondary" />
          <code className="truncate font-code text-body-sm text-fg">{INSTALL}</code>
          <CopyButton value={INSTALL} iconOnly label="Copy the command" size="sm" variant="tertiary" />
        </div>

        <HeroStats />

        <ul aria-label="Built with" className="flex flex-wrap items-center justify-center gap-2">
          <li className="text-body-sm text-fg-tertiary">Built with</li>
          {TECH.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 ps-2 pe-3 text-body-sm text-fg-secondary">
              <Icon aria-hidden className="size-4 text-icon-secondary" />
              {label}
            </li>
          ))}
        </ul>
      </Page>
    </section>
  );
}

/* ── 1b. Ticker of big live components ───────────────────────────────────── */

// Different from the bento's, so the page shows more of the system.
const TICKER = [
  "orders-chart",
  "calendar",
  "composer",
  "notification-center",
  "activity-rings",
  "agent-thinking",
  "task-list",
  "contributions",
  "line-chart",
  "date-range-picker",
];

/**
 * Under the hero: large cards, each a working component, drifting past. It
 * pauses while hovered or focused, so anything in it can be used, and holds
 * still (scrollable by hand) for reduced motion.
 */
function ComponentTicker() {
  return (
    <section aria-label="Live components" className="border-b border-line bg-sunken py-8 sm:py-10">
      <Marquee pauseOnHover fade gap={5} speed={4}>
        {TICKER.map((slug) => (
          <Tile key={slug} slug={slug} fixed className="h-80 w-80 shrink-0 sm:w-96" />
        ))}
      </Marquee>
    </section>
  );
}

/* ── 2. Live bento ───────────────────────────────────────────────────────── */

function Bento() {
  return (
    <section aria-labelledby="live" className="flex flex-col gap-10">
      <Reveal>
        <SectionHeading
          id="live"
          title="Everything here is live"
          description="Not screenshots. Each tile is the real component: click, type, drag. It follows the brand and theme you pick in the header."
        />
      </Reveal>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12">
        <Reveal className="md:col-span-3 lg:col-span-5">
          <Tile slug="stat-card" className="h-full" />
        </Reveal>
        <Reveal className="md:col-span-3 lg:col-span-7" delay={80}>
          <Tile slug="dynamic-island" className="h-full" beam />
        </Reveal>
        <Reveal className="md:col-span-6 lg:col-span-8">
          <Tile slug="revenue-chart" className="h-full" />
        </Reveal>
        <Reveal className="md:col-span-3 lg:col-span-4" delay={80}>
          <Tile slug="range-calendar" className="h-full" />
        </Reveal>
        <Reveal className="md:col-span-3 lg:col-span-4">
          <Tile slug="toast" className="h-full" />
        </Reveal>
        <Reveal className="md:col-span-3 lg:col-span-4" delay={80}>
          <Tile slug="command-palette" className="h-full" />
        </Reveal>
        <Reveal className="md:col-span-3 lg:col-span-4" delay={160}>
          <Tile slug="agent-progress" className="h-full" />
        </Reveal>
      </div>
    </section>
  );
}

/* ── 3. Marquee of every component ───────────────────────────────────────── */

function NameChip({ slug, name }: { slug: string; name: string }) {
  return (
    <a
      href={`#/components/${slug}`}
      className={cx(
        "flex shrink-0 items-center rounded-full border border-line bg-surface px-4 py-2 text-body-md whitespace-nowrap text-fg-secondary transition-colors hover:border-line-control hover:text-fg",
        focusRingNative,
      )}
    >
      {name}
    </a>
  );
}

function ComponentMarquee() {
  const half = Math.ceil(CATALOG.length / 2);
  const rows = [CATALOG.slice(0, half), CATALOG.slice(half)];
  return (
    <section aria-labelledby="everything" className="flex flex-col gap-8">
      <Reveal>
        <SectionHeading
          id="everything"
          title={`${CATALOG.length} pieces, one language`}
          description="Forms, overlays, navigation, data, charts, agent blocks, templates and effects. Hover a row to stop it; every name opens its page."
          action={
            <LinkButton href="#/components" variant="secondary" trailingIcon={RiArrowRightLine}>
              All components
            </LinkButton>
          }
        />
      </Reveal>
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          // About 130 names a row: a long pass, so they drift rather than race.
          <Marquee key={i} reverse={i === 1} pauseOnHover fade gap={3} speed={i === 0 ? 7 : 6}>
            {row.map((entry) => (
              <NameChip key={entry.slug} slug={entry.slug} name={entry.name} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}

/* ── 4. The brand switch, as the demo ────────────────────────────────────── */

function BrandShowcase() {
  const { brand, setBrand } = useTheme();
  const control = useRef<HTMLDivElement>(null);
  const current = BRANDS.find((b) => b.id === brand) ?? BRANDS[0]!;
  return (
    <section aria-labelledby="brands" className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
      <Reveal className="flex flex-col gap-6 lg:col-span-5">
        <SectionHeading
          id="brands"
          title="One system. Three brands."
          description="Windesign's tonal teal, Moon's soft panels and Glass's frosted light. Switch here and watch the whole page change: same components, same code, new tokens."
        />
        <div ref={control} className="flex flex-col gap-3">
          <SegmentedControl
            aria-label="Brand"
            selectedKeys={[brand]}
            onSelectionChange={(keys) => {
              const next = [...keys][0] as Brand | undefined;
              if (!next || next === brand) return;
              const r = control.current?.getBoundingClientRect();
              setBrand(next, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
            }}
          >
            {BRANDS.map(({ id, label }) => (
              <SegmentedControlItem key={id} id={id}>
                {label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <p className="flex items-center gap-2 text-body-sm text-fg-secondary">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: current.accentColor }} />
            {current.label}'s accent: {current.accentLabel}. Try dark mode too, from the header.
          </p>
        </div>
      </Reveal>
      <Reveal className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:col-span-7" delay={100}>
        <HeroSpecimen />
        <div className="flex flex-col gap-5">
          <Tile slug="stat-card" />
          <Tile slug="slide-to-confirm" />
        </div>
      </Reveal>
    </section>
  );
}

/* ── 5. Effects ──────────────────────────────────────────────────────────── */

const EFFECTS = ["split-flap", "scramble-text", "magnetic", "orbiting-circles", "click-spark", "tilt-card"];

function Effects() {
  return (
    <section aria-labelledby="effects" className="flex flex-col gap-10">
      <Reveal>
        <SectionHeading
          id="effects"
          title={`${effectCount} effects, same tokens`}
          description="Animated text, cards, backgrounds, cursors and physics, drawn in each brand's own colours. They pause off screen and hold still for reduced motion."
          action={
            <LinkButton href="#/section/pro" variant="secondary" trailingIcon={RiSparkling2Line}>
              See them all
            </LinkButton>
          }
        />
      </Reveal>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EFFECTS.map((slug, i) => (
          <Reveal key={slug} delay={(i % 3) * 80}>
            <Tile slug={slug} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── 6. Three ways in ────────────────────────────────────────────────────── */

const WAYS: { title: string; icon: IconComponent; text: string; body: ReactNode; link?: { label: string; href: string } }[] = [
  {
    title: "Install the package",
    icon: RiBox3Line,
    text: "Keep the components in node_modules and update them with a version bump.",
    body: <InstallCommand label="Install the package" command={(m) => installCommand(m, "@windesign-ds/react @windesign-ds/styles")} />,
  },
  {
    title: "Copy the source",
    icon: RiTerminalBoxLine,
    text: "Add one component, with the files it uses, as code you own and change.",
    body: <InstallCommand label="Add with the CLI" command={(m) => cliCommand(m, "add context-menu")} />,
  },
  {
    title: "Hand it to your AI",
    icon: RiRobot2Line,
    text: "The MCP server gives Claude Code, Cursor and VS Code the real components and rules.",
    body: <CodeBlock code="claude mcp add windesign -- npx -y @windesign-ds/mcp" language="bash" />,
    link: { label: "Set up your AI tool", href: "#/ai" },
  },
];

function WaysIn() {
  return (
    <section aria-labelledby="ways-in" className="flex flex-col gap-10">
      <Reveal>
        <SectionHeading id="ways-in" title="Three ways in" description="Pick the one that fits the project. They're the same components and tokens underneath." />
      </Reveal>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {WAYS.map(({ title, icon: Icon, text, body, link }, i) => (
          <Reveal key={title} delay={i * 80}>
            <div className="flex h-full flex-col gap-4 rounded-surface border border-line bg-surface p-6">
              <span aria-hidden className="flex size-10 items-center justify-center rounded-control-md bg-muted text-icon">
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-title-sm-strong text-fg">{title}</h3>
                <p className="text-body-md text-fg-secondary">{text}</p>
              </div>
              <div className="mt-auto min-w-0">{body}</div>
              {link && (
                <LinkButton href={link.href} variant="secondary" size="small" trailingIcon={RiArrowRightLine} className="self-start">
                  {link.label}
                </LinkButton>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── 7. Closing call to action ───────────────────────────────────────────── */

function Closing() {
  return (
    <section aria-labelledby="closing" className="relative isolate overflow-hidden border-t border-line">
      <LightRays className="-z-10 opacity-50" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-linear-to-t from-transparent to-canvas" />
      <Page className="items-center gap-6 py-24 text-center sm:py-32">
        <Reveal className="flex flex-col items-center gap-6">
          <h2 id="closing" className="max-w-3xl text-display-md font-semibold tracking-tight text-balance text-fg">
            Start with one component. Keep the whole system.
          </h2>
          <p className="max-w-xl text-body-lg text-pretty text-fg-secondary">Free and MIT licensed, with the source on GitHub.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="md" trailingIcon={RiArrowRightLine} onPress={go("#/components")}>
              Browse components
            </Button>
            <Button size="md" variant="secondary" onPress={go("#/ai")}>
              Use with AI
            </Button>
          </div>
        </Reveal>
      </Page>
    </section>
  );
}

/* ── The page ────────────────────────────────────────────────────────────── */

export function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <ComponentTicker />
      <Page className="gap-24 py-20 sm:gap-32 sm:py-24">
        <Bento />
        <ComponentMarquee />
        <BrandShowcase />
        <Effects />
        <WaysIn />
        <Reveal>
          <QuickStart />
        </Reveal>
        <Reveal>
          <Principles />
        </Reveal>
        <Reveal>
          <AccentSection />
        </Reveal>
      </Page>
      <Closing />
    </div>
  );
}
