"use client";

import type { ComponentType } from "react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * BottomNavigation: the tab bar along the bottom of a phone screen, for an
 * app's three to five top-level destinations. The current one is set in ink
 * with a terracotta rule above it and `aria-current="page"`; counts appear
 * as small badges and are read out ("Inbox, 3 new").
 *
 * Items with `href` are links; without one they're buttons that call
 * `onNavigate`. `fixed` pins the bar to the viewport and pads it for the
 * home indicator.
 */

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

export interface BottomNavigationItem {
  id: string;
  label: string;
  icon: Icon;
  /** A filled icon for the current item. */
  activeIcon?: Icon;
  href?: string;
  badge?: number;
}

export interface BottomNavigationProps {
  "aria-label": string;
  items: BottomNavigationItem[];
  currentId: string;
  onNavigate?: (id: string) => void;
  /** Pin to the bottom of the viewport. Default false. */
  fixed?: boolean;
  className?: string;
}

export function BottomNavigation({ "aria-label": ariaLabel, items, currentId, onNavigate, fixed = false, className }: BottomNavigationProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cx("border-t border-line bg-surface", fixed && "fixed inset-x-0 bottom-0 z-40", className)}
      style={fixed ? { paddingBottom: "env(safe-area-inset-bottom)" } : undefined}
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const current = item.id === currentId;
          const Glyph = current && item.activeIcon ? item.activeIcon : item.icon;
          const content = (
            <>
              <span aria-hidden className={cx("absolute inset-x-1/4 top-0 h-0.5 rounded-full bg-accent-600 transition-opacity duration-(--ds-motion-duration-base)", current ? "opacity-100" : "opacity-0")} />
              <span className="relative">
                <Glyph aria-hidden className="size-5.5" />
                {item.badge ? (
                  <span aria-hidden className="absolute -end-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 font-mono text-micro-emphasis tabular-nums text-on-action ring-2 ring-surface">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className={current ? "text-caption-strong" : "text-caption"}>
                {item.label}
                {item.badge ? <span className="sr-only">, {item.badge} new</span> : null}
              </span>
            </>
          );
          const classes = cx(
            "relative flex h-16 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xs transition-colors duration-(--ds-motion-duration-fast)",
            current ? "text-fg" : "text-fg-secondary hover:text-fg",
            focusRingNative,
            "focus-visible:-outline-offset-2",
          );
          return (
            <li key={item.id} className="flex">
              {item.href ? (
                <a href={item.href} aria-current={current ? "page" : undefined} onClick={() => onNavigate?.(item.id)} className={classes}>
                  {content}
                </a>
              ) : (
                <button type="button" aria-current={current ? "page" : undefined} onClick={() => onNavigate?.(item.id)} className={classes}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
