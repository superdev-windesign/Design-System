import { render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { OrdersChartCard } from "../charts/revenue-chart/orders-chart-card";
import { RevenueChartCard } from "../charts/revenue-chart/revenue-chart-card";
import { AgentThinking } from "./agent-thinking/agent-thinking";
import { AuthCard } from "./auth/auth-card";
import { ComposerLoader } from "./composer-loader/composer-loader";
import { DataGridExample } from "./data-grid/data-grid-example";
import { DataTableExample } from "./data-table/data-table";
import { NotificationCenterDemo } from "./notification-center/notification-center-demo";
import { DashboardSidebar } from "./sidebar/dashboard-sidebar";
import { StatCards } from "./stat-cards/stat-cards";

/**
 * Smoke tests for the blocks ported from BoardUI: each renders without
 * throwing and shows its key content. Behaviour is BoardUI's; these guard
 * the conversion (imports, patches, tokens) rather than re-test it.
 */

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("ported blocks", () => {
  it("AgentThinking shows its label", () => {
    render(<AgentThinking variant="wave" label="Thinking" showTimer={false} />);
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });

  it("ComposerLoader wraps its content", () => {
    render(
      <ComposerLoader active>
        <span>Composer</span>
      </ComposerLoader>,
    );
    expect(screen.getByText("Composer")).toBeInTheDocument();
  });

  it("AuthCard renders the sign-in form", () => {
    render(<AuthCard providers={["google"]} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  it("DataGridExample renders a grid", () => {
    render(<DataGridExample rowCount={12} height={200} />);
    expect(screen.getByRole("grid", { name: "Renewals" })).toBeInTheDocument();
  });

  it("DataTableExample renders the customers table", () => {
    render(<DataTableExample pageSize={5} />);
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("NotificationCenterDemo uses fictional people with initials, not photos", () => {
    const { container } = render(<NotificationCenterDemo />);
    expect(screen.getByText("Livia mentioned you")).toBeInTheDocument();
    expect(container.querySelector('img[src^="/avatars/"]')).toBeNull();
  });

  it("DashboardSidebar shows the default navigation and a fictional user", () => {
    render(<DashboardSidebar showThemeToggle={false} />);
    expect(screen.getAllByRole("link", { name: "Home" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alex Morgan").length).toBeGreaterThan(0);
  });

  it("StatCards renders KPI cards", () => {
    render(<StatCards variant="plain" count={2} />);
    expect(document.body.textContent).toMatch(/\d/);
  });

  it("Revenue and orders chart cards render their headlines", () => {
    render(
      <>
        <RevenueChartCard />
        <OrdersChartCard />
      </>,
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });
});
