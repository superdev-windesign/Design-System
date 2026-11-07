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

/** Groups that aren't foundations, blocks, charts or templates. */
export const COMPONENT_GROUPS: Group[] = GROUPS.map((g) => g.name).filter((g) => !["Foundations", "Blocks", "Charts", "Templates", "Moon", "Glass"].includes(g));

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

/** Top navigation: four chapters of the book, plus the component index. */
export const NAV: { label: string; href: string; matches: (route: Route) => boolean }[] = [
  {
    label: "Foundations",
    href: "#/section/foundations",
    matches: (r) => (r.kind === "section" && r.group === "Foundations") || (r.kind === "detail" && r.entry.group === "Foundations"),
  },
  {
    label: "Components",
    href: "#/components",
    matches: (r) =>
      r.kind === "index" || (r.kind === "section" && COMPONENT_GROUPS.includes(r.group)) || (r.kind === "detail" && COMPONENT_GROUPS.includes(r.entry.group)),
  },
  ...(["Blocks", "Charts", "Templates", "Moon", "Glass"] as const).map((group) => ({
    label: group,
    href: `#/section/${groupSlug(group)}`,
    matches: (r: Route) => (r.kind === "section" && r.group === group) || (r.kind === "detail" && r.entry.group === group),
  })),
];
