import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, defaultClientConditions } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The workspace packages export their TypeScript source under "windesign-source", so the
  // playground runs on live source instead of a published build.
  resolve: { conditions: ["windesign-source", ...defaultClientConditions] },
  server: { port: 5180, strictPort: true },
});
