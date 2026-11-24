// Builds the DTCG sources in src/ into:
//   dist/css/base.css         primitives + theme-invariant semantic tokens   (:root)
//   dist/css/theme-light.css  light semantic tokens        (:root, [data-theme="light"])
//   dist/css/theme-dark.css   dark semantic tokens         ([data-theme="dark"])
//   dist/css/brand-*.css      each brand, light and dark ([data-brand="moon"])
//   dist/css/tokens.css       all of the above + prefers-color-scheme fallbacks
//   dist/json/{light,dark,<brand>-light,<brand>-dark}.json  flat, fully resolved values
//                             (used by tests and docs)
//
// Values are authored as final CSS strings, so the only transform is naming
// (`color.bg.canvas` → `--ds-color-bg-canvas`). Semantic tokens keep their
// references in CSS (`var(--ds-color-white)`) so devtools show where a value comes from.
import StyleDictionary from "style-dictionary";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const PRIMITIVES = ["src/primitives/**/*.json"];
const BASE = ["src/semantic/base.json"];
const platform = { prefix: "ds", transforms: ["name/kebab"] };

async function build(config) {
  await new StyleDictionary(config).buildAllPlatforms();
}

await build({
  source: [...PRIMITIVES, ...BASE],
  log: { verbosity: "silent" },
  platforms: {
    css: {
      ...platform,
      buildPath: "dist/css/",
      files: [{ destination: "base.css", format: "css/variables", options: { selector: ":root", outputReferences: true } }],
    },
  },
});

const SELECTORS = { light: ':root, [data-theme="light"]', dark: '[data-theme="dark"]' };

for (const theme of ["light", "dark"]) {
  await build({
    include: [...PRIMITIVES, ...BASE],
    // Semantic theme tokens plus component-scoped tokens (namespaced `component.*`).
    source: [`src/semantic/theme.${theme}.json`, `src/component/theme.${theme}.json`],
    // Theme files intentionally reference primitives that live in base.css,
    // so the "filtered out references" warning is expected here.
    log: { warnings: "disabled", verbosity: "silent" },
    platforms: {
      css: {
        ...platform,
        buildPath: "dist/css/",
        files: [
          {
            destination: `theme-${theme}.css`,
            format: "css/variables",
            filter: (token) => token.isSource,
            options: { selector: SELECTORS[theme], outputReferences: true },
          },
        ],
      },
      json: {
        ...platform,
        buildPath: "dist/json/",
        files: [{ destination: `${theme}.json`, format: "json/flat" }],
      },
    },
  });
}

// Brands sit across themes: a brand re-points the theme's tokens, and light and
// dark still work inside it. Each block re-declares every theme token, not only
// the ones the brand changes: theme tokens resolve var() where they're declared,
// so without this a brand scoped to one region would keep :root's values.
const BRANDS = ["moon", "glass"];
const brandSelectors = (brand) => ({
  light: `[data-brand="${brand}"], [data-brand="${brand}"] [data-theme="light"]`,
  dark: `[data-brand="${brand}"][data-theme="dark"], [data-brand="${brand}"] [data-theme="dark"], [data-theme="dark"] [data-brand="${brand}"]`,
});
const isThemeToken = (token) => token.isSource || /(semantic|component)[\\/]theme\./.test(token.filePath);

for (const brand of BRANDS) {
  for (const theme of ["light", "dark"]) {
    await build({
      include: [...PRIMITIVES, ...BASE, `src/semantic/theme.${theme}.json`, `src/component/theme.${theme}.json`],
      source: [`src/brands/${brand}/base.json`, `src/brands/${brand}/theme.${theme}.json`],
      log: { warnings: "disabled", verbosity: "silent" },
      platforms: {
        css: {
          ...platform,
          buildPath: "dist/css/",
          files: [
            {
              destination: `brand-${brand}-${theme}.css`,
              format: "css/variables",
              filter: isThemeToken,
              options: { selector: brandSelectors(brand)[theme], outputReferences: true },
            },
          ],
        },
        json: {
          ...platform,
          buildPath: "dist/json/",
          files: [{ destination: `${brand}-${theme}.json`, format: "json/flat" }],
        },
      },
    });
  }
}

// tokens.css: one import for consumers, plus an OS-preference fallback that applies
// the dark values unless the page explicitly opts into light.
const read = (file) => readFile(new URL(`dist/css/${file}`, import.meta.url), "utf8");
const [base, light, dark] = await Promise.all(["base.css", "theme-light.css", "theme-dark.css"].map(read));
const darkDeclarations = dark.slice(dark.indexOf("{") + 1, dark.lastIndexOf("}")).trimEnd();
const prefersDark = `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {${darkDeclarations.replace(/\n/g, "\n  ")}\n  }\n}\n`;

const brandSheets = await Promise.all(
  BRANDS.map(async (brand) => {
    const [brandLight, brandDark] = await Promise.all([read(`brand-${brand}-light.css`), read(`brand-${brand}-dark.css`)]);
    const declarations = brandDark.slice(brandDark.indexOf("{") + 1, brandDark.lastIndexOf("}")).trimEnd();
    const prefers = `@media (prefers-color-scheme: dark) {\n  [data-brand="${brand}"]:not([data-theme="light"]) {${declarations.replace(/\n/g, "\n  ")}\n  }\n}\n`;
    return { brand, css: [brandLight, brandDark, prefers].join("\n") };
  }),
);

await mkdir(new URL("dist/css/", import.meta.url), { recursive: true });
for (const { brand, css } of brandSheets) await writeFile(new URL(`dist/css/brand-${brand}.css`, import.meta.url), css);
await writeFile(
  new URL("dist/css/tokens.css", import.meta.url),
  ["/* Generated by @windesign-ds/tokens — do not edit. Source: packages/tokens/src */", base, light, dark, prefersDark, ...brandSheets.map(({ css }) => css)].join("\n"),
);
console.log("@windesign-ds/tokens: built dist/css/{base,theme-light,theme-dark,brand-*,tokens}.css and dist/json/*.json");
