import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { DateRangePicker } from "./date-range-picker";
import { formatTriggerDate, parseChipDate } from "./shared";

const now = today(getLocalTimeZone());
const fmt = (date: CalendarDate) => formatTriggerDate(date, "en-US");

async function openPicker(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Select date range/ }));
  return screen.findByRole("dialog");
}

describe("DateRangePicker", () => {
  it("shows the placeholder until a range is committed", () => {
    render(<DateRangePicker />);
    expect(screen.getByRole("button", { name: "Select date range" })).toBeInTheDocument();
  });

  it("disables Apply until a range is picked", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    const dialog = await openPicker(user);
    expect(within(dialog).getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("commits a quick-select preset only after Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);

    const dialog = await openPicker(user);
    await user.click(within(dialog).getByRole("button", { name: "Today" }));
    expect(within(dialog).getByText("1 day selected")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0]![0];
    expect(range.start.compare(now)).toBe(0);
    expect(range.end.compare(now)).toBe(0);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: `${fmt(now)} - ${fmt(now)}` })).toBeInTheDocument();
  });

  it("discards the pending range on Cancel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);

    const dialog = await openPicker(user);
    await user.click(within(dialog).getByRole("button", { name: "Last week" }));
    expect(within(dialog).getByText("7 days selected")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Select date range" })).toBeInTheDocument();
  });

  it("lets the start date be typed into its chip", async () => {
    const user = userEvent.setup();
    const start10 = new CalendarDate(2026, 3, 10);
    const end20 = new CalendarDate(2026, 3, 20);
    render(<DateRangePicker defaultValue={{ start: start10, end: end20 }} />);

    await user.click(screen.getByRole("button", { name: `${fmt(start10)} - ${fmt(end20)}` }));
    const dialog = await screen.findByRole("dialog");
    const start = within(dialog).getByRole("textbox", { name: "Start date" });
    expect(start).toHaveValue("10/03/2026");

    await user.clear(start);
    await user.type(start, "12/03/2026{Enter}");
    expect(within(dialog).getByText("9 days selected")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    await openPicker(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("parseChipDate", () => {
  it("parses DD/MM/YYYY and rejects malformed input", () => {
    expect(parseChipDate("05/11/2026")?.toString()).toBe("2026-11-05");
    expect(parseChipDate("31/13/2026")).toBeNull();
    expect(parseChipDate("2026-11-05")).toBeNull();
  });
});
