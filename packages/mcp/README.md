# @windesign-ds/mcp

An [MCP](https://modelcontextprotocol.io) server for the Windesign design
system. Add it to your AI coding tool and it can find the right Windesign
component, read its props and a working example, and follow the rules that
keep generated code on the system (semantic colours only, no arbitrary values,
the system's focus styles).

It runs locally through `npx` and needs nothing else: the component data ships
inside the package, matching `@windesign-ds/react` 0.1.

## Add it to your tool

**Claude Code**

```sh
claude mcp add windesign -- npx -y @windesign-ds/mcp
```

**Cursor** (`.cursor/mcp.json`), **Windsurf** and **Claude Desktop**

```json
{
  "mcpServers": {
    "windesign": { "command": "npx", "args": ["-y", "@windesign-ds/mcp"] }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "windesign": { "type": "stdio", "command": "npx", "args": ["-y", "@windesign-ds/mcp"] }
  }
}
```

Then ask for UI as usual, for example *"Add a settings page with a profile form
and a theme switch, using Windesign."*

## What it offers

| Tool | What it returns |
| --- | --- |
| `search_components` | Components matching what you describe ("rolling number", "date range") |
| `get_component` | One component: import, props with types, a working example, how to add it |
| `list_components` | Every component, or one group (Forms, Overlays, Charts…) |
| `get_tokens` | The allowed utility classes: colours, text styles, radius, shadows… |
| `get_rules` | The rules for writing UI with the system |
| `get_setup` | Setup steps for Vite or Next.js, with the package or the CLI |

Resources: `windesign://rules` and `windesign://tokens`. Prompt:
`build_with_windesign`.

## Try it

```sh
npx @modelcontextprotocol/inspector npx -y @windesign-ds/mcp
```

MIT licence. Docs and every component live: https://galactic-deepskyblue-toad-85.hostingersite.com
