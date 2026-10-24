import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

const PlusIcon = (props: { className?: string }) => <svg data-testid="icon" {...props} />;

describe("Button", () => {
  it("calls onPress when pressed", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} isDisabled>
        Save
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("names icon-only buttons with aria-label and hides the icon", () => {
    render(<Button iconOnly leadingIcon={PlusIcon} aria-label="Add" />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });
});

// Type-level contract, checked by `npm run typecheck`.
export function typeContract() {
  // @ts-expect-error icon-only buttons must have an aria-label
  return <Button iconOnly leadingIcon={PlusIcon} />;
}
