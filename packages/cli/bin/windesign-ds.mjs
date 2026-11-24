#!/usr/bin/env node
// windesign-ds: copies Windesign components into your project as source.
//
//   npx windesign-ds@latest init
//   npx windesign-ds@latest add context-menu dynamic-island
//   npx windesign-ds@latest list [search]
//
// Each component arrives with the internal modules it needs (cx, focus-ring
// recipes, motion tokens…), keeping their folder layout so their relative
// imports work, and any npm packages it uses are installed. Styling still
// comes from @windesign-ds/styles, which `init` sets up.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const registryDir = resolve(here, "../registry");
const own = JSON.parse(readFileSync(resolve(here, "../package.json"), "utf8"));

/* ── Output ─────────────────────────────────────────────────────────────── */

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (color ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const bold = paint("1");
const dim = paint("2");
const green = paint("32");
const yellow = paint("33");
const red = paint("31");
const cyan = paint("36");
const log = (...a) => console.log(...a);
const fail = (msg) => {
  console.error(`${red("✖")} ${msg}`);
  process.exit(1);
};

/* ── Arguments ──────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("-") && !a.includes("=")));
const option = (name) => {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("-") ? argv[i + 1] : undefined;
};
const valued = new Set(["--cwd", "--path"]);
const positional = argv.filter((a, i) => !a.startsWith("-") && !valued.has(argv[i - 1]));
const [command, ...names] = positional;
const yes = flags.has("--yes") || flags.has("-y");
const overwrite = flags.has("--overwrite") || flags.has("-o");
const dryRun = flags.has("--dry-run");
const cwd = resolve(option("cwd") ?? process.cwd());

const HELP = `
${bold("windesign-ds")} ${dim(`v${own.version}`)}  Add Windesign components to your project as source.

${bold("Usage")}
  npx windesign-ds@latest init                 Set up styles and choose where components go
  npx windesign-ds@latest add <name...>        Copy components (and what they need) into your project
  npx windesign-ds@latest list [search]        Show what you can add

${bold("Options")}
  --path <dir>     Where components go (default: src/components/windesign)
  --cwd <dir>      Run in another folder
  -o, --overwrite  Replace files you've changed without asking
  -y, --yes        Don't ask; use the defaults
  --dry-run        Show what would happen without changing anything

${bold("Examples")}
  npx windesign-ds@latest add context-menu
  npx windesign-ds@latest add dynamic-island animated-number
  npx windesign-ds@latest list chart

Browse every component: ${own.homepage}
`;

/* ── Registry ───────────────────────────────────────────────────────────── */

const registry = JSON.parse(readFileSync(join(registryDir, "index.json"), "utf8"));
const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

/** A docs entry by slug or alias, or a single export by name; whatever the user typed. */
function find(name) {
  const key = kebab(name);
  const item = registry.items.find((i) => i.name === key || i.aliases.some((a) => kebab(a) === key));
  if (item) return item;
  const exportName = Object.keys(registry.exports).find((e) => e === name || registry.exports[e].item === key);
  if (exportName) {
    const e = registry.exports[exportName];
    return { name: e.item, title: exportName, exports: [exportName], files: e.files, dependencies: e.dependencies };
  }
  return undefined;
}

function suggest(name) {
  const key = kebab(name);
  const parts = key.split("-").filter(Boolean);
  return registry.items
    .map((i) => ({ i, score: parts.filter((p) => i.name.includes(p) || i.aliases.some((a) => kebab(a).includes(p))).length }))
    .filter((x) => x.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.i.name);
}

/* ── Project ────────────────────────────────────────────────────────────── */

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
};

function project() {
  const pkg = readJson(join(cwd, "package.json"));
  if (!pkg) fail(`No package.json in ${cwd}. Run this inside your app's folder (or pass --cwd).`);
  return pkg;
}

const installed = (pkg) => ({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies });

/** The version of a package installed for this project, looking up through node_modules folders. */
function installedVersion(name) {
  for (let dir = cwd; ; dir = dirname(dir)) {
    const version = readJson(join(dir, "node_modules", name, "package.json"))?.version;
    if (version) return version;
    if (dirname(dir) === dir) return undefined;
  }
}

/** Enough of semver for the "^x.y.z" ranges the registry uses. */
function satisfies(version, range) {
  if (!version) return false;
  const parse = (v) => v.replace(/^[\^~]/, "").split("-")[0].split(".").map(Number);
  const [a, b, c] = parse(version);
  const [x, y, z] = parse(range);
  if (!range.startsWith("^")) return a > x || (a === x && (b > y || (b === y && c >= z)));
  if (x > 0) return a === x && (b > y || (b === y && c >= z));
  if (y > 0) return a === 0 && b === y && c >= z;
  return a === 0 && b === 0 && c === z;
}

function packageManager() {
  const locks = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
    ["package-lock.json", "npm"],
  ];
  for (let dir = cwd; ; dir = dirname(dir)) {
    for (const [file, pm] of locks) if (existsSync(join(dir, file))) return pm;
    if (dirname(dir) === dir) break;
  }
  const agent = process.env.npm_config_user_agent ?? "";
  for (const pm of ["pnpm", "yarn", "bun"]) if (agent.startsWith(pm)) return pm;
  return "npm";
}

function install(packages) {
  if (!packages.length) return;
  const pm = packageManager();
  const args = pm === "npm" ? ["install", ...packages] : ["add", ...packages];
  log(`${cyan("›")} ${pm} ${args.join(" ")}`);
  if (dryRun) return;
  const result = spawnSync(pm, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) fail(`${pm} couldn't install ${packages.join(", ")}. Install them yourself, then run the command again.`);
}

/** "@/…" when tsconfig maps it to src, so the printed imports match how the app imports. */
function importBase(dir) {
  for (const file of ["tsconfig.json", "tsconfig.app.json", "jsconfig.json"]) {
    const text = existsSync(join(cwd, file)) ? readFileSync(join(cwd, file), "utf8") : "";
    const match = text.match(/"@\/\*"\s*:\s*\[\s*"\.?\/?([^"*]*)\*"/);
    if (match) {
      const target = match[1].replace(/\/$/, "");
      const relDir = relative(join(cwd, target), dir).split("\\").join("/");
      if (!relDir.startsWith("..")) return `@/${relDir}`;
    }
  }
  return `./${relative(cwd, dir).split("\\").join("/")}`;
}

/* ── Prompts ────────────────────────────────────────────────────────────── */

const interactive = process.stdin.isTTY && !yes;
async function confirm(question, fallback) {
  if (!interactive) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`${question} ${dim(fallback ? "(Y/n)" : "(y/N)")} `)).trim().toLowerCase();
  rl.close();
  return answer ? answer.startsWith("y") : fallback;
}

/* ── Config ─────────────────────────────────────────────────────────────── */

const CONFIG = "windesign.json";
const DEFAULT_PATH = existsSync(join(cwd, "src")) ? "src/components/windesign" : "components/windesign";
const CSS_CANDIDATES = [
  "src/index.css",
  "src/styles.css",
  "src/app.css",
  "src/main.css",
  "src/global.css",
  "src/globals.css",
  "src/app/globals.css",
  "app/globals.css",
  "styles/globals.css",
];

function loadConfig() {
  return readJson(join(cwd, CONFIG));
}

/* ── init ───────────────────────────────────────────────────────────────── */

async function init({ quiet = false } = {}) {
  const pkg = project();
  const deps = installed(pkg);
  const existing = loadConfig();
  const path = option("path") ?? existing?.path ?? DEFAULT_PATH;
  const css = existing?.css ?? CSS_CANDIDATES.find((f) => existsSync(join(cwd, f)));

  if (!quiet) log(`\n${bold("Setting up Windesign")} in ${dim(cwd)}\n`);

  if (!deps.react) log(`${yellow("!")} React isn't in package.json. The components need React 19.`);
  if (!deps.tailwindcss)
    log(`${yellow("!")} Tailwind CSS isn't installed. The components are styled with Tailwind v4: https://tailwindcss.com/docs/installation`);

  if (!deps["@windesign-ds/styles"]) install([`${registry.styles.name}@^${registry.styles.version}`]);

  const lines = ['@import "@windesign-ds/styles/fonts.css";', '@import "@windesign-ds/styles/tailwind.css";'];
  if (css) {
    const file = join(cwd, css);
    const text = readFileSync(file, "utf8");
    if (text.includes("@windesign-ds/styles/tailwind.css")) {
      log(`${green("✓")} ${css} already imports the Windesign theme`);
    } else if (/@import\s+["']tailwindcss["'];?/.test(text)) {
      const next = text.replace(/(@import\s+["']tailwindcss["'];?[^\n]*\n?)/, (m) => `${m.endsWith("\n") ? m : `${m}\n`}${lines.join("\n")}\n`);
      if (!dryRun) writeFileSync(file, next);
      log(`${green("✓")} Added the Windesign theme to ${css}`);
    } else {
      log(`${yellow("!")} ${css} doesn't import Tailwind. Add these lines to it, after @import "tailwindcss":\n\n  ${lines.join("\n  ")}\n`);
    }
  } else {
    log(`${yellow("!")} Couldn't find your main CSS file. Add these lines to it, after @import "tailwindcss":\n\n  ${lines.join("\n  ")}\n`);
  }

  const config = { path, ...(css ? { css } : {}) };
  if (!dryRun) writeFileSync(join(cwd, CONFIG), `${JSON.stringify(config, null, 2)}\n`);
  log(`${green("✓")} Components will go in ${bold(path)} ${dim(`(saved in ${CONFIG})`)}`);
  if (!quiet) log(`\nNext: ${cyan("npx windesign-ds@latest add button")}\n`);
  return config;
}

/* ── add ────────────────────────────────────────────────────────────────── */

async function add() {
  if (!names.length) fail(`Name a component to add, e.g. ${cyan("npx windesign-ds@latest add context-menu")}. See them all with ${cyan("list")}.`);

  const items = [];
  for (const name of names) {
    const item = find(name);
    if (!item) {
      const close = suggest(name);
      fail(`There's no component called "${name}".${close.length ? ` Did you mean: ${close.join(", ")}?` : ""} See them all with ${cyan("npx windesign-ds@latest list")}.`);
    }
    items.push(item);
  }

  project();
  let config = loadConfig();
  if (!config) {
    log(dim(`No ${CONFIG} yet, so setting up first.\n`));
    config = await init({ quiet: true });
    log("");
  }
  const target = resolve(cwd, option("path") ?? config.path);

  // Files: every item's, once each.
  const files = [...new Set(items.flatMap((i) => i.files))].sort();
  const written = [];
  const kept = [];
  for (const file of files) {
    const source = readFileSync(join(registryDir, "files", file), "utf8");
    const dest = join(target, file);
    if (existsSync(dest)) {
      const current = readFileSync(dest, "utf8");
      if (current === source) continue;
      const replace = overwrite || (await confirm(`${yellow("?")} ${relative(cwd, dest)} has changed. Replace it?`, false));
      if (!replace) {
        kept.push(file);
        continue;
      }
    }
    if (!dryRun) {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, source);
    }
    written.push(file);
  }

  // npm packages the files import that the project doesn't have, or has in a version that's too old.
  const needed = {};
  for (const item of items) Object.assign(needed, item.dependencies);
  install(Object.entries(needed).filter(([name, range]) => !satisfies(installedVersion(name), range)).map(([name, range]) => `${name}@${range}`));

  // Report.
  log("");
  for (const file of written) log(`${green("+")} ${relative(cwd, join(target, file)).split("\\").join("/")}`);
  for (const file of kept) log(`${yellow("=")} ${relative(cwd, join(target, file)).split("\\").join("/")} ${dim("(kept your version)")}`);
  if (!written.length && !kept.length) log(dim("Everything was already up to date."));

  const base = importBase(target);
  log(`\n${green("✓")} Added ${items.map((i) => bold(i.title)).join(", ")}${dryRun ? dim(" (dry run: nothing changed)") : ""}\n`);
  for (const item of items) {
    const byFile = new Map();
    for (const name of item.exports) {
      const file = registry.exports[name]?.file;
      if (!file) continue;
      byFile.set(file, [...(byFile.get(file) ?? []), name]);
    }
    for (const [file, exported] of byFile) log(`  import { ${exported.join(", ")} } from "${base}/${file.replace(/\.tsx?$/, "")}";`);
  }
  log(`\nThey're your files now: change them as you like. Docs: ${own.homepage}\n`);
}

/* ── list ───────────────────────────────────────────────────────────────── */

function list() {
  const query = names.join(" ").toLowerCase();
  const matches = registry.items.filter(
    (i) => !query || [i.name, i.title, i.summary, ...(i.aliases ?? [])].some((s) => s.toLowerCase().includes(query)),
  );
  const groups = new Map();
  for (const item of matches) groups.set(item.group ?? "Other", [...(groups.get(item.group ?? "Other") ?? []), item]);
  for (const [group, items] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    log(`\n${bold(group)}`);
    const width = Math.max(...items.map((i) => i.name.length));
    for (const i of items) log(`  ${cyan(i.name.padEnd(width))}  ${dim(i.summary)}`);
  }
  log(`\n${matches.length} of ${registry.items.length}. Add one with ${cyan("npx windesign-ds@latest add <name>")}\n`);
}

/* ── Main ───────────────────────────────────────────────────────────────── */

if (flags.has("--version") || flags.has("-v")) log(own.version);
else if (!command || flags.has("--help") || flags.has("-h") || command === "help") log(HELP);
else if (command === "init") await init();
else if (command === "add") await add();
else if (command === "list" || command === "ls") list();
else fail(`Unknown command "${command}".\n${HELP}`);
