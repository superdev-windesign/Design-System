"use client";

import { useMemo, useState } from "react";
import { Button as AriaButton, Calendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, Heading } from "react-aria-components";
import type { CalendarDate, DateValue } from "@internationalized/date";
import { getLocalTimeZone, isSameDay, parseDate, today } from "@internationalized/date";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { focusRing, focusRingInset } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Calendar: a full month with events as pills inside each day. Built on React
 * Aria's Calendar, so arrow keys move between days and Page Up/Down between
 * months. Days show up to two pills and "+N more"; the selected day's agenda
 * is listed below the grid.
 */

export type EventCategory = "work" | "personal" | "team" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date, e.g. "2026-10-14". */
  date: string;
  /** Display time, e.g. "09:30". Omit for all-day. */
  time?: string;
  category?: EventCategory;
}

const PILL: Record<EventCategory, string> = {
  work: "bg-tag-blue text-tag-blue-fg",
  personal: "bg-tag-lime text-tag-lime-fg",
  team: "bg-tag-purple text-tag-purple-fg",
  deadline: "bg-tag-rose text-tag-rose-fg",
};

const DOT: Record<EventCategory, string> = {
  work: "bg-chart-6",
  personal: "bg-chart-2",
  team: "bg-chart-5",
  deadline: "bg-chart-3",
};

export const DEMO_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Design review", date: "2026-10-05", time: "10:00", category: "work" },
  { id: "2", title: "Sprint planning", date: "2026-10-05", time: "14:00", category: "team" },
  { id: "3", title: "Dentist", date: "2026-10-07", time: "08:30", category: "personal" },
  { id: "4", title: "Q4 roadmap due", date: "2026-10-09", category: "deadline" },
  { id: "5", title: "1:1 with Sam", date: "2026-10-12", time: "11:00", category: "work" },
  { id: "6", title: "Team lunch", date: "2026-10-14", time: "12:30", category: "team" },
  { id: "7", title: "Release v3.0", date: "2026-10-14", time: "16:00", category: "deadline" },
  { id: "8", title: "Customer call", date: "2026-10-14", time: "17:30", category: "work" },
  { id: "9", title: "Yoga", date: "2026-10-16", time: "07:00", category: "personal" },
  { id: "10", title: "Retro", date: "2026-10-19", time: "15:00", category: "team" },
  { id: "11", title: "Board update", date: "2026-10-22", time: "09:00", category: "work" },
  { id: "12", title: "Invoices due", date: "2026-10-26", category: "deadline" },
  { id: "13", title: "Hack day", date: "2026-10-29", category: "team" },
  { id: "14", title: "Birthday dinner", date: "2026-10-30", time: "19:30", category: "personal" },
];

const MAX_PILLS = 2;
const agendaFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

export interface MonthCalendarProps {
  events?: CalendarEvent[];
  /** Initially selected day (ISO). Defaults to the first event's day, else today. */
  defaultDate?: string;
  onSelectDate?: (date: string) => void;
  className?: string;
}

export function MonthCalendar({ events = DEMO_EVENTS, defaultDate, onSelectDate, className }: MonthCalendarProps) {
  const initial = useMemo(() => parseDate(defaultDate ?? events[0]?.date ?? today(getLocalTimeZone()).toString()), [defaultDate, events]);
  const [value, setValue] = useState<CalendarDate>(initial);
  const [focused, setFocused] = useState<DateValue>(initial);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of [...events].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))) {
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    return map;
  }, [events]);

  const agenda = byDay.get(value.toString()) ?? [];
  const tz = getLocalTimeZone();

  return (
    <section className={cx("flex w-full flex-col gap-4 rounded-2xl border border-line bg-surface p-4", className)}>
      <Calendar
        aria-label="Events"
        value={value}
        onChange={(date) => {
          setValue(date);
          onSelectDate?.(date.toString());
        }}
        focusedValue={focused}
        onFocusChange={setFocused}
        className="flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <Heading className="flex-1 text-title-sm-emphasis text-fg" />
          <AriaButton
            slot="previous"
            className={cx("flex size-8 cursor-pointer items-center justify-center rounded-full text-icon-secondary data-[hovered]:bg-surface-hover", focusRing)}
          >
            <RiArrowLeftSLine aria-hidden className="size-5 rtl:rotate-180" />
          </AriaButton>
          <AriaButton
            slot="next"
            className={cx("flex size-8 cursor-pointer items-center justify-center rounded-full text-icon-secondary data-[hovered]:bg-surface-hover", focusRing)}
          >
            <RiArrowRightSLine aria-hidden className="size-5 rtl:rotate-180" />
          </AriaButton>
        </header>
        <CalendarGrid weekdayStyle="short" className="w-full table-fixed border-collapse">
          <CalendarGridHeader>
            {(day) => <CalendarHeaderCell className="pb-2 text-start text-caption-strong text-fg-secondary">{day}</CalendarHeaderCell>}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => {
              const dayEvents = byDay.get(date.toString()) ?? [];
              return (
                <CalendarCell
                  date={date}
                  className={({ isFocusVisible }) =>
                    cx(
                      "group flex h-24 cursor-pointer flex-col gap-1 overflow-hidden border-t border-line p-1.5 outline-none transition-colors",
                      "data-[hovered]:bg-surface-hover data-[selected]:bg-sunken data-[outside-month]:opacity-40",
                      isFocusVisible && focusRingInset,
                    )
                  }
                >
                  {({ formattedDate, isToday }) => (
                    <>
                      <span
                        className={cx(
                          "flex size-6 items-center justify-center rounded-full text-body-sm-strong tabular-nums",
                          isToday ? "bg-action-primary text-on-action" : "text-fg group-data-[selected]:bg-strong",
                        )}
                      >
                        {formattedDate}
                      </span>
                      {dayEvents.slice(0, MAX_PILLS).map((e) => (
                        <span key={e.id} className={cx("truncate rounded-md px-1.5 py-0.5 text-caption-strong max-sm:hidden", PILL[e.category ?? "work"])}>
                          {e.title}
                        </span>
                      ))}
                      {/* Small screens: dots instead of pills */}
                      {dayEvents.length > 0 && (
                        <span className="flex gap-0.5 sm:hidden">
                          {dayEvents.slice(0, 3).map((e) => (
                            <span key={e.id} className={cx("size-1.5 rounded-full", DOT[e.category ?? "work"])} />
                          ))}
                        </span>
                      )}
                      {dayEvents.length > MAX_PILLS && (
                        <span className="px-1.5 text-caption text-fg-secondary max-sm:hidden">+{dayEvents.length - MAX_PILLS} more</span>
                      )}
                      {dayEvents.length > 0 && <span className="sr-only">, {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}</span>}
                    </>
                  )}
                </CalendarCell>
              );
            }}
          </CalendarGridBody>
        </CalendarGrid>
      </Calendar>

      <div className="flex flex-col gap-2 border-t border-line pt-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-body-md-strong text-fg">{agendaFormat.format(value.toDate(tz))}</h4>
          {!isSameDay(value, today(tz)) && (
            <Button
              size="xs"
              variant="secondary"
              onPress={() => {
                const now = today(tz);
                setValue(now);
                setFocused(now);
              }}
            >
              Today
            </Button>
          )}
        </div>
        <ul aria-live="polite" className="flex flex-col gap-1">
          {agenda.length === 0 && <li className="text-body-sm text-fg-secondary">Nothing scheduled.</li>}
          {agenda.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              <span aria-hidden className={cx("h-6 w-1 shrink-0 rounded-full", DOT[e.category ?? "work"])} />
              <span className="w-12 shrink-0 text-body-sm text-fg-secondary tabular-nums">{e.time ?? "All day"}</span>
              <span className="truncate text-body-md-strong text-fg">{e.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
