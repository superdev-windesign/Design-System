"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { getLocalTimeZone, fromDate, startOfWeek, toCalendarDate, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { useLocale } from "react-aria-components";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Button } from "../button/button";
import { ToggleButton, ToggleButtonGroup } from "../toggle-button/toggle-button";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Schedule: a week or a day as a time grid, with events placed by their
 * start and end (side by side when they overlap) and a terracotta line at
 * the current time. Step through weeks or days, jump to today, switch view.
 *
 * Each day is a labelled group of event buttons in time order, read as
 * "Design review, 10:00 to 11:00, Room 2". Clicking an empty slot calls
 * `onSlotPress` with that time; offer a separate "New event" button too,
 * since slots aren't keyboard targets.
 */

export type ScheduleTone = "blue" | "cyan" | "lime" | "orange" | "purple" | "rose" | "yellow";

export interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  tone?: ScheduleTone;
}

const TONE: Record<ScheduleTone, string> = {
  blue: "bg-tag-blue text-tag-blue-fg",
  cyan: "bg-tag-cyan text-tag-cyan-fg",
  lime: "bg-tag-lime text-tag-lime-fg",
  orange: "bg-tag-orange text-tag-orange-fg",
  purple: "bg-tag-purple text-tag-purple-fg",
  rose: "bg-tag-rose text-tag-rose-fg",
  yellow: "bg-tag-yellow text-tag-yellow-fg",
};

const HOUR = 48; // px per hour row

export interface ScheduleProps {
  events: ScheduleEvent[];
  view?: "week" | "day";
  defaultView?: "week" | "day";
  onViewChange?: (view: "week" | "day") => void;
  /** Any day in the period to show (controlled). */
  date?: Date;
  /** Any day in the period to show first. Default today. */
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** Show the Day / Week switch in the header. Default true. */
  showViewSwitch?: boolean;
  /** First and last hours on the grid. Default 8 and 19. */
  startHour?: number;
  endHour?: number;
  onEventPress?: (event: ScheduleEvent) => void;
  onSlotPress?: (start: Date) => void;
  "aria-label"?: string;
  className?: string;
}

const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Lays overlapping events side by side: each gets a column and the cluster's column count. */
function layout(events: ScheduleEvent[]) {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  const placed: { event: ScheduleEvent; column: number; columns: number }[] = [];
  let cluster: typeof placed = [];
  let clusterEnd = 0;
  const flush = () => {
    const columns = Math.max(1, ...cluster.map((p) => p.column + 1));
    cluster.forEach((p) => (p.columns = columns));
    cluster = [];
  };
  for (const event of sorted) {
    if (event.start.getTime() >= clusterEnd) flush();
    const taken = new Set(cluster.filter((p) => p.event.end.getTime() > event.start.getTime()).map((p) => p.column));
    let column = 0;
    while (taken.has(column)) column++;
    const entry = { event, column, columns: 1 };
    cluster.push(entry);
    placed.push(entry);
    clusterEnd = Math.max(clusterEnd, event.end.getTime());
  }
  flush();
  return placed;
}

export function Schedule({
  events,
  view: controlledView,
  defaultView = "week",
  onViewChange,
  date,
  defaultDate,
  onDateChange,
  showViewSwitch = true,
  startHour = 8,
  endHour = 19,
  onEventPress,
  onSlotPress,
  "aria-label": ariaLabel = "Schedule",
  className,
}: ScheduleProps) {
  const { locale } = useLocale();
  const tz = getLocalTimeZone();
  const [uncontrolledView, setUncontrolledView] = useState(defaultView);
  const view = controlledView ?? uncontrolledView;
  const [uncontrolledAnchor, setUncontrolledAnchor] = useState<CalendarDate>(() => (defaultDate ? toCalendarDate(fromDate(defaultDate, tz)) : today(tz)));
  const anchor = date ? toCalendarDate(fromDate(date, tz)) : uncontrolledAnchor;
  const setAnchor = (next: CalendarDate) => {
    setUncontrolledAnchor(next);
    onDateChange?.(next.toDate(tz));
  };
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    const first = startOfWeek(anchor, locale);
    return Array.from({ length: 7 }, (_, i) => first.add({ days: i }));
  }, [anchor, view, locale]);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const span = (endHour - startHour) * 60;
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const longFmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
  const hourFmt = new Intl.DateTimeFormat(locale, { hour: "numeric" });
  const titleFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const todayDate = today(tz);

  const setView = (next: "week" | "day") => {
    setUncontrolledView(next);
    onViewChange?.(next);
  };
  const step = (direction: 1 | -1) => setAnchor(anchor.add(view === "week" ? { weeks: direction } : { days: direction }));

  const onColumnClick = (event: MouseEvent<HTMLDivElement>, day: CalendarDate) => {
    if (!onSlotPress || event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const minutes = Math.floor(((event.clientY - rect.top) / rect.height) * span / 30) * 30 + startHour * 60;
    const start = day.toDate(tz);
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    onSlotPress(start);
  };

  return (
    <section aria-label={ariaLabel} className={cx("flex flex-col overflow-hidden rounded-surface border border-line bg-surface", className)}>
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <h2 className="me-auto text-title-sm-strong text-fg">{titleFmt.format(days[0]!.toDate(tz))}</h2>
        <Button size="sm" variant="secondary" onPress={() => setAnchor(todayDate)}>
          Today
        </Button>
        <Button size="sm" variant="tertiary" iconOnly leadingIcon={RiArrowLeftSLine} aria-label={view === "week" ? "Previous week" : "Previous day"} onPress={() => step(-1)} className="rtl:-scale-x-100" />
        <Button size="sm" variant="tertiary" iconOnly leadingIcon={RiArrowRightSLine} aria-label={view === "week" ? "Next week" : "Next day"} onPress={() => step(1)} className="rtl:-scale-x-100" />
        {showViewSwitch && (
          <ToggleButtonGroup aria-label="View" selectionMode="single" disallowEmptySelection selectedKeys={[view]} onSelectionChange={(keys) => setView([...keys][0] as "week" | "day")}>
            <ToggleButton id="day" size="sm">
              Day
            </ToggleButton>
            <ToggleButton id="week" size="sm">
              Week
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </header>

      <div className="scrollbar-thin max-h-120 overflow-auto">
        <div className={cx(view === "week" && "min-w-3xl")}>
          {/* Day headings */}
          <div className="sticky top-0 z-20 grid border-b border-line bg-surface" style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}>
            <span />
            {days.map((day) => {
              const isToday = day.compare(todayDate) === 0;
              return (
                <span key={day.toString()} className="flex items-baseline justify-center gap-1.5 border-s border-line py-2 text-body-sm text-fg-secondary">
                  {dayFmt.format(day.toDate(tz))}
                  <span className={cx("flex size-6 items-center justify-center rounded-full text-body-sm-strong tabular-nums", isToday ? "bg-accent-600 text-on-action" : "text-fg")}>{day.day}</span>
                </span>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="grid" style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}>
            <div aria-hidden className="relative">
              {hours.map((h) => (
                <span key={h} className="block pe-2 text-end font-mono text-caption text-fg-tertiary" style={{ height: HOUR }}>
                  <span className="relative -top-2">{h === startHour ? "" : hourFmt.format(new Date(2000, 0, 1, h))}</span>
                </span>
              ))}
            </div>
            {days.map((day) => {
              const start = day.toDate(tz).getTime();
              const dayEvents = events.filter((e) => e.start.getTime() < start + 86400000 && e.end.getTime() > start);
              const isToday = day.compare(todayDate) === 0;
              const nowOffset = minutesOf(now) - startHour * 60;
              return (
                <div
                  key={day.toString()}
                  role="group"
                  aria-label={longFmt.format(day.toDate(tz))}
                  onClick={(event) => onColumnClick(event, day)}
                  className={cx("relative border-s border-line", onSlotPress && "cursor-copy")}
                  style={{ height: HOUR * hours.length, backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${HOUR - 1}px, var(--ds-color-border-default) ${HOUR - 1}px ${HOUR}px)` }}
                >
                  {layout(dayEvents).map(({ event, column, columns }) => {
                    const top = Math.max(0, minutesOf(event.start) - startHour * 60);
                    const bottom = Math.min(span, minutesOf(event.end) - startHour * 60);
                    if (bottom <= 0 || top >= span) return null;
                    const label = `${event.title}, ${timeFmt.format(event.start)} to ${timeFmt.format(event.end)}${event.location ? `, ${event.location}` : ""}`;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        aria-label={label}
                        onClick={() => onEventPress?.(event)}
                        className={cx(
                          "absolute flex cursor-pointer flex-col overflow-hidden rounded-xs border-s-2 border-current px-1.5 py-1 text-start transition-[filter] hover:brightness-95",
                          TONE[event.tone ?? "blue"],
                          focusRingNative,
                        )}
                        style={{
                          top: `${(top / span) * 100}%`,
                          height: `calc(${((bottom - top) / span) * 100}% - 2px)`,
                          insetInlineStart: `calc(${(column / columns) * 100}% + 2px)`,
                          width: `calc(${100 / columns}% - 4px)`,
                        }}
                      >
                        <span className="truncate text-caption-strong">{event.title}</span>
                        <span className="truncate text-caption">{timeFmt.format(event.start)}</span>
                      </button>
                    );
                  })}
                  {isToday && nowOffset >= 0 && nowOffset <= span && (
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 z-10 h-px bg-accent-600" style={{ top: `${(nowOffset / span) * 100}%` }}>
                      <span className="absolute -start-1 -top-1 size-2 rounded-full bg-accent-600" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
