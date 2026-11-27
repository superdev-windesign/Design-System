// Regenerates src/primitives/color.json from Tailwind v4's default OKLCH palette,
// then applies the handful of BoardUI/Figma-tuned overrides. Run after upgrading
// tailwindcss: `npm run sync:palette -w @windesign-ds/tokens`.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const themeCss = await readFile(fileURLToPath(import.meta.resolve("tailwindcss/theme.css")), "utf8");

const OVERRIDES = {
  "slate.200": "#ebeff5",
  "neutral.100": "#f7f7f7",
  "neutral.200": "#ebebeb",
  "neutral.925": "#121212",
  "blue.400": "#3392ff",
};

const color = {};
for (const [, family, step, value] of themeCss.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)) {
  (color[family] ??= {})[step] = { $type: "color", $value: value.trim() };
}
for (const [, name, value] of themeCss.matchAll(/--color-(black|white):\s*([^;]+);/g)) {
  color[name] = { $type: "color", $value: value.trim() };
}
for (const [path, value] of Object.entries(OVERRIDES)) {
  const [family, step] = path.split(".");
  color[family][step] = { $type: "color", $value: value, $description: "BoardUI/Figma override of the Tailwind default" };
}

// Keep each ramp in numeric order (925 lands between 900 and 950).
for (const family of Object.keys(color)) {
  if (color[family].$value) continue;
  color[family] = Object.fromEntries(Object.entries(color[family]).sort(([a], [b]) => Number(a) - Number(b)));
}

// The house ramps aren't Tailwind's: carry them over from the current file so a
// sync never drops them (paper is Windesign's neutrals, lagoon its accent).
const current = JSON.parse(await readFile(new URL("../src/primitives/color.json", import.meta.url), "utf8")).color;
for (const family of ["paper", "lagoon", "terracotta"]) {
  if (current[family]) color[family] = current[family];
}

// The accent ramp is an alias: rebrand by re-pointing these eleven tokens.
color.accent = current.accent ?? Object.fromEntries(Object.keys(color.lagoon ?? color.teal).map((step) => [step, { $type: "color", $value: `{color.lagoon.${step}}` }]));
delete color.accent["925"];

await writeFile(
  new URL("../src/primitives/color.json", import.meta.url),
  JSON.stringify({ color }, null, 2) + "\n",
);
console.log(`Wrote ${Object.keys(color).length} color families to src/primitives/color.json`);
