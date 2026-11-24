#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadData } from "./data.js";
import { DOCS, componentDetails, componentLine, tokenList } from "./format.js";
import { loadRules, setupGuide } from "./guides.js";
import { findComponent, search, suggest } from "./search.js";

/*
 * The Windesign MCP server. AI coding tools (Claude Code, Cursor, VS Code…)
 * start it with `npx -y @windesign-ds/mcp` and talk to it over stdio. It tells
 * them which components exist, how to use them, which classes are allowed, and
 * the rules that keep generated code on the design system.
 */

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
const data = loadData();
const rules = loadRules();
const groups = [...new Set(data.components.map((c) => c.group))].sort();

// 1. The server. `instructions` is shown to the model when it connects: how the tools fit together.
const server = new McpServer(
    { name: "windesign", title: "Windesign design system", version: pkg.version },
    {
        instructions:
            `Windesign is a React design system (@windesign-ds/react ${data.version}, ${data.components.length} components). ` +
            "When writing UI for a project that uses it: call get_rules once, search_components to find a component " +
            "instead of building one, get_component for its props and an example, and get_tokens for the allowed classes. " +
            "Use get_setup if the project doesn't have Windesign yet.",
    },
);

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const readOnly = { readOnlyHint: true, openWorldHint: false };

// 2. Tools: functions the AI decides to call.

server.registerTool(
    "search_components",
    {
        title: "Search components",
        description:
            `Search the ${data.components.length} Windesign components by what they do, e.g. 'rolling number', 'modal', ` +
            "'date range' or 'file upload'. Use it before writing UI, to find a component instead of building one.",
        inputSchema: {
            query: z.string().min(1).describe("What the component should do or be called, in a few words"),
            limit: z.number().int().min(1).max(20).optional().describe("How many results (default 8)"),
        },
        annotations: readOnly,
    },
    async ({ query, limit }) => {
        const results = search(data.components, query, limit ?? 8);
        if (!results.length) {
            return text(`No Windesign component matches "${query}". Try fewer or more general words (e.g. "menu", "chart", "input"), or list_components to browse.`);
        }
        return text(
            `${results.length} result${results.length === 1 ? "" : "s"} for "${query}". Call get_component with a name for props and an example.\n\n` +
                results.map((c, i) => componentLine(c, i)).join("\n\n"),
        );
    },
);

server.registerTool(
    "get_component",
    {
        title: "Get a component",
        description:
            "Everything about one Windesign component: what it does, its import, its props with types, a working " +
            "example, and how to add it (package or CLI). Pass a name from search_components, e.g. 'dynamic-island'.",
        inputSchema: { name: z.string().min(1).describe("The component's name, e.g. 'dynamic-island', 'Dynamic Island' or 'DynamicIsland'") },
        annotations: readOnly,
    },
    async ({ name }) => {
        const c = findComponent(data.components, name);
        if (!c) {
            // isError tells the AI the call failed; the text says how to recover.
            const close = suggest(data.components, name);
            return {
                isError: true,
                content: [{ type: "text" as const, text: `No component called "${name}".${close.length ? ` Did you mean: ${close.join(", ")}?` : ""} Use search_components to find one.` }],
            };
        }
        return text(componentDetails(c));
    },
);

server.registerTool(
    "list_components",
    {
        title: "List components",
        description: `List Windesign components, all of them or one group. Groups: ${groups.join(", ")}.`,
        inputSchema: { group: z.string().optional().describe(`One of: ${groups.join(", ")}`) },
        annotations: readOnly,
    },
    async ({ group }) => {
        const wanted = group?.toLowerCase();
        const picked = wanted ? data.components.filter((c) => c.group.toLowerCase() === wanted) : data.components;
        if (!picked.length) return { isError: true, content: [{ type: "text" as const, text: `No group called "${group}". Groups: ${groups.join(", ")}.` }] };
        const byGroup = new Map<string, string[]>();
        for (const c of picked) byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), `- ${c.name}: ${c.summary}`]);
        return text([...byGroup].map(([g, lines]) => `## ${g} (${lines.length})\n${lines.join("\n")}`).join("\n\n"));
    },
);

const KINDS = ["color", "text", "radius", "shadow", "spacing", "blur", "font", "ease"] as const;
server.registerTool(
    "get_tokens",
    {
        title: "Get design tokens",
        description:
            "The utility classes Windesign allows: semantic colours (bg-surface, text-fg-secondary, border-line…), text " +
            "styles (text-body-md…), radius roles (rounded-control-md…), shadows, sizes, blur, fonts and easing. Tailwind's " +
            "default palette and arbitrary values don't exist in these projects, so use only these.",
        inputSchema: { kind: z.enum(KINDS).optional().describe("Only one kind of token; leave out for all") },
        annotations: readOnly,
    },
    async ({ kind }) => text(tokenList(kind ? data.tokens.filter((g) => g.kind === kind) : data.tokens)),
);

server.registerTool(
    "get_rules",
    {
        title: "Get the design rules",
        description:
            "The rules for writing UI with Windesign: use the components, only semantic colour utilities, no arbitrary " +
            "values, no dark: classes, the system's focus styles. Read once before writing Windesign UI.",
        annotations: readOnly,
    },
    async () => text(rules),
);

server.registerTool(
    "get_setup",
    {
        title: "Get setup steps",
        description: "How to add Windesign to a React app: install, CSS, theme provider and a first component.",
        inputSchema: {
            framework: z.enum(["vite", "next"]).describe("The app's framework"),
            method: z
                .enum(["package", "cli"])
                .optional()
                .describe("'package' installs @windesign-ds/react (default); 'cli' copies component source with npx windesign-ds"),
        },
        annotations: readOnly,
    },
    async ({ framework, method }) => text(setupGuide(framework, method ?? "package")),
);

// 3. Resources: documents the app (or the user) can attach as context.

server.registerResource(
    "rules",
    "windesign://rules",
    { title: "Windesign design rules", description: "How to write UI that stays on the design system", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: rules }] }),
);

server.registerResource(
    "tokens",
    "windesign://tokens",
    { title: "Windesign tokens", description: "Every utility class the theme defines, by group", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: tokenList(data.tokens) }] }),
);

// 4. A prompt: a ready-made instruction the user picks from the app's prompt menu.

server.registerPrompt(
    "build_with_windesign",
    {
        title: "Build with Windesign",
        description: "Build a screen or component using Windesign's components and tokens",
        argsSchema: { task: z.string().describe("What to build, e.g. 'a settings page with a profile form'") },
    },
    ({ task }) => ({
        messages: [
            {
                role: "user" as const,
                content: {
                    type: "text" as const,
                    text:
                        `Build this with the Windesign design system: ${task}\n\n` +
                        "First read the rules below. Then use search_components and get_component to pick existing components " +
                        "(don't rebuild controls), get_tokens for classes, and get_setup if the project isn't set up yet.\n\n" +
                        rules,
                },
            },
        ],
    }),
);

// 5. Connect over stdio. Never console.log in a stdio server: stdout carries the messages.
await server.connect(new StdioServerTransport());
console.error(`windesign MCP server ${pkg.version}: ${data.components.length} components (docs: ${DOCS})`);
