"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { cx } from "../utils/cx";

/**
 * Theming. Themes are token remaps keyed off `data-theme` (see tokens), so
 * switching is one attribute; this keeps that attribute, the visitor's
 * choice and the OS preference in sync.
 *
 * `ThemeProvider` owns the choice for the page: "light", "dark" or "system"
 * (follow the OS). It writes `data-theme` on <html> (or removes it for
 * "system"), remembers the choice in localStorage, and exposes it through
 * `useTheme()`, along with the theme actually showing.
 *
 * It also owns the accent: one `--ds-color-accent-50…950` ramp that every
 * interactive mark reads (checked controls, switches, sliders, focus rings,
 * selections, the primary button in dark mode). Pick a preset, or any colour,
 * with `setAccent`; status and chart colours deliberately stay put.
 *
 * Changes to either can animate: pass the point they came from (a click) and
 * the new look spreads out from it in a circle. Without the View Transitions
 * API, or with reduced motion, they apply at once.
 *
 * And it owns the brand: a whole visual language (colour, type, shape and
 * elevation) that sits across light and dark. Windesign is the default; set
 * "moon" with `setBrand` and every component restyles through its tokens.
 *
 * `ThemeScope` pins one region to a theme or a brand (a dark hero on a light
 * page, a Moon preview on a Windesign page).
 *
 * To avoid a flash of the wrong theme or accent, apply both from storage in
 * a tiny inline script in <head>; see the playground's index.html.
 */

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/* -------------------------------------------------------------------------- */
/*                                   Brand                                    */
/* -------------------------------------------------------------------------- */

export type Brand = "windesign" | "moon" | "glass";

export const DEFAULT_BRAND: Brand = "windesign";

/** The brands, with the accent each one ships with. */
export const BRANDS: { id: Brand; label: string; accentLabel: string; accentColor: string }[] = [
  { id: "windesign", label: "Windesign", accentLabel: "Lagoon", accentColor: "var(--ds-color-lagoon-600)" },
  { id: "moon", label: "Moon", accentLabel: "Piccolo", accentColor: "var(--ds-color-piccolo-600)" },
  { id: "glass", label: "Glass", accentLabel: "Blue", accentColor: "var(--ds-color-azure-600)" },
];

function isBrand(value: string | null): value is Brand {
  return BRANDS.some((brand) => brand.id === value);
}

/** Sets `data-brand` on <html>, or removes it for the default brand. */
export function applyBrand(brand: Brand, root: HTMLElement = document.documentElement) {
  if (brand === DEFAULT_BRAND) delete root.dataset.brand;
  else root.dataset.brand = brand;
}

/* -------------------------------------------------------------------------- */
/*                                   Accent                                   */
/* -------------------------------------------------------------------------- */

export interface AccentPreset {
  id: string;
  label: string;
  /** The primitive ramp it maps onto, e.g. "blue". */
  hue: string;
  /**
   * Steps to darken by (0 or 100), so text on the 600 stop stays readable.
   * Every preset is checked for 4.5:1 button text and 3:1 marks and rings in
   * both themes.
   */
  shift: 0 | 100;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "lagoon", label: "Lagoon", hue: "lagoon", shift: 0 },
  // Windesign's accent before Tonal teal: kept, so a stored choice still resolves.
  { id: "terracotta", label: "Terracotta", hue: "terracotta", shift: 0 },
  { id: "red", label: "Red", hue: "red", shift: 0 },
  { id: "orange", label: "Orange", hue: "orange", shift: 100 },
  { id: "emerald", label: "Emerald", hue: "emerald", shift: 100 },
  { id: "teal", label: "Teal", hue: "teal", shift: 100 },
  { id: "blue", label: "Blue", hue: "blue", shift: 0 },
  { id: "purple", label: "Purple", hue: "purple", shift: 0 },
  { id: "fuchsia", label: "Fuchsia", hue: "fuchsia", shift: 0 },
];

/** A preset id, or any CSS colour (e.g. "#2f6f4f") for a custom accent. */
export type AccentChoice = string;

export const DEFAULT_ACCENT = "lagoon";

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// A custom colour lands on 600 (buttons, marks); lighter stops mix towards white, darker towards black.
const CUSTOM_MIX: Record<(typeof STOPS)[number], string> = {
  50: "white 92%",
  100: "white 84%",
  200: "white 68%",
  300: "white 50%",
  400: "white 32%",
  500: "white 16%",
  600: "",
  700: "black 16%",
  800: "black 32%",
  900: "black 48%",
  950: "black 62%",
};

/** The accent variables for a choice; `null` for the default ramp from the tokens. */
export function accentVariables(choice: AccentChoice): Record<string, string> | null {
  if (choice === DEFAULT_ACCENT) return null;
  const preset = ACCENT_PRESETS.find((p) => p.id === choice);
  const vars: Record<string, string> = {};
  for (const stop of STOPS) {
    vars[`--ds-color-accent-${stop}`] = preset
      ? `var(--ds-color-${preset.hue}-${Math.min(950, stop + preset.shift)})`
      : CUSTOM_MIX[stop]
        ? `color-mix(in oklab, ${choice}, ${CUSTOM_MIX[stop]})`
        : choice;
  }
  return vars;
}

/** Writes the accent onto <html> (or clears it back to the default). */
export function applyAccent(choice: AccentChoice, root: HTMLElement = document.documentElement) {
  const vars = accentVariables(choice);
  for (const stop of STOPS) {
    const name = `--ds-color-accent-${stop}`;
    if (vars) root.style.setProperty(name, vars[name]!);
    else root.style.removeProperty(name);
  }
}

/** WCAG contrast of a hex colour against near-white text, to warn about unreadable custom accents. */
export function contrastWithWhite(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 21;
  const channel = (i: number) => {
    const c = parseInt(m[1]!.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return 1.05 / (lum + 0.05);
}

/* -------------------------------------------------------------------------- */
/*                                 Transition                                 */
/* -------------------------------------------------------------------------- */

export interface TransitionOrigin {
  x: number;
  y: number;
}

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { ready?: Promise<void>; finished: Promise<void> } };

/**
 * Runs `update` (which must change the page synchronously) inside a view
 * transition that reveals the new look as a circle growing from `origin`.
 * Falls back to an instant change without the API or with reduced motion.
 */
export function startThemeTransition(update: () => void, origin?: TransitionOrigin) {
  const doc = document as ViewTransitionDocument;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) {
    update();
    return;
  }
  const root = document.documentElement;
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty("--ds-reveal-x", `${x}px`);
  root.style.setProperty("--ds-reveal-y", `${y}px`);
  root.style.setProperty("--ds-reveal-r", `${radius}px`);
  root.dataset.themeTransition = "";
  const transition = doc.startViewTransition(update);
  const clear = () => delete root.dataset.themeTransition;
  // The browser drops the animation if the tab is hidden or the window resizes
  // part-way through. The change itself still applied, so that isn't an error.
  transition.ready?.catch(() => {});
  transition.finished.then(clear, clear);
}

/* -------------------------------------------------------------------------- */
/*                                  Provider                                  */
/* -------------------------------------------------------------------------- */

interface ThemeContextValue {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  /** Pass `origin` (e.g. the click point) to animate the change from there. */
  setTheme: (theme: ThemeChoice, origin?: TransitionOrigin) => void;
  accent: AccentChoice;
  setAccent: (accent: AccentChoice, origin?: TransitionOrigin) => void;
  brand: Brand;
  /** Pass `origin` to spread the new brand out from that point. */
  setBrand: (brand: Brand, origin?: TransitionOrigin) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readStored(key: string): ThemeChoice | null {
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" || value === "system" ? value : null;
  } catch {
    return null;
  }
}

function readStoredAccent(key: string): AccentChoice | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readStoredBrand(key: string): Brand | null {
  try {
    const value = localStorage.getItem(key);
    return isBrand(value) ? value : null;
  } catch {
    return null;
  }
}

function store(key: string | null, value: string | null) {
  if (!key) return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
}

function useSystemTheme(): ResolvedTheme {
  const [dark, setDark] = useState(() => typeof window !== "undefined" && window.matchMedia?.(DARK_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia?.(DARK_QUERY);
    if (!query) return;
    const onChange = () => setDark(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return dark ? "dark" : "light";
}

function applyThemeAttribute(theme: ThemeChoice, resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  // Lets the browser draw scrollbars and form controls to match.
  root.style.colorScheme = resolved;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Used when nothing is stored. Default "system". */
  defaultTheme?: ThemeChoice;
  /** localStorage key. Pass `null` to not persist. Default "ds-theme". */
  storageKey?: string | null;
  /** Controlled choice. */
  theme?: ThemeChoice;
  onThemeChange?: (theme: ThemeChoice) => void;
  /** Used when nothing is stored. Default "lagoon". */
  defaultAccent?: AccentChoice;
  /** localStorage key for the accent. Pass `null` to not persist. Default "ds-accent". */
  accentStorageKey?: string | null;
  onAccentChange?: (accent: AccentChoice) => void;
  /** Used when nothing is stored. Default "windesign". */
  defaultBrand?: Brand;
  /** localStorage key for the brand. Pass `null` to not persist. Default "ds-brand". */
  brandStorageKey?: string | null;
  onBrandChange?: (brand: Brand) => void;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ds-theme",
  theme: controlled,
  onThemeChange,
  defaultAccent = DEFAULT_ACCENT,
  accentStorageKey = "ds-accent",
  onAccentChange,
  defaultBrand = DEFAULT_BRAND,
  brandStorageKey = "ds-brand",
  onBrandChange,
}: ThemeProviderProps) {
  const [uncontrolled, setUncontrolled] = useState<ThemeChoice>(() => (storageKey && readStored(storageKey)) || defaultTheme);
  const theme = controlled ?? uncontrolled;
  const system = useSystemTheme();
  const resolvedTheme = theme === "system" ? system : theme;
  const [accent, setAccentState] = useState<AccentChoice>(() => (accentStorageKey && readStoredAccent(accentStorageKey)) || defaultAccent);
  const [brand, setBrandState] = useState<Brand>(() => (brandStorageKey && readStoredBrand(brandStorageKey)) || defaultBrand);

  useEffect(() => {
    applyThemeAttribute(theme, resolvedTheme);
    store(storageKey, theme === "system" ? null : theme);
  }, [theme, resolvedTheme, storageKey]);

  useEffect(() => {
    applyAccent(accent);
    store(accentStorageKey, accent === DEFAULT_ACCENT ? null : accent);
  }, [accent, accentStorageKey]);

  useEffect(() => {
    applyBrand(brand);
    store(brandStorageKey, brand === DEFAULT_BRAND ? null : brand);
  }, [brand, brandStorageKey]);

  const setTheme = useCallback(
    (next: ThemeChoice, origin?: TransitionOrigin) => {
      const update = () => {
        // Write the attribute now, so the transition captures the new look.
        applyThemeAttribute(next, next === "system" ? system : next);
        flushSync(() => setUncontrolled(next));
      };
      if (origin) startThemeTransition(update, origin);
      else setUncontrolled(next);
      onThemeChange?.(next);
    },
    [onThemeChange, system],
  );

  const setAccent = useCallback(
    (next: AccentChoice, origin?: TransitionOrigin) => {
      const update = () => {
        applyAccent(next);
        flushSync(() => setAccentState(next));
      };
      if (origin) startThemeTransition(update, origin);
      else update();
      onAccentChange?.(next);
    },
    [onAccentChange],
  );

  const setBrand = useCallback(
    (next: Brand, origin?: TransitionOrigin) => {
      const update = () => {
        applyBrand(next);
        flushSync(() => setBrandState(next));
      };
      if (origin) startThemeTransition(update, origin);
      else update();
      onBrandChange?.(next);
    },
    [onBrandChange],
  );

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, accent, setAccent, brand, setBrand }),
    [theme, resolvedTheme, setTheme, accent, setAccent, brand, setBrand],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The current choice, the theme actually showing, the accent, the brand, and setters. Must be inside ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider");
  return context;
}

export interface ThemeScopeProps extends HTMLAttributes<HTMLDivElement> {
  /** Pin the region to this theme. Leave it out to follow the page. */
  theme?: ResolvedTheme;
  /** Pin the region to this brand. Leave it out to follow the page. */
  brand?: Brand;
}

/** Pins a region to a theme or brand, repainting its canvas, text and type from those tokens. */
export function ThemeScope({ theme, brand, className, ...props }: ThemeScopeProps) {
  return (
    <div
      {...props}
      data-theme={theme}
      data-brand={brand}
      style={{ colorScheme: theme, ...props.style }}
      className={cx("bg-canvas font-sans text-fg", className)}
    />
  );
}
