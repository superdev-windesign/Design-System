import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Tree = { [key: string]: Tree | unknown };

const readJson = (path: string): Tree => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as Tree;

/** Flattens a DTCG tree into { "color.bg.canvas": "<$value>" }. */
function flatten(tree: Tree, prefix: string[] = [], out: Record<string, unknown> = {}) {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$") || typeof node !== "object" || node === null) continue;
    const path = [...prefix, key];
    if ("$value" in node) out[path.join(".")] = (node as { $value: unknown }).$value;
    else flatten(node as Tree, path, out);
  }
  return out;
}

const light = flatten(readJson("../src/semantic/theme.light.json"));
const dark = flatten(readJson("../src/semantic/theme.dark.json"));
const base = flatten(readJson("../src/semantic/base.json"));
const componentLight = flatten(readJson("../src/component/theme.light.json"));
const componentDark = flatten(readJson("../src/component/theme.dark.json"));

describe("theme coverage", () => {
  it("dark defines every light semantic token", () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it("dark defines every light component token", () => {
    expect(Object.keys(componentDark).sort()).toEqual(Object.keys(componentLight).sort());
  });

  it("component tokens stay in the component namespace", () => {
    for (const path of Object.keys(componentLight)) expect(path).toMatch(/^component\./);
  });
});

describe.each(["moon", "glass"])("the %s brand", (brand) => {
  const brandLight = flatten(readJson(`../src/brands/${brand}/theme.light.json`));
  const brandDark = flatten(readJson(`../src/brands/${brand}/theme.dark.json`));
  const brandBase = flatten(readJson(`../src/brands/${brand}/base.json`));
  const known = new Set(Object.keys({ ...light, ...base, ...flatten(readJson("../src/primitives/color.json")) }));

  // A dark override with no light one (or the reverse) would leak the other brand's value.
  it("overrides every token in both themes, bar the roles only dark needs", () => {
    const lightOnly = Object.keys(brandLight).filter((path) => !(path in brandDark));
    expect(lightOnly).toEqual([]);
  });

  it.each(Object.keys({ ...brandLight, ...brandDark, ...brandBase }))("%s overrides a token that exists", (path) => {
    expect(known.has(path)).toBe(true);
  });

  it.each(Object.entries({ ...brandLight, ...brandDark, ...brandBase }))("%s references a primitive", (_, value) => {
    expect(String(value)).toMatch(/{[a-z0-9.-]+}/);
  });
});

describe("component colors", () => {
  // Component shadows may carry raw shadow geometry, but every color must come from a primitive.
  const colors = Object.entries({ ...componentLight, ...componentDark }).filter(([, v]) => !String(v).includes("px"));
  it.each(colors)("%s references a primitive", (_, value) => {
    expect(String(value)).toMatch(/\{[a-z0-9.-]+\}/);
  });
});

describe("semantic layer", () => {
  const semantic = { ...base, ...light, ...dark };

  it.each(Object.entries(semantic))("%s references a primitive instead of a raw value", (_, value) => {
    expect(String(value)).toMatch(/\{[a-z0-9.-]+\}/);
  });

  it.each(Object.keys(semantic))("%s uses lowercase kebab-case segments", (path) => {
    for (const segment of path.split(".")) expect(segment).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});
