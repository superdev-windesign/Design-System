import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, defaultClientConditions } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The workspace packages export their TypeScript source under "windesign-source", so the
  // playground runs on live source instead of a published build.
  resolve: { conditions: ["windesign-source", ...defaultClientConditions] },
  server: { port: 5180, strictPort: true },
  // Two pages: the docs site, and /demo, a small app built the way a package user would build one.
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        demo: fileURLToPath(new URL("./demo/index.html", import.meta.url)),
      },
    },
  },
});
