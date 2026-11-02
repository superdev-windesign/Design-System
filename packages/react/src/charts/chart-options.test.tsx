import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { BarListCard } from "./bar-list/bar-list-card";
import { ComboChartCard } from "./combo-chart/combo-chart-card";
import { ContributionsCard } from "./contributions/contributions-card";
import { DonutChartCard } from "./donut-chart/donut-chart-card";
import { FunnelChartCard } from "./funnel-chart/funnel-chart-card";
import { HeatmapChartCard } from "./heatmap-chart/heatmap-chart-card";
import { LineChartCard } from "./line-chart/line-chart-card";
import { MostActiveDaysCard } from "./most-active-days/most-active-days-card";
import { RadialChartCard } from "./radial-chart/radial-chart-card";
import { SleepScoreCard } from "./sleep-score/sleep-score-card";
import { StepsChartCard } from "./steps-chart/steps-chart-card";
import { OrdersChartCard } from "./revenue-chart/orders-chart-card";
import { RevenueChartCard } from "./revenue-chart/revenue-chart-card";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("the remaining cards are named and described", () => {
  it.each([
    ["Donut", DonutChartCard, "Sessions by source"],
    ["Revenue", RevenueChartCard, "Revenue"],
    ["Orders", OrdersChartCard, "Orders"],
  ] as const)("%s", (_, Card, title) => {
    render(<Card />);
    expect(screen.getByRole("figure", { name: title })).toHaveAttribute("aria-describedby");
  });
});

describe("chart options", () => {
  it("Line switches between periods", async () => {
    const user = userEvent.setup();
    render(<LineChartCard />);
    const period = screen.getByRole("radiogroup", { name: "Period" });
    await user.click(within(period).getByRole("radio", { name: "30 days" }));
    expect(screen.getByText(/over 30 days/)).toBeInTheDocument();
  });

  it("Line hides the period switch for a single series", () => {
    render(<LineChartCard data={[{ label: "a", value: 1 }, { label: "b", value: 2 }]} />);
    expect(screen.queryByRole("radiogroup", { name: "Period" })).not.toBeInTheDocument();
  });

  it("Steps splits two weeks into a switch", async () => {
    const user = userEvent.setup();
    render(<StepsChartCard />);
    const week = screen.getByRole("radiogroup", { name: "Week" });
    expect(within(week).getByRole("radio", { name: "This week" })).toBeChecked();
    await user.click(within(week).getByRole("radio", { name: "Last week" }));
    expect(within(week).getByRole("radio", { name: "Last week" })).toBeChecked();
  });

  it("Bar List drops the switch when there's one list", () => {
    render(<BarListCard data={{ pages: { label: "Pages", items: [{ label: "/", value: 10 }] } } as never} />);
    expect(screen.queryByRole("radiogroup", { name: "Breakdown" })).not.toBeInTheDocument();
  });

  it("Combo and Radial show stat tiles", () => {
    render(
      <>
        <ComboChartCard />
        <RadialChartCard showTiles />
      </>,
    );
    expect(screen.getByText("Best month")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
  });

  it("Funnel switches to bars", async () => {
    const user = userEvent.setup();
    render(<FunnelChartCard />);
    await user.click(screen.getByRole("radio", { name: "Bars" }));
    expect(screen.getByRole("radio", { name: "Bars" })).toBeChecked();
  });

  it("Contributions and Heatmap take a series colour", () => {
    const { container } = render(
      <>
        <ContributionsCard color={3} />
        <HeatmapChartCard color={2} />
      </>,
    );
    expect(container.querySelector('[class*="bg-chart-3"]')).not.toBeNull();
    expect(container.querySelector('[class*="bg-chart-2"]')).not.toBeNull();
    expect(container.querySelector('[class*="bg-chart-7"]')).toBeNull();
  });

  it("Sleep Score puts a focused factor in the gauge", async () => {
    const user = userEvent.setup();
    render(<SleepScoreCard />);
    await user.tab();
    expect(screen.getByText("Duration · 7h 32m")).toBeInTheDocument();
  });

  it("Most Active Days picks a day from its calendar", async () => {
    const user = userEvent.setup();
    const onSelectDay = vi.fn();
    render(<MostActiveDaysCard defaultView="calendar" onSelectDay={onSelectDay} />);
    await user.click(screen.getByRole("button", { name: /Thu, Oct 15/ }));
    expect(onSelectDay.mock.calls[0]![0].date.getDate()).toBe(15);
    expect(screen.getByRole("button", { name: /Thu, Oct 15/ })).toHaveAttribute("aria-pressed", "true");
  });
});
