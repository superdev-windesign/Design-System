import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarDate, Time, today, getLocalTimeZone } from "@internationalized/date";
import { RiAlarmLine, RiFlagLine, RiMapPinLine, RiUserLine } from "@remixicon/react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  ColorWell,
  ColorSwatch,
  ComboBox,
  ComboBoxItem,
  ComboBoxSection,
  DateField,
  DescriptionItem,
  DescriptionList,
  DirectionProvider,
  Form,
  FormActions,
  FormSection,
  MultiSelect,
  NumberField,
  PasswordField,
  Rating,
  RatingValue,
  SearchField,
  Tag,
  TagGroup,
  TimeField,
  toast,
} from "@ds/react";
import type { Key } from "react-aria-components";
import type { CatalogEntry } from "./catalog";

const PEOPLE = [
  { id: "ada", label: "Ada Lovelace", description: "Engineering" },
  { id: "alan", label: "Alan Turing", description: "Research" },
  { id: "grace", label: "Grace Hopper", description: "Platform" },
  { id: "katherine", label: "Katherine Johnson", description: "Data" },
  { id: "margaret", label: "Margaret Hamilton", description: "Reliability" },
  { id: "radia", label: "Radia Perlman", description: "Networking" },
];

const CITIES = {
  Europe: ["Lisbon", "Berlin", "Copenhagen", "Ljubljana"],
  Asia: ["Kyoto", "Seoul", "Pune", "Hanoi"],
  Americas: ["Montréal", "Oaxaca", "Valparaíso"],
};

// ─── Demos ─────────────────────────────────────────────────────────────────

function ComboBoxDemo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <ComboBox label="Assignee" placeholder="Search people" defaultItems={PEOPLE} leadingIcon={RiUserLine}>
        {(person) => (
          <ComboBoxItem id={person.id} description={compact ? undefined : person.description}>
            {person.label}
          </ComboBoxItem>
        )}
      </ComboBox>
      {!compact && (
        <ComboBox label="Office" placeholder="Pick a city" description="Grouped by region. Type to filter." allowsCustomValue leadingIcon={RiMapPinLine}>
          {Object.entries(CITIES).map(([region, cities]) => (
            <ComboBoxSection key={region} title={region}>
              {cities.map((city) => (
                <ComboBoxItem key={city} id={city}>
                  {city}
                </ComboBoxItem>
              ))}
            </ComboBoxSection>
          ))}
        </ComboBox>
      )}
    </div>
  );
}

function MultiSelectDemo() {
  const [items, setItems] = useState(PEOPLE);
  const [selected, setSelected] = useState<Key[]>(["ada", "grace"]);
  return (
    <div className="w-full max-w-sm">
      <MultiSelect
        label="Reviewers"
        items={items}
        selectedKeys={selected}
        onSelectionChange={setSelected}
        description="Type to find people. Enter a new name to invite them."
        allowsCreate
        onCreate={(label) => {
          const person = { id: label.toLowerCase().replace(/\s+/g, "-"), label, description: "Invited" };
          setItems((list) => [...list, person]);
          toast.success(`Invited ${label}`);
          return person;
        }}
      />
    </div>
  );
}

const SKILLS = ["Typography", "Research", "Motion", "Accessibility", "Prototyping"];

function TagGroupDemo() {
  const [tags, setTags] = useState(["Design", "Q3", "High priority", "Web"]);
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <TagGroup label="Applied filters" description="Delete or Backspace removes the focused tag." onRemove={(keys) => setTags((t) => t.filter((x) => !keys.has(x)))}>
        {tags.map((tag) => (
          <Tag key={tag} id={tag}>
            {tag}
          </Tag>
        ))}
      </TagGroup>
      <TagGroup label="Skills" selectionMode="multiple" defaultSelectedKeys={["Typography", "Accessibility"]} size="sm">
        {SKILLS.map((skill) => (
          <Tag key={skill} id={skill}>
            {skill}
          </Tag>
        ))}
      </TagGroup>
    </div>
  );
}

function CheckboxGroupDemo() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
      <CheckboxGroup label="Notify me about" defaultValue={["mentions", "assigned"]} description="Sent to your inbox and the app.">
        <Checkbox value="mentions">Mentions</Checkbox>
        <Checkbox value="assigned">Assigned to me</Checkbox>
        <Checkbox value="replies">Replies to my comments</Checkbox>
        <Checkbox value="digest">Weekly digest</Checkbox>
      </CheckboxGroup>
      <CheckboxGroup label="Platforms" orientation="horizontal" isRequired errorMessage="Choose at least one." isInvalid>
        <Checkbox value="web">Web</Checkbox>
        <Checkbox value="ios">iOS</Checkbox>
        <Checkbox value="android">Android</Checkbox>
      </CheckboxGroup>
    </div>
  );
}

const LABEL_COLOURS = [
  { name: "Bug", color: "#b91c1c" },
  { name: "Feature", color: "#15803d" },
  { name: "Docs", color: "#1d4ed8" },
];

function ColorPickerDemo() {
  const [color, setColor] = useState<string>("#c2410c");
  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Inline: the whole editor in place, with the value read out. */}
      <ColorPicker variant="inline" label="Brand colour" value={color} onChange={(c) => setColor(c.toString("hex"))} />

      {/* Popover trigger, and the same with an opacity rail. */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ColorPicker label="Accent" value={color} onChange={(c) => setColor(c.toString("hex"))} />
        <ColorPicker label="Overlay" defaultValue="rgba(194, 65, 12, 0.6)" showAlpha />
      </div>

      {/* Wells: just the swatch, for a tight row of labels. */}
      <ul className="flex flex-col gap-2">
        {LABEL_COLOURS.map((label) => (
          <li key={label.name} className="flex items-center gap-3">
            <ColorWell aria-label={`${label.name} colour`} defaultValue={label.color} wellClassName="size-6" />
            <span className="text-body-md text-fg">{label.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RatingDemo() {
  const [value, setValue] = useState(4);
  return (
    <div className="flex flex-col items-center gap-6">
      <Rating label="How was your stay?" value={value} onChange={setValue} size="lg" labels={["Poor", "Fair", "Good", "Very good", "Excellent"]} />
      <div className="flex flex-col items-center gap-1">
        <RatingValue value={4.6} count={1204} />
        <span className="text-caption text-fg-secondary">Read-only, with halves</span>
      </div>
    </div>
  );
}

function NumberFieldDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <NumberField label="Seats" defaultValue={5} minValue={1} maxValue={50} description="Between 1 and 50." />
      <NumberField label="Monthly budget" defaultValue={1200} step={50} minValue={0} formatOptions={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} />
      <NumberField label="Discount" defaultValue={0.15} step={0.05} minValue={0} maxValue={1} formatOptions={{ style: "percent" }} size="sm" />
    </div>
  );
}

function SearchFieldDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <SearchField aria-label="Search the docs" placeholder="Search the docs" onSubmit={(q) => setLast(q)} onClear={() => setLast(null)} />
      <p className="text-caption text-fg-secondary">{last ? `Searched for “${last}”` : "Enter searches, Escape clears."}</p>
    </div>
  );
}

function PasswordFieldDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <PasswordField label="Current password" autoComplete="current-password" />
      <PasswordField label="New password" autoComplete="new-password" showStrength description="At least 10 characters. A phrase works well." minLength={10} />
    </div>
  );
}

function DateFieldDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <DateField label="Start date" defaultValue={new CalendarDate(2026, 11, 2)} />
      <DateField label="Date of birth" description="Day, month and year in your locale's order." maxValue={today(getLocalTimeZone())} />
      <DateField label="Deadline" isRequired isInvalid errorMessage="Pick a date after the start date." />
    </div>
  );
}

/** Minutes from `start` to `end`, rolling past midnight for overnight shifts. */
const shiftMinutes = (start: Time, end: Time) => {
  const diff = end.hour * 60 + end.minute - (start.hour * 60 + start.minute);
  return diff < 0 ? diff + 24 * 60 : diff;
};

function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h3 className="font-mono text-caption tracking-wide text-fg-secondary uppercase">{title}</h3>
      {children}
    </section>
  );
}

function ShiftTimes() {
  const [start, setStart] = useState<Time | null>(new Time(22, 0));
  const [end, setEnd] = useState<Time | null>(new Time(6, 30));
  const minutes = start && end ? shiftMinutes(start, end) : null;
  return (
    <div className="flex flex-col gap-3 rounded-surface border border-line bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TimeField label="Shift starts" value={start} onChange={setStart} />
        <TimeField label="Shift ends" value={end} onChange={setEnd} />
      </div>
      <p className="flex items-baseline justify-between border-t border-line pt-3 text-body-sm text-fg-secondary">
        Shift length
        <span aria-live="polite" className="font-mono text-body-md-strong tabular-nums text-fg">
          {minutes === null ? "—" : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`}
          {start && end && end.compare(start) < 0 && <span className="ms-2 font-sans text-caption text-fg-secondary">overnight</span>}
        </span>
      </p>
    </div>
  );
}

const TIME_KEYS: [string, string][] = [
  ["0–9", "Types into the focused part, then moves to the next"],
  ["↑ ↓", "Steps the focused part up or down"],
  ["← →", "Moves between hour, minute and period"],
  ["Backspace", "Clears the focused part"],
  ["A / P", "Sets AM or PM on a 12-hour clock"],
];

function TimeFieldDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <DemoSection title="In use">
        <ShiftTimes />
      </DemoSection>

      <DemoSection title="Clock and seconds">
        <TimeField label="Train departs" defaultValue={new Time(21, 45)} hourCycle={24} description="24-hour clock, whatever the locale." />
        <TimeField label="Split time" defaultValue={new Time(0, 4, 32)} granularity="second" hourCycle={24} icon={null} />
        <TimeField label="Wake-up alarm" defaultValue={new Time(6, 45)} icon={RiAlarmLine} />
      </DemoSection>

      <DemoSection title="Size and state">
        <TimeField label="Reminder" defaultValue={new Time(8, 30)} size="sm" />
        <TimeField label="Reminder" defaultValue={new Time(8, 30)} size="sm" isDisabled description="Turn on reminders to change this." />
      </DemoSection>

      <DemoSection title="Limits">
        <TimeField
          label="Delivery slot"
          defaultValue={new Time(21, 30)}
          minValue={new Time(8)}
          maxValue={new Time(20)}
          validationBehavior="aria"
          description="We deliver between 8:00 AM and 8:00 PM."
        />
        <p className="text-body-sm text-fg-secondary">
          Outside the limits, the error takes the description's place. Set it to 7:30 PM and the description comes back.
        </p>
      </DemoSection>

      <DemoSection title="Right to left">
        <DirectionProvider locale="ar-EG">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TimeField label="يبدأ الدوام" defaultValue={new Time(9)} />
            <TimeField label="ينتهي الدوام" defaultValue={new Time(17)} />
          </div>
        </DirectionProvider>
      </DemoSection>

      <DemoSection title="Keyboard">
        <DescriptionList>
          {TIME_KEYS.map(([keys, action]) => (
            <DescriptionItem key={keys} term={<span className="font-mono">{keys}</span>}>
              {action}
            </DescriptionItem>
          ))}
        </DescriptionList>
      </DemoSection>
    </div>
  );
}

function FormDemo() {
  return (
    <Form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        toast.success(`Saved ${String(data.workspace)}`);
      }}
    >
      <FormSection title="Workspace" description="The name and address your team will see.">
        <SearchField label="Find a template" name="template" placeholder="Search templates" />
        <ComboBox label="Region" name="region" isRequired defaultItems={Object.values(CITIES).flat().map((c) => ({ id: c, label: c }))} placeholder="Choose a city">
          {(city) => <ComboBoxItem id={city.id}>{city.label}</ComboBoxItem>}
        </ComboBox>
        <NumberField label="Seats" name="seats" isRequired minValue={1} maxValue={10} defaultValue={12} description="Your plan allows 10." />
      </FormSection>
      <FormSection title="Security">
        <PasswordField label="Admin password" name="password" isRequired minLength={10} showStrength autoComplete="new-password" />
        <CheckboxGroup label="Require" name="require" defaultValue={["2fa"]}>
          <Checkbox value="2fa">Two-factor sign-in</Checkbox>
          <Checkbox value="sso">Single sign-on</Checkbox>
        </CheckboxGroup>
      </FormSection>
      <input type="hidden" name="workspace" value="Atlas" />
      <FormActions>
        <Button variant="secondary" type="reset">
          Reset
        </Button>
        <Button type="submit">Create workspace</Button>
      </FormActions>
    </Form>
  );
}

// ─── Entries ───────────────────────────────────────────────────────────────

export const FORM_ENTRIES: CatalogEntry[] = [
  {
    slug: "number-field",
    isNew: true,
    name: "Number Field",
    group: "Forms",
    summary: "A number with steppers; formats currency, percent and units, and clamps to a range.",
    imports: ["NumberField"],
    preview: () => (
      <div className="w-full max-w-60">
        <NumberField label="Seats" defaultValue={5} minValue={1} maxValue={50} />
      </div>
    ),
    demo: () => <NumberFieldDemo />,
  },
  {
    slug: "search-field",
    isNew: true,
    name: "Search Field",
    group: "Forms",
    summary: "A search box with a clear button. Enter submits, Escape clears.",
    imports: ["SearchField"],
    preview: () => (
      <div className="w-full max-w-60">
        <SearchField aria-label="Search" defaultValue="type scale" />
      </div>
    ),
    demo: () => <SearchFieldDemo />,
  },
  {
    slug: "password-field",
    isNew: true,
    name: "Password Field",
    group: "Forms",
    summary: "A password input with show / hide and an optional strength gauge.",
    imports: ["PasswordField", "scorePassword"],
    preview: () => (
      <div className="w-full max-w-60">
        <PasswordField label="New password" defaultValue="paper-and-ink-42" showStrength />
      </div>
    ),
    demo: () => <PasswordFieldDemo />,
  },
  {
    slug: "form",
    isNew: true,
    name: "Form",
    group: "Forms",
    summary: "Sections, validation on submit, server errors per field and an action row.",
    imports: ["Form", "FormSection", "FormActions", "FieldError", "FieldLabel", "FieldDescription"],
    preview: () => (
      <div className="flex w-full max-w-64 flex-col gap-3">
        <span className="font-display text-body-md-strong text-fg">Workspace</span>
        <NumberField label="Seats" defaultValue={12} isInvalid errorMessage="Your plan allows 10 seats." size="sm" />
        <div className="flex justify-end gap-1.5 border-t border-line pt-2">
          <Button size="xs" variant="secondary">
            Reset
          </Button>
          <Button size="xs">Create</Button>
        </div>
      </div>
    ),
    demo: () => <FormDemo />,
  },
];

export const DATE_ENTRIES: CatalogEntry[] = [
  {
    slug: "date-field",
    isNew: true,
    name: "Date Field",
    group: "Dates",
    summary: "A typed date, one segment at a time, in the locale's order.",
    imports: ["DateField"],
    preview: () => (
      <div className="w-full max-w-60">
        <DateField label="Start date" defaultValue={new CalendarDate(2026, 11, 2)} />
      </div>
    ),
    demo: () => <DateFieldDemo />,
  },
  {
    slug: "time-field",
    isNew: true,
    name: "Time Field",
    group: "Dates",
    summary: "A typed time with hour, minute and, where the locale uses one, the period.",
    imports: ["TimeField"],
    preview: () => (
      <div className="w-full max-w-60">
        <TimeField label="Meeting starts" defaultValue={new Time(9, 30)} />
      </div>
    ),
    demo: () => <TimeFieldDemo />,
  },
];

export const SELECTION_ENTRIES: CatalogEntry[] = [
  {
    slug: "combobox",
    isNew: true,
    name: "Combobox",
    group: "Selection",
    summary: "A text field with suggestions that filter as you type.",
    imports: ["ComboBox", "ComboBoxItem", "ComboBoxSection"],
    preview: () => <ComboBoxDemo compact />,
    demo: () => <ComboBoxDemo />,
  },
  {
    slug: "multi-select",
    isNew: true,
    name: "Multi-select",
    group: "Selection",
    summary: "Pick several options by typing; choices sit as removable tags.",
    imports: ["MultiSelect"],
    preview: () => (
      <div className="w-full max-w-72">
        <MultiSelect label="Reviewers" items={PEOPLE} defaultSelectedKeys={["ada", "grace", "alan"]} />
      </div>
    ),
    demo: () => <MultiSelectDemo />,
  },
  {
    slug: "tag-group",
    isNew: true,
    name: "Tag Group",
    group: "Selection",
    summary: "Tags that can be removed, selected, or both, with full keyboard support.",
    imports: ["TagGroup", "Tag"],
    preview: () => (
      <TagGroup aria-label="Filters" onRemove={() => {}} className="max-w-72">
        <Tag id="design" icon={RiFlagLine}>
          Design
        </Tag>
        <Tag id="q3">Q3</Tag>
        <Tag id="web">Web</Tag>
      </TagGroup>
    ),
    demo: () => <TagGroupDemo />,
  },
  {
    slug: "checkbox-group",
    isNew: true,
    name: "Checkbox Group",
    group: "Selection",
    summary: "Several checkboxes that make up one answer, with a label and validation.",
    imports: ["CheckboxGroup", "Checkbox"],
    preview: () => (
      <CheckboxGroup label="Notify me about" defaultValue={["mentions"]}>
        <Checkbox value="mentions">Mentions</Checkbox>
        <Checkbox value="replies">Replies</Checkbox>
        <Checkbox value="digest">Weekly digest</Checkbox>
      </CheckboxGroup>
    ),
    demo: () => <CheckboxGroupDemo />,
  },
  {
    slug: "color-picker",
    isNew: true,
    name: "Color Picker",
    group: "Selection",
    summary: "Pick by eye, by hex or from presets: inline, in a popover or from a compact well, with an optional opacity rail and HEX/RGB/HSL readouts.",
    imports: ["ColorPicker", "ColorWell", "ColorEditor", "ColorArea", "ColorSlider", "ColorField", "ColorSwatch", "ColorSwatchPicker"],
    preview: () => (
      <div className="flex items-center gap-3">
        <ColorPicker label="Accent" defaultValue="#c2410c" />
      </div>
    ),
    demo: () => <ColorPickerDemo />,
  },
  {
    slug: "rating",
    isNew: true,
    name: "Rating",
    group: "Selection",
    summary: "A score out of five stars as a radio group, plus a read-only value with halves.",
    imports: ["Rating", "RatingValue"],
    preview: () => (
      <div className="flex flex-col items-center gap-3">
        <Rating aria-label="Rate this" defaultValue={4} size="lg" />
        <RatingValue value={4.5} count={86} />
      </div>
    ),
    demo: () => <RatingDemo />,
  },
];
