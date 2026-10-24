import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, SelectItem } from "./select";
import type { SelectProps } from "./select";

function PriceSelect(props: Partial<SelectProps<object>>) {
  return (
    <Select aria-label="Filter by price" defaultSelectedKey="all" {...props}>
      <SelectItem id="all" textValue="All prices">All prices</SelectItem>
      <SelectItem id="low" textValue="Under $100">Under $100</SelectItem>
      <SelectItem id="high" textValue="Over $100">Over $100</SelectItem>
    </Select>
  );
}

const trigger = () => screen.getByRole("button", { name: /Filter by price/ });

describe("Select", () => {
  it("shows the selected option in the trigger", () => {
    render(<PriceSelect />);
    expect(trigger()).toHaveTextContent("All prices");
  });

  it("opens with the keyboard, selects an option and closes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<PriceSelect onSelectionChange={onSelectionChange} />);

    await user.tab();
    expect(trigger()).toHaveFocus();
    await user.keyboard("{ArrowDown}");

    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(3);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelectionChange).toHaveBeenCalledWith("low");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Under $100");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<PriceSelect />);

    await user.click(trigger());
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // React Aria restores focus on the next frame.
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it("closes the non-modal popover on an outside press", async () => {
    const user = userEvent.setup();
    render(
      <>
        <PriceSelect />
        <p>Outside</p>
      </>,
    );

    await user.click(trigger());
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByText("Outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when the trigger is pressed again", async () => {
    const user = userEvent.setup();
    render(<PriceSelect />);

    await user.click(trigger());
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.click(trigger());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<PriceSelect isDisabled />);

    await user.click(trigger());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
