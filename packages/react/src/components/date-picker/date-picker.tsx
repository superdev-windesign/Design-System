// Adapted from BoardUI (MIT) — components/base/date-picker/date-picker.tsx. See THIRD_PARTY_NOTICES.md.
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Calendar, Dialog, Popover, useLocale } from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import { RiCalendarLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "../../utils/cx";
import { useDismissOnOutsidePress } from "../../utils/use-dismiss-on-outside-press";
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
 * Visual parity with BoardUI's single-date DatePicker (Figma node 3879:6708):
 * one month with both chevrons active, and a footer with an editable
 * "DD/MM/YYYY" chip plus Cancel/Apply. Reuses the range picker's chrome.
 *
 * Uses a standalone Popover anchored by `triggerRef` (not DialogTrigger), so an
 * external element can open it: pass `triggerRef` + `isOpen` + `onOpenChange`,
 * and the built-in trigger button is hidden.
 */

export interface DatePickerProps {
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onChange?: (value: CalendarDate | null) => void;
  isDisabled?: boolean;
  className?: string;
  "aria-label"?: string;
  /** Trigger text when no date is committed. Default "Select date". */
  placeholder?: string;
  /** Anchor the popover to an external element instead of the built-in trigger. */
  triggerRef?: RefObject<HTMLElement | null>;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  isDisabled,
  className,
  "aria-label": ariaLabel = "Date",
  placeholder = "Select date",
  triggerRef: externalTriggerRef,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: DatePickerProps) {
  const { locale } = useLocale();
  const ownTriggerRef = useRef<HTMLButtonElement>(null);
  const triggerRef = externalTriggerRef ?? ownTriggerRef;
  const isExternal = externalTriggerRef !== undefined;
  const popoverRef = useRef<HTMLElement>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isExternal ? (controlledIsOpen ?? false) : internalOpen;
  const setIsOpen = isExternal ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<CalendarDate | null>(defaultValue);
  const committedValue = isControlled ? (value ?? null) : internalValue;
  const [pendingValue, setPendingValue] = useState<CalendarDate | null>(committedValue);

  // React Aria's Calendar keeps its own visible month while mounted (the
  // Popover stays mounted for its exit animation). Re-keying it on every open
  // makes it show the committed value's month again.
  const [openKey, setOpenKey] = useState(0);

  // Re-sync on every open, including opens driven by an external trigger.
  useEffect(() => {
    if (isOpen) {
      setPendingValue(committedValue);
      setOpenKey((key) => key + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on the open transition only
  }, [isOpen]);

  const commit = (next: CalendarDate | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    setIsOpen(false);
  };

  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);

  return (
    <>
      {!isExternal && (
        <button
          ref={ownTriggerRef}
          type="button"
          disabled={isDisabled}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={cx(triggerButtonClassName, className)}
        >
          <RiCalendarLine className="size-icon-md shrink-0 text-icon" aria-hidden />
          <span className="flex items-center justify-center whitespace-nowrap px-1 text-body-md-strong text-fg">
            {committedValue ? formatTriggerDate(committedValue, locale) : placeholder}
          </span>
        </button>
      )}
      <Popover
        ref={popoverRef}
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        offset={4}
        placement="bottom end"
        isNonModal
        className={popoverClassName}
      >
        <Dialog aria-label={ariaLabel} className="outline-none">
          <Calendar key={openKey} aria-label={ariaLabel} value={pendingValue} onChange={setPendingValue}>
            <div className="flex flex-col p-2 pb-3">
              <MonthPanel offset={0} showPrev showNext />
              <div className="flex items-center justify-between px-4 pt-3">
                <div>
                  <AnimatePresence>
                    {pendingValue && (
                      <motion.div key="date-summary" {...summaryMotion}>
                        <DateChipInput date={pendingValue} label="Date" onCommit={setPendingValue} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <CalendarActions>
                  <Button
                    variant="secondary"
                    onPress={() => {
                      setPendingValue(committedValue);
                      setIsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onPress={() => commit(pendingValue)} isDisabled={!pendingValue}>
                    Apply
                  </Button>
                </CalendarActions>
              </div>
            </div>
          </Calendar>
        </Dialog>
      </Popover>
    </>
  );
}
