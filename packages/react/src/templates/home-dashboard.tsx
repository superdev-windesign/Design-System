"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { RiDownloadLine } from "@remixicon/react";
import { Button } from "../components/button/button";
import { DashboardSidebar, DASHBOARD_NAV } from "../blocks/sidebar/dashboard-sidebar";
import { DataTableExample } from "../blocks/data-table/data-table";
import { StatCards } from "../blocks/stat-cards/stat-cards";
import { OrdersChartCard } from "../charts/revenue-chart/orders-chart-card";
import { RevenueChartCard } from "../charts/revenue-chart/revenue-chart-card";
import { TemplatePage, TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Home Dashboard: the sidebar, KPI cards, this year's revenue against last,
 * orders, and the customers table: the first screen of an admin app.
 */

const NAV = DASHBOARD_NAV.map((item) => ({ ...item, href: `#nav-${item.key}` }));

export function HomeDashboard({ className }: TemplateProps) {
  const [selected, setSelected] = useState("home");
  // Nav rows are in-page anchors here; pick them up to move the selection.
  const onNavClick = (event: MouseEvent) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#nav-"]');
    if (!link) return;
    event.preventDefault();
    setSelected(link.getAttribute("href")!.slice("#nav-".length));
  };

  return (
    <TemplateRoot className={className}>
      <div className="hidden shrink-0 p-3 @3xl:block" onClickCapture={onNavClick}>
        <DashboardSidebar showThemeToggle={false} items={NAV} selected={selected} />
      </div>
      <TemplatePage
        title="Good morning, Alex"
        description="Here's how the store is doing this year."
        actions={
          <Button variant="secondary" size="sm" leadingIcon={RiDownloadLine}>
            Export
          </Button>
        }
      >
        <StatCards variant="plain" columns={2} />
        <div className="grid gap-4 @4xl:grid-cols-2">
          <RevenueChartCard />
          <OrdersChartCard />
        </div>
        <DataTableExample pageSize={6} />
      </TemplatePage>
    </TemplateRoot>
  );
}
