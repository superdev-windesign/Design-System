import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // user-event suites run slower when every file runs in parallel; 5s flaked under load.
    testTimeout: 15_000,
  },
});
