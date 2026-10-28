"use client";

import { RiDropLine, RiHeartPulseLine, RiLungsLine, RiTempHotLine } from "@remixicon/react";
import { Avatar } from "../components/avatar/avatar";
import { Button } from "../components/button/button";
import { Notification } from "../components/notification/notification";
import { StatCard } from "../components/stat-card/stat-card";
import { LineChartCard } from "../charts/line-chart/line-chart-card";
import { SleepScoreCard } from "../charts/sleep-score/sleep-score-card";
import { StepsChartCard } from "../charts/steps-chart/steps-chart-card";
import { TemplatePage, TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * Medical Profile: a patient overview for a care team. Who the patient is,
 * the latest vitals with trends, sleep and activity from their wearable,
 * open alerts and current medication. All data is fictional.
 */

const HEART_RATE = ["Oct 15", "Oct 16", "Oct 17", "Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26", "Oct 27", "Oct 28"].map(
  (label, i) => ({ label, value: Math.round(68 - i * 0.5 + Math.sin(i * 1.3) * 3) }),
);

const MEDICATIONS = [
  { name: "Lisinopril", dose: "10 mg", schedule: "Once daily, morning" },
  { name: "Atorvastatin", dose: "20 mg", schedule: "Once daily, evening" },
  { name: "Vitamin D3", dose: "1000 IU", schedule: "Once daily" },
];

const FACTS = [
  ["Age", "54"],
  ["Blood type", "A+"],
  ["Height", "172 cm"],
  ["Weight", "78 kg"],
] as const;

export function MedicalProfile({ className }: TemplateProps) {
  return (
    <TemplateRoot className={className}>
      <TemplatePage title="Patient overview" description="Fictional patient, for demonstration only" actions={<Button size="sm" variant="secondary">Message care team</Button>}>
        <section aria-label="Patient" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 @3xl:flex-row @3xl:items-center">
          <div className="flex items-center gap-3">
            <Avatar size="lg" color="blue" initials="DO" alt="" />
            <div className="flex flex-col">
              <span className="text-headline-emphasis text-fg">Dana Okafor</span>
              <span className="text-body-sm text-fg-secondary">Patient ID 4471-208 · Dr. Priya Nair</span>
            </div>
          </div>
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 @3xl:grid-cols-4 @3xl:justify-items-end">
            {FACTS.map(([term, value]) => (
              <div key={term} className="flex flex-col">
                <dt className="text-caption text-fg-secondary">{term}</dt>
                <dd className="text-body-md-strong text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-tag-rose px-1.5 py-0.5 text-caption-strong text-tag-rose-fg">Allergy: penicillin</span>
            <span className="rounded-md bg-tag-yellow px-1.5 py-0.5 text-caption-strong text-tag-yellow-fg">Hypertension</span>
          </div>
        </section>

        <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4">
          <StatCard label="Resting heart rate" icon={RiHeartPulseLine} value={62} change={-0.06} invertTrend comparison="bpm, vs 2 weeks ago" data={HEART_RATE.map((d) => d.value)} />
          <StatCard label="Blood pressure" icon={RiDropLine} value={128} change={-0.04} invertTrend comparison="systolic mmHg" />
          <StatCard label="Oxygen saturation" icon={RiLungsLine} value={0.97} format={{ style: "percent" }} change={0} comparison="SpO₂" />
          <StatCard label="Temperature" icon={RiTempHotLine} value={36.8} format={{ maximumFractionDigits: 1 }} comparison="°C, this morning" />
        </div>

        <div className="grid gap-4 @4xl:grid-cols-2">
          <LineChartCard title="Resting heart rate" unit="bpm" target={65} data={HEART_RATE} color={3} />
          <SleepScoreCard />
        </div>

        <div className="grid gap-4 @4xl:grid-cols-[3fr_2fr]">
          <StepsChartCard goal={8000} />
          <div className="flex flex-col gap-4">
            <section aria-labelledby="med-alerts" className="flex flex-col gap-2">
              <h3 id="med-alerts" className="text-headline-emphasis text-fg">
                Alerts
              </h3>
              <Notification status="error" title="Blood pressure above target" description="Three readings over 135 systolic this week." timestamp="2d" dismissible={false} />
              <Notification status="information" title="Lab results ready" description="Lipid panel from Oct 24." timestamp="4d" dismissible={false} />
            </section>
            <section aria-labelledby="med-meds" className="flex flex-col gap-2">
              <h3 id="med-meds" className="text-headline-emphasis text-fg">
                Medication
              </h3>
              <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
                {MEDICATIONS.map((m) => (
                  <li key={m.name} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span className="flex flex-col">
                      <span className="text-body-md-strong text-fg">{m.name}</span>
                      <span className="text-body-sm text-fg-secondary">{m.schedule}</span>
                    </span>
                    <span className="text-body-sm-strong text-fg-secondary tabular-nums">{m.dose}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </TemplatePage>
    </TemplateRoot>
  );
}
