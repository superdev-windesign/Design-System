"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDownSmall } from "../../icons/chevrons";
import type { IconComponent } from "../button/button";
import { easing } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { FLOATING_SURFACE } from "../../recipes/overlay";
import { cx } from "../../utils/cx";

/**
 * NavigationMenu: a site's main navigation, where some entries open a panel
 * of links (Products → Analytics, Billing, …). It follows the disclosure
 * navigation pattern rather than the ARIA menu pattern: entries are links and
 * buttons in a list, Tab moves through them in order, and a button expands
 * its panel. Escape closes the panel and returns focus to its button; so does
 * leaving the bar with the pointer or with focus.
 *
 * ```tsx
 * <NavigationMenu aria-label="Main">
 *   <NavigationMenuLink href="/" isCurrent>Home</NavigationMenuLink>
 *   <NavigationMenuItem label="Products">
 *     <NavigationMenuPanelLink href="/analytics" title="Analytics" description="…" />
 *   </NavigationMenuItem>
 * </NavigationMenu>
 * ```
 */

interface NavContext {
  openId: string | null;
  setOpenId: (id: string | null) => void;
  /** Opens after a short hover; another hover-open switches at once. */
  hoverOpen: (id: string) => void;
  cancelHover: () => void;
}

const NavigationMenuContext = createContext<NavContext | null>(null);

export interface NavigationMenuProps {
  "aria-label": string;
  children: ReactNode;
  className?: string;
}

export function NavigationMenu({ children, className, "aria-label": ariaLabel }: NavigationMenuProps) {
  const ref = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const openRef = useRef(openId);
  openRef.current = openId;

  useEffect(() => {
    if (openId === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const context: NavContext = {
    openId,
    setOpenId,
    hoverOpen: (id) => {
      clearTimeout(hoverTimer.current);
      if (openRef.current !== null) setOpenId(id);
      else hoverTimer.current = setTimeout(() => setOpenId(id), 150);
    },
    cancelHover: () => clearTimeout(hoverTimer.current),
  };

  return (
    <NavigationMenuContext.Provider value={context}>
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={className}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(() => setOpenId(null), 250);
        }}
        onPointerEnter={() => clearTimeout(hoverTimer.current)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenId(null);
        }}
      >
        {/* The list, not the nav, anchors the panels: the nav may be stretched by its parent. */}
        <ul className="relative flex flex-wrap items-center gap-0.5">{children}</ul>
      </nav>
    </NavigationMenuContext.Provider>
  );
}

const ENTRY = cx(
  "relative inline-flex h-control-md cursor-pointer items-center gap-1 rounded-control-md px-3 text-body-md-strong text-fg-secondary",
  "transition-colors duration-(--ds-motion-duration-fast) hover:bg-surface-hover hover:text-fg",
  focusRingNative,
);

export interface NavigationMenuLinkProps {
  href: string;
  children: ReactNode;
  /** Marks the link as the current page: it's underlined and gets `aria-current="page"`. */
  isCurrent?: boolean;
}

export function NavigationMenuLink({ href, children, isCurrent }: NavigationMenuLinkProps) {
  return (
    <li>
      <a href={href} aria-current={isCurrent ? "page" : undefined} className={cx(ENTRY, isCurrent && "text-fg")}>
        {children}
        {isCurrent && <span aria-hidden className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-accent-600" />}
      </a>
    </li>
  );
}

export interface NavigationMenuItemProps {
  label: ReactNode;
  /** NavigationMenuPanelLinks, or any content for the panel. */
  children: ReactNode;
  /** Optional footer strip under the links (a "See all" link, a note). */
  footer?: ReactNode;
  /** Columns of links in the panel. Default 2. */
  columns?: 1 | 2 | 3;
}

export function NavigationMenuItem({ label, children, footer, columns = 2 }: NavigationMenuItemProps) {
  const nav = useContext(NavigationMenuContext);
  if (!nav) throw new Error("NavigationMenuItem must be inside a NavigationMenu");
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOpen = nav.openId === id;
  const reduceMotion = useReducedMotion();

  return (
    <li
      onPointerEnter={(event) => event.pointerType === "mouse" && nav.hoverOpen(id)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.stopPropagation();
          nav.setOpenId(null);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          nav.cancelHover();
          nav.setOpenId(isOpen ? null : id);
        }}
        className={cx(ENTRY, isOpen && "bg-surface-hover text-fg")}
      >
        {label}
        <ChevronDownSmall aria-hidden className={cx("size-4 text-fg-secondary transition-transform duration-(--ds-motion-duration-moderate)", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: easing.enter }}
            className={cx("absolute inset-x-0 top-full z-40 mt-2 overflow-hidden sm:inset-x-auto sm:w-max sm:max-w-2xl", FLOATING_SURFACE)}
          >
            <ul className={cx("grid gap-0.5 p-2", columns === 1 ? "grid-cols-1" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>{children}</ul>
            {footer && <div className="border-t border-line bg-sunken px-4 py-3 text-body-sm text-fg-secondary">{footer}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export interface NavigationMenuPanelLinkProps {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: IconComponent;
  isCurrent?: boolean;
}

export function NavigationMenuPanelLink({ href, title, description, icon: Icon, isCurrent }: NavigationMenuPanelLinkProps) {
  const nav = useContext(NavigationMenuContext);
  return (
    <li>
      <a
        href={href}
        aria-current={isCurrent ? "page" : undefined}
        onClick={() => nav?.setOpenId(null)}
        className={cx(
          "group flex gap-3 rounded-control-md p-3 transition-colors duration-(--ds-motion-duration-fast) hover:bg-surface-hover sm:w-64",
          isCurrent && "bg-sunken",
          focusRingNative,
        )}
      >
        {Icon && (
          <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-control-md border border-line bg-surface text-icon-secondary group-hover:text-accent-600">
            <Icon className="size-4.5" />
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body-md-strong text-fg">{title}</span>
          {description && <span className="text-body-sm text-pretty text-fg-secondary">{description}</span>}
        </span>
      </a>
    </li>
  );
}
