import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "./date-picker";
import { formatTriggerDate } from "./shared";

describe("DatePicker", () => {
  it("commits a typed date on Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new CalendarDate(2026, 8, 3)} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: formatTriggerDate(new CalendarDate(2026, 8, 3), "en-US") }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("August 2026")).toBeInTheDocument();

    const chip = within(dialog).getByRole("textbox", { name: "Date" });
    await user.clear(chip);
    await user.type(chip, "21/08/2026{Enter}");
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0].toString()).toBe("2026-08-21");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the committed date on Cancel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new CalendarDate(2026, 8, 3)} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /2026/ }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Aug 3, 2026/ })).toBeInTheDocument();
  });
});
