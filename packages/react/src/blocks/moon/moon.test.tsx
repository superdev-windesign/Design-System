import { CalendarDate, Time } from "@internationalized/date";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { useState } from "react";
import { ThemeProvider, ThemeScope, useTheme } from "../../foundations/theme";
import { AppSidebar } from "./app-sidebar";
import { AuthFlow } from "./auth-flow";
import { DateTimeRangePicker } from "./date-time-range-picker";
import { ExpandableTable } from "./expandable-table";
import { Leaderboard } from "./leaderboard";
import { MetricChart } from "./metric-chart";
import { PaymentFields, detectCardBrand, formatCardNumber, formatExpiry, isExpiryValid, passesLuhn } from "./payment-fields";
import { SearchBox, highlightParts, type SearchResultGroup } from "./search-box";
import { SnapSheet, nearestSnap } from "./snap-sheet";
import { TagCombobox } from "./tag-combobox";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("the Moon brand", () => {
  function Switcher() {
    const { brand, setBrand } = useTheme();
    return <button onClick={() => setBrand(brand === "moon" ? "windesign" : "moon")}>{brand}</button>;
  }

  afterEach(() => {
    delete document.documentElement.dataset.brand;
    localStorage.clear();
  });

  it("marks the page, remembers the choice and clears the mark for the house brand", async () => {
    const user = userEvent.setup();
    const onBrandChange = vi.fn();
    render(
      <ThemeProvider onBrandChange={onBrandChange}>
        <Switcher />
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset.brand).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "windesign" }));
    expect(document.documentElement.dataset.brand).toBe("moon");
    expect(localStorage.getItem("ds-brand")).toBe("moon");
    expect(onBrandChange).toHaveBeenLastCalledWith("moon");

    await user.click(screen.getByRole("button", { name: "moon" }));
    expect(document.documentElement.dataset.brand).toBeUndefined();
    expect(localStorage.getItem("ds-brand")).toBeNull();
  });

  it("starts on the stored brand", () => {
    localStorage.setItem("ds-brand", "moon");
    render(
      <ThemeProvider>
        <Switcher />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "moon" })).toBeInTheDocument();
    expect(document.documentElement.dataset.brand).toBe("moon");
  });

  it("scopes a brand to one region without touching the page", () => {
    render(
      <ThemeScope brand="moon" theme="dark" data-testid="scope">
        Preview
      </ThemeScope>,
    );
    const scope = screen.getByTestId("scope");
    expect(scope).toHaveAttribute("data-brand", "moon");
    expect(scope).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.dataset.brand).toBeUndefined();
  });
});

describe("DateTimeRangePicker", () => {
  const value = { start: new CalendarDate(2026, 3, 9), end: new CalendarDate(2026, 3, 13), startTime: new Time(9), endTime: new Time(17, 30) };

  it("holds choices back until Apply, and sets each end's time separately", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<DateTimeRangePicker defaultValue={value} onApply={onApply} minuteStep={15} />);

    await user.click(screen.getByRole("option", { name: "10" }));
    await user.click(screen.getByRole("radio", { name: "End" }));
    await user.click(screen.getByRole("option", { name: "45" }));
    expect(onApply).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledTimes(1);
    const range = onApply.mock.calls[0]![0];
    expect(range.startTime.toString()).toBe("10:00:00");
    expect(range.endTime.toString()).toBe("17:45:00");
  });

  it("won't apply a same-day range that ends before it starts", async () => {
    const day = new CalendarDate(2026, 3, 9);
    render(<DateTimeRangePicker defaultValue={{ start: day, end: day, startTime: new Time(12), endTime: new Time(9) }} />);
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("only offers Clear when asked to", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { rerender } = render(<DateTimeRangePicker defaultValue={value} />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();

    rerender(<DateTimeRangePicker defaultValue={value} onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(screen.getByText("Pick a start and an end date")).toBeInTheDocument();
  });

  it("can start the week on Monday", () => {
    render(<DateTimeRangePicker defaultValue={value} firstDayOfWeek="mon" />);
    expect(screen.getAllByRole("columnheader", { hidden: true })[0]).toHaveTextContent("M");
  });
});

describe("Leaderboard", () => {
  const entries = Array.from({ length: 8 }, (_, index) => ({ id: `p${index}`, name: `Player ${index}`, score: 100 - index }));

  it("pins the current player when they're off the visible list", () => {
    render(<Leaderboard title="Top" entries={entries} currentUserId="p7" pageSize={4} />);
    expect(screen.getByText("Player 7")).toBeInTheDocument();
    expect(screen.queryByText("Player 6")).not.toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("numbers every rank", () => {
    render(<Leaderboard title="Top" entries={entries} pageSize={4} />);
    for (const rank of ["1", "2", "3", "4"]) expect(screen.getByText(rank)).toBeInTheDocument();
  });

  it("switches boards by period", async () => {
    const user = userEvent.setup();
    render(
      <Leaderboard
        title="Top"
        periods={[
          { id: "day", label: "Day", entries: entries.slice(0, 2) },
          { id: "week", label: "Week", entries: [{ id: "w", name: "Weekly winner", score: 9 }] },
        ]}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "Week" }));
    expect(await screen.findByText("Weekly winner")).toBeInTheDocument();
  });
});

describe("AuthFlow", () => {
  it("signs in, then asks for the code and finishes", async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    const onVerify = vi.fn(() => true);
    const onComplete = vi.fn();
    render(<AuthFlow providers={[]} onSignIn={onSignIn} onVerify={onVerify} onComplete={onComplete} />);

    await user.type(screen.getByRole("textbox", { name: /email/i }), "mira@example.com");
    await user.type(screen.getByLabelText(/^password/i), "correct horse");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(onSignIn).toHaveBeenCalled());
    expect(onSignIn.mock.calls[0]![0]).toMatchObject({ email: "mira@example.com", password: "correct horse" });

    // The code step starts in the first box, so typing just works.
    expect(await screen.findByRole("textbox", { name: "Digit 1 of 6" })).toHaveFocus();
    await user.keyboard("123456");
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("123456"));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it("reveals the password on request", async () => {
    const user = userEvent.setup();
    render(<AuthFlow providers={[]} />);
    const field = screen.getByLabelText(/^password/i);
    expect(field).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(field).toHaveAttribute("type", "text");
  });

  it("won't submit with fields missing, and says so", async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    render(<AuthFlow providers={[]} onSignIn={onSignIn} />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onSignIn).not.toHaveBeenCalled();
    expect(await screen.findByText("Check the highlighted fields.")).toBeInTheDocument();
  });

  it("stays put and shows the message when a handler refuses", async () => {
    const user = userEvent.setup();
    render(<AuthFlow providers={[]} onSignIn={() => "That password isn't right."} />);
    await user.type(screen.getByRole("textbox", { name: /email/i }), "mira@example.com");
    await user.type(screen.getByLabelText(/^password/i), "wrong");
    await user.keyboard("{Enter}");
    expect(await screen.findByText("That password isn't right.")).toBeInTheDocument();
    expect(screen.queryByLabelText("One-time code")).not.toBeInTheDocument();
  });
});

describe("AppSidebar", () => {
  const sections = [
    {
      id: "main",
      items: [
        { id: "home", label: "Home" },
        { id: "reports", label: "Reports", items: [{ id: "revenue", label: "Revenue" }] },
      ],
    },
  ];

  it("selects rows, opens a branch and marks the current page", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AppSidebar sections={sections} selected="home" onSelect={onSelect} aria-label="App" />);
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "Reports" }));
    await user.click(await screen.findByRole("button", { name: "Revenue" }));
    expect(onSelect).toHaveBeenCalledWith("revenue");
  });

  it("folds to a rail where branches open as a menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AppSidebar sections={sections} defaultCollapsed onSelect={onSelect} aria-label="App" />);
    await user.click(screen.getByRole("button", { name: "Reports" }));
    await user.click(await screen.findByRole("menuitem", { name: "Revenue" }));
    expect(onSelect).toHaveBeenCalledWith("revenue");
  });
});

describe("MetricChart", () => {
  const metrics = [
    {
      id: "revenue",
      label: "Revenue",
      formatValue: (value: number) => `$${value}`,
      points: { week: [{ label: "Mon", value: 10, previous: 5 }, { label: "Tue", value: 30, previous: 5 }] },
    },
    { id: "refunds", label: "Refunds", lowerIsBetter: true, points: { week: [{ label: "Mon", value: 2, previous: 4 }] } },
  ];

  it("totals each metric and switches between them", async () => {
    const user = userEvent.setup();
    render(<MetricChart title="Performance" metrics={metrics} periods={[{ id: "week", label: "Week" }]} />);
    const options = within(screen.getByRole("radiogroup", { name: "Metric" }));
    expect(options.getByRole("radio", { name: "Revenue" })).toBeChecked();
    await user.click(options.getByRole("radio", { name: "Refunds" }));
    expect(options.getByRole("radio", { name: "Refunds" })).toBeChecked();
  });

  it("turns the comparison off from the legend, and switches to bars from the corner", async () => {
    const user = userEvent.setup();
    render(<MetricChart title="Performance" metrics={metrics} periods={[{ id: "week", label: "Week" }]} />);
    const legend = screen.getByRole("button", { name: "Previous period" });
    expect(legend).toHaveAttribute("aria-pressed", "true");
    await user.click(legend);
    expect(legend).toHaveAttribute("aria-pressed", "false");

    const bars = screen.getByRole("radio", { name: "Bar chart" });
    await user.click(bars);
    expect(bars).toBeChecked();
  });
});

describe("ExpandableTable", () => {
  interface Row {
    id: string;
    name: string;
    amount: number;
  }
  const rows: Row[] = [
    { id: "a", name: "Ada", amount: 30 },
    { id: "b", name: "Ben", amount: 10 },
    { id: "c", name: "Cy", amount: 20 },
  ];
  const columns = [
    { key: "name", label: "Name", sortValue: (row: Row) => row.name },
    { key: "amount", label: "Amount", sortValue: (row: Row) => row.amount },
  ];
  const props = { "aria-label": "People", columns, rows, getRowId: (row: Row) => row.id, getRowLabel: (row: Row) => row.name };

  it("sorts, and says which way", async () => {
    const user = userEvent.setup();
    render(<ExpandableTable {...props} />);
    await user.click(screen.getByRole("button", { name: /Amount/ }));
    expect(screen.getByRole("columnheader", { name: /Amount/ })).toHaveAttribute("aria-sort", "ascending");
    const firstRow = screen.getAllByRole("row")[1]!;
    expect(within(firstRow).getByText("Ben")).toBeInTheDocument();
  });

  it("opens a row's detail", async () => {
    const user = userEvent.setup();
    render(<ExpandableTable {...props} renderExpanded={(row) => <p>About {row.name}</p>} />);
    const toggle = screen.getByRole("button", { name: "Details for Ada" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("About Ada")).toBeInTheDocument();
  });

  it("selects rows for bulk actions and clears them afterwards", async () => {
    const user = userEvent.setup();
    const act = vi.fn();
    render(
      <ExpandableTable
        {...props}
        selectable
        renderBulkActions={(selected, clear) => (
          <button
            onClick={() => {
              act(selected.map((row) => row.name));
              clear();
            }}
          >
            Remind
          </button>
        )}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Select Ada" }));
    await user.click(screen.getByRole("checkbox", { name: "Select Cy" }));
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remind" }));
    expect(act).toHaveBeenCalledWith(["Ada", "Cy"]);
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });
});

describe("TagCombobox", () => {
  const groups = [
    {
      id: "eu",
      label: "Europe",
      options: [
        { id: "de", label: "Germany", keywords: "DE" },
        { id: "fr", label: "France" },
      ],
    },
    { id: "as", label: "Asia", options: [{ id: "jp", label: "Japan" }] },
  ];

  function Controlled({ onChange }: { onChange: (keys: string[]) => void }) {
    const [keys, setKeys] = useState(["de"]);
    return (
      <TagCombobox
        label="Markets"
        groups={groups}
        selectedKeys={keys}
        onSelectionChange={(next) => {
          setKeys(next);
          onChange(next);
        }}
      />
    );
  }

  it("clears everything from the counter, without opening the list", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Clear 1 selected" }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.queryByRole("button", { name: /^Clear/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters as you type, on keywords too, and keeps the list open across picks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "Markets" }));
    await user.click(await screen.findByRole("option", { name: "Japan" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining(["de", "jp"]));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.type(screen.getByRole("combobox", { name: "Markets" }), "DE");
    expect(await screen.findByRole("option", { name: "Germany" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "France" })).not.toBeInTheDocument();
  });

  it("counts what's chosen in one chip", () => {
    render(<TagCombobox label="Markets" groups={groups} defaultSelectedKeys={["de", "fr", "jp"]} />);
    expect(screen.getByRole("button", { name: "Clear 3 selected" })).toHaveTextContent("3");
  });
});

describe("SearchBox", () => {
  const groups: SearchResultGroup[] = [{ id: "pages", label: "Pages", results: [{ id: "billing", title: "Billing", description: "Invoices" }] }];

  it("searches once typing settles, and ignores the title for filtering", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn(() => groups);
    const onSelect = vi.fn();
    render(<SearchBox onSearch={onSearch} onSelect={onSelect} debounce={0} />);
    // "Invoices" matches the description only; the results shown are onSearch's call.
    await user.type(screen.getByRole("combobox", { name: "Search" }), "Invoices");
    const option = await screen.findByRole("option", { name: /Billing/ });
    expect(onSearch).toHaveBeenLastCalledWith("Invoices");
    await user.click(option);
    expect(onSelect).toHaveBeenCalledWith(groups[0]!.results[0]);
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("drops an answer that arrives after a newer search", async () => {
    const user = userEvent.setup();
    const answers: Record<string, (found: SearchResultGroup[]) => void> = {};
    const onSearch = (query: string) => new Promise<SearchResultGroup[]>((resolve) => void (answers[query] = resolve));
    render(<SearchBox onSearch={onSearch} debounce={0} />);
    const field = screen.getByRole("combobox", { name: "Search" });

    await user.type(field, "a");
    await waitFor(() => expect(answers.a).toBeDefined());
    await user.type(field, "b");
    await waitFor(() => expect(answers.ab).toBeDefined());

    await act(async () => answers.ab!([{ id: "new", label: "New", results: [{ id: "fresh", title: "Fresh" }] }]));
    await act(async () => answers.a!([{ id: "old", label: "Old", results: [{ id: "stale", title: "Stale" }] }]));
    expect(await screen.findByRole("option", { name: "Fresh" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Stale" })).not.toBeInTheDocument();
  });

  it("offers suggestions and recent searches when empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchBox onSearch={() => []} onSubmit={onSubmit} suggestions={[{ id: "start", label: "Getting started" }]} recent={["Refunds"]} />);
    await user.click(screen.getByRole("combobox", { name: "Search" }));
    expect(await screen.findByRole("option", { name: "Getting started" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Refunds" }));
    expect(onSubmit).toHaveBeenCalledWith("Refunds");
    expect(screen.getByRole("combobox", { name: "Search" })).toHaveValue("Refunds");
  });

  it("searches for a suggestion when it's chosen", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchBox onSearch={() => []} onSubmit={onSubmit} suggestions={[{ id: "start", label: "Getting started" }]} />);
    await user.click(screen.getByRole("combobox", { name: "Search" }));
    await user.click(await screen.findByRole("option", { name: "Getting started" }));
    expect(onSubmit).toHaveBeenCalledWith("Getting started");
  });

  it("removes a recent search with its button, and with Delete from the keyboard", async () => {
    const user = userEvent.setup();
    const onRemoveRecent = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchBox onSearch={() => []} onSubmit={onSubmit} recent={["Refunds", "Billing"]} onRemoveRecent={onRemoveRecent} />);
    await user.click(screen.getByRole("combobox", { name: "Search" }));
    await screen.findByRole("option", { name: "Refunds" });

    const [remove] = screen.getAllByText("Remove");
    await user.click(remove!);
    expect(onRemoveRecent).toHaveBeenCalledWith("Refunds");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard("{ArrowDown}{Delete}");
    expect(onRemoveRecent).toHaveBeenCalledTimes(2);
  });

  it("submits free text on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchBox onSearch={() => []} onSubmit={onSubmit} debounce={0} />);
    await user.type(screen.getByRole("combobox", { name: "Search" }), "anything{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("anything");
  });

  it("finds where a match sits, ignoring case", () => {
    expect(highlightParts("Billing", "ILL")).toEqual({ before: "B", match: "ill", after: "ing" });
    expect(highlightParts("Billing", "zzz")).toBeNull();
    expect(highlightParts("Billing", "  ")).toBeNull();
  });
});

describe("SnapSheet", () => {
  it("settles where a release would coast to", () => {
    const heights = [300, 700];
    expect(nearestSnap(heights, 450, 0)).toBe(0);
    expect(nearestSnap(heights, 550, 0)).toBe(1);
    // Flicked upward from low down: momentum carries it to the top stop.
    expect(nearestSnap(heights, 400, -1500)).toBe(1);
    // Flicked downward from high up.
    expect(nearestSnap(heights, 600, 1500)).toBe(0);
  });

  it("steps between stops from the keyboard and closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSnapChange = vi.fn();
    render(
      <SnapSheet isOpen onOpenChange={onOpenChange} onSnapChange={onSnapChange} title="Order">
        Items
      </SnapSheet>,
    );
    const handle = await screen.findByRole("slider", { name: "Sheet height" });
    expect(handle).toHaveAttribute("aria-valuenow", "40");

    handle.focus();
    await user.keyboard("{ArrowUp}");
    expect(onSnapChange).toHaveBeenLastCalledWith(1);
    expect(handle).toHaveAttribute("aria-valuenow", "90");

    await user.keyboard("{Home}");
    expect(onSnapChange).toHaveBeenLastCalledWith(0);

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("has no close button: the scrim, a drag or Escape close it", async () => {
    render(
      <SnapSheet isOpen onOpenChange={() => {}} title="Order">
        Items
      </SnapSheet>,
    );
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("names the dialog after its title", async () => {
    render(
      <SnapSheet isOpen onOpenChange={() => {}} title="Order">
        Items
      </SnapSheet>,
    );
    expect(await screen.findByRole("dialog", { name: "Order" })).toBeInTheDocument();
  });
});

describe("PaymentFields", () => {
  const now = new Date(2026, 10, 4);

  it("recognises the networks", () => {
    expect(detectCardBrand("4242")).toBe("visa");
    expect(detectCardBrand("5555")).toBe("mastercard");
    expect(detectCardBrand("2223")).toBe("mastercard");
    expect(detectCardBrand("3782")).toBe("amex");
    expect(detectCardBrand("6011")).toBe("discover");
    expect(detectCardBrand("9999")).toBe("unknown");
  });

  it("groups digits the way each network prints them", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
    expect(formatCardNumber("42424")).toBe("4242 4");
  });

  it("checks the Luhn digit", () => {
    expect(passesLuhn("4242424242424242")).toBe(true);
    expect(passesLuhn("378282246310005")).toBe(true);
    expect(passesLuhn("4242424242424241")).toBe(false);
    expect(passesLuhn("42")).toBe(false);
  });

  it("shapes the expiry, including autofilled four-digit years", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("5")).toBe("05");
    expect(formatExpiry("123")).toBe("12/3");
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("12/2028")).toBe("12/28");
    expect(formatExpiry("3/2029")).toBe("03/29");
  });

  it("treats a card as good through its expiry month", () => {
    expect(isExpiryValid("11/26", now)).toBe(true);
    expect(isExpiryValid("10/26", now)).toBe(false);
    expect(isExpiryValid("01/27", now)).toBe(true);
    expect(isExpiryValid("13/27", now)).toBe(false);
    expect(isExpiryValid("12", now)).toBe(false);
  });

  it("reports a complete, valid card", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PaymentFields onChange={onChange} now={now} />);

    await user.type(screen.getByRole("textbox", { name: "Name on card" }), "Mira Okafor");
    await user.type(screen.getByRole("textbox", { name: "Card number" }), "4242424242424242");
    expect(screen.getByRole("textbox", { name: /Card number/ })).toHaveValue("4242 4242 4242 4242");
    await user.type(screen.getByRole("textbox", { name: "Expiry" }), "1228");
    expect(screen.getByRole("textbox", { name: "Expiry" })).toHaveValue("12/28");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ isValid: false, brand: "visa" }));

    await user.type(screen.getByRole("textbox", { name: "Security code" }), "123");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ isValid: true, number: "4242424242424242", expiry: "12/28", cvc: "123" }));
  });

  it("asks American Express for four security digits", async () => {
    const user = userEvent.setup();
    render(<PaymentFields hideName defaultValue={{ number: "378282246310005" }} now={now} />);
    const cvc = screen.getByRole("textbox", { name: "Security code" });
    await user.type(cvc, "12345");
    expect(cvc).toHaveValue("1234");
  });

  it("only complains once you've left the field", async () => {
    const user = userEvent.setup();
    render(<PaymentFields hideName now={now} />);
    const number = screen.getByRole("textbox", { name: "Card number" });
    await user.type(number, "4242424242424241");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("listitem")).toHaveTextContent("Check the card number.");
  });

  it("keeps the caret after the digit being fixed", async () => {
    const user = userEvent.setup();
    render(<PaymentFields hideName defaultValue={{ number: "42424242" }} now={now} />);
    const number = screen.getByRole<HTMLInputElement>("textbox", { name: /Card number/ });
    number.focus();
    number.setSelectionRange(2, 2);
    await user.keyboard("9");
    expect(number).toHaveValue("4294 2424 2");
    expect(number.selectionStart).toBe(3);
  });
});
