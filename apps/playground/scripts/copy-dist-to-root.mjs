// Mirrors apps/playground/dist to <repo root>/dist after every build.
//
// Hosts disagree on where to look for a monorepo app's output: with the
// project root at the repo root they expect ./dist, with it at
// apps/playground they expect apps/playground/dist. Producing both makes the
// deploy work under either setting, without host-specific configuration.
import { cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const from = fileURLToPath(new URL("../dist", import.meta.url));
const to = fileURLToPath(new URL("../../../dist", import.meta.url));

rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`@windesign-ds/playground: copied build output to ${to}`);
