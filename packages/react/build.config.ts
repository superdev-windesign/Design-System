import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

/**
 * The published build of @windesign/react: ES modules, one file per source
 * module, so apps only bundle the components they import. Dependencies stay
 * external. Types come from `tsc -p tsconfig.build.json` alongside.
 */

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const deps = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];
const isExternal = (id: string) => deps.some((dep) => id === dep || id.startsWith(`${dep}/`));

/**
 * Rollup drops module-level directives, but Next.js needs "use client" at the
 * top of every client component. Remember which modules had it and put it back
 * on their output files.
 */
function preserveUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: "preserve-use-client",
    transform(code, id) {
      if (/^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(code)) clientModules.add(id);
      return null;
    },
    renderChunk(code, chunk) {
      if (chunk.facadeModuleId && clientModules.has(chunk.facadeModuleId)) return { code: `"use client";\n${code}`, map: null };
      return null;
    },
  };
}

export default defineConfig({
  plugins: [preserveUseClient()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    target: "es2022",
    lib: { entry: resolve(__dirname, "src/index.ts"), formats: ["es"] },
    rollupOptions: {
      external: isExternal,
      output: { preserveModules: true, preserveModulesRoot: "src", entryFileNames: "[name].js" },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
  esbuild: { jsx: "automatic" },
});
