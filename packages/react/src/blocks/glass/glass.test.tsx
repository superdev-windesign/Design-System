import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { useRef, useState } from "react";
import { RiHome5Fill, RiMailFill, RiSunLine, RiUser3Fill, RiWifiFill } from "@remixicon/react";
import { ThemeProvider, useTheme } from "../../foundations/theme";
import { ControlCenter } from "./control-center";
import { GlassDock, dockIconSize, fittedDockSize } from "./glass-dock";
import { GlassSheet } from "./glass-sheet";
import { GlassTabBar, useMinimizeOnScroll } from "./glass-tab-bar";
import { GlassToolbar } from "./glass-toolbar";
import { LiquidGlass, refractionProfile, roundedRectInset } from "./liquid-glass";
import { MorphMenu } from "./morph-menu";
import { NotificationStack, groupByApp, type StackNotification } from "./notification-stack";
import { NowPlaying, formatTrackTime, type NowPlayingTrack } from "./now-playing";
import { SpotlightSearch, type SpotlightGroup } from "./spotlight-search";
import { WheelPicker, wheelIndexAt } from "./wheel-picker";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("the Glass brand", () => {
  afterEach(() => {
    delete document.documentElement.dataset.brand;
    localStorage.clear();
  });

  it("can be switched to and remembered", async () => {
    const user = userEvent.setup();
    function Switcher() {
      const { brand, setBrand } = useTheme();
      return <button onClick={() => setBrand("glass")}>{brand}</button>;
    }
    render(
      <ThemeProvider>
        <Switcher />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "windesign" }));
    expect(document.documentElement.dataset.brand).toBe("glass");
    expect(localStorage.getItem("ds-brand")).toBe("glass");
  });
});

describe("LiquidGlass", () => {
  it("bends most at the very edge and not at all on the flat", () => {
    const profile = refractionProfile({ bezel: 14, depth: 12 });
    const first = profile[0]!;
    const last = profile[profile.length - 1]!;
    expect(first).toBeGreaterThan(last * 10);
    expect(last).toBeLessThan(0.2);
    // Monotonic enough to read as one smooth curve.
    expect(profile[32]!).toBeGreaterThan(profile[96]!);
  });

  it("measures distance in from a rounded rectangle, pointing inward", () => {
    // Middle of the left edge of a 200 × 100 box.
    expect(roundedRectInset(0, 50, 200, 100, 20)).toMatchObject({ distance: 0, nx: 1, ny: 0 });
    // On the top edge.
    expect(roundedRectInset(100, 4, 200, 100, 20)).toMatchObject({ distance: 4, nx: 0, ny: 1 });
    // Inside the top-left corner's arc: pointing diagonally in.
    const corner = roundedRectInset(10, 10, 200, 100, 20);
    expect(corner.nx).toBeGreaterThan(0);
    expect(corner.nx).toBeCloseTo(corner.ny);
  });

  it("is hidden from assistive tech and leaves its children on top", () => {
    render(<LiquidGlass data-testid="glass">Hello</LiquidGlass>);
    const glass = screen.getByTestId("glass");
    expect(glass).toHaveTextContent("Hello");
    expect(glass.querySelector("[aria-hidden]")).toHaveClass("glass");
  });

  it("uses the clear material when asked", () => {
    render(<LiquidGlass data-testid="glass" variant="clear" />);
    expect(screen.getByTestId("glass").querySelector("[aria-hidden]")).toHaveClass("glass-clear");
  });

  it("doesn't refract where the browser can't", () => {
    render(<LiquidGlass data-testid="glass" refract />);
    expect(screen.getByTestId("glass").querySelector("[data-refracting]")).toBeNull();
    expect(screen.getByTestId("glass").querySelector("svg")).toBeNull();
  });
});

describe("GlassTabBar", () => {
  const tabs = [
    { id: "home", label: "Home", icon: RiHome5Fill },
    { id: "mail", label: "Mail", icon: RiMailFill, badge: 3 },
    { id: "you", label: "You", icon: RiUser3Fill },
  ];

  it("selects a tab", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<GlassTabBar tabs={tabs} onSelectionChange={onSelectionChange} />);
    expect(screen.getByRole("tab", { name: "Home" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: /Mail/ }));
    expect(onSelectionChange).toHaveBeenCalledWith("mail");
    expect(screen.getByRole("tab", { name: /Mail/ })).toHaveAttribute("aria-selected", "true");
  });

  it("offers search apart from the tabs", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<GlassTabBar tabs={tabs} onSearch={onSearch} />);
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalled();
    expect(screen.queryByRole("tab", { name: "Search" })).not.toBeInTheDocument();
  });

  it("minimizes to the current tab, and expands when it's pressed", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    render(<GlassTabBar tabs={tabs} selected="mail" minimized onExpand={onExpand} accessory={<p>Mini player</p>} />);
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mail, show all tabs" }));
    expect(onExpand).toHaveBeenCalled();
    expect(screen.getByText("Mini player")).toBeInTheDocument();
  });

  it("minimizes on the way down and returns on the way up", () => {
    const element = document.createElement("div");
    const { result } = renderHook(() => useMinimizeOnScroll(useRef(element)));
    const scrollTo = (top: number) =>
      act(() => {
        element.scrollTop = top;
        element.dispatchEvent(new Event("scroll"));
      });
    expect(result.current).toBe(false);
    scrollTo(200);
    expect(result.current).toBe(true);
    scrollTo(205);
    expect(result.current).toBe(true);
    scrollTo(120);
    expect(result.current).toBe(false);
  });
});

describe("GlassToolbar", () => {
  it("runs actions, tracks toggles, and names every icon", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    function Bar() {
      const [liked, setLiked] = useState(false);
      return (
        <GlassToolbar
          aria-label="Actions"
          title="Photo"
          foldWidth={0}
          leading={[{ id: "a", actions: [{ id: "save", label: "Save", icon: RiHome5Fill, onPress: onSave }] }]}
          trailing={[{ id: "b", actions: [{ id: "like", label: "Like", icon: RiMailFill, isSelected: liked, onSelectedChange: setLiked }] }]}
        />
      );
    }
    render(<Bar />);
    expect(screen.getByRole("toolbar", { name: "Actions" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalled();
    const like = screen.getByRole("button", { name: "Like" });
    await user.click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
  });
});

describe("GlassToolbar when narrow", () => {
  it("folds trailing actions into a menu but keeps the prominent one out", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <GlassToolbar
        aria-label="Actions"
        foldWidth={9999}
        trailing={[{ id: "a", actions: [{ id: "save", label: "Save", icon: RiHome5Fill, onPress: onSave }, { id: "edit", label: "Edit", icon: RiMailFill, isProminent: true }] }]}
      />,
    );
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Save" }));
    expect(onSave).toHaveBeenCalled();
  });
});

describe("MorphMenu", () => {
  it("opens from its button and reports the choice", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <MorphMenu aria-label="Actions" onAction={onAction} sections={[{ id: "a", items: [{ id: "copy", label: "Copy" }, { id: "gone", label: "Delete", isDestructive: true }] }]}>
        Open
      </MorphMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Copy" }));
    expect(onAction).toHaveBeenCalledWith("copy");
  });
});

describe("GlassSheet", () => {
  it("names itself, moves between heights from the keyboard, and closes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onDetentChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <GlassSheet isOpen onOpenChange={onOpenChange} onDetentChange={onDetentChange} onConfirm={onConfirm} title="Add to album">
        Items
      </GlassSheet>,
    );
    expect(await screen.findByRole("dialog", { name: "Add to album" })).toBeInTheDocument();

    const handle = screen.getByRole("slider", { name: "Sheet height" });
    handle.focus();
    await user.keyboard("{ArrowUp}");
    expect(onDetentChange).toHaveBeenLastCalledWith(1);
    expect(handle).toHaveAttribute("aria-valuenow", "92");

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onConfirm).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("ControlCenter", () => {
  it("switches toggles and exposes real sliders", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onChange = vi.fn();
    render(
      <ControlCenter
        onToggle={onToggle}
        connectivity={[{ id: "wifi", label: "Wi-Fi", icon: RiWifiFill, defaultSelected: true }]}
        focus={{ id: "focus", label: "Focus", icon: RiHome5Fill }}
        brightness={{ label: "Brightness", icon: RiSunLine, defaultValue: 50, onChange }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Wi-Fi" }));
    expect(onToggle).toHaveBeenCalledWith("wifi", false);
    await user.click(screen.getByRole("button", { name: "Focus" }));
    expect(onToggle).toHaveBeenCalledWith("focus", true);

    const slider = screen.getByRole("slider", { name: "Brightness" });
    expect(slider).toHaveAttribute("aria-orientation", "vertical");
    fireEvent.change(slider, { target: { value: "70" } });
    expect(onChange).toHaveBeenCalledWith(70);
  });
});

describe("NowPlaying", () => {
  const queue: NowPlayingTrack[] = [
    { id: "a", title: "First", artist: "One", artwork: "red", duration: 90 },
    { id: "b", title: "Second", artist: "Two", artwork: "blue", duration: 120 },
  ];

  it("formats times", () => {
    expect(formatTrackTime(0)).toBe("0:00");
    expect(formatTrackTime(83)).toBe("1:23");
    expect(formatTrackTime(600)).toBe("10:00");
    expect(formatTrackTime(-3)).toBe("0:00");
  });

  it("plays, pauses and moves through the queue, wrapping at the ends", async () => {
    const user = userEvent.setup();
    const onTrackChange = vi.fn();
    const onPlayingChange = vi.fn();
    render(<NowPlaying queue={queue} onTrackChange={onTrackChange} onPlayingChange={onPlayingChange} />);
    expect(screen.getByText("First")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next track" }));
    expect(onTrackChange).toHaveBeenLastCalledWith(queue[1]);
    await user.click(screen.getByRole("button", { name: "Next track" }));
    expect(onTrackChange).toHaveBeenLastCalledWith(queue[0]);
    await user.click(screen.getByRole("button", { name: "Previous track" }));
    expect(onTrackChange).toHaveBeenLastCalledWith(queue[1]);
  });

  it("advances its clock while playing and rolls on at the end", () => {
    vi.useFakeTimers();
    try {
      render(<NowPlaying queue={queue} defaultPlaying />);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByRole("slider", { name: "Position" })).toHaveValue("3");
      for (let i = 0; i < 88; i += 1) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }
      expect(screen.getByText("Second")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("has a compact form", () => {
    render(<NowPlaying variant="mini" queue={queue} />);
    expect(screen.getByRole("group", { name: "Now playing" })).toHaveTextContent("First");
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });
});

describe("NotificationStack", () => {
  const notifications: StackNotification[] = [
    { id: "1", app: "Messages", title: "Mira", body: "First", time: "now" },
    { id: "2", app: "Messages", title: "Jonas", body: "Second", time: "4m" },
    { id: "3", app: "Mail", title: "Invoice", body: "Third", time: "8:02" },
  ];

  it("groups by app in the order they first appear", () => {
    expect(groupByApp(notifications).map((group) => [group.app, group.items.length])).toEqual([
      ["Messages", 2],
      ["Mail", 1],
    ]);
  });

  it("stacks several from one app, then opens them", async () => {
    const user = userEvent.setup();
    render(<NotificationStack notifications={notifications} />);
    expect(screen.getByText("1 more")).toBeInTheDocument();
    expect(screen.queryByText("Jonas")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Mira/ }));
    expect(await screen.findByText("Jonas")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show less" }));
    await waitFor(() => expect(screen.queryByText("Jonas")).not.toBeInTheDocument());
  });

  it("opens a single notification, and dismisses from its button or with Delete", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onDismiss = vi.fn();
    render(<NotificationStack notifications={notifications} onOpen={onOpen} onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: /^Invoice/ }));
    expect(onOpen).toHaveBeenCalledWith(notifications[2]);

    await user.click(screen.getByRole("button", { name: "Dismiss Invoice" }));
    expect(onDismiss).toHaveBeenCalledWith("3");

    screen.getByRole("button", { name: /^Mira/ }).focus();
    await user.keyboard("{Delete}");
    expect(onDismiss).toHaveBeenCalledWith("1");
  });

  it("says when there's nothing left", () => {
    render(<NotificationStack notifications={[]} />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });
});

describe("GlassDock", () => {
  const items = [
    { id: "mail", label: "Mail", icon: RiMailFill, isRunning: true },
    { id: "home", label: "Home", icon: RiHome5Fill },
  ];

  it("swells near the pointer and stays flat beyond its reach", () => {
    expect(dockIconSize(0, 50, 1.6, 100)).toBeCloseTo(80);
    expect(dockIconSize(100, 50, 1.6, 100)).toBeCloseTo(50);
    expect(dockIconSize(400, 50, 1.6, 100)).toBeCloseTo(50);
    expect(dockIconSize(-40, 50, 1.6, 100)).toBeCloseTo(dockIconSize(40, 50, 1.6, 100));
    expect(dockIconSize(30, 50, 1.6, 100)).toBeGreaterThan(dockIconSize(60, 50, 1.6, 100));
  });

  it("shrinks its icons to fit a narrow shelf, never growing past their size", () => {
    expect(fittedDockSize(1000, 8, true, 52)).toBe(52);
    expect(fittedDockSize(300, 8, true, 52)).toBe(27);
    expect(fittedDockSize(0, 8, true, 52)).toBe(52);
    expect(fittedDockSize(40, 8, false, 52)).toBe(24);
  });

  it("is one toolbar, and says what's running", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<GlassDock items={items} trailing={[{ id: "bin", label: "Bin", icon: RiUser3Fill }]} onSelect={onSelect} />);
    expect(screen.getByRole("toolbar", { name: "Dock" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mail, running" }));
    expect(onSelect).toHaveBeenCalledWith("mail");
    expect(screen.getByRole("button", { name: "Bin" })).toBeInTheDocument();
  });
});

describe("SpotlightSearch", () => {
  const groups: SpotlightGroup[] = [{ id: "apps", label: "Apps", results: [{ id: "mail", title: "Mail", subtitle: "Application" }] }];
  const categories = [{ id: "apps", label: "Apps", icon: RiHome5Fill }];

  it("searches, shows groups, and opens a result", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn(() => groups);
    const onSelect = vi.fn();
    render(<SpotlightSearch onSearch={onSearch} onSelect={onSelect} debounce={0} />);
    await user.type(screen.getByRole("combobox", { name: "Search" }), "mai");
    const option = await screen.findByRole("option", { name: "Mail, Application" });
    expect(onSearch).toHaveBeenLastCalledWith("mai", undefined);
    await user.click(option);
    expect(onSelect).toHaveBeenCalledWith(groups[0]!.results[0]);
  });

  it("narrows by category, which moves into the field and comes back out with Backspace", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn(() => groups);
    render(<SpotlightSearch onSearch={onSearch} categories={categories} debounce={0} />);
    await user.click(screen.getByRole("radio", { name: "Apps" }));
    expect(screen.getByRole("button", { name: "Remove Apps filter" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Apps" })).not.toBeInTheDocument();

    const field = screen.getByRole("combobox", { name: "Search" });
    await user.type(field, "m");
    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith("m", "apps"));
    await user.clear(field);
    await user.keyboard("{Backspace}");
    expect(screen.queryByRole("button", { name: "Remove Apps filter" })).not.toBeInTheDocument();
  });

  it("says when nothing matches", async () => {
    const user = userEvent.setup();
    render(<SpotlightSearch onSearch={() => []} debounce={0} emptyMessage="Nothing found" />);
    await user.type(screen.getByRole("combobox", { name: "Search" }), "zz");
    expect(await screen.findByText("Nothing found")).toBeInTheDocument();
  });
});

describe("WheelPicker", () => {
  const columns = [
    { id: "hour", label: "Hour", options: ["1", "2", "3", "4"].map((value) => ({ value, label: value })) },
    { id: "period", label: "Period", options: ["AM", "PM"].map((value) => ({ value, label: value })) },
  ];

  it("finds the row nearest a scroll position, within bounds", () => {
    expect(wheelIndexAt(0, 10)).toBe(0);
    expect(wheelIndexAt(17, 10)).toBe(0);
    expect(wheelIndexAt(19, 10)).toBe(1);
    expect(wheelIndexAt(9999, 10)).toBe(9);
    expect(wheelIndexAt(-40, 10)).toBe(0);
  });

  it("exposes each column as a spinbutton and moves with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WheelPicker columns={columns} defaultValue={{ hour: "2", period: "AM" }} onChange={onChange} />);
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    expect(hour).toHaveAttribute("aria-valuetext", "2");

    hour.focus();
    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith({ hour: "3", period: "AM" });
    expect(hour).toHaveAttribute("aria-valuetext", "3");

    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith({ hour: "4", period: "AM" });
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith({ hour: "1", period: "AM" });
  });

  it("stays inside its options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WheelPicker columns={columns} defaultValue={{ hour: "4", period: "PM" }} onChange={onChange} />);
    screen.getByRole("spinbutton", { name: "Hour" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(within(screen.getByRole("group", { name: "Picker" })).getByRole("spinbutton", { name: "Hour" })).toHaveAttribute("aria-valuetext", "4");
  });
});
