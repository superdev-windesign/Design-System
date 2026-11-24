// Ports BoardUI's MIT-licensed free components onto the Windesign token system.
//
//   node tools/boardui-port/port.mjs <path to a BoardUI checkout>
//
// For each file in mapping.FILES it rewrites imports to this repo's layout,
// renames token utilities and CSS variables to Windesign names, converts pixel
// values on the spacing scale (w-[118px] → w-29.5), adds an attribution
// header, and writes the result under packages/react/src. Anything it can't
// map is listed in tools/boardui-port/report.txt for a manual pass.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSES, COLORS, DEFAULT_IMPORTS, FILES, IMPORTS, PATCHES, TEXT } from "./mapping.mjs";

const source = process.argv[2];
if (!source) throw new Error("Usage: node tools/boardui-port/port.mjs <BoardUI checkout>");
const repo = fileURLToPath(new URL("../../", import.meta.url));
const destRoot = join(repo, "packages/react/src");

const COLOR_UTILITY = /^(-?)(bg|text|border(?:-[xytrblse])?|ring|ring-offset|fill|stroke|from|via|to|divide|outline|placeholder|decoration|caret|accent)-(.+?)(\/[\d.]+)?$/;
const SPACING_PX = /^(-?)(w|h|size|min-w|max-w|min-h|max-h|p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|top|left|right|bottom|start|end|inset(?:-[xy])?|translate-[xy]|space-[xy]|leading|basis)-\[(\d+(?:\.\d+)?)px\]$/;

const unmapped = new Map();
const note = (file, what) => unmapped.set(`${file}: ${what}`, true);

function mapBase(base, file) {
  if (base in CLASSES) return CLASSES[base];

  const text = /^text-(.+)$/.exec(base);
  if (text && text[1] in TEXT) return `text-${TEXT[text[1]]}`;

  const color = COLOR_UTILITY.exec(base);
  if (color && color[3] in COLORS) return `${color[1]}${color[2]}-${COLORS[color[3]][0]}${color[4] ?? ""}`;

  const px = SPACING_PX.exec(base);
  if (px) {
    const value = Number(px[3]);
    if (Number.isInteger(value)) return `${px[1]}${px[2]}-${String(value / 4)}`;
  }

  if (/^shadow-\[/.test(base) || /-\[#|rgb\(|oklch\(/.test(base)) note(file, base);
  else if (/^text-\[\d/.test(base)) note(file, base);
  return base;
}

/** Rewrites one class token, keeping variant prefixes (`hover:`, `data-[x]:`) and `!`. */
function mapToken(token, file) {
  let depth = 0;
  let split = -1;
  for (let i = 0; i < token.length; i++) {
    if (token[i] === "[") depth++;
    else if (token[i] === "]") depth--;
    else if (token[i] === ":" && depth === 0) split = i;
  }
  const prefix = token.slice(0, split + 1);
  let base = token.slice(split + 1);
  const important = base.startsWith("!") ? "!" : "";
  base = base.slice(important.length);
  return prefix + important + mapBase(base, file);
}

/**
 * BoardUI draws focus with box-shadow rings (`ring-2 ring-offset-2 ring-focus`).
 * The system uses one outline-based focus style, which survives forced-colors
 * mode. Within any string that styles focus, convert the ring tokens that share
 * a variant prefix with `ring-focus`, and drop the bare `outline-none` that
 * would otherwise cancel the outline.
 */
function focusRingsToOutline(code) {
  // Single-line class strings only: a looser match can run from a quote inside
  // code (e.g. '[role="treegrid"]') across lines and mangle real code.
  return code.replace(/(["'`])([^"'`\n\\]*?ring-focus[^"'`\n\\]*?)\1/g, (literal, quote, body) => {
    const tokens = body.split(/(\s+)/);
    const prefixes = new Set(tokens.filter((t) => t.endsWith("ring-focus")).map((t) => t.slice(0, -"ring-focus".length)));
    const inset = new Set([...prefixes].filter((p) => tokens.includes(`${p}ring-inset`)));
    const out = tokens
      .map((t) => {
        for (const p of prefixes) {
          if (t === `${p}ring-focus`) return `${p}outline-focus`;
          if (t === `${p}ring-2`) return inset.has(p) ? `${p}outline-2 ${p}-outline-offset-2` : `${p}outline-2`;
          if (t === `${p}ring-offset-2`) return `${p}outline-offset-2`;
          if (t === `${p}ring-inset`) return "";
        }
        return t === "outline-none" ? "" : t;
      })
      .join("")
      .replace(/\s{2,}/g, " ")
      .trim();
    return quote + out + quote;
  });
}

/**
 * BoardUI's Button is a native <button> (`onClick`, `disabled`, `size="small"`,
 * `variant="ghost"`); ours wraps React Aria (`onPress`, `isDisabled`, `sm`,
 * `tertiary`). Rewrites the props on every <Button …> opening tag.
 */
function adaptButtonProps(code) {
  if (!/from "[^"]*button\/button"/.test(code)) return code;
  let out = "";
  let i = 0;
  for (let start = code.indexOf("<Button", i); start !== -1; start = code.indexOf("<Button", i)) {
    if (!/[\s>/]/.test(code[start + 7] ?? "")) {
      out += code.slice(i, start + 7);
      i = start + 7;
      continue;
    }
    // Walk to the end of the opening tag, skipping `>` inside {…} expressions.
    let depth = 0;
    let end = start + 7;
    for (; end < code.length; end++) {
      const ch = code[end];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ">" && depth === 0) break;
    }
    const tag = code
      .slice(start, end)
      .replace(/\bsize="small"/g, 'size="sm"')
      .replace(/\bsize="medium"/g, 'size="md"')
      .replace(/\bvariant="ghost"/g, 'variant="tertiary"')
      .replace(/(?<![\w-])onClick=/g, "onPress=")
      .replace(/(?<![\w-])disabled(?=[\s=/]|$)/g, "isDisabled");
    out += code.slice(i, start) + tag;
    i = end;
  }
  return out + code.slice(i);
}

function convert(code, from, to) {
  const file = from;

  // Framework default imports (next/link) → this package's neutral equivalents.
  code = code.replace(/import (\w+) from "([^"]+)";/g, (match, local, spec) => {
    if (!(spec in DEFAULT_IMPORTS)) return match;
    const [target, name] = DEFAULT_IMPORTS[spec].split("#");
    let rel = posix.relative(posix.dirname(to), target);
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `import { ${name}${name === local ? "" : ` as ${local}`} } from "${rel}";`;
  });

  // Imports: BoardUI's "@/..." aliases → relative paths in this package.
  code = code.replace(/from "(@\/[^"]+)"/g, (match, spec) => {
    const target = IMPORTS[spec] ?? spec.replace(/^@\/components\/base\//, "components/");
    if (target.startsWith("@/")) {
      note(file, `import ${spec}`);
      return match;
    }
    let rel = posix.relative(posix.dirname(to), target);
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `from "${rel}"`;
  });

  // CSS variables referenced from inline styles and SVG attributes.
  code = code.replace(/var\(--color-([a-z0-9-]+)\)/g, (match, name) => {
    if (name in COLORS) return `var(${COLORS[name][1]})`;
    if (/^(accent|neutral|red|blue|green|yellow|lime|rose|white|black)(-\d+)?$/.test(name)) return `var(--ds-color-${name})`;
    note(file, match);
    return match;
  });

  // Class-like tokens inside quotes, template literals and JSX expressions.
  code = code.replace(/(?<=[\s"'`{(])([!\-a-z0-9:[\]=&>_.%/#()*,]+)(?=[\s"'`})])/g, (token) =>
    /[a-z]/.test(token) && !/^(https?|\.\/|\.\.\/)/.test(token) ? mapToken(token, file) : token,
  );

  code = focusRingsToOutline(code);
  code = adaptButtonProps(code);

  for (const [find, replace] of PATCHES[to] ?? []) {
    if (!code.includes(find)) note(file, `patch did not apply: ${find.slice(0, 60)}`);
    code = code.replace(find, replace);
  }
  // A patch may have replaced something noted during conversion; only report what's left.
  for (const key of unmapped.keys()) {
    const what = key.slice(file.length + 2);
    if (key.startsWith(`${file}: `) && !what.startsWith("patch did not apply") && !code.includes(what)) unmapped.delete(key);
  }

  const header = `// Adapted from BoardUI (MIT) — ${from}. See THIRD_PARTY_NOTICES.md.\n`;
  return code.startsWith('"use client"') ? code.replace(/^"use client";\n/, `"use client";\n${header}`) : header + code;
}

for (const [from, to] of Object.entries(FILES)) {
  const input = readFileSync(join(source, from), "utf8");
  const output = convert(input, from, to);
  const dest = join(destRoot, to);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, output);
}

const reportPath = join(repo, "tools/boardui-port/report.txt");
writeFileSync(reportPath, [...unmapped.keys()].sort().join("\n") + "\n");
console.log(`Ported ${Object.keys(FILES).length} files into ${relative(repo, destRoot)}; ${unmapped.size} items need a manual pass (${relative(repo, reportPath)}).`);
