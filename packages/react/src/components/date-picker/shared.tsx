// Adapted from BoardUI (MIT) — components/base/date-picker/shared.tsx. See THIRD_PARTY_NOTICES.md.
import { useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Button as AriaButton,
  ButtonContext,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  RangeCalendarStateContext,
  useLocale,
} from "react-aria-components";
import type { CalendarCellRenderProps } from "react-aria-components";
import { CalendarDate, endOfWeek, getLocalTimeZone, isSameDay, startOfWeek } from "@internationalized/date";
import { ChevronLeft16, ChevronRight16 } from "../../icons/chevrons";
import { focusRing, focusRingInset, focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Shared chrome for the date-picker family. `DateRangePicker` (dual month,
 * Figma node 3871:5738) and `DatePicker` (single month, node 3879:6708) are
 * the same visual system around different React Aria roots (`RangeCalendar`
 * vs `Calendar`), so a fidelity fix only has to happen here.
 */

export function formatTriggerDate(date: CalendarDate, locale?: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(
    date.toDate(getLocalTimeZone()),
  );
}

export function formatChipDate(date: CalendarDate) {
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

/** Parses the chip's "DD/MM/YYYY" text back into a date, or null when it isn't one. */
export function parseChipDate(text: string): CalendarDate | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new CalendarDate(year, month, day);
}

export function DayCell(props: CalendarCellRenderProps & { isRange: boolean }) {
  const { locale } = useLocale();
  const { date, formattedDate, isSelected, isSelectionStart, isSelectionEnd, isHovered, isFocusVisible, isDisabled, isOutsideMonth, isRange } = props;

  if (isOutsideMonth) {
    return <div className="size-8" />;
  }

  const isWeekStart = isSameDay(date, startOfWeek(date, locale));
  const isWeekEnd = isSameDay(date, endOfWeek(date, locale));

  // A plain Calendar never sets isSelectionStart/End, so the single selected
  // day must be detected through isSelected or it would render as a range middle.
  const isSingleDay = isRange ? isSelectionStart && isSelectionEnd : isSelected;
  const isEdge = isRange ? isSelectionStart || isSelectionEnd : isSelected;

  // Cells sit 12px apart. A selected range should read as one band, so its
  // background reaches 6px toward each selected neighbour — never past the
  // first or last column of a week, where there is no neighbour.
  const extendStart = isRange && isSelected && !isSelectionStart && !isWeekStart;
  const extendEnd = isRange && isSelected && !isSelectionEnd && !isWeekEnd;

  // Both background layers always render and fade on opacity, so changing a
  // range is a cheap CSS transition across ~70 cells instead of remounts.
  // border-radius transitions too, so corners ease in sync with the fade.
  return (
    <div className="relative size-8">
      <span
        aria-hidden
        className={cx(
          "absolute inset-y-0 bg-selection-range transition-[opacity,border-radius] duration-(--ds-motion-duration-fast) ease-out",
          isSelectionStart ? "start-1/2" : extendStart ? "-start-1.5" : "start-0",
          isSelectionEnd ? "end-1/2" : extendEnd ? "-end-1.5" : "end-0",
          !isSelectionStart && isWeekStart && "rounded-s-item",
          !isSelectionEnd && isWeekEnd && "rounded-e-item",
          isSelected && !isSingleDay ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cx(
          "relative flex size-8 items-center justify-center rounded-item outline-none",
          !isSelected && isHovered && "bg-sunken-hover",
          "transition-colors duration-(--ds-motion-duration-fast) ease-out",
          isFocusVisible && focusRingInset,
        )}
      >
        <span
          aria-hidden
          className={cx(
            "absolute inset-0 bg-selection-range-edge transition-[opacity,border-radius] duration-(--ds-motion-duration-fast) ease-out",
            isSingleDay && "rounded-item",
            isSelectionStart && !isSingleDay && "rounded-s-item",
            isSelectionEnd && !isSingleDay && "rounded-e-item",
            isEdge ? "opacity-100" : "opacity-0",
          )}
        />
        <span className={cx("relative text-body-md-strong text-fg", isDisabled && "text-fg-tertiary")}>
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

const monthNavButton = cx(
  "flex size-4 cursor-pointer items-center justify-center rounded-hairline text-fg-secondary",
  "transition-colors duration-(--ds-motion-duration-base) hover:bg-sunken-hover",
  focusRing,
);

export function MonthPanel({
  offset,
  showPrev,
  showNext,
  bare = false,
  hideHeader = false,
}: {
  offset: number;
  showPrev?: boolean;
  showNext?: boolean;
  /** Skip the card chrome so the grid can sit inside a caller-styled container. */
  bare?: boolean;
  /** Skip the title and prev/next row when the caller renders its own. */
  hideHeader?: boolean;
}) {
  const { locale } = useLocale();
  // Works inside a RangeCalendar or a plain Calendar: exactly one context is set.
  const rangeState = useContext(RangeCalendarStateContext);
  const singleState = useContext(CalendarStateContext);
  const state = rangeState ?? singleState;
  const isRange = rangeState != null;
  const panelDate = state ? state.visibleRange.start.add({ months: offset }) : null;
  const title = panelDate
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(panelDate.toDate(getLocalTimeZone()))
    : "";

  return (
    // w-81.5 = 326px card; w-74 = 296px bare grid.
    <div className={bare ? "w-74 shrink-0" : "w-81.5 shrink-0 rounded-surface bg-surface p-3.75 shadow-raised"}>
      <div className="flex flex-col gap-5">
        {!hideHeader && (
          <div className="flex items-center justify-between">
            {showPrev ? (
              <AriaButton slot="previous" className={monthNavButton}>
                <ChevronLeft16 />
              </AriaButton>
            ) : (
              <span className="size-4" aria-hidden />
            )}
            <span className="flex-1 text-center text-body-md-strong text-fg">{title}</span>
            {showNext ? (
              <AriaButton slot="next" className={monthNavButton}>
                <ChevronRight16 />
              </AriaButton>
            ) : (
              <span className="size-4" aria-hidden />
            )}
          </div>
        )}
        <CalendarGrid
          offset={{ months: offset }}
          weekdayStyle="short"
          className="-m-3 self-start border-separate border-spacing-3 outline-none"
        >
          <CalendarGridHeader>
            {(day) => (
              <CalendarHeaderCell className="size-6 pb-0 text-center text-body-md-strong text-fg-secondary">
                {day.slice(0, 2)}
              </CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => (
              <CalendarCell date={date} className="p-0 outline-none">
                {(cellProps) => <DayCell {...cellProps} isRange={isRange} />}
              </CalendarCell>
            )}
          </CalendarGridBody>
        </CalendarGrid>
      </div>
    </div>
  );
}

/**
 * One editable "DD/MM/YYYY" chip. It keeps its own draft while typing, commits
 * on blur or Enter, and reverts to the last valid date if the text doesn't parse.
 */
export function DateChipInput({
  date,
  label,
  onCommit,
}: {
  date: CalendarDate;
  label: string;
  onCommit: (date: CalendarDate) => void;
}) {
  const formatted = formatChipDate(date);
  const [text, setText] = useState(formatted);

  useEffect(() => {
    setText(formatted);
  }, [formatted]);

  const commit = () => {
    const parsed = parseChipDate(text);
    if (parsed) onCommit(parsed);
    else setText(formatted);
  };

  return (
    <input
      type="text"
      dir="ltr"
      inputMode="numeric"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") setText(formatted);
      }}
      aria-label={label}
      className={cx(
        "w-26 rounded-control-md border border-line bg-surface p-2 text-body-md-strong text-fg shadow-raised outline-none",
        "transition-colors duration-(--ds-motion-duration-fast) ease-out focus-visible:border-line-pressed",
      )}
    />
  );
}

/**
 * React Aria's Calendar and RangeCalendar slot every React Aria Button inside
 * them as month navigation and throw when one has no `previous`/`next` slot.
 * Footer actions (Cancel/Apply) aren't navigation, so they opt out here.
 */
export function CalendarActions({ children }: { children: ReactNode }) {
  return (
    <ButtonContext.Provider value={null}>
      <div className="flex items-center gap-2.5">{children}</div>
    </ButtonContext.Provider>
  );
}

/** Trigger chrome shared by both pickers: calendar icon + value on a raised surface. */
export const triggerButtonClassName = cx(
  "inline-flex shrink-0 cursor-pointer items-center gap-0.5 rounded-control-md border border-line bg-surface p-2 shadow-raised",
  "transition-[background-color,border-color,box-shadow] duration-(--ds-motion-duration-base)",
  "hover:border-line-hover hover:bg-surface-hover",
  focusRingNative,
  "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-fg-tertiary disabled:shadow-none",
);

/** Popover chrome shared by both pickers: a sunken panel holding raised month cards. */
export const popoverClassName = cx(
  "origin-top rounded-panel bg-sunken shadow-overlay",
  "transition duration-(--ds-motion-duration-base) ease-out",
  "data-[entering]:scale-95 data-[entering]:opacity-0 data-[entering]:blur-enter",
  "data-[exiting]:scale-95 data-[exiting]:opacity-0 data-[exiting]:blur-enter",
);

/** The footer's slide-down entrance for the selected-date summary. */
export const summaryMotion = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.34, 1.2, 0.64, 1] as const },
};
