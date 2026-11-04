"use client";

import { useState, type ReactNode } from "react";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { Menu, MenuItem, MenuTrigger } from "../../components/menu/menu";
import { Tooltip, TooltipTrigger } from "../../components/tooltip/tooltip";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * App sidebar: an app's main navigation, in labelled sections with one level
 * of nesting, that collapses to an icon rail.
 *
 * Expanded, a parent row opens its children in place, and the branch holding
 * the current page starts open. On the rail there's no room for labels, so
 * leaf rows name themselves in a tooltip and parent rows open their children
 * in a menu. The rail keeps every destination one press away.
 *
 * The block owns only its open and collapsed state. The current page is yours:
 * pass `selected` and handle `onSelect` (or give rows an `href`).
 */

export interface AppSidebarItem {
  id: string;
  label: string;
  icon?: IconComponent;
  /** A link. Leave it out and the row calls `onSelect` instead. */
  href?: string;
  badge?: ReactNode;
  /** Child rows, one level deep. */
  items?: AppSidebarItem[];
}

export interface AppSidebarSection {
  id: string;
  /** Heading above the rows. Hidden on the rail. */
  label?: string;
  items: AppSidebarItem[];
}

export interface AppSidebarProps {
  sections: AppSidebarSection[];
  /** The id of the current page. */
  selected?: string;
  onSelect?: (id: string) => void;
  /** Top slot, e.g. a logo. */
  header?: ReactNode | ((state: { collapsed: boolean }) => ReactNode);
  /** Bottom slot, e.g. the signed-in user. */
  footer?: ReactNode | ((state: { collapsed: boolean }) => ReactNode);
  /** Controlled rail state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  "aria-label"?: string;
  className?: string;
}

const ROW = "flex h-10 min-w-0 cursor-pointer items-center gap-3 rounded-item px-2.5 text-body-md outline-none transition-colors";
const rowState = (current: boolean) =>
  cx(
    current ? "bg-action-tertiary text-action-tertiary-fg" : "text-fg-secondary data-[hovered]:bg-surface-hover data-[hovered]:text-fg",
    focusRing,
  );

const inBranch = (item: AppSidebarItem, id?: string) => item.items?.some((child) => child.id === id) ?? false;

function RowContent({ item, collapsed, open }: { item: AppSidebarItem; collapsed: boolean; open?: boolean }) {
  const Icon = item.icon;
  return (
    <>
      {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
          {item.badge !== undefined && <span className="shrink-0 text-caption tabular-nums text-fg-secondary">{item.badge}</span>}
          {open !== undefined && <RiArrowDownSLine aria-hidden className={cx("size-4 shrink-0 transition-transform duration-(--ds-motion-duration-base) motion-reduce:transition-none", open && "rotate-180")} />}
        </>
      )}
    </>
  );
}

/** A destination row: a link with an `href`, otherwise a button. */
function LeafRow({ item, current, collapsed, onSelect, className }: { item: AppSidebarItem; current: boolean; collapsed: boolean; onSelect?: (id: string) => void; className?: string }) {
  const shared = {
    "aria-current": current ? ("page" as const) : undefined,
    "aria-label": collapsed ? item.label : undefined,
    onPress: () => onSelect?.(item.id),
    className: cx(ROW, rowState(current), collapsed && "justify-center px-0", className),
  };
  return item.href ? (
    <AriaLink {...shared} href={item.href}>
      <RowContent item={item} collapsed={collapsed} />
    </AriaLink>
  ) : (
    <AriaButton {...shared}>
      <RowContent item={item} collapsed={collapsed} />
    </AriaButton>
  );
}

function SidebarRow({ item, selected, collapsed, onSelect }: { item: AppSidebarItem; selected?: string; collapsed: boolean; onSelect?: (id: string) => void }) {
  const branchCurrent = inBranch(item, selected);
  const [open, setOpen] = useState(branchCurrent);

  if (!item.items?.length) {
    const row = <LeafRow item={item} current={item.id === selected} collapsed={collapsed} onSelect={onSelect} />;
    if (!collapsed) return row;
    return (
      <TooltipTrigger>
        {row}
        <Tooltip placement="end">{item.label}</Tooltip>
      </TooltipTrigger>
    );
  }

  if (collapsed) {
    return (
      <MenuTrigger>
        <AriaButton aria-label={item.label} className={cx(ROW, rowState(branchCurrent), "justify-center px-0")}>
          <RowContent item={item} collapsed />
        </AriaButton>
        <Menu aria-label={item.label} placement="end top" onAction={(key) => onSelect?.(String(key))}>
          {item.items.map((child) => (
            <MenuItem key={child.id} id={child.id} href={child.href}>
              {child.label}
            </MenuItem>
          ))}
        </Menu>
      </MenuTrigger>
    );
  }

  return (
    <>
      <AriaButton aria-expanded={open} onPress={() => setOpen((value) => !value)} className={cx(ROW, rowState(branchCurrent && !open), "w-full")}>
        <RowContent item={item} collapsed={false} open={open} />
      </AriaButton>
      {open && (
        <ul className="ms-5 flex flex-col gap-0.5 border-s border-line ps-2 pt-0.5">
          {item.items.map((child) => (
            <li key={child.id}>
              <LeafRow item={child} current={child.id === selected} collapsed={false} onSelect={onSelect} className="h-9 text-body-sm" />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function AppSidebar({
  sections,
  selected,
  onSelect,
  header,
  footer,
  collapsed: controlled,
  defaultCollapsed = false,
  onCollapsedChange,
  "aria-label": ariaLabel = "Main",
  className,
}: AppSidebarProps) {
  const [own, setOwn] = useState(defaultCollapsed);
  const collapsed = controlled ?? own;
  const toggle = () => {
    setOwn(!collapsed);
    onCollapsedChange?.(!collapsed);
  };
  const slot = (content: AppSidebarProps["header"]) => (typeof content === "function" ? content({ collapsed }) : content);
  const Chevron = collapsed ? RiArrowRightSLine : RiArrowLeftSLine;

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cx(
        "flex h-full shrink-0 flex-col gap-3 rounded-panel bg-surface p-3 shadow-raised",
        "transition-[width] duration-(--ds-motion-duration-slow) ease-standard motion-reduce:transition-none",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className={cx("flex min-h-9 items-center gap-2", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <div className="min-w-0 flex-1">{slot(header)}</div>}
        <AriaButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onPress={toggle}
          className={cx("flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control-sm text-icon-secondary transition-colors data-[hovered]:bg-surface-hover data-[hovered]:text-fg", focusRing)}
        >
          <Chevron aria-hidden className="size-5 rtl:-scale-x-100" />
        </AriaButton>
      </div>

      <nav aria-label={ariaLabel} className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="flex flex-col gap-0.5">
            {section.label && !collapsed && <p className="px-2.5 pb-1 text-caption text-fg-tertiary">{section.label}</p>}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-0.5">
                  <SidebarRow item={item} selected={selected} collapsed={collapsed} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer !== undefined && <div className="border-t border-line pt-3">{slot(footer)}</div>}
    </aside>
  );
}
