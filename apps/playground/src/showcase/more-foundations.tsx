import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import tailwindBridge from "@windesign-ds/styles/tailwind.css?raw";
import lightTokens from "@windesign-ds/tokens/json/light.json";
import {
  RiAddLine,
  RiArrowRightLine,
  RiBellLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEditLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiFileTextLine,
  RiFilter3Line,
  RiFolderLine,
  RiHeartLine,
  RiHomeLine,
  RiImageLine,
  RiInformationLine,
  RiLinkM,
  RiLockLine,
  RiMailLine,
  RiMoreLine,
  RiSearchLine,
  RiSettings3Line,
  RiShareLine,
  RiStarLine,
  RiTimeLine,
  RiUploadLine,
  RiUserLine,
} from "@remixicon/react";
import { AccentPicker, Button, Grid, Stack, Text, ThemeScope, cx, useTheme } from "@windesign-ds/react";
import { CodeBlock } from "../site/gated-code";
import { AccentSpecimen } from "../site/accent-section";

const centreOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
import type { IconComponent, ThemeChoice } from "@windesign-ds/react";

/**
 * More foundation pages: spacing, radius, elevation, motion, icons,
 * breakpoints and theming. Like Color and Typography, values come from the
 * token bridge and the live page, so they follow the theme and the tokens.
 */

const TOKENS = lightTokens as Record<string, string | number>;

const readVar = (variable: string) => (typeof document === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(variable).trim());

/** Re-reads computed values when the theme attribute changes. */
function useThemeVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((v) => v + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return version;
}

const bridge = (prefix: string) =>
  [...tailwindBridge.matchAll(new RegExp(`^\\s*--${prefix}-([a-z0-9-]+):\\s*var\\((--ds-[a-z0-9-]+)\\);`, "gm"))].map((m) => ({ name: m[1]!, variable: m[2]! }));

function Section({ title, blurb, children }: { title: string; blurb?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-md-strong text-fg">{title}</h2>
        {blurb && <p className="max-w-prose text-body-md text-fg-secondary">{blurb}</p>}
      </div>
      {children}
    </section>
  );
}

function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("font-mono text-caption text-fg-secondary", className)}>{children}</span>;
}

/* -------------------------------------------------------------------------- */
/*                                   Spacing                                  */
/* -------------------------------------------------------------------------- */

const STEPS = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16];
const SIZES = bridge("spacing");

export function SpacingFoundation() {
  const version = useThemeVersion();
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <Section title="Scale" blurb="Every padding, margin and gap is a step of 4px: p-2 is 8px, gap-6 is 24px. Half steps exist for tight controls. Arbitrary values like p-[13px] are not used.">
        <div className="flex flex-col">
          {STEPS.map((step) => (
            <div key={step} className="grid grid-cols-3 items-center gap-4 border-b border-line py-2 last:border-b-0 sm:grid-cols-4">
              <Mono className="text-fg">{step}</Mono>
              <Mono>{step * 4}px · {step / 4}rem</Mono>
              <span className="col-span-1 flex sm:col-span-2">
                <span className="h-3 rounded-hairline bg-accent-600" style={{ width: `calc(var(--spacing) * ${step})` }} />
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Component sizes" blurb="Control heights and icon sizes are tokens of their own, so buttons, fields and icons line up across components.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SIZES.map(({ name, variable }) => (
            <div key={name + version} className="flex items-center justify-between gap-3 rounded-surface border border-line bg-surface px-4 py-3">
              <span className="flex flex-col">
                <span className="text-body-md-strong text-fg">{name}</span>
                <Mono>
                  h-{name} · size-{name}
                </Mono>
              </span>
              <span className="flex items-center gap-3">
                <Mono className="text-fg">{readVar(variable)}</Mono>
                <span className="rounded-xs bg-muted" style={{ width: `var(${variable})`, height: `var(${variable})` }} />
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function SpacingPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-1.5">
      {[1, 2, 4, 6, 10, 16].map((step) => (
        <span key={step} className="flex items-center gap-3">
          <Mono className="w-6">{step}</Mono>
          <span className="h-2.5 rounded-hairline bg-accent-600" style={{ width: `calc(var(--spacing) * ${step})` }} />
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Radius                                   */
/* -------------------------------------------------------------------------- */

const RADII = bridge("radius");
const ROLE_RADII = RADII.filter((r) => !/^(xs|sm|md|lg|2lg|xl|2xl|3xl)$/.test(r.name));
const SCALE_RADII = RADII.filter((r) => /^(xs|sm|md|lg|2lg|xl|2xl|3xl)$/.test(r.name));

const RADIUS_USE: Record<string, string> = {
  hairline: "Bars, ticks, meter segments",
  "control-xs": "Extra-small buttons",
  "control-sm": "Small buttons and inline controls",
  "control-md": "Buttons, fields, menu rows",
  item: "Calendar days, list items",
  tile: "Thumbnails and tiles",
  chip: "Tags, chips and badges",
  surface: "Cards, alerts, panels",
  overlay: "Popovers, menus, dialogs",
  panel: "Large framed panels",
};

function RadiusRow({ name, variable, use, version }: { name: string; variable: string; use?: string; version: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
      <span className="size-12 shrink-0 border-2 border-accent-600 border-b-0 border-e-0" style={{ borderTopLeftRadius: `var(${variable})` }} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-mono text-body-sm text-fg">rounded-{name}</span>
        {use && <span className="text-body-sm text-fg-secondary">{use}</span>}
      </span>
      <Mono key={version} className="text-fg">
        {readVar(variable)}
      </Mono>
    </div>
  );
}

export function RadiusFoundation() {
  const version = useThemeVersion();
  return (
    <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
      <Section title="Roles" blurb="Use a role, which says what the corner is for. Corners are crisp: 4px on controls, 6px on surfaces.">
        <div className="flex flex-col">
          {ROLE_RADII.map((r) => (
            <RadiusRow key={r.name} {...r} use={RADIUS_USE[r.name]} version={version} />
          ))}
        </div>
      </Section>
      <Section title="Scale" blurb="For component internals where no role fits.">
        <div className="flex flex-col">
          {SCALE_RADII.map((r) => (
            <RadiusRow key={r.name} {...r} version={version} />
          ))}
        </div>
      </Section>
    </div>
  );
}

export function RadiusPreview() {
  return (
    <div className="flex items-end gap-3">
      {["hairline", "control-md", "surface", "overlay", "panel"].map((name) => {
        const r = RADII.find((x) => x.name === name);
        return (
          <span key={name} className="flex flex-col items-center gap-2">
            <span className="size-12 border-2 border-accent-600 border-b-0 border-e-0" style={{ borderTopLeftRadius: r ? `var(${r.variable})` : undefined }} />
            <Mono>{name.replace("control-", "")}</Mono>
          </span>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Elevation                                 */
/* -------------------------------------------------------------------------- */

const SHADOWS = bridge("shadow");
const SYSTEM_SHADOWS = ["hairline", "raised", "overlay", "control-checked"];
const SHADOW_USE: Record<string, string> = {
  hairline: "A rule drawn as a shadow, for edges inside a surface",
  raised: "Controls and cards that sit just above the page",
  overlay: "Menus, popovers, dialogs and toasts",
  "control-checked": "The inner highlight on checked controls",
};

export function ElevationFoundation() {
  const version = useThemeVersion();
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <Section title="System" blurb="Depth is quiet: rules first, a soft lift for controls, and one stronger shadow for anything floating. Use shadow-raised and shadow-overlay; never write a shadow by hand.">
        <Grid columns={4} gap={4}>
          {SHADOWS.filter((s) => SYSTEM_SHADOWS.includes(s.name)).map(({ name, variable }) => (
            <div key={name} className="flex flex-col gap-3">
              <div className="flex h-28 items-center justify-center rounded-surface bg-surface" style={{ boxShadow: `var(${variable})` }}>
                <span className="font-mono text-body-sm text-fg">shadow-{name}</span>
              </div>
              <span className="text-body-sm text-fg-secondary">{SHADOW_USE[name]}</span>
            </div>
          ))}
        </Grid>
      </Section>
      <Section title="Component shadows" blurb="Effects owned by one component (switch thumbs, slider tracks), kept in the component token namespace.">
        <div className="flex flex-wrap gap-2">
          {SHADOWS.filter((s) => !SYSTEM_SHADOWS.includes(s.name)).map(({ name }) => (
            <span key={name + version} className="rounded-chip border border-line bg-surface px-2 py-1 font-mono text-caption text-fg-secondary">
              shadow-{name}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function ElevationPreview() {
  return (
    <div className="flex items-center gap-4">
      {["raised", "overlay"].map((name) => (
        <span key={name} className={cx("flex size-24 items-center justify-center rounded-surface bg-surface font-mono text-caption text-fg-secondary", name === "raised" ? "shadow-raised" : "shadow-overlay")}>
          {name}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Motion                                   */
/* -------------------------------------------------------------------------- */

const DURATIONS = Object.entries(TOKENS)
  .filter(([key]) => key.startsWith("ds-motion-duration-"))
  .map(([key, value]) => ({ name: key.replace("ds-motion-duration-", ""), value: String(value) }));
const EASINGS = Object.keys(TOKENS)
  .filter((key) => key.startsWith("ds-motion-easing-"))
  .map((key) => key.replace("ds-motion-easing-", ""));

const DURATION_USE: Record<string, string> = {
  fast: "Hover colours, small fades",
  base: "Most state changes",
  moderate: "Menus, chevrons, dialogs",
  slow: "Drawers, progress, images",
  "press-in": "Press-down scale",
  "press-out": "Press-release scale",
  shimmer: "One loading sweep",
  "row-enter": "Rows sliding in",
  "row-exit": "Rows leaving",
};

export function MotionFoundation() {
  const [played, setPlayed] = useState(false);
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <Section title="Durations" blurb="Short and purposeful. Components read these as CSS variables, e.g. duration-(--ds-motion-duration-base), and React code uses the easing and layoutSpring exports.">
        <div className="flex flex-col">
          {DURATIONS.map(({ name, value }) => (
            <div key={name} className="grid grid-cols-3 items-center gap-4 border-b border-line py-2 last:border-b-0">
              <span className="font-mono text-body-sm text-fg">{name}</span>
              <Mono className="text-fg">{value}</Mono>
              <span className="text-body-sm text-fg-secondary">{DURATION_USE[name]}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Easing" blurb="Press Play to send each dot across with its curve over the moderate duration. With reduced motion turned on, components cut transitions short.">
        <Button variant="secondary" size="sm" onPress={() => setPlayed((p) => !p)} className="self-start">
          {played ? "Reset" : "Play"}
        </Button>
        <div className="flex flex-col gap-3">
          {EASINGS.map((name) => (
            <div key={name} className="flex items-center gap-4">
              <span className="w-24 font-mono text-body-sm text-fg">{name}</span>
              <span className="relative h-6 flex-1 rounded-full bg-sunken">
                <span
                  className="absolute top-1 size-4 rounded-full bg-accent-600 motion-reduce:transition-none"
                  style={{
                    insetInlineStart: played ? "calc(100% - 20px)" : "4px",
                    transition: `inset-inline-start calc(var(--ds-motion-duration-slow) * 2) var(--ds-motion-easing-${name})`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function MotionPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-2">
      {DURATIONS.slice(0, 4).map(({ name, value }) => (
        <span key={name} className="flex items-center gap-3">
          <Mono className="w-16">{name}</Mono>
          <span className="h-2 rounded-full bg-accent-600" style={{ width: `${Math.min(100, parseFloat(value) / 4)}%` }} />
          <Mono>{value}</Mono>
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Icons                                   */
/* -------------------------------------------------------------------------- */

const ICONS: [string, IconComponent][] = [
  ["Add", RiAddLine],
  ["ArrowRight", RiArrowRightLine],
  ["Bell", RiBellLine],
  ["Calendar", RiCalendarLine],
  ["Check", RiCheckLine],
  ["Close", RiCloseLine],
  ["DeleteBin", RiDeleteBinLine],
  ["Download", RiDownloadLine],
  ["Edit", RiEditLine],
  ["ExternalLink", RiExternalLinkLine],
  ["Eye", RiEyeLine],
  ["FileText", RiFileTextLine],
  ["Filter3", RiFilter3Line],
  ["Folder", RiFolderLine],
  ["Heart", RiHeartLine],
  ["Home", RiHomeLine],
  ["Image", RiImageLine],
  ["Information", RiInformationLine],
  ["Link", RiLinkM],
  ["Lock", RiLockLine],
  ["Mail", RiMailLine],
  ["More", RiMoreLine],
  ["Search", RiSearchLine],
  ["Settings3", RiSettings3Line],
  ["Share", RiShareLine],
  ["Star", RiStarLine],
  ["Time", RiTimeLine],
  ["Upload", RiUploadLine],
  ["User", RiUserLine],
];

const ICON_USAGE = `import { RiDownloadLine } from "@remixicon/react";
import { Button } from "@windesign-ds/react";

// Pass the component, not an element: the button sizes it.
<Button leadingIcon={RiDownloadLine}>Export</Button>

// Icon-only controls need a name.
<Button iconOnly leadingIcon={RiDownloadLine} aria-label="Export" />

// Decorative icons are hidden from screen readers.
<RiDownloadLine aria-hidden className="size-icon-sm text-icon-secondary" />`;

export function IconsFoundation() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <Section title="Set" blurb="Icons come from Remix Icon, line style, imported one by one from @remixicon/react so only what's used ships. They inherit the text colour; use the icon colour tokens for quieter ones.">
        <Grid minItemWidth={112} gap={2}>
          {ICONS.map(([name, Icon]) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-surface border border-line bg-surface px-2 py-4">
              <Icon aria-hidden className="size-icon-md text-fg" />
              <span className="truncate font-mono text-caption text-fg-secondary">Ri{name}Line</span>
            </div>
          ))}
        </Grid>
      </Section>
      <Section title="Sizes" blurb="Three sizes, matched to the control heights.">
        <Stack direction="row" gap={8} align="end">
          {(["xs", "sm", "md"] as const).map((size) => (
            <Stack key={size} gap={2} align="center">
              <RiSearchLine aria-hidden className={cx("text-fg", size === "xs" ? "size-icon-xs" : size === "sm" ? "size-icon-sm" : "size-icon-md")} />
              <Mono>size-icon-{size}</Mono>
            </Stack>
          ))}
        </Stack>
      </Section>
      <Section title="Usage">
        <CodeBlock code={ICON_USAGE} language="tsx" />
      </Section>
    </div>
  );
}

export function IconsPreview() {
  return (
    <div className="grid grid-cols-5 gap-4 text-fg">
      {ICONS.slice(0, 15).map(([name, Icon]) => (
        <Icon key={name} aria-hidden className="size-icon-md" />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Breakpoints                                */
/* -------------------------------------------------------------------------- */

const BREAKPOINTS = [
  { name: "base", min: 0, use: "Phones: one column, stacked actions" },
  { name: "sm", min: 640, use: "Large phones: rows of controls, two-column grids" },
  { name: "md", min: 768, use: "Tablets: side panels appear" },
  { name: "lg", min: 1024, use: "Laptops: full navigation, three-column grids" },
  { name: "xl", min: 1280, use: "Desktops: wider page column" },
  { name: "2xl", min: 1536, use: "Large screens: content stays at max width" },
];

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 0 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export function BreakpointsFoundation() {
  const width = useViewportWidth();
  const active = [...BREAKPOINTS].reverse().find((b) => width >= b.min)!;
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <Section title="Viewport" blurb="Tailwind's mobile-first breakpoints: unprefixed classes apply everywhere, sm: and up apply from that width. Design for 375px first.">
        <p className="font-mono text-caption text-fg-secondary" aria-live="polite">
          This window: <span className="text-fg">{width}px</span> · active: <span className="text-accent-600">{active.name}</span>
        </p>
        <div className="flex flex-col">
          {BREAKPOINTS.map((b) => (
            <div key={b.name} className={cx("grid grid-cols-3 items-center gap-4 border-b border-line py-2.5 last:border-b-0", b === active && "bg-sunken")}>
              <span className="ps-2 font-mono text-body-sm text-fg">{b.name === "base" ? "(none)" : `${b.name}:`}</span>
              <Mono className="text-fg">{b.min ? `≥ ${b.min}px · ${b.min / 16}rem` : "0px"}</Mono>
              <span className="text-body-sm text-fg-secondary">{b.use}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Containers" blurb="Templates size themselves to their container, not the window, so they also fit a panel or a preview. Mark the box with @container and use @md:, @3xl: and so on inside it.">
        <CodeBlock
          language="tsx"
          code={`<div className="@container">\n  <div className="grid gap-4 @3xl:grid-cols-[2fr_1fr]">…</div>\n</div>`}
        />
      </Section>
    </div>
  );
}

export function BreakpointsPreview() {
  return (
    <div className="flex w-full max-w-64 items-end gap-1.5">
      {BREAKPOINTS.slice(1).map((b, i) => (
        <span key={b.name} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="w-full rounded-hairline border border-line bg-sunken" style={{ height: `${28 + i * 16}px` }} />
          <Mono>{b.name}</Mono>
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Theming                                  */
/* -------------------------------------------------------------------------- */

const THEME_USAGE = `import { AccentPicker, ThemeProvider, ThemeScope, useTheme } from "@windesign-ds/react";

<ThemeProvider defaultTheme="light">
  <App />
</ThemeProvider>

function ThemeMenu() {
  const { theme, resolvedTheme, setTheme, accent, setAccent } = useTheme();
  // theme: "light" | "dark" | "system"; resolvedTheme: what's showing
  // setTheme("dark", { x, y }) reveals the change in a circle from that point
  // setAccent("blue"), setAccent("#2f6f4f"), or drop in <AccentPicker />
}

// One region in a fixed theme:
<ThemeScope theme="dark">…</ThemeScope>`;

function MiniCard() {
  return (
    <div className="flex flex-col gap-3 p-5">
      <span className="text-title-sm-strong text-fg">Quarterly plan</span>
      <span className="text-body-sm text-fg-secondary">Tokens remap; the component is the same.</span>
      <Button size="sm" className="self-start">
        Open
      </Button>
    </div>
  );
}

export function ThemingFoundation() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <Section title="This page" blurb="The site runs inside ThemeProvider. Switching here is the same as the switch in the header.">
        <Stack direction="row" gap={2} wrap>
          {(["light", "dark"] as ThemeChoice[]).map((choice) => (
            <Button key={choice} size="sm" variant={theme === choice ? "primary" : "secondary"} onPress={(e) => setTheme(choice, centreOf(e.target))} aria-pressed={theme === choice}>
              {choice[0]!.toUpperCase() + choice.slice(1)}
            </Button>
          ))}
        </Stack>
        <Text size="sm" tone="secondary" mono>
          theme: {theme} · resolvedTheme: {resolvedTheme}
        </Text>
      </Section>
      <Section title="Accent" blurb="One ramp, --ds-color-accent-50…950, colours every interactive mark. Pick a preset or any colour; the change spreads out from where you clicked.">
        <AccentPicker />
        <AccentSpecimen />
      </Section>
      <Section title="Scopes" blurb="ThemeScope pins a region to one theme, whatever the page is using.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ThemeScope theme="light" className="overflow-hidden rounded-surface border border-line">
            <MiniCard />
          </ThemeScope>
          <ThemeScope theme="dark" className="overflow-hidden rounded-surface border border-line">
            <MiniCard />
          </ThemeScope>
        </div>
      </Section>
      <Section title="Usage">
        <CodeBlock code={THEME_USAGE} language="tsx" />
      </Section>
    </div>
  );
}

export function ThemingPreview() {
  return (
    <div className="grid w-full max-w-72 grid-cols-2 overflow-hidden rounded-surface border border-line">
      <ThemeScope theme="light" className="p-4">
        <span className="text-body-sm-strong text-fg">Light</span>
      </ThemeScope>
      <ThemeScope theme="dark" className="p-4">
        <span className="text-body-sm-strong text-fg">Dark</span>
      </ThemeScope>
    </div>
  );
}
