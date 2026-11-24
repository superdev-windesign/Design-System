// Connects to the built server with the SDK's own MCP client, over stdio, the
// way an AI app does, and checks every tool, resource and prompt. `npm test`
// builds first.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const server = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const client = new Client({ name: "windesign-test", version: "1.0.0" });

before(async () => {
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [server], stderr: "ignore" }));
});
after(() => client.close());

const call = async (name, args = {}) => {
  const result = await client.callTool({ name, arguments: args });
  return { text: result.content.map((c) => c.text).join("\n"), isError: Boolean(result.isError) };
};

test("the server introduces itself and tells the model how to use it", () => {
  assert.equal(client.getServerVersion().name, "windesign");
  assert.match(client.getInstructions(), /search_components/);
});

test("it offers the six tools, all read-only", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["get_component", "get_rules", "get_setup", "get_tokens", "list_components", "search_components"]);
  for (const t of tools) assert.equal(t.annotations?.readOnlyHint, true, t.name);
});

test("search finds components by what they do", async () => {
  assert.match((await call("search_components", { query: "rolling number" })).text, /^1\. Animated Number \(animated-number\)/m);
  assert.match((await call("search_components", { query: "file upload" })).text, /^1\. File Upload/m);
  assert.match((await call("search_components", { query: "date range" })).text, /Date Range Picker/);
  const none = await call("search_components", { query: "zzz nothing" });
  assert.match(none.text, /No Windesign component matches/);
});

test("get_component returns props, an example and how to add it, by any name", async () => {
  for (const name of ["dynamic-island", "Dynamic Island", "DynamicIsland", "Status pill"]) {
    const { text, isError } = await call("get_component", { name });
    assert.equal(isError, false, name);
    assert.match(text, /^# Dynamic Island \(dynamic-island\)/, name);
  }
  const { text } = await call("get_component", { name: "animated-number" });
  assert.match(text, /- value: number/);
  assert.match(text, /- format\?: NumberFormatOptions/);
  assert.match(text, /## Example[\s\S]*<AnimatedNumber/);
  assert.match(text, /npx windesign-ds@latest add animated-number/);
});

test("an unknown component is an error that suggests others", async () => {
  const { text, isError } = await call("get_component", { name: "date picker thing" });
  assert.equal(isError, true);
  assert.match(text, /Did you mean: .*date-picker/);
});

test("list_components lists a group, and rejects an unknown one", async () => {
  assert.match((await call("list_components", { group: "Charts" })).text, /^## Charts \(\d+\)/);
  assert.equal((await call("list_components", { group: "Nope" })).isError, true);
});

test("get_tokens returns the semantic utilities, filtered by kind", async () => {
  const colors = (await call("get_tokens", { kind: "color" })).text;
  assert.match(colors, /canvas, surface/);
  assert.match(colors, /fg-secondary/);
  assert.doesNotMatch(colors, /rounded-\*/);
  assert.match((await call("get_tokens", { kind: "radius" })).text, /control-md/);
});

test("get_rules and get_setup return the guides", async () => {
  assert.match((await call("get_rules")).text, /Never write hex/);
  const vite = (await call("get_setup", { framework: "vite" })).text;
  assert.match(vite, /npm install @windesign-ds\/react @windesign-ds\/styles/);
  assert.match(vite, /@source "\.\.\/node_modules\/@windesign-ds\/react\/dist"/);
  const next = (await call("get_setup", { framework: "next", method: "cli" })).text;
  assert.match(next, /npx windesign-ds@latest add/);
  assert.match(next, /app\/layout\.tsx/);
});

test("resources and the prompt are there", async () => {
  const { resources } = await client.listResources();
  assert.deepEqual(resources.map((r) => r.uri).sort(), ["windesign://rules", "windesign://tokens"]);
  const rules = await client.readResource({ uri: "windesign://rules" });
  assert.match(rules.contents[0].text, /# Writing UI with Windesign/);

  const prompt = await client.getPrompt({ name: "build_with_windesign", arguments: { task: "a login form" } });
  assert.match(prompt.messages[0].content.text, /^Build this with the Windesign design system: a login form/);
});
