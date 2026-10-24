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

describe("theme coverage", () => {
  it("dark defines every light token", () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
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
