import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { CalendarDate, Time } from "@internationalized/date";
import { Avatar } from "./avatar/avatar";
import { AvatarGroup } from "./avatar-group/avatar-group";
import { BottomNavigation } from "./bottom-navigation/bottom-navigation";
import { Button } from "./button/button";
import { Calendar, RangeCalendar } from "./calendar/calendar";
import { CodeBlock } from "./code-block/code-block";
import { CopyButton } from "./copy-button/copy-button";
import { EditableText } from "./editable-text/editable-text";
import { formatCompactNumber, formatRelativeTime, FormattedNumber } from "./format/format";
import { Grid, Stack } from "./layout/layout";
import { Link } from "./link/link";
import { PhoneField, toE164 } from "./phone-field/phone-field";
import { ProgressCircle } from "./progress-circle/progress-circle";
import { DateTimePicker, TimePicker, timeSlots } from "./time-picker/time-picker";
import { Tour } from "./tour/tour";
import { Blockquote, Heading, Text } from "./typography/typography";
import { VirtualList } from "./virtual-list/virtual-list";
import { ListItem } from "./list/list";
import { SkipLink, VisuallyHidden } from "./visually-hidden/visually-hidden";
import { ThemeProvider, useTheme } from "../foundations/theme";

describe("Calendar and RangeCalendar", () => {
  it("selects a day from the grid", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar aria-label="Delivery" defaultFocusedValue={new CalendarDate(2026, 11, 1)} onChange={onChange} />);
    expect(screen.getByRole("application", { name: /Delivery/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /12/ }));
    expect(onChange.mock.calls[0]![0].toString()).toBe("2026-11-12");
  });

  it("shows several months for a range", () => {
    render(<RangeCalendar aria-label="Stay" visibleMonths={2} defaultFocusedValue={new CalendarDate(2026, 11, 1)} />);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
  });
});

describe("TimePicker", () => {
  it("builds slots inside the bounds", () => {
    const slots = timeSlots(60, new Time(9), new Time(12));
    expect(slots.map((t) => t.toString())).toEqual(["09:00:00", "10:00:00", "11:00:00", "12:00:00"]);
  });

  it("sets the time from the list", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker label="Starts" interval={30} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Choose a time" }));
    const list = await screen.findByRole("listbox", { name: "Times" });
    await user.click(within(list).getAllByRole("option")[19]!);
    expect(onChange.mock.calls.at(-1)![0].toString()).toBe("09:30:00");
  });
});

describe("DateTimePicker", () => {
  it("opens a calendar with a time row", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker label="Publish at" />);
    await user.click(screen.getByRole("button", { name: /Open calendar/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("grid")).toBeInTheDocument();
    expect(within(dialog).getByRole("group", { name: "Time" })).toBeInTheDocument();
  });
});

describe("Link", () => {
  it("marks external links for screen readers", () => {
    render(
      <Link href="https://example.com" isExternal>
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Docs (opens in a new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("AvatarGroup", () => {
  it("counts the people it doesn't show", () => {
    render(
      <AvatarGroup aria-label="Editors" max={2} total={10}>
        <Avatar aria-label="Riley Chen" initials="RC" />
        <Avatar aria-label="Sam Patel" initials="SP" />
        <Avatar aria-label="Jordan Lee" initials="JL" />
      </AvatarGroup>,
    );
    const group = screen.getByRole("group", { name: "Editors" });
    expect(within(group).getAllByRole("img").map((a) => a.getAttribute("aria-label"))).toEqual(["Riley Chen", "Sam Patel", "8 more"]);
  });
});

describe("ProgressCircle", () => {
  it("reports its value", () => {
    render(<ProgressCircle aria-label="Upload" value={40} showValue />);
    expect(screen.getByRole("progressbar", { name: "Upload" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
});

describe("CopyButton and CodeBlock", () => {
  it("copies and announces it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onCopy = vi.fn();
    render(<CopyButton value="sk_test_123" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("sk_test_123");
    expect(onCopy).toHaveBeenCalledWith("sk_test_123");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
  });

  it("shows line numbers that aren't part of the code", () => {
    const { container } = render(<CodeBlock code={"one\ntwo"} title="a.ts" showLineNumbers />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
    const numbers = container.querySelectorAll("[aria-hidden]");
    expect([...numbers].map((n) => n.textContent)).toContain("2");
  });
});

describe("Typography and layout", () => {
  it("renders headings at their level and text as paragraphs", () => {
    render(
      <Stack gap={2}>
        <Heading level={1}>Title</Heading>
        <Text tone="secondary">Body</Text>
        <Blockquote cite="Someone">Quote</Blockquote>
        <Grid columns={2}>
          <span>a</span>
        </Grid>
      </Stack>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Body").tagName).toBe("P");
    expect(screen.getByRole("figure")).toHaveTextContent("— Someone");
  });
});

describe("ThemeProvider", () => {
  function Switch() {
    const { theme, setTheme } = useTheme();
    return (
      <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme}
      </button>
    );
  }

  it("sets data-theme on the document and remembers it", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey="test-theme">
        <Switch />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "system" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("test-theme")).toBe("dark");
  });
});

describe("SkipLink and VisuallyHidden", () => {
  it("moves focus to the main content", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SkipLink />
        <main id="main">Content</main>
        <button type="button">
          Read more<VisuallyHidden> about tokens</VisuallyHidden>
        </button>
      </>,
    );
    await user.click(screen.getByRole("link", { name: "Skip to content" }));
    expect(screen.getByRole("main")).toHaveFocus();
    expect(screen.getByRole("button", { name: "Read more about tokens" })).toBeInTheDocument();
  });
});

describe("EditableText", () => {
  it("saves on Enter and cancels on Escape", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableText label="Title" defaultValue="Draft" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Edit Title: Draft" }));
    const field = screen.getByRole("textbox", { name: "Title" });
    await user.clear(field);
    await user.type(field, "Final{Enter}");
    expect(onChange).toHaveBeenCalledWith("Final");
    const display = screen.getByRole("button", { name: "Edit Title: Final" });
    await waitFor(() => expect(display).toHaveFocus());

    await user.click(display);
    await user.type(screen.getByRole("textbox", { name: "Title" }), "zzz{Escape}");
    expect(screen.getByRole("button", { name: "Edit Title: Final" })).toBeInTheDocument();
  });

  it("keeps editing while validation fails", async () => {
    const user = userEvent.setup();
    render(<EditableText label="Title" defaultValue="Draft" validate={(v) => (v ? null : "Needs a title.")} />);
    await user.click(screen.getByRole("button", { name: /Edit Title/ }));
    await user.clear(screen.getByRole("textbox"));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Needs a title.");
  });
});

describe("PhoneField", () => {
  it("returns the number in E.164", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneField label="Mobile" defaultCountry="PT" onChange={onChange} />);
    await user.type(screen.getByRole("textbox", { name: "Mobile" }), "912 345 678");
    expect(onChange).toHaveBeenLastCalledWith({ country: "PT", national: "912 345 678", e164: "+351912345678" });
    expect(toE164("44", "07700 900123")).toBe("+447700900123");
  });
});

describe("Tour", () => {
  function Demo({ onFinish }: { onFinish: () => void }) {
    const a = useRef<HTMLButtonElement>(null);
    const b = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button ref={a}>Search</Button>
        <Button ref={b}>New</Button>
        <Tour
          isOpen={open}
          onOpenChange={setOpen}
          onFinish={onFinish}
          steps={[
            { target: a, title: "Find anything", content: "Search here." },
            { target: b, title: "Start a board", content: "Make one here." },
          ]}
        />
      </>
    );
  }

  it("walks through the steps and finishes", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Demo onFinish={onFinish} />);
    expect(await screen.findByRole("dialog", { name: "Find anything" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("dialog", { name: "Start a board" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onFinish).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("BottomNavigation", () => {
  it("marks the current destination and reads badges", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const Icon = () => <svg aria-hidden />;
    render(
      <BottomNavigation
        aria-label="Main"
        currentId="home"
        onNavigate={onNavigate}
        items={[
          { id: "home", label: "Home", icon: Icon },
          { id: "inbox", label: "Inbox", icon: Icon, badge: 3 },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
    // jsdom's name computation spaces out nested spans; browsers read "Inbox, 3 new".
    await user.click(screen.getByRole("button", { name: /^Inbox ?, 3 new$/ }));
    expect(onNavigate).toHaveBeenCalledWith("inbox");
  });
});

describe("VirtualList", () => {
  it("tells assistive tech the full count", () => {
    // jsdom has no layout, so every row renders here; keep the count small.
    const items = Array.from({ length: 120 }, (_, i) => ({ id: i + 1, name: `Person ${i + 1}` }));
    render(
      <VirtualList aria-label="Contacts" items={items}>
        {(p) => <ListItem id={p.id} title={p.name} />}
      </VirtualList>,
    );
    expect(screen.getByRole("grid", { name: "Contacts" })).toHaveAttribute("aria-rowcount", "120");
  });
});

describe("Formatting", () => {
  it("formats relative times and compact numbers", () => {
    const now = Date.UTC(2026, 10, 2, 12);
    expect(formatRelativeTime(now - 5 * 60_000, { now, locale: "en-US" })).toBe("5 minutes ago");
    expect(formatRelativeTime(now - 26 * 3600_000, { now, locale: "en-US" })).toBe("yesterday");
    expect(formatRelativeTime(now + 3 * 86400_000, { now, locale: "en-US" })).toBe("in 3 days");
    expect(formatCompactNumber(1284, "en-US")).toBe("1.3K");
    render(<FormattedNumber value={3_480_000} compact />);
    expect(screen.getByText("3.5M")).toHaveAttribute("title", "3,480,000");
  });
});

