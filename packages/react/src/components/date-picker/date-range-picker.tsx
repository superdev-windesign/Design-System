// Adapted from BoardUI (MIT) — components/base/date-picker/date-range-picker.tsx. See THIRD_PARTY_NOTICES.md.
import { useMemo, useRef, useState } from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover, RangeCalendar, useLocale } from "react-aria-components";
import {
  CalendarDate,
  endOfMonth,
  endOfYear,
  getLocalTimeZone,
  isSameDay,
  startOfMonth,
  startOfYear,
  today,
} from "@internationalized/date";
import { RiCalendarLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useDismissOnOutsidePress, useTriggerToggle } from "../../utils/use-dismiss-on-outside-press";
import { Button } from "../button/button";
import {
  CalendarActions,
  DateChipInput,
  MonthPanel,
  formatTriggerDate,
  popoverClassName,
  summaryMotion,
  triggerButtonClassName,
} from "./shared";

/**
 * Visual parity with BoardUI's DateRangePicker (Figma node 3871:5738).
 *
 * The trigger opens a popover with a quick-select sidebar, two adjacent months
 * (`visibleDuration={{ months: 2 }}`) and a footer with editable date chips, an
 * "N days selected" pill and Cancel/Apply. Selection is held as a *pending*
 * range: nothing is committed until Apply.
 *
 * Only the outer chevrons are wired (prev on month 1, next on month 2); the
 * inner slots are invisible spacers, because two adjacent months share one
 * navigation state.
 */

export interface DateRangeValue {
  start: CalendarDate;
  end: CalendarDate;
}

export interface DateRangePickerProps {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null) => void;
  isDisabled?: boolean;
  className?: string;
  /** Extra classes for the portalled calendar, such as a locale-specific font. */
  popoverClassName?: string;
  "aria-label"?: string;
  /** Trigger text when no range is committed. Default "Select date range". */
  placeholder?: string;
}

function daysInRange(value: DateRangeValue) {
  const tz = getLocalTimeZone();
  const ms = value.end.toDate(tz).getTime() - value.start.toDate(tz).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

function useQuickSelectPresets() {
  return useMemo(() => {
    const now = today(getLocalTimeZone());
    const lastMonth = now.subtract({ months: 1 });
    const lastYear = now.subtract({ years: 1 });
    return [
      { label: "Today", range: { start: now, end: now } },
      { label: "Yesterday", range: { start: now.subtract({ days: 1 }), end: now.subtract({ days: 1 }) } },
      { label: "Last week", range: { start: now.subtract({ days: 7 }), end: now.subtract({ days: 1 }) } },
      { label: "This month", range: { start: startOfMonth(now), end: endOfMonth(now) } },
      { label: "Last month", range: { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) } },
      { label: "This year", range: { start: startOfYear(now), end: endOfYear(now) } },
      { label: "Last year", range: { start: startOfYear(lastYear), end: endOfYear(lastYear) } },
      { label: "All time", range: { start: now.subtract({ years: 10 }), end: now } },
    ];
  }, []);
}

function isPresetActive(value: DateRangeValue | null, range: DateRangeValue) {
  return !!value && isSameDay(value.start, range.start) && isSameDay(value.end, range.end);
}

function QuickSelect({ value, onSelect }: { value: DateRangeValue | null; onSelect: (range: DateRangeValue) => void }) {
  const presets = useQuickSelectPresets();

  return (
    // w-29.5 = 118px sidebar
    <div className="flex w-29.5 shrink-0 flex-col gap-1.5">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.range)}
          className={cx(
            "w-full cursor-pointer rounded-control-md px-2 py-1.5 text-start text-body-md-strong text-fg",
            "transition-colors duration-(--ds-motion-duration-base)",
            focusRingNative,
            isPresetActive(value, preset.range) ? "bg-muted" : "hover:bg-sunken-hover",
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

function Footer({
  value,
  onChange,
  onCancel,
  onApply,
}: {
  value: DateRangeValue | null;
  onChange: (value: DateRangeValue) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  return (
    <div className="flex items-center justify-between pe-4 pt-3">
      <div className="flex items-center gap-2.5">
        <AnimatePresence>
          {value && (
            <motion.div key="range-summary" {...summaryMotion} className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.25">
                <DateChipInput
                  date={value.start}
                  label="Start date"
                  onCommit={(start) => onChange({ start, end: start.compare(value.end) > 0 ? start : value.end })}
                />
                <span className="text-body-md-strong text-fg-secondary">-</span>
                <DateChipInput
                  date={value.end}
                  label="End date"
                  onCommit={(end) => onChange({ start: end.compare(value.start) < 0 ? end : value.start, end })}
                />
              </div>
              <span className="rounded-chip bg-muted p-2 text-body-md-strong text-fg-secondary">
                {`${daysInRange(value)} day${daysInRange(value) === 1 ? "" : "s"} selected`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CalendarActions>
        <Button variant="secondary" onPress={onCancel}>
          Cancel
        </Button>
        <Button onPress={onApply} isDisabled={!value}>
          Apply
        </Button>
      </CalendarActions>
    </div>
  );
}

export function DateRangePicker({
  value,
  defaultValue = null,
  onChange,
  isDisabled,
  className,
  popoverClassName: calendarClassName,
  "aria-label": ariaLabel = "Date range",
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const { locale } = useLocale();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<DateRangeValue | null>(defaultValue);
  const committedValue = isControlled ? (value ?? null) : internalValue;
  const [pendingValue, setPendingValue] = useState<DateRangeValue | null>(committedValue);

  const commit = (next: DateRangeValue | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);
  // Pressing the trigger while open closes the popover instead of reopening it.
  const allowOpenChange = useTriggerToggle(isOpen, triggerRef);

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!allowOpenChange(open)) return;
        if (open) setPendingValue(committedValue);
        setIsOpen(open);
      }}
    >
      <AriaButton ref={triggerRef} isDisabled={isDisabled} className={cx(triggerButtonClassName, className)}>
        <RiCalendarLine className="size-icon-md shrink-0 text-icon" aria-hidden />
        <span className="flex items-center justify-center whitespace-nowrap px-1 text-body-md-strong text-fg">
          {committedValue
            ? `${formatTriggerDate(committedValue.start, locale)} - ${formatTriggerDate(committedValue.end, locale)}`
            : placeholder}
        </span>
      </AriaButton>
      <Popover
        ref={popoverRef}
        offset={4}
        placement="bottom end"
        isNonModal
        className={cx(popoverClassName, calendarClassName)}
      >
        <Dialog aria-label={ariaLabel} className="outline-none">
          {({ close }) => (
            <RangeCalendar
              aria-label={ariaLabel}
              visibleDuration={{ months: 2 }}
              value={pendingValue}
              onChange={setPendingValue}
            >
              <div className="flex gap-3">
                <div className="ps-4 pt-4">
                  <QuickSelect value={pendingValue} onSelect={setPendingValue} />
                </div>
                <div className="flex flex-col pe-2 pb-3 pt-2">
                  <div className="flex gap-2">
                    <MonthPanel offset={0} showPrev />
                    <MonthPanel offset={1} showNext />
                  </div>
                  <Footer
                    value={pendingValue}
                    onChange={setPendingValue}
                    onCancel={() => {
                      setPendingValue(committedValue);
                      close();
                    }}
                    onApply={() => {
                      commit(pendingValue);
                      close();
                    }}
                  />
                </div>
              </div>
            </RangeCalendar>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
