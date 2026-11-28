import { useState } from "react";
import {
  RiBookOpenLine,
  RiExternalLinkLine,
  RiListCheck2,
  RiPaletteLine,
  RiSearchLine,
  RiShapesLine,
  RiTerminalBoxLine,
} from "@remixicon/react";
import { Link, LinkButton, PillTab, PillTabList } from "@windesign-ds/react";
import { CodeBlock } from "./gated-code";
import type { IconComponent } from "@windesign-ds/react";
import { InstallCommand, cliCommand } from "./install-command";
import { REPO_URL } from "./meta";
import { Page, PageHeader, SectionHeading } from "./pages";

/**
 * #/ai: how to use Windesign from an AI coding tool. The MCP server
 * (@windesign-ds/mcp) tells the tool which components exist, their props and
 * examples, the allowed classes and the rules; the CLI copies components in.
 */

const CLIENTS = [
  {
    id: "claude-code",
    label: "Claude Code",
    note: "Run once in your project's terminal:",
    file: undefined,
    language: "bash",
    code: "claude mcp add windesign -- npx -y @windesign-ds/mcp",
  },
  {
    id: "cursor",
    label: "Cursor",
    note: "Add to .cursor/mcp.json in your project (or ~/.cursor/mcp.json for every project):",
    file: ".cursor/mcp.json",
    language: "json",
    code: `{
  "mcpServers": {
    "windesign": { "command": "npx", "args": ["-y", "@windesign-ds/mcp"] }
  }
}`,
  },
  {
    id: "vscode",
    label: "VS Code",
    note: "Add to .vscode/mcp.json in your project, then start it from the file's Start button:",
    file: ".vscode/mcp.json",
    language: "json",
    code: `{
  "servers": {
    "windesign": { "type": "stdio", "command": "npx", "args": ["-y", "@windesign-ds/mcp"] }
  }
}`,
  },
  {
    id: "desktop",
    label: "Claude Desktop, Windsurf",
    note: "Add to the app's MCP settings file (claude_desktop_config.json, or Windsurf's mcp_config.json), then restart the app:",
    file: "MCP settings",
    language: "json",
    code: `{
  "mcpServers": {
    "windesign": { "command": "npx", "args": ["-y", "@windesign-ds/mcp"] }
  }
}`,
  },
] as const;

const TOOLS: { name: string; icon: IconComponent; text: string }[] = [
  { name: "search_components", icon: RiSearchLine, text: "Finds components by what they do: “rolling number”, “date range”, “file upload”." },
  { name: "get_component", icon: RiShapesLine, text: "One component's import, props with types, a working example and how to add it." },
  { name: "get_tokens", icon: RiPaletteLine, text: "The classes that exist: semantic colours, text styles, radius roles, shadows." },
  { name: "get_rules", icon: RiListCheck2, text: "The rules that keep code on the system: no hex, no arbitrary values, no dark:." },
  { name: "get_setup", icon: RiTerminalBoxLine, text: "Setup for Vite or Next.js, with the package or the CLI." },
  { name: "list_components", icon: RiBookOpenLine, text: "Every component, or one group: Forms, Overlays, Charts…" },
];

const PROMPTS = [
  "Add a settings page with a profile form and a theme switch, using Windesign.",
  "Show monthly revenue in a card with a rolling number and a sparkline.",
  "Replace this hand-made modal with Windesign's Dialog.",
  "Which Windesign component fits a date range with presets?",
];

function ClientSetup() {
  const [client, setClient] = useState<(typeof CLIENTS)[number]["id"]>("claude-code");
  const current = CLIENTS.find((c) => c.id === client)!;
  return (
    <div className="flex flex-col gap-3">
      <PillTabList aria-label="AI tool">
        {CLIENTS.map((c) => (
          <PillTab key={c.id} isSelected={client === c.id} onSelect={() => setClient(c.id)}>
            {c.label}
          </PillTab>
        ))}
      </PillTabList>
      <p className="text-body-md text-fg-secondary">{current.note}</p>
      <CodeBlock code={current.code} language={current.language} title={current.file} />
    </div>
  );
}

export function AiPage() {
  return (
    <Page className="gap-16 py-10 sm:gap-20 sm:py-14">
      <PageHeader
        crumbs={[{ label: "Use with AI" }]}
        title="Use Windesign with AI"
        lead="Connect your AI coding tool to Windesign's MCP server and it builds with the real components, their props and the system's tokens, instead of guessing."
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <LinkButton href="https://www.npmjs.com/package/@windesign-ds/mcp" target="_blank" rel="noreferrer" variant="secondary" size="small" trailingIcon={RiExternalLinkLine}>
            @windesign-ds/mcp on npm
          </LinkButton>
          <span className="text-body-sm text-fg-secondary">Runs on your computer through npx. Nothing to host, no account.</span>
        </div>
      </PageHeader>

      <section aria-labelledby="connect" className="flex flex-col gap-8">
        <SectionHeading id="connect" title="1. Connect the server" description="One line or one file, depending on your tool. It needs Node.js 20 or newer." />
        <ClientSetup />
      </section>

      <section aria-labelledby="ask" className="flex flex-col gap-8">
        <SectionHeading
          id="ask"
          title="2. Ask as usual"
          description="Mention Windesign and the tool looks components up before it writes code. For example:"
        />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PROMPTS.map((prompt) => (
            <li key={prompt} className="rounded-surface border border-line bg-surface p-4 text-body-md text-fg">
              “{prompt}”
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="knows" className="flex flex-col gap-8">
        <SectionHeading
          id="knows"
          title="What the server knows"
          description="Everything comes from the source when the server is published, so it matches the components' version exactly."
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ name, icon: Icon, text }) => (
            <li key={name} className="flex flex-col gap-3 rounded-surface border border-line bg-surface p-5">
              <span aria-hidden className="flex size-9 items-center justify-center rounded-control-md bg-muted text-icon">
                <Icon className="size-4.5" />
              </span>
              <code className="font-code text-body-sm-strong text-fg">{name}</code>
              <p className="text-body-md text-fg-secondary">{text}</p>
            </li>
          ))}
        </ul>
        <p className="text-body-md text-fg-secondary">
          It also offers the rules and tokens as resources (<code className="font-code text-fg">windesign://rules</code>,{" "}
          <code className="font-code text-fg">windesign://tokens</code>) and a <code className="font-code text-fg">build_with_windesign</code> prompt. Read{" "}
          <Link href={`${REPO_URL}/blob/main/packages/mcp/content/rules.md`} isExternal target="_blank" rel="noreferrer">
            the rules it follows
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="cli" className="flex flex-col gap-8">
        <SectionHeading
          id="cli"
          title="Copy components in"
          description="The AI, or you, can add any component as source with the CLI. It copies the files the component uses and installs its packages."
        />
        <InstallCommand label="Add with the CLI" command={(m) => cliCommand(m, "add context-menu")} />
      </section>

      <section aria-labelledby="try" className="flex flex-col gap-8">
        <SectionHeading id="try" title="Try the server on its own" description="The MCP Inspector opens a page where you can call each tool by hand and see the messages." />
        <CodeBlock code="npx @modelcontextprotocol/inspector npx -y @windesign-ds/mcp" language="bash" />
      </section>
    </Page>
  );
}
