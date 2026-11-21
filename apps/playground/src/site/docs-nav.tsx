import { useLayoutEffect, useRef } from "react";
import { SideNavigation, cx } from "@ds/react";
import type { SideNavItem, SideNavSection } from "@ds/react";
import type { Group } from "../showcase/catalog";
import { BRAND_GROUPS, COMPONENT_GROUPS, PATTERN_GROUPS, entriesIn, groupSlug, routeGroup } from "./routes";
import type { Route } from "./routes";

/**
 * The docs sidebar: the whole system as one stacked tree. Each part is a
 * titled section, each group in it opens to list its pages, and the group
 * holding the current page starts open.
 */

const OVERVIEW = (group: Group) => `section:${groupSlug(group)}`;

const entryItems = (group: Group): SideNavItem[] => entriesIn(group).map((entry) => ({ id: entry.slug, label: entry.name, href: `#/components/${entry.slug}` }));

/** A group that opens: its overview first, then each page in it. */
const groupItem = (group: Group): SideNavItem => ({
  id: `group:${groupSlug(group)}`,
  label: group,
  badge: entriesIn(group).length,
  items: [{ id: OVERVIEW(group), label: "Overview", href: `#/section/${groupSlug(group)}` }, ...entryItems(group)],
});

export const DOC_SECTIONS: SideNavSection[] = [
  {
    title: "Foundations",
    items: [{ id: OVERVIEW("Foundations"), label: "Overview", href: "#/section/foundations" }, ...entryItems("Foundations")],
  },
  {
    title: "Components",
    items: [{ id: "index", label: "All components", href: "#/components" }, ...COMPONENT_GROUPS.map(groupItem)],
  },
  { title: "Patterns", items: PATTERN_GROUPS.map(groupItem) },
  { title: "Brands", items: BRAND_GROUPS.map(groupItem) },
];

/** The sidebar id of the page a route shows. */
export function currentNavId(route: Route) {
  if (route.kind === "detail") return route.entry.slug;
  if (route.kind === "section") return OVERVIEW(route.group);
  if (route.kind === "index") return "index";
  return undefined;
}

export function DocsNav({ route, className }: { route: Route; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const currentId = currentNavId(route);

  // Keep the current page in view: the sidebar scrolls on its own, apart from the page.
  useLayoutEffect(() => {
    const box = host.current;
    const scroller = box?.closest<HTMLElement>("[data-docs-scroll]");
    const current = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!scroller || !current) return;
    const top = current.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    if (top < scroller.scrollTop || top + current.offsetHeight > scroller.scrollTop + scroller.clientHeight) {
      scroller.scrollTop = Math.max(0, top - scroller.clientHeight / 3);
    }
  }, [currentId]);

  return (
    <div ref={host} className={className}>
      {/* Keyed by group, so moving to another group opens it rather than keeping the last one's state. */}
      <SideNavigation key={String(routeGroup(route))} aria-label="Contents" sections={DOC_SECTIONS} currentId={currentId} />
    </div>
  );
}

/** The sidebar column beside the docs pages, from the lg breakpoint up. */
export function DocsSidebar({ route }: { route: Route }) {
  return (
    <div
      data-docs-scroll
      className={cx(
        // ps-5.5 plus each row's own 10px lines the labels up with the wordmark above.
        "scrollbar-thin sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-e border-line py-6 ps-5.5 pe-3 lg:block",
      )}
    >
      <DocsNav route={route} />
    </div>
  );
}
