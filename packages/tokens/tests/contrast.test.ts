import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, over, parseColor } from "./color";

type Theme = "light" | "dark";
interface Pair {
  fg: string;
  bg: string;
  backdrop?: string;
  min: number;
  usage: string;
  knownFailures?: Theme[];
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as T;
const { pairs } = readJson<{ pairs: Pair[] }>("../src/contrast-pairs.json");
const themes: Record<Theme, Record<string, string>> = {
  light: readJson("../dist/json/light.json"),
  dark: readJson("../dist/json/dark.json"),
};

const cssName = (path: string) => `ds-${path.replace(/\./g, "-")}`;

function resolve(theme: Theme, path: string) {
  const value = themes[theme][cssName(path)];
  if (value === undefined) throw new Error(`Token ${path} is missing from the ${theme} build`);
  return parseColor(value);
}

function ratio(theme: Theme, pair: Pair) {
  const canvas = resolve(theme, "color.bg.canvas");
  const backdrop = over(resolve(theme, pair.backdrop ?? "color.bg.canvas"), canvas);
  const bg = over(resolve(theme, pair.bg), backdrop);
  const fg = over(resolve(theme, pair.fg), bg);
  return contrastRatio(fg, bg);
}

describe.each(["light", "dark"] as const)("contrast (%s theme)", (theme) => {
  for (const pair of pairs) {
    const known = pair.knownFailures?.includes(theme) ?? false;
    const label = `${pair.fg} on ${pair.bg} ≥ ${pair.min}:1 — ${pair.usage}`;

    if (known) {
      it(`[known parity failure] ${label}`, () => {
        // If this starts passing, the debt is paid: remove the theme from knownFailures.
        expect(ratio(theme, pair), "now passes — remove it from knownFailures").toBeLessThan(pair.min);
      });
    } else {
      it(label, () => {
        expect(ratio(theme, pair)).toBeGreaterThanOrEqual(pair.min);
      });
    }
  }
});
