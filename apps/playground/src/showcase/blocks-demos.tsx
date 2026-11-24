import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  AgentThinking,
  AuthCard,
  Button,
  ComposerLoader,
  DashboardSidebar,
  DataGridExample,
  DataTableExample,
  NotificationCenterDemo,
  OrdersChartCard,
  RevenueChartCard,
  SegmentedControl,
  SegmentedControlItem,
  SettingsGeneral,
  SettingsModal,
  StatCards,
  Switch,
  DASHBOARD_NAV,
} from "@windesign/react";
import type { AuthMode } from "@windesign/react";
import { RiArrowUpLine, RiAttachment2, RiSettings3Line } from "@remixicon/react";
import { GoogleSession, useProviderHandler } from "../site/google-auth";

/**
 * Paints a block at its real width, then scales it down to the card. Blocks
 * are page-sized; shrinking the whole thing reads better than cropping it.
 */
export function Fit({ width, children, center = false }: { width: number; children: ReactNode; center?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className="relative size-full overflow-hidden">
      <div
        className={center ? "absolute top-1/2 left-0" : "absolute top-0 left-0"}
        style={{
          width,
          transform: `${center ? "translateY(-50%) " : ""}scale(${scale})`,
          transformOrigin: center ? "left center" : "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Agent Thinking ────────────────────────────────────────────────────────

export function AgentThinkingDemo({ timers = true }: { timers?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-3.5">
      <AgentThinking variant="wave" label="Thinking" showTimer={timers} />
      <AgentThinking variant="spin" label="Searching the docs" showTimer={timers} />
      <AgentThinking variant="stars" label="Reading files" showTimer={timers} />
      <AgentThinking variant="infinity" label="Writing the answer" showTimer={timers} />
    </div>
  );
}

// ─── Composer Loader ───────────────────────────────────────────────────────

function ComposerField() {
  return (
    <div className="flex items-center gap-2 py-2 ps-4 pe-2">
      <RiAttachment2 aria-hidden className="size-5 shrink-0 text-icon-secondary" />
      <span className="flex-1 truncate text-body-md text-fg-secondary">Summarize last week's support tickets</span>
      <span className="flex size-8 items-center justify-center rounded-full bg-action-primary text-on-action">
        <RiArrowUpLine aria-hidden className="size-4" />
      </span>
    </div>
  );
}

export function ComposerLoaderPreview() {
  return (
    <div className="w-full max-w-80">
      <ComposerLoader active>
        <ComposerField />
      </ComposerLoader>
    </div>
  );
}

export function ComposerLoaderDemo() {
  const [active, setActive] = useState(true);
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <div className="w-full">
        <ComposerLoader active={active}>
          <ComposerField />
        </ComposerLoader>
      </div>
      <Switch isSelected={active} onChange={setActive}>
        Agent is working
      </Switch>
    </div>
  );
}

// ─── Auth Card ─────────────────────────────────────────────────────────────

export function AuthCardDemo() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const onProvider = useProviderHandler();
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <SegmentedControl
        aria-label="Mode"

        selectedKeys={[mode]}
        onSelectionChange={(keys) => setMode(([...keys][0] as AuthMode | undefined) ?? mode)}
      >
        <SegmentedControlItem id="signin">Sign in</SegmentedControlItem>
        <SegmentedControlItem id="signup">Sign up</SegmentedControlItem>
        <SegmentedControlItem id="verify">Verify</SegmentedControlItem>
      </SegmentedControl>
      <AuthCard
        key={mode}
        mode={mode}
        email="alex@example.com"
        layout="inline"
        providers={["google", "apple", "github"]}
        headingLevel={3}
        onProvider={onProvider}
      />
      <GoogleSession />
    </div>
  );
}

// ─── Settings Modal ────────────────────────────────────────────────────────

export function SettingsModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button leadingIcon={RiSettings3Line} onPress={() => setIsOpen(true)}>
        Open settings
      </Button>
      <p className="text-body-sm text-fg-secondary">General, profile, storage and tools pages in one dialog.</p>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export const SettingsPreview = () => (
  <Fit width={560}>
    <div className="p-4">
      <SettingsGeneral />
    </div>
  </Fit>
);

// ─── Sidebar ───────────────────────────────────────────────────────────────

// In-page anchors, so picking a row changes the selection instead of leaving the docs.
const DEMO_NAV = DASHBOARD_NAV.map((item) => ({ ...item, href: `#nav-${item.key}` }));

export function SidebarDemo() {
  const [selected, setSelected] = useState("home");
  const onClickCapture = (event: MouseEvent) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#nav-"]');
    if (!link) return;
    event.preventDefault();
    setSelected(link.getAttribute("href")!.slice("#nav-".length));
  };
  return (
    <div className="h-183 w-65" onClickCapture={onClickCapture}>
      <DashboardSidebar fluid showThemeToggle={false} items={DEMO_NAV} selected={selected} />
    </div>
  );
}

export const SidebarPreview = () => (
  <Fit width={260}>
    <div className="h-183">
      <DashboardSidebar fluid showThemeToggle={false} />
    </div>
  </Fit>
);

// ─── Stat Cards ────────────────────────────────────────────────────────────

export function StatCardsBlockDemo() {
  const [variant, setVariant] = useState<"plain" | "footer">("plain");
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <SegmentedControl
        aria-label="Variant"

        selectedKeys={[variant]}
        onSelectionChange={(keys) => setVariant(([...keys][0] as "plain" | "footer" | undefined) ?? variant)}
      >
        <SegmentedControlItem id="plain">Delta chips</SegmentedControlItem>
        <SegmentedControlItem id="footer">Footer band</SegmentedControlItem>
      </SegmentedControl>
      <StatCards variant={variant} columns={2} className="w-full" />
    </div>
  );
}

export const StatCardsPreview = () => (
  <Fit width={330} center>
    <StatCards variant="footer" count={1} columns={1} />
  </Fit>
);

// ─── Revenue Chart ─────────────────────────────────────────────────────────

export function RevenueChartDemo() {
  return (
    <div className="grid w-full gap-4 xl:grid-cols-2">
      <RevenueChartCard />
      <OrdersChartCard />
    </div>
  );
}

export const RevenueChartPreview = () => (
  <Fit width={560} center>
    <RevenueChartCard />
  </Fit>
);

// ─── Tables ────────────────────────────────────────────────────────────────

export const DataGridPreview = () => (
  <Fit width={960}>
    <DataGridExample rowCount={48} showTitle={false} height={264} />
  </Fit>
);

export const DataGridDemo = () => <DataGridExample rowCount={10000} />;

export const DataTablePreview = () => (
  <Fit width={790}>
    <DataTableExample showSizeToggle={false} pageSize={5} />
  </Fit>
);

export const DataTableDemo = () => (
  <div className="w-full">
    <DataTableExample />
  </div>
);

export const NotificationCenterPreview = () => (
  <Fit width={400}>
    <NotificationCenterDemo />
  </Fit>
);
