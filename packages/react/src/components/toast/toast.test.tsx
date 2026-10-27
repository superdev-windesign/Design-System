import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { Toaster, createToastQueue } from "./toast";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

// A fresh queue per test keeps toasts from leaking between them.
function setup() {
  const { queue, toast } = createToastQueue();
  render(<Toaster queue={queue} />);
  return { queue, toast };
}

describe("Toaster", () => {
  it("renders nothing until a toast is queued", () => {
    setup();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("shows a toast inside a notifications landmark", () => {
    const { toast } = setup();
    act(() => {
      toast.success("Changes saved", { description: "Your profile is up to date." });
    });
    const region = screen.getByRole("region");
    const dialog = within(region).getByRole("alertdialog", { name: "Changes saved" });
    expect(dialog).toHaveAccessibleDescription("Your profile is up to date.");
  });

  it("stacks newest first and closes with the close button", async () => {
    const user = userEvent.setup();
    const { toast } = setup();
    act(() => {
      toast.show("First");
      toast.show("Second");
    });
    const [front, back] = screen.getAllByRole("alertdialog");
    expect(front).toHaveAccessibleName("Second");
    expect(back).toHaveAccessibleName("First");

    await user.click(within(screen.getByRole("alertdialog", { name: "Second" })).getByRole("button", { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole("alertdialog", { name: "Second" })).not.toBeInTheDocument());
    expect(screen.getByRole("alertdialog", { name: "First" })).toBeInTheDocument();
  });

  it("runs the action and closes the toast", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { toast } = setup();
    act(() => {
      toast.show("File deleted", { action: { label: "Undo", onAction } });
    });
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("swaps a loading toast for the outcome of a promise", async () => {
    const { toast } = setup();
    let resolve!: (value: string) => void;
    const work = new Promise<string>((r) => (resolve = r));

    act(() => {
      void toast.promise(work, { loading: "Publishing…", success: (v) => `Published ${v}`, error: "Failed" });
    });
    expect(screen.getByRole("alertdialog", { name: "Publishing…" })).toBeInTheDocument();

    await act(async () => resolve("v2"));
    await waitFor(() => expect(screen.getByRole("alertdialog", { name: "Published v2" })).toBeInTheDocument());
    expect(screen.queryByRole("alertdialog", { name: "Publishing…" })).not.toBeInTheDocument();
  });

  it("closes on its own after the timeout", async () => {
    const { toast } = setup();
    act(() => {
      toast.info("Heads up", { timeout: 50 });
    });
    expect(screen.getByRole("alertdialog", { name: "Heads up" })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});
