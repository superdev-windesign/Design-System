"use client";

import { useId, useState, type ReactNode } from "react";
import { RiArrowRightSLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * SideNavigation: the vertical menu of an app or a docs site, in titled
 * sections, with groups that open to show nested pages. The current page is
 * set in ink with a terracotta rule and `aria-current="page"`, and the group
 * holding it starts open.
 *
 * It's plain navigation (links and disclosure buttons in lists), so Tab moves
 * through it in reading order and screen readers announce the structure.
 */

export interface SideNavItem {
  id: string;
  label: string;
  /** Leaf items are links. Items with `items` are groups that open and close. */
  href?: string;
  icon?: IconComponent;
  /** A count or short label at the end of the row. */
  badge?: ReactNode;
  items?: SideNavItem[];
}

export interface SideNavSection {
  title?: string;
  items: SideNavItem[];
}

export interface SideNavigationProps {
  "aria-label": string;
  sections: SideNavSection[];
  /** The id of the current page. */
  currentId?: string;
  /** Called when a link is followed, e.g. to close a mobile drawer. */
  onNavigate?: (id: string) => void;
  className?: string;
}

const contains = (item: SideNavItem, id?: string): boolean => !!id && (item.id === id || !!item.items?.some((child) => contains(child, id)));

const ROW = cx(
  "relative flex w-full items-center gap-2.5 rounded-control-md px-2.5 py-1.75 text-start text-body-md",
  "transition-colors duration-(--ds-motion-duration-fast)",
  focusRingNative,
);

function NavRow({ item, depth, currentId, onNavigate }: { item: SideNavItem; depth: number; currentId?: string; onNavigate?: (id: string) => void }) {
  const childrenId = useId();
  const [open, setOpen] = useState(() => contains(item, currentId) && item.id !== currentId);
  const Icon = item.icon;
  const current = item.id === currentId;
  const indent = depth > 0 ? { paddingInlineStart: `calc(0.625rem + ${depth} * 1.25rem)` } : undefined;
  const body = (
    <>
      {Icon && <Icon aria-hidden className={cx("size-4 shrink-0", current ? "text-accent-600" : "text-icon-secondary")} />}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge != null && <span className="shrink-0 rounded-chip bg-muted px-1.5 font-mono text-caption tabular-nums text-fg-secondary">{item.badge}</span>}
    </>
  );

  if (item.items?.length) {
    const holdsCurrent = contains(item, currentId);
    return (
      <li>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={childrenId}
          onClick={() => setOpen((o) => !o)}
          style={indent}
          className={cx(ROW, "cursor-pointer text-fg-secondary hover:bg-surface-hover hover:text-fg", holdsCurrent && !open && "text-fg")}
        >
          {body}
          <RiArrowRightSLine aria-hidden className={cx("size-4 shrink-0 text-icon-tertiary transition-transform duration-(--ds-motion-duration-moderate) rtl:-scale-x-100", open && "rotate-90 rtl:-rotate-90")} />
        </button>
        <ul id={childrenId} hidden={!open} className="mt-0.5 flex flex-col gap-0.5">
          {item.items.map((child) => (
            <NavRow key={child.id} item={child} depth={depth + 1} currentId={currentId} onNavigate={onNavigate} />
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li>
      <a
        href={item.href ?? "#"}
        aria-current={current ? "page" : undefined}
        onClick={() => onNavigate?.(item.id)}
        style={indent}
        className={cx(ROW, current ? "bg-sunken text-body-md-strong text-fg" : "text-fg-secondary hover:bg-surface-hover hover:text-fg")}
      >
        {current && <span aria-hidden className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent-600" />}
        {body}
      </a>
    </li>
  );
}

export function SideNavigation({ "aria-label": ariaLabel, sections, currentId, onNavigate, className }: SideNavigationProps) {
  const id = useId();
  return (
    <nav aria-label={ariaLabel} className={cx("flex w-full flex-col gap-5", className)}>
      {sections.map((section, i) => {
        const headingId = `${id}-section-${i}`;
        return (
          <div key={section.title ?? i} className="flex flex-col gap-1">
            {section.title && (
              <h2 id={headingId} className="px-2.5 font-mono text-caption tracking-wide text-fg-secondary uppercase">
                {section.title}
              </h2>
            )}
            <ul aria-labelledby={section.title ? headingId : undefined} className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavRow key={item.id} item={item} depth={0} currentId={currentId} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
