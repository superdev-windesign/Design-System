"use client";

import { useState } from "react";
import { RiMapPin2Line, RiUserFollowLine, RiUserAddLine } from "@remixicon/react";
import { Avatar } from "../components/avatar/avatar";
import { Button } from "../components/button/button";
import { BarListCard } from "../charts/bar-list/bar-list-card";
import { ContributionsCard } from "../charts/contributions/contributions-card";
import { MostActiveDaysCard } from "../charts/most-active-days/most-active-days-card";
import { RadarChartCard } from "../charts/radar-chart/radar-chart-card";
import { TemplatePage, TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * AI Profile: one person's year with AI tools. Who they are, how often they
 * work with agents (contributions), where they're strongest against the team,
 * which days they're busiest and which models and tools they lean on.
 */

const STATS = [
  ["Prompts", "4,812"],
  ["Agents built", "12"],
  ["Day streak", "23"],
] as const;

const USAGE = {
  models: {
    label: "Models",
    rows: [
      { label: "Balanced", value: 2410 },
      { label: "Deep reasoning", value: 1320 },
      { label: "Fast", value: 860 },
      { label: "Vision", value: 222 },
    ],
  },
  tools: {
    label: "Tools",
    rows: [
      { label: "Web search", value: 1640 },
      { label: "Code runner", value: 1180 },
      { label: "File reader", value: 940 },
      { label: "Calendar", value: 310 },
    ],
  },
  agents: {
    label: "Agents",
    rows: [
      { label: "Release helper", value: 920 },
      { label: "Research scout", value: 610 },
      { label: "Inbox triage", value: 480 },
      { label: "Data analyst", value: 395 },
    ],
  },
};

const STRENGTHS = [
  { axis: "Writing", a: 88, b: 72 },
  { axis: "Code", a: 74, b: 70 },
  { axis: "Research", a: 91, b: 66 },
  { axis: "Data", a: 63, b: 69 },
  { axis: "Design", a: 80, b: 58 },
  { axis: "Planning", a: 85, b: 64 },
];

export function AiProfile({ className }: TemplateProps) {
  const [following, setFollowing] = useState(false);
  return (
    <TemplateRoot className={className}>
      <TemplatePage title="Profile">
        <section aria-label="About" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 @3xl:flex-row @3xl:items-center">
          <Avatar size="lg" color="pink" initials="MC" alt="" className="size-16 text-title-sm-emphasis" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-title-sm-emphasis text-fg">Mia Chen</span>
              <span className="text-body-md text-fg-secondary">@miachen</span>
            </div>
            <p className="text-body-md text-fg-secondary">Product designer. Builds small agents that clear the boring parts of the week.</p>
            <span className="flex items-center gap-1 text-body-sm text-fg-secondary">
              <RiMapPin2Line aria-hidden className="size-4" /> Lisbon
            </span>
          </div>
          <dl className="flex gap-6">
            {STATS.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-caption text-fg-secondary">{label}</dt>
                <dd className="text-title-sm-emphasis text-fg tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <Button
            size="sm"
            variant={following ? "secondary" : "primary"}
            leadingIcon={following ? RiUserFollowLine : RiUserAddLine}
            aria-pressed={following}
            onPress={() => setFollowing((f) => !f)}
          >
            {following ? "Following" : "Follow"}
          </Button>
        </section>

        <ContributionsCard title="Activity" unit="prompts" />

        <div className="grid gap-4 @4xl:grid-cols-2">
          <RadarChartCard title="Strengths" data={STRENGTHS} labels={{ a: "Mia", b: "Team average" }} />
          <MostActiveDaysCard unit="prompts" />
        </div>
        <BarListCard title="Most used" data={USAGE} barClassName="bg-chart-3/35" />
      </TemplatePage>
    </TemplateRoot>
  );
}
