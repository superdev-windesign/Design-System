import { useEffect, useMemo, useState } from "react";
import tailwindBridge from "@ds/styles/tailwind.css?raw";
import lightTokens from "@ds/tokens/json/light.json";
import { cx, focusRingNative } from "@ds/react";

/**
 * Foundation pages: the colour and type tokens, read straight from the
 * Tailwind bridge (packages/styles/src/tailwind.css) so they can't drift from
 * what the utilities actually resolve to. Values are read from the live page,
 * so they follow the theme switch.
 */

/* -------------------------------------------------------------------------- */
/*                                   Parsing                                  */
/* -------------------------------------------------------------------------- */

interface ColorToken {
  /** Utility name, e.g. "surface" → bg-surface / text-surface / border-surface. */
  name: string;
  /** The underlying @ds variable. */
  variable: string;
}

const COLOR_LINE = /^\s*--color-([a-z0-9-]+):\s*var\((--ds-[a-z0-9-]+)\);/gm;
const TEXT_LINE = /^\s*--text-([a-z0-9-]+):\s*var\(--ds-text-([a-z0-9-]+)-size\);/gm;

const COLORS: ColorToken[] = [...tailwindBridge.matchAll(COLOR_LINE)].map((m) => ({ name: m[1]!, variable: m[2]! }));
const TEXT_STYLES = [...tailwindBridge.matchAll(TEXT_LINE)].map((m) => m[1]!).filter((name) => !name.includes("--"));

const GROUPS: { title: string; blurb: string; test: (name: string) => boolean }[] = [
  { title: "Surfaces", blurb: "Page, cards, wells and overlays. Use with bg-*.", test: (n) => /^(canvas|surface|sunken|muted|strong|scrim)/.test(n) },
  { title: "Text and icons", blurb: "Use with text-*. Secondary text meets 4.5:1 on surfaces.", test: (n) => /^(fg|on-action|icon)/.test(n) },
  { title: "Borders and focus", blurb: "Use with border-* and outline-*.", test: (n) => /^(line|separator|focus)/.test(n) },
  { title: "Status", blurb: "Success, danger and info: tinted backgrounds, foregrounds, solids and text.", test: (n) => n.startsWith("status-") },
  { title: "Tags", blurb: "Category pills: each pairs a background with its foreground.", test: (n) => n.startsWith("tag-") },
  { title: "Accent", blurb: "The one ramp exposed directly, for interactive emphasis. Follows the brand.", test: (n) => n.startsWith("accent-") },
  { title: "Charts", blurb: "Categorical series 1–9 with hover shades, plus track, cursor and neutral.", test: (n) => n.startsWith("chart-") },
];

const grouped = GROUPS.map((g) => ({ ...g, tokens: COLORS.filter((c) => g.test(c.name)) }));
const componentTokens = COLORS.filter((c) => !GROUPS.some((g) => g.test(c.name)));

/** Primitive ramps, e.g. blue → [50…950]. */
const RAMPS = Object.keys(lightTokens).reduce<Record<string, string[]>>((acc, key) => {
  const m = /^ds-color-([a-z]+)-(\d+)$/.exec(key);
  if (m && m[1] !== "accent") (acc[m[1]!] ??= []).push(m[2]!);
  return acc;
}, {});

/* -------------------------------------------------------------------------- */
/*                               Live CSS values                              */
/* -------------------------------------------------------------------------- */

/** Re-renders when the theme changes, so computed values stay current. */
function useThemeVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", bump);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", bump);
    };
  }, []);
  return version;
}

const readVar = (variable: string) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

/** oklch(…) is exact but unfamiliar; show it short. */
const shortValue = (value: string) => value.replace(/oklch\(([\d.]+)%? ([\d.]+) ([\d.a-z]+)\)/, (_, l, c, h) => `oklch(${Number(l).toFixed(1)} ${Number(c).toFixed(3)} ${h})`);

/* -------------------------------------------------------------------------- */
/*                                    Color                                   */
/* -------------------------------------------------------------------------- */

function Swatch({ token, version }: { token: ColorToken; version: number }) {
  const value = useMemo(() => readVar(token.variable), [token.variable, version]);
  return (
    <li className="flex items-center gap-3 rounded-xl p-1.5">
      <span
        aria-hidden
        className="size-10 shrink-0 rounded-lg shadow-hairline ring-1 ring-line ring-inset"
        style={{ background: `var(${token.variable})` }}
      />
      <span className="flex min-w-0 flex-col">
        <code className="truncate font-mono text-body-sm-strong text-fg">{token.name}</code>
        <span className="truncate font-mono text-caption text-fg-secondary">{shortValue(value) || token.variable}</span>
      </span>
    </li>
  );
}

export function ColorFoundation() {
  const version = useThemeVersion();
  const [showComponent, setShowComponent] = useState(false);

  return (
    <div className="flex w-full flex-col gap-10 text-start">
      <p className="max-w-prose text-body-md text-fg-secondary">
        Components use semantic names, never raw colours: <code className="font-mono text-fg">bg-surface</code>,{" "}
        <code className="font-mono text-fg">text-fg-secondary</code>, <code className="font-mono text-fg">border-line</code>. Each name maps to a{" "}
        <code className="font-mono text-fg">--ds-*</code> variable that the light and dark themes remap, so switch the theme above and every value below
        changes with it.
      </p>

      {grouped.map((group) => (
        <section key={group.title} aria-labelledby={`color-${group.title}`} className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id={`color-${group.title}`} className="text-headline-emphasis text-fg">
              {group.title} <span className="text-body-sm text-fg-secondary tabular-nums">{group.tokens.length}</span>
            </h2>
            <p className="text-body-sm text-fg-secondary">{group.blurb}</p>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {group.tokens.map((token) => (
              <Swatch key={token.name} token={token} version={version} />
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="color-component" className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="color-component" className="text-headline-emphasis text-fg">
              Component tokens <span className="text-body-sm text-fg-secondary tabular-nums">{componentTokens.length}</span>
            </h2>
            <p className="text-body-sm text-fg-secondary">Used by one component each (switch, kbd, avatar…). Don't reach for these elsewhere.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowComponent((s) => !s)}
            aria-expanded={showComponent}
            className={cx("shrink-0 rounded-full px-3 py-1 text-body-sm-strong text-fg-secondary transition-colors hover:bg-surface-hover", focusRingNative)}
          >
            {showComponent ? "Hide" : "Show"}
          </button>
        </div>
        {showComponent && (
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {componentTokens.map((token) => (
              <Swatch key={token.name} token={token} version={version} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="color-primitives" className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="color-primitives" className="text-headline-emphasis text-fg">
            Primitive ramps
          </h2>
          <p className="text-body-sm text-fg-secondary">The raw scales semantic tokens point at. Components never use these directly.</p>
        </div>
        <div className="flex flex-col gap-1.5 overflow-x-auto pb-1">
          {Object.entries(RAMPS).map(([hue, steps]) => (
            <div key={hue} className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-mono text-caption text-fg-secondary">{hue}</span>
              <div className="flex flex-1 overflow-hidden rounded-lg">
                {steps.map((step) => (
                  <span
                    key={step}
                    title={`${hue}-${step}`}
                    className="h-7 min-w-7 flex-1"
                    style={{ background: `var(--ds-color-${hue}-${step})` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const PREVIEW_ROWS = [
  ["--ds-color-accent-300", "--ds-color-accent-400", "--ds-color-accent-500", "--ds-color-accent-600", "--ds-color-accent-700"],
  ["--ds-color-chart-1", "--ds-color-chart-2", "--ds-color-chart-3", "--ds-color-chart-4", "--ds-color-chart-5"],
  ["--ds-color-bg-canvas", "--ds-color-bg-sunken", "--ds-color-bg-surface", "--ds-color-bg-muted", "--ds-color-bg-strong"],
];

export function ColorPreview() {
  return (
    <div className="flex flex-col gap-2">
      {PREVIEW_ROWS.map((row, r) => (
        <div key={r} className={cx("flex gap-2", r === 1 && "translate-x-4")}>
          {row.map((v) => (
            <span key={v} className="size-9 rounded-full shadow-hairline ring-1 ring-line ring-inset" style={{ background: `var(${v})` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Typography                                 */
/* -------------------------------------------------------------------------- */

const styleOf = (name: string) => ({
  fontSize: `var(--ds-text-${name}-size)`,
  lineHeight: `var(--ds-text-${name}-line-height)`,
  fontWeight: `var(--ds-text-${name}-weight)`,
  letterSpacing: `var(--ds-text-${name}-tracking)`,
});

const SPECIMEN: Record<string, string> = {
  "display-sm": "$48,213",
  "title-lg-strong": "Quarterly revenue",
  "title-md-strong": "Workspace settings",
};

function TypeRow({ name, version }: { name: string; version: number }) {
  const values = useMemo(
    () => ({
      size: readVar(`--ds-text-${name}-size`),
      lineHeight: readVar(`--ds-text-${name}-line-height`),
      weight: readVar(`--ds-text-${name}-weight`),
    }),
    [name, version],
  );
  const toPx = (v: string) => (v.endsWith("rem") ? `${Math.round(parseFloat(v) * 16)}px` : v);
  return (
    <li className="grid items-baseline gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[12rem_1fr]">
      <div className="flex flex-col">
        <code className="font-mono text-body-sm-strong text-fg">text-{name}</code>
        <span className="font-mono text-caption text-fg-secondary tabular-nums">
          {toPx(values.size)} / {toPx(values.lineHeight)} · {values.weight}
        </span>
      </div>
      <p className="truncate text-fg" style={styleOf(name)}>
        {SPECIMEN[name] ?? "The quick brown fox jumps over the lazy dog"}
      </p>
    </li>
  );
}

export function TypographyFoundation() {
  const version = useThemeVersion();
  // Largest first, so the page reads as a scale.
  const ordered = useMemo(
    () => [...TEXT_STYLES].sort((a, b) => parseFloat(readVar(`--ds-text-${b}-size`)) - parseFloat(readVar(`--ds-text-${a}-size`))),
    [],
  );

  return (
    <div className="flex w-full flex-col gap-10 text-start">
      <p className="max-w-prose text-body-md text-fg-secondary">
        Text is set with named styles that bundle size, line height, weight and tracking: <code className="font-mono text-fg">text-body-md</code>, not{" "}
        <code className="font-mono text-fg">text-sm font-medium</code>. Each style reads its values from{" "}
        <code className="font-mono text-fg">--ds-text-*</code> tokens.
      </p>

      <section aria-labelledby="type-families" className="grid gap-4 sm:grid-cols-2">
        <h2 id="type-families" className="sr-only">
          Families
        </h2>
        {[
          { label: "Sans", utility: "font-sans", variable: "--ds-font-family-sans", sample: "Aa Bb Cc 0123" },
          { label: "Mono", utility: "font-mono", variable: "--ds-font-family-mono", sample: "{ x: 0x1F }" },
        ].map((family) => (
          <div key={family.label} className="flex flex-col gap-3 rounded-2xl bg-sunken p-5">
            <span className="text-body-sm-strong text-fg-secondary">
              {family.label} · <code className="font-mono">{family.utility}</code>
            </span>
            <span className="text-display-sm text-fg" style={{ fontFamily: `var(${family.variable})` }}>
              {family.sample}
            </span>
            <span className="truncate font-mono text-caption text-fg-secondary">{readVar(family.variable).split(",")[0]}</span>
          </div>
        ))}
      </section>

      <section aria-labelledby="type-styles" className="flex flex-col">
        <h2 id="type-styles" className="text-headline-emphasis text-fg">
          Text styles <span className="text-body-sm text-fg-secondary tabular-nums">{TEXT_STYLES.length}</span>
        </h2>
        <ul>
          {ordered.map((name) => (
            <TypeRow key={name} name={name} version={version} />
          ))}
        </ul>
      </section>
    </div>
  );
}

export function TypographyPreview() {
  return (
    <div className="flex w-full flex-col gap-1 ps-4">
      <span className="text-display-sm text-fg">Display</span>
      <span className="text-title-md-strong text-fg">Title</span>
      <span className="text-headline-emphasis text-fg-secondary">Headline</span>
      <span className="text-body-md text-fg-secondary">Body regular</span>
      <span className="font-mono text-caption text-fg-secondary">Mono caption</span>
    </div>
  );
}
