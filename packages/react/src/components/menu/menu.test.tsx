import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { RiBold, RiItalic } from "@remixicon/react";
import { Button } from "../button/button";
import { Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SubmenuTrigger } from "./menu";
import { ContextMenu, ContextMenuArea } from "./context-menu";
import { Menubar, MenubarMenu } from "./menubar";
import { Toolbar, ToolbarSeparator } from "../toolbar/toolbar";
import { ToggleButton, ToggleButtonGroup } from "../toggle-button/toggle-button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuPanelLink } from "../navigation-menu/navigation-menu";
import { Stepper } from "../stepper/stepper";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("Menu", () => {
  it("opens from its trigger, runs an action and closes", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <MenuTrigger>
        <Button>Edit</Button>
        <Menu onAction={onAction}>
          <MenuSection title="History">
            <MenuItem id="undo" shortcut="⌘Z">
              Undo
            </MenuItem>
            <MenuItem id="redo">Redo</MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuItem id="delete" variant="danger">
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(3);
    expect(within(menu).getByRole("group", { name: "History" })).toBeInTheDocument();

    await user.click(within(menu).getByRole("menuitem", { name: /Undo/ }));
    expect(onAction.mock.calls[0]?.[0]).toBe("undo");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("checks items in a multiple-selection menu", async () => {
    const user = userEvent.setup();
    render(
      <MenuTrigger defaultOpen>
        <Button>View</Button>
        <Menu selectionMode="multiple" defaultSelectedKeys={["grid"]}>
          <MenuItem id="grid">Show grid</MenuItem>
          <MenuItem id="rulers">Show rulers</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    const rulers = screen.getByRole("menuitemcheckbox", { name: "Show rulers" });
    expect(screen.getByRole("menuitemcheckbox", { name: "Show grid" })).toHaveAttribute("aria-checked", "true");
    await user.click(rulers);
    expect(rulers).toHaveAttribute("aria-checked", "true");
  });

  it("opens a submenu with the arrow key", async () => {
    const user = userEvent.setup();
    render(
      <MenuTrigger>
        <Button>File</Button>
        <Menu>
          <MenuItem id="new">New</MenuItem>
          <SubmenuTrigger>
            <MenuItem id="share">Share</MenuItem>
            <Menu>
              <MenuItem id="email">Email</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );
    screen.getByRole("button", { name: "File" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "Email" })).toBeInTheDocument();
  });
});

describe("ContextMenu", () => {
  it("opens on right-click inside its area", async () => {
    render(
      <ContextMenu>
        <ContextMenuArea aria-label="Report.pdf">Report.pdf</ContextMenuArea>
        <Menu aria-label="File actions">
          <MenuItem id="open">Open</MenuItem>
          <MenuItem id="rename">Rename</MenuItem>
        </Menu>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByRole("group", { name: "Report.pdf" }), { clientX: 20, clientY: 20 });
    // The menu is named by the area it belongs to.
    expect(await screen.findByRole("menu", { name: "Report.pdf" })).toBeInTheDocument();
  });
});

describe("Menubar", () => {
  function Bar() {
    return (
      <Menubar aria-label="Editor">
        <MenubarMenu label="File">
          <Menu aria-label="File">
            <MenuItem id="new">New</MenuItem>
          </Menu>
        </MenubarMenu>
        <MenubarMenu label="Edit">
          <Menu aria-label="Edit">
            <MenuItem id="undo">Undo</MenuItem>
          </Menu>
        </MenubarMenu>
      </Menubar>
    );
  }

  it("is one tab stop with arrow keys between titles", async () => {
    const user = userEvent.setup();
    render(<Bar />);
    expect(screen.getByRole("menubar", { name: "Editor" })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
  });

  it("switches to the next menu with the arrow key while one is open", async () => {
    const user = userEvent.setup();
    render(<Bar />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu", { name: "File" })).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menu", { name: "Edit" })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("menu", { name: "File" })).not.toBeInTheDocument());
  });
});

describe("Toolbar and ToggleButton", () => {
  it("groups toggles that report their pressed state", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar aria-label="Formatting">
        <ToggleButtonGroup aria-label="Style" selectionMode="multiple">
          <ToggleButton id="bold" icon={RiBold} aria-label="Bold" />
          <ToggleButton id="italic" icon={RiItalic} aria-label="Italic" />
        </ToggleButtonGroup>
        <ToolbarSeparator />
        <ToggleButton aria-label="Pin">Pin</ToggleButton>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold).toHaveAttribute("aria-pressed", "false");
    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");
  });
});

describe("NavigationMenu", () => {
  it("expands a panel of links and closes it on Escape", async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu aria-label="Main">
        <NavigationMenuLink href="#/" isCurrent>
          Home
        </NavigationMenuLink>
        <NavigationMenuItem label="Products">
          <NavigationMenuPanelLink href="#/analytics" title="Analytics" description="Dashboards" />
        </NavigationMenuItem>
      </NavigationMenu>,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    const button = screen.getByRole("button", { name: "Products" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("link", { name: /Analytics/ }));
    await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));

    await user.click(button);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });
});

describe("Stepper", () => {
  it("marks the current step and lets people revisit finished ones", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <Stepper
        currentStep="shipping"
        onStepChange={onStepChange}
        steps={[
          { id: "cart", label: "Cart" },
          { id: "shipping", label: "Shipping" },
          { id: "pay", label: "Payment" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    await user.click(screen.getByRole("button", { name: /Cart/ }));
    expect(onStepChange).toHaveBeenCalledWith("cart");
    expect(screen.queryByRole("button", { name: /Payment/ })).not.toBeInTheDocument();
  });
});
