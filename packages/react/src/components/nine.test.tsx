import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RiAddLine } from "@remixicon/react";
import { Button } from "./button/button";
import { DialogTrigger, Dialog } from "./dialog/dialog";
import { BottomSheet } from "./bottom-sheet/bottom-sheet";
import { Countdown, formatElapsed } from "./countdown/countdown";
import { FloatingActionButton } from "./floating-button/floating-button";
import { MentionsInput, findMentions } from "./mentions-input/mentions-input";
import { Schedule } from "./schedule/schedule";
import { SideNavigation } from "./side-navigation/side-navigation";
import { TableOfContents } from "./table-of-contents/table-of-contents";
import { TreeSelect, treePath } from "./tree-select/tree-select";
import { DonutChartCard } from "../charts/donut-chart/donut-chart-card";

const PEOPLE = [
  { id: "ada", label: "Ada Lovelace" },
  { id: "alan", label: "Alan Turing" },
  { id: "grace", label: "Grace Hopper" },
];

describe("DonutChartCard", () => {
  it("describes every share in text", () => {
    render(<DonutChartCard data={[{ label: "Direct", value: 75 }, { label: "Email", value: 25 }]} />);
    expect(screen.getByText(/Direct 75 \(75%\), Email 25 \(25%\)/)).toBeInTheDocument();
  });
});

describe("SideNavigation", () => {
  it("opens the group holding the current page and toggles groups", async () => {
    const user = userEvent.setup();
    render(
      <SideNavigation
        aria-label="Docs"
        currentId="tokens"
        sections={[
          {
            title: "Guides",
            items: [
              { id: "start", label: "Getting started", href: "#start" },
              { id: "theming", label: "Theming", items: [{ id: "tokens", label: "Tokens", href: "#tokens" }] },
              { id: "api", label: "API", items: [{ id: "hooks", label: "Hooks", href: "#hooks" }] },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Tokens" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Theming" })).toHaveAttribute("aria-expanded", "true");
    const api = screen.getByRole("button", { name: "API" });
    expect(api).toHaveAttribute("aria-expanded", "false");
    await user.click(api);
    expect(screen.getByRole("link", { name: "Hooks" })).toBeVisible();
  });
});

describe("TableOfContents", () => {
  it("moves focus to the heading it links to", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <TableOfContents updateHash={false} items={[{ id: "intro", label: "Intro" }, { id: "usage", label: "Usage", level: 3 }]} />
        <h2 id="intro">Intro</h2>
        <h3 id="usage">Usage</h3>
      </>,
    );
    await user.click(screen.getByRole("link", { name: "Usage" }));
    expect(screen.getByRole("heading", { name: "Usage" })).toHaveFocus();
    expect(screen.getByRole("link", { name: "Usage" })).toHaveAttribute("aria-current", "location");
  });
});

describe("MentionsInput", () => {
  it("suggests on @ and inserts with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MentionsInput label="Comment" options={PEOPLE} onChange={onChange} />);
    const box = screen.getByRole("textbox", { name: "Comment" });
    await user.type(box, "Thanks @gr");
    const list = screen.getByRole("listbox", { name: "Suggestions" });
    expect(within(list).getAllByRole("option").map((o) => o.textContent)).toEqual(["Grace Hopper"]);
    await user.keyboard("{Enter}");
    expect(box).toHaveValue("Thanks @Grace Hopper ");
    expect(onChange).toHaveBeenLastCalledWith("Thanks @Grace Hopper ", [PEOPLE[2]]);
  });

  it("finds mentions in order", () => {
    expect(findMentions("@Alan Turing and @Ada Lovelace", PEOPLE).map((p) => p.id)).toEqual(["alan", "ada"]);
  });
});

const TREE = [
  { id: "design", label: "Design", children: [{ id: "brand", label: "Brand", children: [{ id: "logos", label: "Logos" }] }] },
  { id: "eng", label: "Engineering" },
];

describe("TreeSelect", () => {
  it("shows the path of the chosen node", () => {
    render(<TreeSelect label="Folder" items={TREE} defaultValue="logos" />);
    expect(screen.getByRole("button", { name: /Folder.*Design.*Brand.*Logos/ })).toBeInTheDocument();
    expect(treePath(TREE, "logos").map((n) => n.label)).toEqual(["Design", "Brand", "Logos"]);
  });

  it("chooses from the tree", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TreeSelect label="Folder" items={TREE} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /Folder/ }));
    const tree = await screen.findByRole("treegrid");
    await user.click(within(tree).getByRole("row", { name: "Engineering" }));
    expect(onChange).toHaveBeenCalledWith("eng", [TREE[1]]);
  });
});

describe("FloatingActionButton", () => {
  it("is named by its label even when only the icon shows", () => {
    render(<FloatingActionButton icon={RiAddLine} label="New task" placement="static" />);
    expect(screen.getByRole("button", { name: "New task" })).toBeInTheDocument();
  });
});

describe("Countdown", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it("counts down and calls onComplete at zero", () => {
    const onComplete = vi.fn();
    const now = Date.now();
    render(<Countdown to={now + 3 * 3600_000 + 5_000} units={["hours", "minutes", "seconds"]} onComplete={onComplete} label="Sale ends in" />);
    expect(screen.getByRole("timer", { name: "Sale ends in" })).toHaveTextContent("3 hours, 0 minutes, 5 seconds");
    act(() => vi.advanceTimersByTime(3 * 3600_000 + 6_000));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.getByRole("timer")).toHaveTextContent("Time's up");
  });

  it("formats elapsed time", () => {
    expect(formatElapsed(65_430)).toBe("01:05.43");
    expect(formatElapsed(3_725_000)).toBe("1:02:05");
  });
});

describe("BottomSheet", () => {
  it("opens a dialog with a resize handle", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Filters</Button>
        <BottomSheet>
          <Dialog title="Filters">Body</Dialog>
        </BottomSheet>
      </DialogTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    const handle = screen.getByRole("button", { name: /Resize sheet, 50%/ });
    await user.click(handle);
    expect(screen.getByRole("button", { name: /Resize sheet, 92%/ })).toBeInTheDocument();
  });
});

describe("Schedule", () => {
  it("places events in their day, named with their times", async () => {
    const user = userEvent.setup();
    const onEventPress = vi.fn();
    const day = new Date(2026, 10, 4);
    const at = (h: number, m = 0) => new Date(2026, 10, 4, h, m);
    render(
      <Schedule
        defaultDate={day}
        onEventPress={onEventPress}
        events={[
          { id: "a", title: "Design review", start: at(10), end: at(11), location: "Room 2" },
          { id: "b", title: "Standup", start: at(10, 30), end: at(10, 45) },
        ]}
      />,
    );
    const wednesday = screen.getByRole("group", { name: /4 November|November 4/ });
    const buttons = within(wednesday).getAllByRole("button");
    expect(buttons[0]).toHaveAccessibleName(/^Design review, 10:00.*to 11:00.*, Room 2$/);
    await user.click(buttons[1]!);
    expect(onEventPress.mock.calls[0]![0].id).toBe("b");
    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.queryByRole("group", { name: /4 November|November 4/ })).not.toBeInTheDocument();
  });
});

