import { fireEvent, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { AnimatedNumber, StatCard } from "./stat-card";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  // jsdom has no PointerEvent, so fireEvent would drop clientX.
  window.PointerEvent ??= MouseEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("AnimatedNumber", () => {
  it("exposes the formatted value once to assistive tech", () => {
    const { container } = render(<AnimatedNumber value={48213.5} format={{ style: "currency", currency: "USD" }} />);
    expect(screen.getByText("$48,213.50")).toHaveClass("sr-only");
    // The rolling columns are decorative.
    expect(container.querySelector("[aria-hidden]")).not.toBeNull();
  });
});

describe("StatCard", () => {
  it("is a labelled group with the value and the change", () => {
    render(<StatCard label="Revenue" value={1200} change={0.124} comparison="vs last month" />);
    const group = screen.getByRole("group", { name: "Revenue" });
    expect(group).toHaveTextContent("1,200");
    expect(group).toHaveTextContent("Up +12.4% vs last month");
  });

  it("colors a fall as good news when the trend is inverted", () => {
    render(<StatCard label="Churn" value={2} change={-0.05} invertTrend />);
    expect(screen.getByText("Down", { exact: false }).parentElement).toHaveClass("bg-status-success");
  });

  it("shows a point's value and label while the sparkline is scrubbed", () => {
    render(<StatCard label="Visitors" value={30} data={[10, 20, 30]} dataLabels={["Mon", "Tue", "Wed"]} />);
    const chart = screen.getByRole("img", { name: "Trend over 3 periods, from 10 to 30" });
    // jsdom has no layout, so give the chart a width to scrub across.
    chart.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 48, right: 200, bottom: 48, x: 0, y: 0, toJSON() {} });

    fireEvent.pointerMove(chart, { clientX: 0 });
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveTextContent("10");

    fireEvent.pointerLeave(chart);
    expect(screen.queryByText("Mon")).not.toBeInTheDocument();
  });
});
