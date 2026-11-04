"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { CalendarDate, Time, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import {
  Button as AriaButton,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  ListBox,
  ListBoxItem,
  RangeCalendar,
  RangeCalendarStateContext,
} from "react-aria-components";
import type { RangeValue } from "react-aria-components";
import { useDateFormatter } from "react-aria";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Date and time range picker: two months side by side (one on a narrow
 * panel), a range drawn as a band between two solid days, and hour and minute
 * columns for whichever end is being set.
 *
 * Choices stay pending until Apply, so a half-picked range never reaches the
 * app. It's a panel rather than a popover, so it can sit in a page, a Popover
 * or a Dialog. React Aria owns the calendar's keyboard model; each time column
 * is a listbox.
 */

export interface DateTimeRange {
  start: CalendarDate;
  end: CalendarDate;
  startTime: Time;
  endTime: Time;
}

export interface DateTimeRangePickerProps {
  defaultValue?: DateTimeRange;
  /** Called on every pending change, before Apply. */
  onChange?: (range: DateTimeRange | null) => void;
  onApply?: (range: DateTimeRange) => void;
  onClear?: () => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  /** Minutes between entries in the minute column. Default 5. */
  minuteStep?: number;
  applyLabel?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** One month's name, read from the calendar's state so it tracks paging. */
function MonthName({ offset, className }: { offset: number; className?: string }) {
  const state = useContext(RangeCalendarStateContext);
  const formatter = useDateFormatter({ month: "long", year: "numeric", timeZone: state?.timeZone });
  if (!state) return null;
  return (
    <span aria-hidden className={cx("flex-1 text-center text-body-md-strong text-fg", className)}>
      {formatter.format(state.visibleRange.start.add({ months: offset }).toDate(state.timeZone))}
    </span>
  );
}

const NAV_BUTTON = cx(
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control-sm text-icon-secondary transition-colors",
  "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
  focusRing,
);

function MonthGrid({ offset, className }: { offset: number; className?: string }) {
  return (
    <CalendarGrid offset={{ months: offset }} className={cx("w-full border-collapse", className)}>
      <CalendarGridHeader>
        {(day) => <CalendarHeaderCell className="pb-2 text-caption text-fg-tertiary">{day}</CalendarHeaderCell>}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell
            date={date}
            // The band: pale between the ends, rounded where a row starts or stops.
            className={({ isSelected, isSelectionStart, isSelectionEnd, isOutsideMonth }) =>
              cx(
                "relative my-0.5 flex h-9 items-center justify-center outline-none",
                isOutsideMonth && "invisible",
                isSelected && "bg-sunken [td:first-child>&]:rounded-s-item [td:last-child>&]:rounded-e-item",
                isSelectionStart && "rounded-s-full",
                isSelectionEnd && "rounded-e-full",
              )
            }
          >
            {({ formattedDate, isSelectionStart, isSelectionEnd, isHovered, isFocusVisible, isDisabled, isUnavailable }) => (
              <span
                className={cx(
                  "flex size-9 cursor-pointer items-center justify-center rounded-full text-body-sm tabular-nums transition-colors",
                  isSelectionStart || isSelectionEnd ? "bg-fg text-canvas" : "text-fg",
                  isHovered && !isSelectionStart && !isSelectionEnd && "bg-surface-hover",
                  isFocusVisible && "outline-2 outline-offset-2 outline-focus",
                  (isDisabled || isUnavailable) && "cursor-not-allowed text-fg-disabled",
                )}
              >
                {formattedDate}
              </span>
            )}
          </CalendarCell>
        )}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

function TimeColumn({ label, values, value, onChange }: { label: string; values: number[]; value: number; onChange: (value: number) => void }) {
  const list = useRef<HTMLDivElement>(null);

  // Keep the chosen value in view, moving only this column and never the page.
  useEffect(() => {
    const element = list.current;
    const item = element?.querySelector<HTMLElement>("[data-selected]");
    if (element && item) element.scrollTop = item.offsetTop - element.clientHeight / 2 + item.offsetHeight / 2;
  }, [value]);

  return (
    <ListBox
      ref={list}
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        if (keys === "all") return;
        const next = [...keys][0];
        if (next !== undefined) onChange(Number(next));
      }}
      className={cx("scrollbar-thin relative flex h-64 w-14 flex-col gap-0.5 overflow-y-auto rounded-surface bg-sunken p-1", focusRing)}
    >
      {values.map((entry) => (
        <ListBoxItem
          key={entry}
          id={entry}
          textValue={pad(entry)}
          className={cx(
            "flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-item text-body-sm tabular-nums text-fg outline-none transition-colors",
            "data-[hovered]:bg-surface-hover data-[selected]:bg-fg data-[selected]:text-canvas",
            "data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-focus",
          )}
        >
          {pad(entry)}
        </ListBoxItem>
      ))}
    </ListBox>
  );
}

export function DateTimeRangePicker({
  defaultValue,
  onChange,
  onApply,
  onClear,
  minValue,
  maxValue,
  isDateUnavailable,
  minuteStep = 5,
  applyLabel = "Apply",
  className,
}: DateTimeRangePickerProps) {
  const [dates, setDates] = useState<RangeValue<CalendarDate> | null>(defaultValue ? { start: defaultValue.start, end: defaultValue.end } : null);
  const [times, setTimes] = useState({ start: defaultValue?.startTime ?? new Time(9), end: defaultValue?.endTime ?? new Time(17) });
  const [editing, setEditing] = useState<"start" | "end">("start");
  const format = useDateFormatter({ dateStyle: "medium" });

  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  const time = times[editing];
  // A stored minute off the step (say 07 at a 5-minute step) still needs a row to select.
  const minuteValues = minutes.includes(time.minute) ? minutes : [...minutes, time.minute].sort((a, b) => a - b);

  const pending = (nextDates: typeof dates, nextTimes: typeof times): DateTimeRange | null =>
    nextDates ? { start: nextDates.start, end: nextDates.end, startTime: nextTimes.start, endTime: nextTimes.end } : null;

  const setTime = (part: "hour" | "minute", value: number) => {
    const current = times[editing];
    const next = { ...times, [editing]: new Time(part === "hour" ? value : current.hour, part === "minute" ? value : current.minute) };
    setTimes(next);
    onChange?.(pending(dates, next));
  };

  const range = pending(dates, times);
  const stamp = (date: CalendarDate, at: Time) => `${format.format(date.toDate(getLocalTimeZone()))}, ${pad(at.hour)}:${pad(at.minute)}`;
  // An unusable range: same day, with the end at or before the start.
  const isBackwards = range !== null && range.start.compare(range.end) === 0 && range.endTime.compare(range.startTime) <= 0;

  return (
    <section aria-label="Date and time range" className={cx("@container/picker w-full max-w-4xl rounded-panel bg-surface shadow-raised", className)}>
      <div className="flex flex-col gap-4 p-4 @3xl/picker:flex-row">
        <RangeCalendar
          aria-label="Date range"
          value={dates}
          onChange={(next) => {
            const value = { start: new CalendarDate(next.start.year, next.start.month, next.start.day), end: new CalendarDate(next.end.year, next.end.month, next.end.day) };
            setDates(value);
            onChange?.(pending(value, times));
          }}
          minValue={minValue}
          maxValue={maxValue}
          isDateUnavailable={isDateUnavailable}
          visibleDuration={{ months: 2 }}
          pageBehavior="single"
          className="min-w-0 flex-1"
        >
          <header className="mb-3 flex items-center gap-2">
            <AriaButton slot="previous" className={NAV_BUTTON}>
              <RiArrowLeftSLine aria-hidden className="size-5 rtl:-scale-x-100" />
            </AriaButton>
            <MonthName offset={0} />
            <MonthName offset={1} className="hidden @xl/picker:block" />
            <AriaButton slot="next" className={NAV_BUTTON}>
              <RiArrowRightSLine aria-hidden className="size-5 rtl:-scale-x-100" />
            </AriaButton>
          </header>
          <div className="flex gap-6">
            <MonthGrid offset={0} />
            <MonthGrid offset={1} className="hidden @xl/picker:table" />
          </div>
        </RangeCalendar>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <SegmentedControl
            aria-label="Set the time for"
            selectedKeys={[editing]}
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (next) setEditing(next as "start" | "end");
            }}
          >
            <SegmentedControlItem id="start">Start</SegmentedControlItem>
            <SegmentedControlItem id="end">End</SegmentedControlItem>
          </SegmentedControl>
          <div className="flex gap-1.5">
            <TimeColumn label={`${editing === "start" ? "Start" : "End"} hour`} values={HOURS} value={time.hour} onChange={(v) => setTime("hour", v)} />
            <TimeColumn label={`${editing === "start" ? "Start" : "End"} minute`} values={minuteValues} value={time.minute} onChange={(v) => setTime("minute", v)} />
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p aria-live="polite" className="min-w-0 text-body-sm tabular-nums text-fg-secondary">
          {range ? `${stamp(range.start, range.startTime)} – ${stamp(range.end, range.endTime)}` : "Pick a start and an end date"}
        </p>
        <div className="flex gap-2">
          <Button
            variant="tertiary"
            size="sm"
            isDisabled={!dates}
            onPress={() => {
              setDates(null);
              onChange?.(null);
              onClear?.();
            }}
          >
            Clear
          </Button>
          <Button size="sm" isDisabled={!range || isBackwards} onPress={() => range && onApply?.(range)}>
            {applyLabel}
          </Button>
        </div>
      </footer>
    </section>
  );
}
