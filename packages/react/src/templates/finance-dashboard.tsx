"use client";

import { useState } from "react";
import { RiBankCardLine, RiHandCoinLine, RiWallet3Line } from "@remixicon/react";
import { SegmentedControl, SegmentedControlItem } from "../components/segmented-control/segmented-control";
import { StatCard } from "../components/stat-card/stat-card";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "../components/table/table";
import { RadialChartCard } from "../charts/radial-chart/radial-chart-card";
import { SankeyChartCard } from "../charts/sankey-chart/sankey-chart-card";
import { cx } from "../utils/cx";
import { TemplatePage, TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Finance Dashboard: balance, income and spending with trends, where the
 * money went this month as a Sankey, budgets as rings, and recent
 * transactions.
 */

const PERIODS = { month: 1, quarter: 3, year: 12 } as const;
type Period = keyof typeof PERIODS;

const series = (start: number, drift: number, n = 12) =>
  Array.from({ length: n }, (_, i) => Math.round(start * (1 + drift * i + Math.sin(i * 1.7) * 0.04)));

const CASH_FLOW = {
  nodes: [{ name: "Income" }, { name: "Housing" }, { name: "Groceries" }, { name: "Transport" }, { name: "Savings" }, { name: "Fun" }, { name: "Rent" }, { name: "Utilities" }],
  links: [
    { source: 0, target: 1, value: 2100 },
    { source: 0, target: 2, value: 640 },
    { source: 0, target: 3, value: 320 },
    { source: 0, target: 4, value: 1400 },
    { source: 0, target: 5, value: 540 },
    { source: 1, target: 6, value: 1850 },
    { source: 1, target: 7, value: 250 },
  ],
};

const BUDGETS = [
  { label: "Groceries", used: 640, limit: 800 },
  { label: "Transport", used: 320, limit: 400 },
  { label: "Fun", used: 540, limit: 500 },
];

const TRANSACTIONS = [
  { id: "t1", merchant: "Greenleaf Market", category: "Groceries", date: "Oct 27", amount: -86.4 },
  { id: "t2", merchant: "Payroll · Acme Inc.", category: "Income", date: "Oct 25", amount: 5000 },
  { id: "t3", merchant: "City Transit", category: "Transport", date: "Oct 24", amount: -42 },
  { id: "t4", merchant: "Riverside Apartments", category: "Housing", date: "Oct 22", amount: -1850 },
  { id: "t5", merchant: "Cinema Nova", category: "Fun", date: "Oct 21", amount: -28.5 },
  { id: "t6", merchant: "Spark Energy", category: "Housing", date: "Oct 20", amount: -112.3 },
];

const CATEGORY_TONE: Record<string, string> = {
  Income: "bg-tag-lime text-tag-lime-fg",
  Housing: "bg-tag-blue text-tag-blue-fg",
  Groceries: "bg-tag-orange text-tag-orange-fg",
  Transport: "bg-tag-cyan text-tag-cyan-fg",
  Fun: "bg-tag-purple text-tag-purple-fg",
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "exceptZero" });

export function FinanceDashboard({ className }: TemplateProps) {
  const [period, setPeriod] = useState<Period>("month");
  const n = PERIODS[period];
  const balance = series(18000, 0.03);
  const income = series(5000, 0.01);
  const spending = series(4100, 0.015);
  const sum = (s: number[]) => s.slice(-n).reduce((a, b) => a + b, 0);
  // Balance change across the period: from its start (or the first month for a year) to now.
  const balanceChange = balance[11]! / balance[Math.max(0, 11 - n)]! - 1;

  return (
    <TemplateRoot className={className}>
      <TemplatePage
        title="Finance"
        description="Personal account, October 2026"
        actions={
          <SegmentedControl
            aria-label="Period"
            selectedKeys={[period]}
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (next) setPeriod(next as Period);
            }}
          >
            <SegmentedControlItem id="month">Month</SegmentedControlItem>
            <SegmentedControlItem id="quarter">Quarter</SegmentedControlItem>
            <SegmentedControlItem id="year">Year</SegmentedControlItem>
          </SegmentedControl>
        }
      >
        <div className="grid gap-4 @3xl:grid-cols-3">
          <StatCard label="Balance" icon={RiWallet3Line} value={balance[11]!} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} change={balanceChange} comparison={`vs ${n === 1 ? "last month" : `${n} months ago`}`} data={balance} />
          <StatCard label="Income" icon={RiHandCoinLine} value={sum(income)} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} change={0.06} comparison="vs same period last year" data={income} />
          <StatCard label="Spending" icon={RiBankCardLine} value={sum(spending)} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} change={0.021} invertTrend comparison="vs same period last year" data={spending} />
        </div>
        <div className="grid gap-4 @4xl:grid-cols-[3fr_2fr]">
          <SankeyChartCard data={CASH_FLOW} title="Cash flow" formatValue={(v) => `$${v.toLocaleString("en-US")}`} />
          <RadialChartCard data={BUDGETS} title="Budgets" formatValue={(v) => `$${v.toLocaleString("en-US")}`} />
        </div>
        <section aria-labelledby="fin-tx" className="flex flex-col gap-3">
          <h3 id="fin-tx" className="text-headline-emphasis text-fg">
            Recent transactions
          </h3>
          <Table aria-labelledby="fin-tx">
            <TableHeader>
              <TableColumn isRowHeader>Merchant</TableColumn>
              <TableColumn>Category</TableColumn>
              <TableColumn>Date</TableColumn>
              <TableColumn className="text-end">Amount</TableColumn>
            </TableHeader>
            <TableBody items={TRANSACTIONS}>
              {(tx) => (
                <TableRow id={tx.id}>
                  <TableCell>{tx.merchant}</TableCell>
                  <TableCell>
                    <span className={cx("rounded-md px-1.5 py-0.5 text-caption-strong", CATEGORY_TONE[tx.category])}>{tx.category}</span>
                  </TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell className={cx("text-end tabular-nums", tx.amount > 0 ? "text-status-success-text" : "text-fg")}>{money.format(tx.amount)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
      </TemplatePage>
    </TemplateRoot>
  );
}
