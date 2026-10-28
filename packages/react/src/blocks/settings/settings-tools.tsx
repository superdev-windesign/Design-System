"use client";
// Adapted from BoardUI (MIT) — components/application/settings/settings-tools.tsx. See THIRD_PARTY_NOTICES.md.

import { useTemplateCopy } from "../../foundations/template-copy";

import { useState, type ReactNode } from "react";
import { RiAddLine, RiMoreFill } from "@remixicon/react";
import { Chip } from "../../components/badges/chip";
import { Button } from "../../components/button/button";
import { PillTab, PillTabList } from "../../components/tabs/pill-tab";
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "../../components/dropdown/dropdown";
import { Switch } from "../../components/switch/switch";
import { ChevronUpDownSmall } from "../../icons/chevrons";
import { cx } from "../../utils/cx";
import { SettingsCard, SettingsRow, SettingsSectionLabel } from "./settings-rows";

/**
 * The settings modal's Tools page — MCP server management, structured after
 * the classic tools/servers settings layout: a scope switcher (per-project
 * pills), an Authentication toggle, the selected scope's server list, an
 * empty-state Team section, and the global Plugin servers.
 *
 * No Figma frame for this page — composed from the settings modal's own
 * recipes (SettingsCard/SettingsRow chrome, Switch, secondary Buttons, the
 * dropdown menu pattern) plus page-local pieces that follow the system:
 * icon tiles use the inbox-feed swatch pairs (bg-*-200 / text-*-700), the
 * status dot is ringed with the card background like the sidebar's badge
 * treatments, and the expandable tool list reuses the grid-rows grow
 * transition from the Storage table.
 */

/* ------------------------------------------------------------------- data */

type ServerStatus = "connected" | "error";

interface McpServer {
  id: string;
  name: string;
  /** Letter tile — bg/text pair from the swatch palette. */
  initial: string;
  tileClass: string;
  status: ServerStatus;
  /** e.g. "26 tools, 1 prompts, 104 resources enabled" */
  summary?: string;
  /** Names revealed by the expander chevron. */
  tools?: string[];
}

const SERVERS = {
  astro: {
    id: "astro",
    name: "astro",
    initial: "A",
    tileClass: "bg-muted text-fg-secondary",
    status: "error",
  },
  figma: {
    id: "figma",
    name: "Figma",
    initial: "F",
    tileClass: "bg-avatar-pink text-avatar-pink-fg",
    status: "connected",
    summary: "26 tools, 1 prompts, 104 resources enabled",
    tools: ["get_design_context", "get_metadata", "get_screenshot", "get_variable_defs", "create_new_file"],
  },
  paper: {
    id: "paper",
    name: "paper",
    initial: "P",
    tileClass: "bg-tag-blue text-tag-blue-fg",
    status: "error",
  },
  posthog: {
    id: "posthog",
    name: "posthog",
    initial: "P",
    tileClass: "bg-tag-yellow text-tag-yellow-fg",
    status: "connected",
    summary: "521 tools, 173 resources enabled",
    tools: ["query_insights", "list_dashboards", "capture_event", "feature_flags", "session_recordings"],
  },
  vercel: {
    id: "vercel",
    name: "vercel",
    initial: "V",
    tileClass: "bg-social-dark text-on-action",
    status: "connected",
    summary: "30 tools, 13 prompts enabled",
    tools: ["list_deployments", "get_build_logs", "promote_deployment", "env_variables"],
  },
} satisfies Record<string, McpServer>;

/** Per-scope server lists — switching a pill swaps the section below. */
const SCOPES: { id: string; label: string; servers: McpServer[] }[] = [
  { id: "home", label: "Home", servers: [SERVERS.astro, SERVERS.figma] },
  { id: "acme", label: "acme", servers: [SERVERS.figma, SERVERS.vercel] },
  { id: "iospoke", label: "iospoke", servers: [SERVERS.astro] },
  { id: "mideo", label: "mideo", servers: [SERVERS.posthog] },
  { id: "daily", label: "Daily Task", servers: [SERVERS.figma] },
  { id: "poke", label: "poke-1", servers: [] },
  { id: "cloud", label: "Cloud", servers: [SERVERS.vercel, SERVERS.posthog] },
];

const PLUGIN_SERVERS: McpServer[] = [SERVERS.paper, SERVERS.posthog, SERVERS.vercel];

/* ----------------------------------------------------------------- pieces */

/** 32px rounded-sm letter tile with a connection dot pinned to its corner,
 *  ringed in the card background so it reads as punched-through. */
function ServerTile({ server }: { server: McpServer }) {
  const localize = useTemplateCopy();
  return localize((
    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg">
      <span
        className={cx(
          "flex size-8 items-center justify-center rounded-lg text-body-sm-strong",
          server.tileClass,
        )}
      >
        {server.initial}
      </span>
      <span
        aria-hidden
        className={cx(
          "absolute -bottom-0.5 -start-0.5 size-2.5 rounded-full ring-2 ring-sunken",
          server.status === "connected" ? "bg-status-success-solid" : "bg-status-danger-solid",
        )}
      />
    </span>
  ));
}

/** Bare "…" row action — quieter than IconButton on the grey card, same
 *  hover language as the sidebar rows. Opens the shared dropdown menu. */
function ServerMenu({ name }: { name: string }) {
  const localize = useTemplateCopy();
  const [isOpen, setIsOpen] = useState(false);
  return localize((
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger
        aria-label={`Actions for ${name}`}
        className={cx(
          "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
          "text-icon-secondary outline-none transition-colors duration-150 ease",
          "hover:bg-sunken-hover focus-visible:outline-2 focus-visible:outline-focus",
          isOpen && "bg-sunken-hover",
        )}
      >
        <RiMoreFill className="size-4 shrink-0" aria-hidden />
      </DropdownTrigger>
      <DropdownPopover aria-label={`Actions for ${name}`} placement="bottom end" className="w-45 p-2">
        <DropdownGroup>
          {["Show output", "Refresh tools", "Remove server"].map((label) => (
            <DropdownItem key={label} onSelect={() => setIsOpen(false)} className="px-2 py-1.5">
              <span className="truncate text-body-md-strong whitespace-nowrap text-fg">{label}</span>
            </DropdownItem>
          ))}
        </DropdownGroup>
      </DropdownPopover>
    </Dropdown>
  ));
}

/** Quiet inline text action ("Logout", "Show Output"). */
function InlineAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const localize = useTemplateCopy();
  return localize((
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "cursor-pointer rounded-sm text-body-sm whitespace-nowrap text-fg-tertiary",
        "outline-none transition-colors duration-150 ease",
        "hover:text-fg-secondary focus-visible:outline-2 focus-visible:outline-focus",
      )}
    >
      {children}
    </button>
  ));
}

function ServerRow({ server }: { server: McpServer }) {
  const localize = useTemplateCopy();
  const [expanded, setExpanded] = useState(false);
  return localize((
    <div className="border-b border-separator py-2.5 pe-2.5 last:border-b-0">
      <div className="flex w-full items-center gap-2.5">
        <ServerTile server={server} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-2">
            <p className="text-body-md-strong whitespace-nowrap text-fg">{server.name}</p>
            <InlineAction>Logout</InlineAction>
          </div>
          {server.status === "connected" ? (
            <div className="flex items-center gap-1">
              <p className="truncate text-body-sm text-fg-secondary">{server.summary}</p>
              {server.tools && (
                <button
                  type="button"
                  aria-label={`${expanded ? "Hide" : "Show"} ${server.name} tools`}
                  aria-expanded={expanded}
                  onClick={() => setExpanded((v) => !v)}
                  className={cx(
                    "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs",
                    "text-icon-tertiary outline-none transition-colors duration-150 ease",
                    "hover:text-icon-secondary focus-visible:outline-2 focus-visible:outline-focus",
                  )}
                >
                  <ChevronUpDownSmall className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-body-sm whitespace-nowrap text-fg-secondary">Error</p>
              <span className="text-body-sm text-fg-tertiary">–</span>
              <InlineAction>Show Output</InlineAction>
            </div>
          )}
        </div>
        <ServerMenu name={server.name} />
      </div>

      {/* Expandable tool chips — same grid-rows grow transition as the
          Storage table's new-row entrance, but as a two-way toggle. */}
      {server.tools && (
        <div
          className={cx(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 pt-2 ps-10.5">
              {server.tools.map((tool) => (
                <Chip key={tool} variant="caption" color="soft">
                  {tool}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  ));
}

function NewServerRow() {
  const localize = useTemplateCopy();
  return localize((
    <button
      type="button"
      className={cx(
        "group flex w-full cursor-pointer items-center gap-2.5 py-2.5 pe-2.5 text-start",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
      )}
    >
      <span
        className={cx(
          "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted",
          "transition-colors duration-150 ease group-hover:bg-muted-hover",
        )}
      >
        <RiAddLine className="size-5 shrink-0 text-icon-secondary" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-body-md-strong whitespace-nowrap text-fg">New MCP Server</span>
        <span className="text-body-sm whitespace-nowrap text-fg-secondary">
          Add a Custom MCP Server
        </span>
      </span>
    </button>
  ));
}

/* ------------------------------------------------------------------- page */

export function SettingsTools() {
  const localize = useTemplateCopy();
  const [scopeId, setScopeId] = useState("home");
  const [waitForAuth, setWaitForAuth] = useState(true);
  const scope = SCOPES.find((s) => s.id === scopeId) ?? SCOPES[0]!;

  return localize((
    <div className="flex w-full flex-col gap-6">
      {/* Scope switcher — the shared fully-rounded pill tabs (same component
          as the AI chat panel's Changes/Browser switcher). */}
      <PillTabList
        aria-label="Project scope"
        className="-mx-1 flex w-[calc(100%+8px)] overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SCOPES.map((s) => (
          <PillTab key={s.id} variant="gray" isSelected={s.id === scopeId} onSelect={() => setScopeId(s.id)}>
            {s.label}
          </PillTab>
        ))}
      </PillTabList>

      {/* Authentication */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel className="px-2">Authentication</SettingsSectionLabel>
        <SettingsCard>
          <SettingsRow
            label="Wait for MCP Authentication"
            description="Wait indefinitely to authenticate when prompted. When off, skip authentication prompts after 30 seconds."
          >
            <Switch isSelected={waitForAuth} onChange={setWaitForAuth} aria-label="Wait for MCP authentication" />
          </SettingsRow>
        </SettingsCard>
      </div>

      {/* Scope servers */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-0.5">
          <SettingsSectionLabel className="px-2">{scope.label} MCP Servers</SettingsSectionLabel>
          <p className="w-full px-2 text-body-sm text-fg-tertiary">
            Servers available from {scope.label}.
          </p>
        </div>
        <SettingsCard>
          {scope.servers.map((server) => (
            <ServerRow key={server.id} server={server} />
          ))}
          <NewServerRow />
        </SettingsCard>
      </div>

      {/* Team servers — empty state */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <SettingsSectionLabel className="px-2">Team MCP Servers</SettingsSectionLabel>
            <p className="w-full px-2 text-body-sm text-fg-tertiary">
              Configured in the dashboard
            </p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0">
            Manage
          </Button>
        </div>
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-sunken px-6 py-8">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-body-md-strong text-fg">No Team MCP Servers</p>
            <p className="max-w-90 text-body-sm text-fg-secondary">
              Configure MCP servers in the dashboard to make them available in BoardUI on desktop
              and in the cloud.
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Configure Team MCP Servers
          </Button>
        </div>
      </div>

      {/* Plugin servers */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel className="px-2">Plugin MCP Servers</SettingsSectionLabel>
        <SettingsCard>
          {PLUGIN_SERVERS.map((server) => (
            <ServerRow key={server.id} server={server} />
          ))}
        </SettingsCard>
      </div>
    </div>
  ));
}
