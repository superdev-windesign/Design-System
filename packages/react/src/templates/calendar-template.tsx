"use client";

import { useMemo, useState } from "react";
import { fromDate, getLocalTimeZone, toCalendarDate } from "@internationalized/date";
import { RiAddLine } from "@remixicon/react";
import { MonthCalendar, type CalendarEvent, type EventCategory } from "../blocks/month-calendar/month-calendar";
import { Button } from "../components/button/button";
import { Calendar } from "../components/calendar/calendar";
import { Checkbox } from "../components/checkbox/checkbox";
import { CheckboxGroup } from "../components/checkbox/checkbox-group";
import { Schedule, type ScheduleEvent, type ScheduleTone } from "../components/schedule/schedule";
import { ToggleButton, ToggleButtonGroup } from "../components/toggle-button/toggle-button";
import { cx } from "../utils/cx";
import { TemplatePage, TemplateRoot, type TemplateProps } from "./shared";

/**
 * Calendar: a calendar app screen. A sidebar with a month to jump around in,
 * the calendars you can show or hide, and what's next; the main area shows
 * the month (events as pills) or a week or day as a time grid. Clicking an
 * empty slot in the week or day adds an event there.
 */

type View = "month" | "week" | "day";

interface CalendarSource {
  id: EventCategory;
  label: string;
  tone: ScheduleTone;
  dot: string;
}

const CALENDARS: CalendarSource[] = [
  { id: "work", label: "Work", tone: "blue", dot: "bg-chart-6" },
  { id: "team", label: "Team", tone: "purple", dot: "bg-chart-5" },
  { id: "personal", label: "Personal", tone: "lime", dot: "bg-chart-2" },
  { id: "deadline", label: "Deadlines", tone: "rose", dot: "bg-chart-3" },
];

type AppEvent = ScheduleEvent & { calendar: EventCategory };

/** A month of events around today, so every view has something in it. */
function seedEvents(): AppEvent[] {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const at = (week: number, day: number, h: number, m = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + week * 7 + day, h, m);
  const list: [number, number, number, number, number, number, string, EventCategory, string?][] = [
    // week, day, start h, start m, end h, end m, title, calendar, location
    [-1, 1, 10, 0, 11, 0, "Quarterly planning", "work", "Room 1"],
    [-1, 3, 15, 0, 16, 0, "Retro", "team"],
    [0, 0, 9, 30, 10, 0, "Standup", "team"],
    [0, 0, 11, 0, 12, 30, "Design review", "work", "Room 2"],
    [0, 1, 8, 0, 9, 0, "Gym", "personal"],
    [0, 1, 13, 0, 14, 0, "Lunch with Sam", "personal"],
    [0, 2, 9, 30, 10, 0, "Standup", "team"],
    [0, 2, 14, 0, 16, 0, "Accessibility audit", "work", "Studio"],
    [0, 2, 15, 0, 16, 0, "Interview", "work"],
    [0, 3, 17, 0, 18, 0, "Release cut-off", "deadline"],
    [0, 4, 10, 0, 12, 0, "Sprint planning", "team", "Room 1"],
    [1, 0, 9, 30, 10, 0, "Standup", "team"],
    [1, 1, 12, 0, 13, 0, "Customer call", "work"],
    [1, 3, 18, 0, 19, 0, "Invoices due", "deadline"],
    [1, 4, 19, 30, 21, 0, "Birthday dinner", "personal"],
    [2, 2, 11, 0, 12, 0, "Board update", "work"],
    [2, 4, 9, 0, 17, 0, "Hack day", "team"],
  ];
  return list.map(([w, d, sh, sm, eh, em, title, calendar, location], i) => ({
    id: String(i + 1),
    title,
    start: at(w, d, sh, sm),
    end: at(w, d, eh, em),
    location,
    calendar,
    tone: CALENDARS.find((c) => c.id === calendar)!.tone,
  }));
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function CalendarTemplate({ className }: TemplateProps) {
  const tz = getLocalTimeZone();
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(() => new Date());
  const [events, setEvents] = useState<AppEvent[]>(seedEvents);
  const [shown, setShown] = useState<string[]>(CALENDARS.map((c) => c.id));

  const visible = useMemo(() => events.filter((e) => shown.includes(e.calendar)), [events, shown]);
  const upcoming = useMemo(() => {
    const now = Date.now();
    return visible.filter((e) => e.end.getTime() > now).sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 4);
  }, [visible]);
  const monthEvents: CalendarEvent[] = useMemo(
    () => visible.map((e) => ({ id: e.id, title: e.title, date: isoDay(e.start), time: `${pad(e.start.getHours())}:${pad(e.start.getMinutes())}`, category: e.calendar })),
    [visible],
  );

  const timeFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

  const addEvent = (start: Date) => {
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setEvents((list) => [...list, { id: `new-${list.length + 1}`, title: "New event", start, end, calendar: "work", tone: "blue" }]);
    setShown((s) => (s.includes("work") ? s : [...s, "work"]));
  };

  const newEventAtNextHour = () => {
    const start = new Date(date);
    const now = new Date();
    start.setHours(isoDay(date) === isoDay(now) ? now.getHours() + 1 : 9, 0, 0, 0);
    addEvent(start);
  };

  return (
    <TemplateRoot className={cx("@container/cal", className)}>
      <aside aria-label="Calendars" className="hidden w-84 shrink-0 flex-col gap-6 overflow-y-auto border-e border-line p-3 @3xl/cal:flex">
        <Button leadingIcon={RiAddLine} onPress={newEventAtNextHour} className="self-start">
          New event
        </Button>
        <Calendar aria-label="Go to date" value={toCalendarDate(fromDate(date, tz))} onChange={(d) => setDate(d.toDate(tz))} className="w-full border-0 p-0" />
        <CheckboxGroup label="My calendars" value={shown} onChange={setShown}>
          {CALENDARS.map((c) => (
            <Checkbox key={c.id} value={c.id}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className={cx("size-2.5 rounded-full", c.dot)} />
                {c.label}
              </span>
            </Checkbox>
          ))}
        </CheckboxGroup>
        <section aria-labelledby="cal-next" className="flex flex-col gap-2">
          <h3 id="cal-next" className="font-mono text-caption tracking-wide text-fg-secondary uppercase">
            Up next
          </h3>
          {upcoming.length ? (
            <ol className="flex flex-col">
              {upcoming.map((e) => (
                <li key={e.id} className="flex gap-2.5 border-t border-line py-2 first:border-t-0">
                  <span aria-hidden className={cx("mt-1.5 size-2 shrink-0 rounded-full", CALENDARS.find((c) => c.id === e.calendar)!.dot)} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-body-sm-strong text-fg">{e.title}</span>
                    <span className="font-mono text-caption text-fg-secondary">{timeFmt.format(e.start)}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-body-sm text-fg-secondary">Nothing coming up.</p>
          )}
        </section>
      </aside>
      <TemplatePage
        title="Calendar"
        description={`${visible.length} events across ${shown.length} ${shown.length === 1 ? "calendar" : "calendars"}`}
        actions={
          <>
            <ToggleButtonGroup aria-label="View" selectionMode="single" disallowEmptySelection selectedKeys={[view]} onSelectionChange={(keys) => setView([...keys][0] as View)}>
              <ToggleButton id="month" size="sm">
                Month
              </ToggleButton>
              <ToggleButton id="week" size="sm">
                Week
              </ToggleButton>
              <ToggleButton id="day" size="sm">
                Day
              </ToggleButton>
            </ToggleButtonGroup>
            <Button size="sm" leadingIcon={RiAddLine} onPress={newEventAtNextHour} className="@3xl/cal:hidden">
              New event
            </Button>
          </>
        }
      >
        {view === "month" ? (
          <MonthCalendar
            key={`${date.getFullYear()}-${date.getMonth()}`}
            events={monthEvents}
            defaultDate={isoDay(date)}
            onSelectDate={(iso) => {
              const [y, m, d] = iso.split("-").map(Number);
              setDate(new Date(y!, m! - 1, d!));
            }}
          />
        ) : (
          <Schedule events={visible} view={view} date={date} onDateChange={setDate} showViewSwitch={false} onSlotPress={addEvent} startHour={8} endHour={21} />
        )}
      </TemplatePage>
    </TemplateRoot>
  );
}
