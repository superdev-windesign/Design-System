"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
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
 * `ThemeScope` pins one region to a theme (a dark hero on a light page).
 *
 * To avoid a flash of the wrong theme, also set `data-theme` from storage in
 * a tiny inline script in <head>; see the playground's index.html.
 */

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeChoice) => void;
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

export interface ThemeProviderProps {
  children: ReactNode;
  /** Used when nothing is stored. Default "system". */
  defaultTheme?: ThemeChoice;
  /** localStorage key. Pass `null` to not persist. Default "ds-theme". */
  storageKey?: string | null;
  /** Controlled choice. */
  theme?: ThemeChoice;
  onThemeChange?: (theme: ThemeChoice) => void;
}

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "ds-theme", theme: controlled, onThemeChange }: ThemeProviderProps) {
  const [uncontrolled, setUncontrolled] = useState<ThemeChoice>(() => (storageKey && readStored(storageKey)) || defaultTheme);
  const theme = controlled ?? uncontrolled;
  const system = useSystemTheme();
  const resolvedTheme = theme === "system" ? system : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    // Lets the browser draw scrollbars and form controls to match.
    root.style.colorScheme = resolvedTheme;
    if (!storageKey) return;
    try {
      if (theme === "system") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }, [theme, resolvedTheme, storageKey]);

  const setTheme = useCallback(
    (next: ThemeChoice) => {
      setUncontrolled(next);
      onThemeChange?.(next);
    },
    [onThemeChange],
  );

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The current choice, the theme actually showing, and a setter. Must be inside ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider");
  return context;
}

export interface ThemeScopeProps extends HTMLAttributes<HTMLDivElement> {
  theme: ResolvedTheme;
}

/** Pins a region to one theme, repainting its canvas and text from that theme's tokens. */
export function ThemeScope({ theme, className, ...props }: ThemeScopeProps) {
  return <div {...props} data-theme={theme} style={{ colorScheme: theme, ...props.style }} className={cx("bg-canvas text-fg", className)} />;
}
