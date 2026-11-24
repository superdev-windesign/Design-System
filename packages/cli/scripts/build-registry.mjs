// Builds the registry the CLI copies components from: registry/index.json plus
// a copy of every source file an item needs, under registry/files/.
//
// An item is a docs entry (its slug, e.g. "context-menu") or any single export
// (e.g. "AnimatedNumber" → "animated-number"). Its files are the modules that
// define what it imports, plus every module those reach through relative
// imports (cx, focus-ring recipes, motion tokens…). Bare imports become the
// npm packages the item needs, with the version ranges @windesign-ds/react uses.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const cliRoot = resolve(here, "..");
const repo = resolve(cliRoot, "../..");
const reactRoot = join(repo, "packages/react");
const srcRoot = join(reactRoot, "src");
const showcase = join(repo, "apps/playground/src/showcase");
const out = join(cliRoot, "registry");

const reactPkg = JSON.parse(readFileSync(join(reactRoot, "package.json"), "utf8"));
const stylesVersion = JSON.parse(readFileSync(join(repo, "packages/styles/package.json"), "utf8")).version;
const PEERS = new Set(Object.keys(reactPkg.peerDependencies ?? {}));
const VERSIONS = reactPkg.dependencies ?? {};

const posix = (p) => p.split("\\").join("/");
const rel = (abs) => posix(relative(srcRoot, abs));
const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

/* ── 1. Which file defines each export of the package ───────────────────── */

const program = ts.createProgram([join(srcRoot, "index.ts")], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  skipLibCheck: true,
  noEmit: true,
});
const checker = program.getTypeChecker();
const indexSymbol = checker.getSymbolAtLocation(program.getSourceFile(join(srcRoot, "index.ts")));
/** @type {Map<string, string>} export name → defining file, relative to src */
const exportFile = new Map();
for (const symbol of checker.getExportsOfModule(indexSymbol)) {
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const decl = target.declarations?.[0];
  if (!decl) continue;
  const file = decl.getSourceFile().fileName;
  if (!posix(file).startsWith(posix(srcRoot))) continue;
  exportFile.set(symbol.name, rel(file));
}

/* ── 2. Module graph: relative imports and npm packages ──────────────────── */

const resolveRelative = (fromAbs, spec) => {
  const base = resolve(dirname(fromAbs), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      /* try the next */
    }
  }
  throw new Error(`Can't resolve ${spec} from ${rel(fromAbs)}`);
};

const packageOf = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

/** @type {Map<string, { local: string[]; packages: string[] }>} */
const graph = new Map();
const scan = (relPath) => {
  if (graph.has(relPath)) return;
  const abs = join(srcRoot, relPath);
  const info = ts.preProcessFile(readFileSync(abs, "utf8"), true, true);
  const node = { local: [], packages: [] };
  graph.set(relPath, node);
  for (const { fileName: spec } of info.importedFiles) {
    if (spec.startsWith(".")) node.local.push(rel(resolveRelative(abs, spec)));
    else node.packages.push(packageOf(spec));
  }
  node.local.forEach(scan);
};

const closure = (entryFiles) => {
  const files = new Set();
  const packages = new Set();
  const visit = (f) => {
    if (files.has(f)) return;
    files.add(f);
    scan(f);
    const node = graph.get(f);
    node.packages.forEach((p) => packages.add(p));
    node.local.forEach(visit);
  };
  entryFiles.forEach(visit);
  const dependencies = {};
  for (const p of [...packages].sort()) {
    if (PEERS.has(p)) continue;
    if (!VERSIONS[p]) throw new Error(`${p} is imported but isn't a dependency of @windesign-ds/react`);
    dependencies[p] = VERSIONS[p];
  }
  return { files: [...files].sort(), dependencies };
};

/* ── 3. Docs entries, read from the playground's catalogue ──────────────── */

const literal = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined);
const strings = (node) => (node && ts.isArrayLiteralExpression(node) ? node.elements.map(literal).filter(Boolean) : []);

// Entries made through a helper (effect(), the brand files' entry()) get their group from it, not a literal.
const fileGroup = (file) => (file.startsWith("effects-") ? "Pro" : file.startsWith("liquid-") || file.startsWith("glass-") ? "Glass" : file.startsWith("moon-") ? "Moon" : undefined);

const entries = [];
for (const file of readdirSync(showcase).filter((f) => f.endsWith(".tsx"))) {
  const source = ts.createSourceFile(file, readFileSync(join(showcase, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = Object.fromEntries(
        node.properties.filter((p) => ts.isPropertyAssignment(p) && p.name && ts.isIdentifier(p.name)).map((p) => [p.name.text, p.initializer]),
      );
      const slug = literal(props.slug);
      const imports = strings(props.imports);
      if (slug && imports.length) {
        entries.push({
          name: slug,
          title: literal(props.name) ?? slug,
          group: literal(props.group) ?? fileGroup(file),
          summary: literal(props.summary) ?? "",
          aliases: strings(props.aliases),
          exports: imports,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

/* ── 4. Items and the files they copy ───────────────────────────────────── */

const items = [];
const seen = new Set();
const skipped = [];
for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
  if (seen.has(entry.name)) continue;
  const entryFiles = entry.exports.map((name) => exportFile.get(name)).filter(Boolean);
  if (!entryFiles.length) {
    skipped.push(entry.name);
    continue;
  }
  seen.add(entry.name);
  items.push({ ...entry, ...closure([...new Set(entryFiles)]) });
}

// Every export is addable on its own too, by its kebab-case name.
const exportsIndex = {};
for (const [name, file] of [...exportFile].sort(([a], [b]) => a.localeCompare(b))) {
  exportsIndex[name] = { item: kebab(name), file, ...closure([file]) };
}

/* ── 5. Write it out ────────────────────────────────────────────────────── */

rmSync(out, { recursive: true, force: true });
const allFiles = new Set([...items.flatMap((i) => i.files), ...Object.values(exportsIndex).flatMap((e) => e.files)]);
for (const f of allFiles) {
  mkdirSync(dirname(join(out, "files", f)), { recursive: true });
  cpSync(join(srcRoot, f), join(out, "files", f));
}
writeFileSync(
  join(out, "index.json"),
  `${JSON.stringify({ version: reactPkg.version, styles: { name: "@windesign-ds/styles", version: stylesVersion }, items, exports: exportsIndex }, null, 2)}\n`,
);
console.log(`windesign-ds registry: ${items.length} entries, ${Object.keys(exportsIndex).length} exports, ${allFiles.size} files`);
if (skipped.length) console.log(`  (no source to copy for: ${skipped.join(", ")})`);
