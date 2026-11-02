import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { Button } from "./button/button";
import { Dialog, DialogTrigger, Modal } from "./dialog/dialog";
import { AlertDialog } from "./dialog/alert-dialog";
import { Drawer } from "./drawer/drawer";
import { Popover, PopoverTrigger } from "./popover/popover";
import { HoverCard } from "./hover-card/hover-card";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("Modal and Dialog", () => {
  it("opens from its trigger, is named and described, and returns focus on close", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Edit profile</Button>
        <Modal>
          <Dialog title="Edit profile" description="Changes are visible to your team." footer={({ close }) => <Button onPress={close}>Save</Button>}>
            <p>Body</p>
          </Dialog>
        </Modal>
      </DialogTrigger>,
    );

    const trigger = screen.getByRole("button", { name: "Edit profile" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    expect(dialog).toHaveAccessibleDescription("Changes are visible to your team.");

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Open</Button>
        <Modal>
          <Dialog title="Details">Body</Dialog>
        </Modal>
      </DialogTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("AlertDialog", () => {
  it("is an alertdialog that focuses Cancel first when destructive", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Delete</Button>
        <AlertDialog title="Delete project?" variant="danger" primaryActionLabel="Delete">
          This can't be undone.
        </AlertDialog>
      </DialogTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog", { name: "Delete project?" });
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("waits for an async primary action before closing", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const action = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<AlertDialog defaultOpen title="Publish?" primaryActionLabel="Publish" onPrimaryAction={action}>Goes live now.</AlertDialog>);

    await user.click(screen.getByRole("button", { name: "Publish" }));
    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await act(async () => finish());
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});

describe("Drawer", () => {
  it("frames a dialog that opens from its trigger", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Filters</Button>
        <Drawer placement="end">
          <Dialog title="Filters">Body</Dialog>
        </Drawer>
      </DialogTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
  });
});

describe("Popover", () => {
  it("opens a dialog named by its title and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <PopoverTrigger>
        <Button>Share</Button>
        <Popover title="Share this page">
          <a href="#copy">Copy link</a>
        </Popover>
      </PopoverTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(screen.getByRole("dialog", { name: "Share this page" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("HoverCard", () => {
  it("opens while hovered and closes after the pointer leaves", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard delay={0} closeDelay={0} onOpenChange={onOpenChange} trigger={<a href="#riley">@riley</a>}>
        <p>Riley Chen, Design</p>
      </HoverCard>,
    );
    await user.hover(screen.getByRole("link", { name: "@riley" }));
    expect(await screen.findByText("Riley Chen, Design")).toBeInTheDocument();
    await user.unhover(screen.getByRole("link", { name: "@riley" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });
});
