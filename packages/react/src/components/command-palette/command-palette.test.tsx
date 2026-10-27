import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { CommandGroup, CommandItem, CommandPalette } from "./command-palette";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function Palette(props: Partial<Parameters<typeof CommandPalette>[0]>) {
  return (
    <CommandPalette defaultOpen {...props}>
      <CommandGroup title="Navigation">
        <CommandItem id="home">Go to home</CommandItem>
        <CommandItem id="settings" keywords={["preferences", "account"]}>
          Open settings
        </CommandItem>
      </CommandGroup>
      <CommandGroup title="Actions">
        <CommandItem id="new" shortcut={["⌘", "N"]}>
          New project
        </CommandItem>
      </CommandGroup>
    </CommandPalette>
  );
}

const search = () => screen.getByRole("searchbox", { name: "Search commands" });

describe("CommandPalette", () => {
  it("opens with focus in the search field and lists every command", () => {
    render(<Palette />);
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(search()).toHaveFocus();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("filters by label and by keywords", async () => {
    const user = userEvent.setup();
    render(<Palette />);

    await user.type(search(), "project");
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["New project⌘N"]);

    await user.clear(search());
    await user.type(search(), "prefer");
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["Open settings"]);
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.type(search(), "zzz");
    // React Aria wraps the empty state in a menuitem so screen readers announce it.
    const [only, ...rest] = screen.getAllByRole("menuitem");
    expect(rest).toHaveLength(0);
    expect(only).toHaveTextContent("No results for “zzz”");
  });

  it("runs the chosen command with the keyboard, then closes", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    render(<Palette onAction={onAction} onOpenChange={onOpenChange} />);

    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onAction).toHaveBeenCalledWith("settings");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("toggles with the configured shortcut", async () => {
    const user = userEvent.setup();
    render(<Palette defaultOpen={false} shortcut="j" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.keyboard("{Control>}j{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
