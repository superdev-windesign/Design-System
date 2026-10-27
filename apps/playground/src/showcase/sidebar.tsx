import { useEffect, useId, useMemo, useState } from "react";
import type { ComponentType, Ref } from "react";
import { Badge, Input, Kbd, cx, focusRingNative } from "@ds/react";
import { RiArrowRightSLine, RiFlaskLine, RiLayoutGridLine, RiSearchLine } from "@remixicon/react";
import { CATALOG, GROUPS } from "./catalog";

interface NavItem {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  isNew?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    id: "start",
    title: "Getting started",
    items: [
      { label: "All components", href: "#/components", icon: RiLayoutGridLine },
      { label: "Parity lab", href: "#/parity", icon: RiFlaskLine },
    ],
  },
  ...GROUPS.map((group) => ({
    id: group.name,
    title: group.name,
    items: CATALOG.filter((entry) => entry.group === group.name).map((entry) => ({
      label: entry.name,
      href: `#/components/${entry.slug}`,
      isNew: entry.isNew,
    })),
  })),
];

const isActive = (item: NavItem, route: string) => {
  const target = item.href.slice(1);
  return target === "/components" ? route === "/components" || route === "/" : route === target;
};

const STORAGE_KEY = "ds-docs-sidebar";

/** Remembers which sections are open, and always opens the one holding the current page. */
function useOpenSections(route: string) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as Record<string, boolean>;
    } catch {
      return { start: true };
    }
  });

  useEffect(() => {
    const current = SECTIONS.find((section) => section.items.some((item) => isActive(item, route)));
    if (current && !open[current.id]) setOpen((prev) => ({ ...prev, [current.id]: true }));
    // Only react to navigation; manual toggles shouldn't be undone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
      // Storage can be unavailable; sections still work for this visit.
    }
  }, [open]);

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  return [open, toggle] as const;
}

const isApplePlatform = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

function ShortcutHint() {
  return <Kbd className="px-1.5">{isApplePlatform() ? "⌘K" : "Ctrl K"}</Kbd>;
}

function BrandMark() {
  return (
    <span aria-hidden className="flex size-7 items-center justify-center rounded-lg bg-linear-to-b from-accent-500 to-accent-600 text-on-action shadow-raised">
      <RiLayoutGridLine className="size-4" />
    </span>
  );
}

function NavLink({ item, route, onNavigate }: { item: NavItem; route: string; onNavigate?: () => void }) {
  const active = isActive(item, route);
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        "flex min-h-9 items-center gap-2 rounded-xl px-2 text-body-md-strong transition-colors",
        active ? "bg-muted text-fg" : "text-fg-secondary hover:bg-surface-hover hover:text-fg",
        focusRingNative,
      )}
    >
      {Icon && <Icon aria-hidden className="size-4.5 shrink-0 text-icon-secondary" />}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.isNew && (
        <Badge color="primary" className="shrink-0">
          New
        </Badge>
      )}
    </a>
  );
}

function Section({
  section,
  route,
  isOpen,
  onToggle,
  onNavigate,
}: {
  section: NavSection;
  route: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const listId = useId();
  const withIcons = section.items.some((item) => item.icon);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={onToggle}
        className={cx(
          "flex w-full cursor-pointer items-center justify-between rounded-control-sm px-2 py-1.5 text-caption-strong uppercase tracking-wide text-fg-tertiary transition-colors hover:text-fg-secondary",
          focusRingNative,
        )}
      >
        {section.title}
        <RiArrowRightSLine aria-hidden className={cx("size-4 transition-transform rtl:-scale-x-100", isOpen && "rotate-90 rtl:-rotate-90")} />
      </button>
      {isOpen && (
        <ul id={listId} className="flex flex-col">
          {section.items.map((item, index) => {
            const isLast = index === section.items.length - 1;
            return (
              <li key={item.href} className={cx("relative", withIcons ? "ps-5" : "ps-6")}>
                {/* Tree guide: a rounded elbow into each item, with the trunk continuing past all but the last. */}
                <span aria-hidden className="absolute start-2.5 top-0 h-1/2 w-2 rounded-es-md border-b border-s border-line" />
                {!isLast && <span aria-hidden className="absolute start-2.5 top-1/2 h-1/2 border-s border-line" />}
                <NavLink item={item} route={route} onNavigate={onNavigate} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export interface SidebarProps {
  route: string;
  /** Lets the app focus search from a keyboard shortcut. */
  searchRef?: Ref<HTMLInputElement>;
  /** Called after a link is chosen (closes the mobile drawer). */
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ route, searchRef, onNavigate, className }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [open, toggle] = useOpenSections(route);
  const q = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        items: q ? section.items.filter((item) => item.label.toLowerCase().includes(q)) : section.items,
      })).filter((section) => section.items.length > 0),
    [q],
  );

  return (
    <nav
      aria-label="Documentation"
      className={cx("flex h-full flex-col gap-3 rounded-panel border border-line bg-sunken p-3 shadow-raised", className)}
    >
      <a
        href="#/components"
        onClick={onNavigate}
        className={cx("flex items-center gap-2 self-start rounded-control-md px-1 py-0.5 text-headline-emphasis text-fg", focusRingNative)}
      >
        <BrandMark />
        Windesign DS
      </a>

      <Input
        ref={searchRef}
        aria-label="Search the docs"
        aria-keyshortcuts="Meta+K Control+K"
        placeholder="Quick search"
        leadingIcon={RiSearchLine}
        trailingIcon={ShortcutHint}
        value={query}
        onChange={setQuery}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
        fieldClassName="rounded-full bg-muted"
      />

      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-1">
        {sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            route={route}
            // While searching, every section with a match is shown expanded.
            isOpen={q ? true : !!open[section.id]}
            onToggle={() => toggle(section.id)}
            onNavigate={onNavigate}
          />
        ))}
        {sections.length === 0 && <p className="px-2 text-body-sm text-fg-tertiary">No pages match “{query}”.</p>}
      </div>
    </nav>
  );
}
