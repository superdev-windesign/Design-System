"use client";

import { Calendar as AriaCalendar, RangeCalendar as AriaRangeCalendar, Text } from "react-aria-components";
import type { CalendarProps as AriaCalendarProps, DateValue, RangeCalendarProps as AriaRangeCalendarProps } from "react-aria-components";
import { MonthPanel } from "../date-picker/shared";
import { FIELD_ERROR } from "../../recipes/field";
import { cx } from "../../utils/cx";

/**
 * Calendar and RangeCalendar: a month grid that stays on the page (a booking
 * sidebar, a dashboard filter), rather than in a picker's popover. They share
 * the date picker's day cells, so a range reads as one band either way.
 *
 * Arrow keys move by day, Page Up / Down by month, Home / End to the week's
 * ends; Enter or Space selects. `isDateUnavailable` greys out days that can't
 * be chosen (booked, closed) while keeping them focusable.
 */

const FRAME = "inline-flex flex-col gap-3 rounded-surface border border-line bg-surface p-4";

export interface CalendarProps<T extends DateValue> extends Omit<AriaCalendarProps<T>, "className" | "visibleDuration"> {
  /** Shown under the grid when the value is invalid. */
  errorMessage?: string;
  className?: string;
}

export function Calendar<T extends DateValue>({ errorMessage, className, ...props }: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={cx(FRAME, className)}>
      <MonthPanel offset={0} showPrev showNext bare />
      {errorMessage && (
        <Text slot="errorMessage" className={FIELD_ERROR}>
          {errorMessage}
        </Text>
      )}
    </AriaCalendar>
  );
}

export interface RangeCalendarProps<T extends DateValue> extends Omit<AriaRangeCalendarProps<T>, "className" | "visibleDuration"> {
  /** Months side by side (stacked below the md breakpoint). Default 1. */
  visibleMonths?: 1 | 2 | 3;
  errorMessage?: string;
  className?: string;
}

export function RangeCalendar<T extends DateValue>({ visibleMonths = 1, errorMessage, className, ...props }: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar {...props} visibleDuration={{ months: visibleMonths }} className={cx(FRAME, className)}>
      {/* Side by side from md; a shrink-to-fit frame would otherwise always wrap. */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {Array.from({ length: visibleMonths }, (_, i) => (
          <MonthPanel key={i} offset={i} showPrev={i === 0} showNext={i === visibleMonths - 1} bare />
        ))}
      </div>
      {errorMessage && (
        <Text slot="errorMessage" className={FIELD_ERROR}>
          {errorMessage}
        </Text>
      )}
    </AriaRangeCalendar>
  );
}
