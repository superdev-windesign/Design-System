import { useEffect, useState } from "react";
import { CATALOG, GROUPS } from "../showcase/catalog";
import type { CatalogEntry, Group } from "../showcase/catalog";

/**
 * Hash routes:
 *   #/                     home
 *   #/components           contents of every component group
 *   #/section/<group>      one group (foundations, blocks, charts, templates, …)
 *   #/components/<slug>    one entry
 */
export type Route =
  | { kind: "home" }
  | { kind: "index" }
  | { kind: "section"; group: Group }
  | { kind: "detail"; entry: CatalogEntry }
  | { kind: "missing"; path: string };

export const groupSlug = (group: Group) => group.toLowerCase().replace(/\s+/g, "-");
export const groupBySlug = (slug: string) => GROUPS.find((g) => groupSlug(g.name) === slug)?.name;

/** Larger pieces built from the components. */
export const PATTERN_GROUPS: Group[] = ["Blocks", "Charts", "Templates"];

/** Components made for one brand's look. */
export const BRAND_GROUPS: Group[] = ["Moon", "Glass"];

/** The component chapters: everything that isn't a foundation, a pattern or a brand. */
export const COMPONENT_GROUPS: Group[] = GROUPS.map((g) => g.name).filter((g) => g !== "Foundations" && !PATTERN_GROUPS.includes(g) && !BRAND_GROUPS.includes(g));

/** The group a page belongs to, or "index" for the component contents. */
export const routeGroup = (route: Route): Group | "index" | null =>
  route.kind === "section" ? route.group : route.kind === "detail" ? route.entry.group : route.kind === "index" ? "index" : null;

/** Pages that sit in the docs shell, with the sidebar beside them. */
export const isDocsRoute = (route: Route) => routeGroup(route) !== null;

/** "03" for the third group: the chapter number used across the site. */
export const groupNumber = (group: Group) => String(GROUPS.findIndex((g) => g.name === group) + 1).padStart(2, "0");

/** "03.2": chapter and position within it. */
export const entryNumber = (entry: CatalogEntry) => {
  const inGroup = CATALOG.filter((e) => e.group === entry.group);
  return `${groupNumber(entry.group)}.${inGroup.indexOf(entry) + 1}`;
};

export const entriesIn = (group: Group) => CATALOG.filter((e) => e.group === group);

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/") return { kind: "home" };
  if (path === "/components") return { kind: "index" };
  const section = /^\/section\/([a-z0-9-]+)$/.exec(path);
  if (section) {
    const group = groupBySlug(section[1]!);
    return group ? { kind: "section", group } : { kind: "missing", path };
  }
  const detail = /^\/components\/([a-z0-9-]+)$/.exec(path);
  if (detail) {
    const entry = CATALOG.find((e) => e.slug === detail[1]);
    return entry ? { kind: "detail", entry } : { kind: "missing", path };
  }
  return { kind: "missing", path };
}

export function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return parseRoute(hash);
}

/**
 * Top navigation: only the three top-level parts. Everything inside them,
 * from Actions to Blocks, Charts and the brand sets, is in the sidebar.
 */
export const NAV: { label: string; href: string; matches: (route: Route) => boolean }[] = [
  { label: "Foundations", href: "#/section/foundations", matches: (r) => routeGroup(r) === "Foundations" },
  {
    label: "Components",
    href: "#/components",
    matches: (r) => {
      const group = routeGroup(r);
      return group !== null && group !== "Foundations" && group !== "Templates";
    },
  },
  { label: "Templates", href: "#/section/templates", matches: (r) => routeGroup(r) === "Templates" },
];
