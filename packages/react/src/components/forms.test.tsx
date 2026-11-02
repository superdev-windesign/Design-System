import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDate } from "@internationalized/date";
import { Button } from "./button/button";
import { Checkbox } from "./checkbox/checkbox";
import { CheckboxGroup } from "./checkbox/checkbox-group";
import { ComboBox, ComboBoxItem } from "./combobox/combobox";
import { Tag, TagGroup } from "./tag-group/tag-group";
import { NumberField } from "./number-field/number-field";
import { SearchField } from "./search-field/search-field";
import { PasswordField, scorePassword } from "./password-field/password-field";
import { MultiSelect } from "./multi-select/multi-select";
import { DateField } from "./date-field/date-field";
import { ColorPicker } from "./color-picker/color-picker";
import { Form, FormActions } from "./form/form";
import { Rating, RatingValue } from "./rating/rating";

const PEOPLE = [
  { id: "ada", label: "Ada Lovelace" },
  { id: "alan", label: "Alan Turing" },
  { id: "grace", label: "Grace Hopper" },
];

describe("ComboBox", () => {
  it("filters as you type and selects a suggestion", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ComboBox label="Assignee" defaultItems={PEOPLE} onSelectionChange={onSelectionChange}>
        {(person) => <ComboBoxItem id={person.id}>{person.label}</ComboBoxItem>}
      </ComboBox>,
    );
    const input = screen.getByRole("combobox", { name: "Assignee" });
    await user.type(input, "gr");
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getAllByRole("option").map((o) => o.textContent)).toEqual(["Grace Hopper"]);
    await user.click(within(listbox).getByRole("option", { name: "Grace Hopper" }));
    expect(onSelectionChange).toHaveBeenCalledWith("grace");
    expect(input).toHaveValue("Grace Hopper");
  });
});

describe("TagGroup", () => {
  it("removes tags with the remove button", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <TagGroup label="Filters" onRemove={onRemove}>
        <Tag id="design">Design</Tag>
        <Tag id="research">Research</Tag>
      </TagGroup>,
    );
    expect(screen.getByRole("grid", { name: "Filters" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /Remove/ })[0]!);
    expect([...onRemove.mock.calls[0]![0]]).toEqual(["design"]);
  });
});

describe("NumberField", () => {
  it("steps with its buttons and clamps to the range", async () => {
    const user = userEvent.setup();
    render(<NumberField label="Seats" defaultValue={2} minValue={1} maxValue={3} />);
    const input = screen.getByRole("textbox", { name: "Seats" });
    await user.click(screen.getByRole("button", { name: /Increase/ }));
    expect(input).toHaveValue("3");
    expect(screen.getByRole("button", { name: /Increase/ })).toBeDisabled();
  });
});

describe("SearchField", () => {
  it("clears its text with the clear button", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchField aria-label="Search docs" onClear={onClear} />);
    const input = screen.getByRole("searchbox", { name: "Search docs" });
    await user.type(input, "tokens");
    await user.click(screen.getByRole("button", { name: /Clear/ }));
    expect(input).toHaveValue("");
    expect(onClear).toHaveBeenCalled();
  });
});

describe("PasswordField", () => {
  it("reveals the password and grades its strength", async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordField label="New password" showStrength />);
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("type", "password");
    await user.type(input, "correct-Horse-9-battery");
    expect(screen.getByText("Strong")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Show password" });
    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("scores by length and variety", () => {
    expect(scorePassword("")).toBe(0);
    expect(scorePassword("abc")).toBe(1);
    expect(scorePassword("abcdefgh12")).toBe(2);
    expect(scorePassword("Abcdefghijkl-34")).toBe(4);
  });
});

describe("CheckboxGroup", () => {
  it("labels its checkboxes as one answer", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxGroup label="Notify me about" defaultValue={["mentions"]} onChange={onChange}>
        <Checkbox value="mentions">Mentions</Checkbox>
        <Checkbox value="replies">Replies</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole("group", { name: "Notify me about" })).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Replies" }));
    expect(onChange).toHaveBeenCalledWith(["mentions", "replies"]);
  });
});

describe("MultiSelect", () => {
  it("adds picked options as tags and removes the last with Backspace", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<MultiSelect label="Reviewers" items={PEOPLE} defaultSelectedKeys={["ada"]} onSelectionChange={onSelectionChange} />);
    const input = screen.getByRole("combobox", { name: "Reviewers" });
    await user.type(input, "ala");
    await user.click(await screen.findByRole("option", { name: "Alan Turing" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["ada", "alan"]);
    // The list stays open for the next pick, without the one just chosen.
    expect(screen.getAllByRole("option").map((o) => o.textContent)).not.toContain("Alan Turing");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(screen.getAllByRole("row").map((row) => row.textContent)).toEqual(["Ada Lovelace", "Alan Turing"]);
    expect(input).toHaveValue("");

    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(onSelectionChange).toHaveBeenLastCalledWith(["ada"]);
  });
});

describe("DateField", () => {
  it("renders editable segments under its label", () => {
    render(<DateField label="Start date" defaultValue={new CalendarDate(2026, 3, 14)} />);
    const group = screen.getByRole("group", { name: "Start date" });
    expect(within(group).getAllByRole("spinbutton").length).toBeGreaterThanOrEqual(3);
  });
});

describe("ColorPicker", () => {
  it("opens a picker with an area, a hue slider and a hex field", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Brand colour" defaultValue="#c2410c" />);
    await user.click(screen.getByRole("button", { name: /Brand colour/ }));
    const dialog = await screen.findByRole("dialog", { name: "Brand colour" });
    // The area is one two-dimensional slider; the hue strip is the other.
    expect(within(dialog).getAllByRole("slider")).toHaveLength(2);
    expect(within(dialog).getByRole("textbox", { name: "Hex" })).toHaveValue("#C2410C");
  });
});

describe("Form and FieldError", () => {
  it("shows server errors under the field they belong to", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit} validationErrors={{ seats: "Your plan allows 10 seats." }}>
        <NumberField name="seats" label="Seats" />
        <FormActions>
          <Button type="submit">Save</Button>
        </FormActions>
      </Form>,
    );
    const field = screen.getByRole("textbox", { name: "Seats" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Your plan allows 10 seats.");
  });
});

describe("Rating", () => {
  it("is a radio group of stars", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating aria-label="Rate this recipe" onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Rate this recipe" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(onChange).toHaveBeenCalledWith(4);
    await waitFor(() => expect(screen.getByRole("radio", { name: "4 stars" })).toBeChecked());
  });

  it("reads a fixed score aloud", () => {
    render(<RatingValue value={4.5} count={1204} />);
    expect(screen.getByRole("img", { name: "4.5 out of 5 stars, 1,204 ratings" })).toBeInTheDocument();
  });
});
