"use client";

import { RiAdvertisementLine, RiArrowLeftRightLine, RiCoinsLine, RiUserAddLine } from "@remixicon/react";
import { Button } from "../components/button/button";
import { StatCard } from "../components/stat-card/stat-card";
import { StatusDot } from "../components/status-dot/status-dot";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "../components/table/table";
import { AreaChartCard } from "../charts/area-chart/area-chart-card";
import { FunnelChartCard } from "../charts/funnel-chart/funnel-chart-card";
import { StageBarsCard } from "../charts/stage-bars/stage-bars-card";
import { TemplatePage, TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Marketing Dashboard: spend and return at a glance, the acquisition funnel,
 * spend by channel over time, lead stages, and the running campaigns.
 */

const trend = (start: number, drift: number) => Array.from({ length: 10 }, (_, i) => Math.round(start * (1 + drift * i + Math.cos(i) * 0.05)));

const CAMPAIGNS = [
  { id: "c1", name: "Autumn launch", channel: "Paid search", status: "live", spend: 12400, conversions: 418 },
  { id: "c2", name: "Webinar series", channel: "Email", status: "live", spend: 3100, conversions: 236 },
  { id: "c3", name: "Partner bundle", channel: "Referral", status: "paused", spend: 5600, conversions: 141 },
  { id: "c4", name: "Retargeting Q4", channel: "Social", status: "live", spend: 8900, conversions: 302 },
  { id: "c5", name: "Brand video", channel: "Video", status: "ended", spend: 15200, conversions: 188 },
];

const STATUS = { live: { color: "green", label: "Live" }, paused: { color: "yellow", label: "Paused" }, ended: { color: "indigo", label: "Ended" } } as const;
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function MarketingDashboard({ className }: TemplateProps) {
  const spend = trend(9800, 0.03);
  const signups = trend(1200, 0.04);
  return (
    <TemplateRoot className={className}>
      <TemplatePage title="Marketing" description="Last 10 weeks across all channels" actions={<Button size="sm">New campaign</Button>}>
        <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4">
          <StatCard label="Spend" icon={RiAdvertisementLine} value={45200} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} change={0.08} invertTrend data={spend} />
          <StatCard label="Signups" icon={RiUserAddLine} value={1285} change={0.14} data={signups} />
          <StatCard label="Cost per signup" icon={RiCoinsLine} value={35.17} format={{ style: "currency", currency: "USD" }} change={-0.05} invertTrend />
          <StatCard label="Return on spend" icon={RiArrowLeftRightLine} value={3.4} format={{ maximumFractionDigits: 1 }} change={0.09} />
        </div>
        <div className="grid gap-4 @4xl:grid-cols-2">
          <FunnelChartCard title="Acquisition funnel" />
          <AreaChartCard title="Visitors by channel" defaultMode="overlap" />
        </div>
        <div className="grid gap-4 @4xl:grid-cols-[2fr_3fr]">
          <StageBarsCard
            title="Lead stages"
            data={[
              { label: "Leads", value: 3820 },
              { label: "Qualified", value: 1460 },
              { label: "Demo", value: 512 },
              { label: "Proposal", value: 198 },
              { label: "Won", value: 87 },
            ]}
          />
          <section aria-labelledby="mkt-campaigns" className="flex min-w-0 flex-col gap-3">
            <h3 id="mkt-campaigns" className="text-headline-emphasis text-fg">
              Campaigns
            </h3>
            <Table aria-labelledby="mkt-campaigns">
              <TableHeader>
                <TableColumn isRowHeader>Campaign</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn className="text-end">Spend</TableColumn>
                <TableColumn className="text-end">Signups</TableColumn>
                <TableColumn className="text-end">Per signup</TableColumn>
              </TableHeader>
              <TableBody items={CAMPAIGNS}>
                {(c) => (
                  <TableRow id={c.id}>
                    <TableCell>
                      <span className="flex flex-col">
                        <span className="text-body-md-strong text-fg">{c.name}</span>
                        <span className="text-body-sm text-fg-secondary">{c.channel}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <StatusDot color={STATUS[c.status as keyof typeof STATUS].color} />
                        {STATUS[c.status as keyof typeof STATUS].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{usd.format(c.spend)}</TableCell>
                    <TableCell className="text-end tabular-nums">{c.conversions}</TableCell>
                    <TableCell className="text-end tabular-nums">{usd.format(c.spend / c.conversions)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        </div>
      </TemplatePage>
    </TemplateRoot>
  );
}
