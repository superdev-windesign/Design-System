// The data the MCP server answers from, written to data/*.json at build time.
//
//   components.json  every docs entry: name, summary, other names, exports,
//                    the files the CLI copies and the npm packages it needs
//                    (from the CLI's registry), plus each export's props (read
//                    from the TypeScript types) and a usage example (the docs
//                    demo's source).
//   tokens.json      the theme's utilities, in the groups tailwind.css gives
//                    them ("Surfaces → bg-*", "Radius → rounded-*"…).
//
// The server reads these at start-up, so answers never need the repo or the
// network and always match the version the server was published with.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const mcpRoot = resolve(here, "..");
const repo = resolve(mcpRoot, "../..");
const cliRoot = join(repo, "packages/cli");
const srcRoot = join(repo, "packages/react/src");
const showcase = join(repo, "apps/playground/src/showcase");
const registryFile = join(cliRoot, "registry/index.json");
const posix = (p) => p.split("\\").join("/");

/* ── 1. The CLI's registry: every entry, its exports, files and packages ── */

// Always rebuild it, so the MCP data never lags behind the source.
execFileSync(process.execPath, [join(cliRoot, "scripts/build-registry.mjs")], { stdio: "inherit" });
const registry = JSON.parse(readFileSync(registryFile, "utf8"));

/* ── 2. Props and descriptions, from the TypeScript types ───────────────── */

const program = ts.createProgram([join(srcRoot, "index.ts")], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
});
const checker = program.getTypeChecker();
const index = checker.getSymbolAtLocation(program.getSourceFile(join(srcRoot, "index.ts")));
const ownFile = (node) => posix(node.getSourceFile().fileName).startsWith(posix(srcRoot));
const docOf = (symbol) => ts.displayPartsToString(symbol.getDocumentationComment(checker)).replace(/\s+/g, " ").trim();
const short = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** @type {Map<string, { kind: string, description: string, props?: object[], inherits?: string[] }>} */
const exportInfo = new Map();
for (const exported of checker.getExportsOfModule(index)) {
  const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const decl = symbol.declarations?.[0];
  if (!decl || !ownFile(decl)) continue;

  const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
  const signature = type.getCallSignatures()[0];
  const isComponent = signature && /^[A-Z]/.test(exported.name) && !(symbol.flags & ts.SymbolFlags.Class);
  const info = { kind: isComponent ? "component" : symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias) ? "type" : signature ? "function" : "value", description: short(docOf(symbol), 600) };

  // A component's props: the properties of its first parameter. Only props
  // declared in this library are listed one by one; inherited ones (React
  // Aria's, the DOM's) are named by where they come from.
  const param = isComponent ? signature.getParameters()[0] : undefined;
  if (param) {
    const propsType = checker.getTypeOfSymbolAtLocation(param, decl);
    const props = [];
    const inherited = new Set();
    for (const prop of propsType.getProperties()) {
      const pdecl = prop.declarations?.[0];
      if (!pdecl) continue;
      if (!ownFile(pdecl)) {
        const from = posix(pdecl.getSourceFile().fileName).match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1];
        if (from) inherited.add(from);
        continue;
      }
      props.push({
        name: prop.name,
        type: short(checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, decl), undefined, ts.TypeFormatFlags.NoTruncation), 160),
        required: !(prop.flags & ts.SymbolFlags.Optional),
        description: short(docOf(prop), 240),
      });
    }
    info.props = props.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
    info.inherits = [...inherited].sort();
  }
  exportInfo.set(exported.name, info);
}

/* ── 3. Usage examples, from the docs demos ─────────────────────────────── */

// Each catalogue entry's `demo` (or `preview`) is a small working example. When
// it renders a helper component from the same file (`() => <IslandDemo />`),
// the helper's source comes too, since that's where the real usage is.
const literal = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined);
const examples = new Map();
for (const file of readdirSync(showcase).filter((f) => f.endsWith(".tsx"))) {
  const source = ts.createSourceFile(file, readFileSync(join(showcase, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const locals = new Map();
  source.statements.forEach((s) => {
    if (ts.isFunctionDeclaration(s) && s.name) locals.set(s.name.text, s.getText());
    if (ts.isVariableStatement(s)) s.declarationList.declarations.forEach((d) => ts.isIdentifier(d.name) && locals.set(d.name.text, s.getText()));
  });
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = Object.fromEntries(node.properties.filter((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)).map((p) => [p.name.text, p.initializer]));
      const slug = literal(props.slug);
      const body = props.demo ?? props.preview;
      if (slug && body && !examples.has(slug)) {
        let code = body.getText().replace(/^\(\)\s*=>\s*/, "");
        const helpers = [...code.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]).filter((name) => locals.has(name));
        for (const name of new Set(helpers)) code = `${locals.get(name)}\n\n// Rendered as:\n${code}`;
        examples.set(slug, short(code, 4000));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

/* ── 4. Tokens, in tailwind.css's own groups ────────────────────────────── */

const css = readFileSync(join(repo, "packages/styles/src/tailwind.css"), "utf8");
const tokenGroups = [];
let group;
for (const line of css.split("\n")) {
  const heading = line.match(/^\s*\/\*\s*(.+?)\s*\*\/\s*$/);
  if (heading && !heading[1].startsWith("──")) {
    // A second comment line right after the first continues the same heading.
    if (group && !group.tokens.length) group.title += ` ${heading[1]}`;
    else tokenGroups.push((group = { title: heading[1], kind: "", tokens: [] }));
    continue;
  }
  const v = line.match(/^\s*--(color|text|radius|shadow|spacing|blur|font|ease)-([a-z0-9-]+?):/);
  if (!v || !group || v[2].includes("--") || v[2] === "*") continue;
  group.kind ||= v[1];
  group.tokens.push(v[2]);
}
const PREFIX = { color: "bg-* / text-* / border-*", text: "text-*", radius: "rounded-*", shadow: "shadow-*", spacing: "h-* / w-* / size-*", blur: "blur-* / backdrop-blur-*", font: "font-*", ease: "ease-*" };
const tokens = tokenGroups
  .filter((g) => g.tokens.length)
  .map((g) => ({ title: g.title, kind: g.kind, utilities: g.title.includes("→") ? g.title.split("→")[1].trim() : PREFIX[g.kind], tokens: g.tokens }));

/* ── 5. Write it out ────────────────────────────────────────────────────── */

const components = registry.items.map((item) => ({
  name: item.name,
  title: item.title,
  group: item.group ?? "Other",
  summary: item.summary,
  aliases: item.aliases ?? [],
  exports: item.exports,
  files: item.files,
  dependencies: item.dependencies,
  api: item.exports.map((name) => ({ name, ...(exportInfo.get(name) ?? { kind: "value", description: "" }) })),
  example: examples.get(item.name),
}));

mkdirSync(join(mcpRoot, "data"), { recursive: true });
const write = (file, value) => writeFileSync(join(mcpRoot, "data", file), `${JSON.stringify(value, null, 2)}\n`);
write("components.json", { version: registry.version, components });
write("tokens.json", { groups: tokens });

const withProps = components.filter((c) => c.api.some((a) => a.props?.length)).length;
const withExample = components.filter((c) => c.example).length;
console.log(`@windesign-ds/mcp: ${components.length} components (${withProps} with props, ${withExample} with examples), ${tokens.length} token groups`);
