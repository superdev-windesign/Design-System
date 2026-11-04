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
import type { RangeCalendarProps, RangeValue } from "react-aria-components";
import { useDateFormatter } from "react-aria";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Date and time range picker, after Moon's: two months side by side with a
 * joined pair of hour and minute columns beside them. The range is a pale band
 * running row by row between two solid days, and Apply sits alone under a
 * hairline. On a narrower panel the columns drop below the months, and then
 * the second month goes.
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
  /** Passing this adds a Clear button beside Apply. */
  onClear?: () => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  /** Overrides the locale's first day of the week. */
  firstDayOfWeek?: RangeCalendarProps<DateValue>["firstDayOfWeek"];
  /** Minutes between entries in the minute column. Default 5. */
  minuteStep?: number;
  applyLabel?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** One month's name, read from the calendar's state so it tracks paging. */
function MonthName({ offset }: { offset: number }) {
  const state = useContext(RangeCalendarStateContext);
  const formatter = useDateFormatter({ month: "long", year: "numeric", timeZone: state?.timeZone });
  if (!state) return null;
  return (
    <span aria-hidden className="mb-4 block h-8 text-center text-title-sm-strong leading-8 font-normal text-fg">
      {formatter.format(state.visibleRange.start.add({ months: offset }).toDate(state.timeZone))}
    </span>
  );
}

const NAV_BUTTON = cx(
  "absolute top-0 flex size-8 cursor-pointer items-center justify-center rounded-full text-icon-secondary transition-colors",
  "data-[hovered]:bg-muted data-[hovered]:text-fg data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
  focusRing,
);

function MonthGrid({ offset }: { offset: number }) {
  return (
    <CalendarGrid offset={{ months: offset }} className="w-full border-collapse">
      <CalendarGridHeader>
        {(day) => <CalendarHeaderCell className="pb-3 text-body-sm text-fg-tertiary">{day}</CalendarHeaderCell>}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell
            date={date}
            // The band: each week is its own soft-cornered strip, and the ends tuck under the solid days.
            className={({ isSelected, isSelectionStart, isSelectionEnd, isOutsideMonth }) =>
              cx(
                "relative my-0.5 flex h-9 items-center justify-center outline-none",
                isOutsideMonth && "invisible",
                isSelected && "bg-canvas [td:first-child>&]:rounded-s-control-xs [td:last-child>&]:rounded-e-control-xs",
                isSelectionStart && "rounded-s-full",
                isSelectionEnd && "rounded-e-full",
              )
            }
          >
            {({ formattedDate, isSelectionStart, isSelectionEnd, isHovered, isFocusVisible, isDisabled, isUnavailable }) => (
              <span
                className={cx(
                  "flex size-9 cursor-pointer items-center justify-center rounded-full text-body-md-strong tabular-nums transition-colors",
                  isSelectionStart || isSelectionEnd ? "bg-fg text-canvas" : "text-fg",
                  isHovered && !isSelectionStart && !isSelectionEnd && "bg-muted",
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
      className="scrollbar-none relative flex flex-1 flex-col overflow-y-auto py-1 outline-none"
    >
      {values.map((entry) => (
        <ListBoxItem key={entry} id={entry} textValue={pad(entry)} className="flex h-9 shrink-0 cursor-pointer items-center justify-center outline-none">
          {({ isSelected, isHovered, isFocusVisible }) => (
            <span
              className={cx(
                "flex size-8 items-center justify-center rounded-full text-body-md-strong tabular-nums transition-colors",
                isSelected ? "bg-fg text-canvas" : "text-fg",
                isHovered && !isSelected && "bg-muted",
                isFocusVisible && "outline-2 outline-offset-1 outline-focus",
              )}
            >
              {pad(entry)}
            </span>
          )}
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
  firstDayOfWeek,
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
  const endName = editing === "start" ? "Start" : "End";

  return (
    <section aria-label="Date and time range" className={cx("@container/picker w-full max-w-4xl rounded-panel bg-surface", className)}>
      <div className="flex flex-col gap-4 p-4 @2xl/picker:p-6">
        <div className="flex flex-col gap-6 @2xl/picker:flex-row">
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
            firstDayOfWeek={firstDayOfWeek}
            visibleDuration={{ months: 2 }}
            pageBehavior="single"
            className="relative min-w-0 flex-1"
          >
            <AriaButton slot="previous" className={cx(NAV_BUTTON, "start-0")}>
              <RiArrowLeftSLine aria-hidden className="size-6 rtl:-scale-x-100" />
            </AriaButton>
            <AriaButton slot="next" className={cx(NAV_BUTTON, "end-0")}>
              <RiArrowRightSLine aria-hidden className="size-6 rtl:-scale-x-100" />
            </AriaButton>
            <div className="flex gap-6">
              <div className="min-w-0 flex-1">
                <MonthName offset={0} />
                <MonthGrid offset={0} />
              </div>
              <div className="hidden min-w-0 flex-1 @xl/picker:block">
                <MonthName offset={1} />
                <MonthGrid offset={1} />
              </div>
            </div>
          </RangeCalendar>

          {/* Beside the months it takes their height, so its own long lists have to sit out of the flow. */}
          <div className="relative h-56 shrink-0 overflow-hidden rounded-surface bg-canvas @2xl/picker:h-auto @2xl/picker:w-30">
            <div className="absolute inset-0 flex divide-x divide-line">
              <TimeColumn label={`${endName} hour`} values={HOURS} value={time.hour} onChange={(v) => setTime("hour", v)} />
              <TimeColumn label={`${endName} minute`} values={minuteValues} value={time.minute} onChange={(v) => setTime("minute", v)} />
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
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
          <p aria-live="polite" className="min-w-0 text-body-sm tabular-nums text-fg-secondary">
            {range ? `${stamp(range.start, range.startTime)} – ${stamp(range.end, range.endTime)}` : "Pick a start and an end date"}
          </p>
          <div className="ms-auto flex gap-2">
            {onClear && (
              <Button
                variant="tertiary"
                size="sm"
                isDisabled={!dates}
                onPress={() => {
                  setDates(null);
                  onChange?.(null);
                  onClear();
                }}
              >
                Clear
              </Button>
            )}
            <Button variant="ink" size="sm" isDisabled={!range || isBackwards} onPress={() => range && onApply?.(range)} className="rounded-action px-6">
              {applyLabel}
            </Button>
          </div>
        </footer>
      </div>
    </section>
  );
}
