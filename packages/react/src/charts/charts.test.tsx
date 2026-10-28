import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import type { ComponentType } from "react";
import { ActivityRingsCard } from "./activity-rings/activity-rings-card";
import { AreaChartCard } from "./area-chart/area-chart-card";
import { BarListCard } from "./bar-list/bar-list-card";
import { ComboChartCard } from "./combo-chart/combo-chart-card";
import { ContributionsCard } from "./contributions/contributions-card";
import { EarningsChartCard } from "./earnings-chart/earnings-chart-card";
import { FunnelChartCard } from "./funnel-chart/funnel-chart-card";
import { HeatmapChartCard } from "./heatmap-chart/heatmap-chart-card";
import { LineChartCard } from "./line-chart/line-chart-card";
import { MostActiveDaysCard } from "./most-active-days/most-active-days-card";
import { RadarChartCard } from "./radar-chart/radar-chart-card";
import { RadialChartCard } from "./radial-chart/radial-chart-card";
import { SankeyChartCard } from "./sankey-chart/sankey-chart-card";
import { ScatterChartCard } from "./scatter-chart/scatter-chart-card";
import { SleepScoreCard } from "./sleep-score/sleep-score-card";
import { StageBarsCard } from "./stage-bars/stage-bars-card";
import { StepsChartCard } from "./steps-chart/steps-chart-card";
import { describeChange } from "./shared/chart-card";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const CARDS: [string, ComponentType, string][] = [
  ["ActivityRingsCard", ActivityRingsCard, "Today's goals"],
  ["AreaChartCard", AreaChartCard, "Visitors by channel"],
  ["BarListCard", BarListCard, "Top sources"],
  ["ComboChartCard", ComboChartCard, "Signups and conversion"],
  ["ContributionsCard", ContributionsCard, "Contributions"],
  ["EarningsChartCard", EarningsChartCard, "Payouts"],
  ["FunnelChartCard", FunnelChartCard, "Checkout funnel"],
  ["HeatmapChartCard", HeatmapChartCard, "Orders by hour"],
  ["LineChartCard", LineChartCard, "API latency (p95)"],
  ["MostActiveDaysCard", MostActiveDaysCard, "Most active days"],
  ["RadarChartCard", RadarChartCard, "Release quality"],
  ["RadialChartCard", RadialChartCard, "Storage used"],
  ["SankeyChartCard", SankeyChartCard, "Where revenue went"],
  ["ScatterChartCard", ScatterChartCard, "Deal size vs. time to close"],
  ["SleepScoreCard", SleepScoreCard, "Sleep score"],
  ["StageBarsCard", StageBarsCard, "Hiring pipeline"],
  ["StepsChartCard", StepsChartCard, "Daily steps"],
];

describe.each(CARDS)("%s", (_, Card, title) => {
  it("is a figure named by its title and described in words", () => {
    render(<Card />);
    const figure = screen.getByRole("figure", { name: title });
    // The text alternative must carry the data, not just repeat the title.
    expect(figure.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)!.textContent!.length).toBeGreaterThan(title.length + 10);
  });
});

describe("chart toggles", () => {
  it("switches the earnings range and updates the headline", async () => {
    const user = userEvent.setup();
    render(<EarningsChartCard />);
    // The headline is the bare amount; the caption below it has more words.
    const headline = () => screen.getByText(/^\$[\d,]+$/).textContent;
    const before = headline();
    await user.click(screen.getByRole("radio", { name: "12M" }));
    expect(headline()).not.toBe(before);
  });

  it("switches the bar list breakdown", async () => {
    const user = userEvent.setup();
    render(<BarListCard />);
    expect(screen.getByText("/pricing")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Countries" }));
    expect(screen.getByText("Germany")).toBeInTheDocument();
    expect(screen.queryByText("/pricing")).not.toBeInTheDocument();
  });

  it("spotlights an activity ring from its legend row", async () => {
    const user = userEvent.setup();
    render(<ActivityRingsCard />);
    await user.hover(screen.getByText("Active minutes"));
    expect(screen.getAllByText("Active minutes")).toHaveLength(2);
  });
});

describe("describeChange", () => {
  it("rounds to one decimal and colours by direction", () => {
    expect(describeChange(112.4, 100)).toEqual({ label: "+12.4%", color: "lime" });
    expect(describeChange(90, 100)).toEqual({ label: "-10%", color: "rose" });
    expect(describeChange(90, 100, { lowerIsBetter: true })).toEqual({ label: "-10%", color: "lime" });
    expect(describeChange(5, 0)).toEqual({ label: "New", color: "neutral" });
  });
});
