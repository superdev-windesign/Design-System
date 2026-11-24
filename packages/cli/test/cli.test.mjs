// Runs the CLI against throwaway projects. `npm test` builds the registry first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(root, "bin/windesign-ds.mjs");
const registry = JSON.parse(readFileSync(join(root, "registry/index.json"), "utf8"));

const run = (cwd, ...args) => spawnSync(process.execPath, [bin, ...args, "--cwd", cwd], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

/** A project that already has every package, so `add` never calls a package manager. */
function project() {
  const dir = mkdtempSync(join(tmpdir(), "windesign-cli-"));
  const deps = { react: "^19.2.0", "react-dom": "^19.2.0", tailwindcss: "^4.1.0", "@windesign-ds/styles": "^0.1.0" };
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "app", dependencies: deps }));
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src/index.css"), '@import "tailwindcss";\n');
  return dir;
}

test("every registry file exists and every item has files", () => {
  assert.ok(registry.items.length > 200);
  for (const item of registry.items) {
    assert.ok(item.files.length, `${item.name} has no files`);
    for (const f of item.files) assert.ok(existsSync(join(root, "registry/files", f)), `${item.name}: missing ${f}`);
  }
});

test("items never depend on React itself or on the published package", () => {
  for (const item of registry.items) {
    assert.ok(!("react" in item.dependencies) && !("react-dom" in item.dependencies), item.name);
    assert.ok(!Object.keys(item.dependencies).some((d) => d.startsWith("@windesign-ds/")), item.name);
  }
});

test("init adds the theme to the CSS file and saves the config", () => {
  const dir = project();
  try {
    const r = run(dir, "init", "--yes");
    assert.equal(r.status, 0, r.stderr);
    assert.match(readFileSync(join(dir, "src/index.css"), "utf8"), /@import "tailwindcss";\n@import "@windesign-ds\/styles\/fonts\.css";\n@import "@windesign-ds\/styles\/tailwind\.css";/);
    assert.deepEqual(JSON.parse(readFileSync(join(dir, "windesign.json"), "utf8")), { path: "src/components/windesign", css: "src/index.css" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("add copies a component with the files it imports, and keeps changed files", () => {
  const dir = project();
  try {
    run(dir, "init", "--yes");
    const base = join(dir, "src/components/windesign");
    // Pretend the packages are installed so nothing is fetched.
    for (const name of Object.keys(registry.items.find((i) => i.name === "context-menu").dependencies)) {
      mkdirSync(join(dir, "node_modules", name), { recursive: true });
      writeFileSync(join(dir, "node_modules", name, "package.json"), JSON.stringify({ version: "99.0.0" }));
    }
    let r = run(dir, "add", "context-menu", "--yes");
    assert.equal(r.status, 0, r.stderr);
    for (const f of ["components/menu/context-menu.tsx", "components/menu/menu.tsx", "utils/cx.ts", "recipes/focus-ring.ts"]) assert.ok(existsSync(join(base, f)), f);
    assert.match(r.stdout, /import \{ ContextMenu, ContextMenuArea \} from ".\/src\/components\/windesign\/components\/menu\/context-menu";/);

    writeFileSync(join(base, "utils/cx.ts"), "// mine\n");
    r = run(dir, "add", "context-menu", "--yes");
    assert.equal(readFileSync(join(base, "utils/cx.ts"), "utf8"), "// mine\n");
    assert.match(r.stdout, /kept your version/);

    run(dir, "add", "context-menu", "--yes", "--overwrite");
    assert.notEqual(readFileSync(join(base, "utils/cx.ts"), "utf8"), "// mine\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("names resolve by alias and by export, and unknown names suggest others", () => {
  const dir = project();
  try {
    assert.match(run(dir, "add", "AnimatedNumber", "--dry-run", "--yes").stdout, /stat-card\/stat-card/);
    const miss = run(dir, "add", "context-menuu", "--yes");
    assert.equal(miss.status, 1);
    assert.match(miss.stderr, /Did you mean: .*context-menu/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
