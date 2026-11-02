import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb/breadcrumb";
import { Select, SelectItem } from "./select/select";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "./table/table";
import { Skeleton } from "./skeleton/skeleton";
import { Schedule } from "./schedule/schedule";
import { Composer } from "../blocks/composer/composer";
import { CalendarTemplate } from "../templates/calendar-template";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("Breadcrumb maxItems", () => {
  it("folds the middle levels into a menu of links", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb maxItems={3}>
        <BreadcrumbItem href="#home">Home</BreadcrumbItem>
        <BreadcrumbItem href="#a">Workspace</BreadcrumbItem>
        <BreadcrumbItem href="#b">Design</BreadcrumbItem>
        <BreadcrumbItem href="#c">Brand</BreadcrumbItem>
        <BreadcrumbItem current>Logo.svg</BreadcrumbItem>
      </Breadcrumb>,
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("link").map((a) => a.textContent)).toEqual(["Home", "Brand"]);
    await user.click(screen.getByRole("button", { name: "Show 2 more levels" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Workspace", "Design"]);
  });
});

describe("Select isSearchable", () => {
  it("filters the options as you type", async () => {
    const user = userEvent.setup();
    render(
      <Select aria-label="Country" isSearchable searchPlaceholder="Search countries">
        {["Portugal", "Poland", "Peru", "Spain"].map((c) => (
          <SelectItem key={c} id={c} textValue={c}>
            {c}
          </SelectItem>
        ))}
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: /Country/ }));
    const search = await screen.findByRole("searchbox", { name: "Search countries" });
    await waitFor(() => expect(search).toHaveFocus());
    await user.keyboard("po");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Portugal", "Poland"]);
  });
});

describe("Table stickyHeader", () => {
  it("marks the table so its header sticks", () => {
    render(
      <Table aria-label="Orders" stickyHeader containerClassName="max-h-40">
        <TableHeader>
          <TableColumn isRowHeader>Order</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow id="1">
            <TableCell>#1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole("grid", { name: "Orders" });
    expect(table).toHaveClass("bui-table-sticky");
    expect(table.parentElement).toHaveClass("max-h-40", "overflow-y-auto");
  });
});

describe("Skeleton reveal", () => {
  it("brings loaded content in through the reveal animation", () => {
    render(
      <Skeleton isLoaded>
        <p>Loaded</p>
      </Skeleton>,
    );
    expect(screen.getByText("Loaded").parentElement).toHaveClass("animate-reveal");
  });
});

describe("Composer", () => {
  it("sends with Enter and becomes a stop button while working", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(<Composer onSubmit={onSubmit} status={{ branch: "main", context: 0.4 }} />);
    const box = screen.getByRole("textbox", { name: "Message" });
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    await user.type(box, "Ship it{Enter}");
    expect(onSubmit).toHaveBeenCalledWith({ text: "Ship it", model: "balanced", files: [] });
    expect(box).toHaveValue("");
    rerender(<Composer onSubmit={onSubmit} isWorking status={{ branch: "main", context: 0.4 }} />);
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.getByText("Working…")).toBeInTheDocument();
  });

  it("lists attached files and removes them", async () => {
    const user = userEvent.setup();
    const { container } = render(<Composer />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File(["a"], "notes.pdf", { type: "application/pdf" }));
    const list = screen.getByRole("list", { name: "Attached files" });
    expect(within(list).getByText("notes.pdf")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove notes.pdf" }));
    expect(screen.queryByRole("list", { name: "Attached files" })).not.toBeInTheDocument();
  });
});

describe("Schedule controlled date", () => {
  it("reports navigation through onDateChange", async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(<Schedule events={[]} date={new Date(2026, 10, 4)} onDateChange={onDateChange} showViewSwitch={false} />);
    expect(screen.queryByRole("group", { name: "View" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next week" }));
    const next = onDateChange.mock.calls[0]![0] as Date;
    expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([2026, 10, 11]);
  });
});

describe("CalendarTemplate", () => {
  it("switches views and hides a calendar's events", async () => {
    const user = userEvent.setup();
    render(<CalendarTemplate />);
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeInTheDocument();
    const before = screen.getByText(/events across 4 calendars/).textContent!;
    await user.click(screen.getByRole("checkbox", { name: "Deadlines" }));
    expect(screen.getByText(/events across 3 calendars/).textContent).not.toBe(before);
    await user.click(screen.getByRole("radio", { name: "Month" }));
    expect(screen.getByRole("radio", { name: "Month" })).toBeChecked();
  });
});
