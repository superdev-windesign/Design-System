import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressBar } from "./progress-bar/progress-bar";
import { Meter } from "./meter/meter";
import { Spinner } from "./spinner/spinner";
import { Skeleton, SkeletonGroup, SkeletonText } from "./skeleton/skeleton";
import { EmptyState } from "./empty-state/empty-state";
import { Alert } from "./alert/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./card/card";
import { Accordion, AccordionItem } from "./accordion/accordion";
import { List, ListItem } from "./list/list";
import { DescriptionItem, DescriptionList } from "./description-list/description-list";
import { Timeline, TimelineItem } from "./timeline/timeline";
import { ResizablePanel, ResizablePanels } from "./resizable/resizable";
import { ScrollArea } from "./scroll-area/scroll-area";
import { Image } from "./image/image";

describe("ProgressBar", () => {
  it("reports its value, or none while indeterminate", () => {
    const { rerender } = render(<ProgressBar label="Uploading" value={40} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("40%")).toBeInTheDocument();
    rerender(<ProgressBar label="Uploading" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });
});

describe("Meter", () => {
  it("names its state in words past a threshold", () => {
    const { rerender } = render(<Meter label="Storage" value={40} />);
    expect(screen.getByRole("meter", { name: "Storage" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.queryByText("Nearly full")).not.toBeInTheDocument();
    rerender(<Meter label="Storage" value={80} />);
    expect(screen.getByText("Nearly full")).toBeInTheDocument();
    rerender(<Meter label="Storage" value={95} segments={10} />);
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });
});

describe("Spinner", () => {
  it("is a named busy indicator unless hidden", () => {
    const { rerender } = render(<Spinner />);
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
    rerender(<Spinner aria-hidden />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("hides placeholders and marks the region busy", () => {
    const { rerender } = render(
      <SkeletonGroup label="Loading orders">
        <Skeleton isLoaded={false}>
          <p>Order 1042</p>
        </Skeleton>
        <SkeletonText lines={2} />
      </SkeletonGroup>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading orders");
    expect(screen.queryByText("Order 1042")).not.toBeInTheDocument();
    rerender(
      <SkeletonGroup isLoading={false}>
        <Skeleton isLoaded>
          <p>Order 1042</p>
        </Skeleton>
      </SkeletonGroup>,
    );
    expect(screen.getByText("Order 1042")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("titles the empty area at the chosen level", () => {
    render(<EmptyState title="No projects yet" description="Create one to get started." headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "No projects yet" })).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("announces when asked and can be dismissed", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert tone="danger" title="Couldn't save" announce="assertive" onDismiss={onDismiss}>
        Check your connection.
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save");
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe("Card", () => {
  it("makes the whole card one link through its title", () => {
    render(
      <Card>
        <CardHeader title={<CardTitle href="#/p/atlas">Atlas</CardTitle>} description="Design system" />
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Atlas" })).toContainElement(screen.getByRole("link", { name: "Atlas" }));
  });
});

describe("Accordion", () => {
  it("opens one section at a time by default", async () => {
    const user = userEvent.setup();
    render(
      <Accordion numbered>
        <AccordionItem id="a" title="Shipping">
          Two to four days.
        </AccordionItem>
        <AccordionItem id="b" title="Returns">
          Thirty days.
        </AccordionItem>
      </Accordion>,
    );
    const shipping = screen.getByRole("button", { name: /Shipping/ });
    const returns = screen.getByRole("button", { name: /Returns/ });
    await user.click(shipping);
    expect(shipping).toHaveAttribute("aria-expanded", "true");
    await user.click(returns);
    expect(returns).toHaveAttribute("aria-expanded", "true");
    expect(shipping).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("01")).toBeInTheDocument();
  });
});

describe("List", () => {
  it("selects rows with their checkboxes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <List aria-label="Team" selectionMode="multiple" onSelectionChange={onSelectionChange}>
        <ListItem id="ada" title="Ada Lovelace" description="Engineering" />
        <ListItem id="alan" title="Alan Turing" description="Research" />
      </List>,
    );
    expect(screen.getByRole("grid", { name: "Team" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("checkbox")[1]!);
    expect([...onSelectionChange.mock.calls[0]![0]]).toEqual(["alan"]);
  });
});

describe("DescriptionList", () => {
  it("pairs terms with values", () => {
    render(
      <DescriptionList>
        <DescriptionItem term="Status">Active</DescriptionItem>
        <DescriptionItem term="Plan">Team</DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getAllByRole("term").map((t) => t.textContent)).toEqual(["Status", "Plan"]);
    expect(screen.getAllByRole("definition").map((d) => d.textContent)).toEqual(["Active", "Team"]);
  });
});

describe("Timeline", () => {
  it("lists events with machine-readable times", () => {
    render(
      <Timeline aria-label="Order history">
        <TimelineItem title="Order placed" time="09:40" dateTime="2026-03-14T09:40" />
        <TimelineItem title="Shipped" tone="success" />
      </Timeline>,
    );
    expect(screen.getByRole("list", { name: "Order history" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("09:40").tagName).toBe("TIME");
  });
});

describe("ResizablePanels", () => {
  it("resizes with the keyboard within each pane's limits", async () => {
    const user = userEvent.setup();
    const onResize = vi.fn();
    render(
      <ResizablePanels onResize={onResize}>
        <ResizablePanel label="Files" defaultSize={30} minSize={20}>
          Files
        </ResizablePanel>
        <ResizablePanel label="Editor">Editor</ResizablePanel>
      </ResizablePanels>,
    );
    const handle = screen.getByRole("separator", { name: "Resize Files" });
    expect(handle).toHaveAttribute("aria-valuenow", "30");
    handle.focus();
    await user.keyboard("{ArrowRight}");
    expect(handle).toHaveAttribute("aria-valuenow", "35");
    await user.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "20");
    expect(onResize).toHaveBeenLastCalledWith([20, 80]);
  });
});

describe("ScrollArea", () => {
  it("is a named region", () => {
    render(
      <ScrollArea aria-label="Changelog" className="h-40">
        <p>Entries</p>
      </ScrollArea>,
    );
    expect(screen.getByRole("region", { name: "Changelog" })).toBeInTheDocument();
  });
});

describe("Image", () => {
  it("falls back to its alt text when it fails, inside a captioned figure", () => {
    render(<Image src="/missing.jpg" alt="Harbour at dawn" ratio={4 / 3} caption="The east quay." figureLabel="Fig. 2" />);
    const img = screen.getByRole("img", { name: "Harbour at dawn" });
    fireEvent.error(img);
    expect(screen.getByText("Harbour at dawn")).toBeInTheDocument();
    expect(screen.getByRole("figure")).toHaveTextContent("Fig. 2The east quay.");
  });
});
