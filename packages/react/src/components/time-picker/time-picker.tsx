"use client";

import { useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  DateInput,
  DatePicker as AriaDatePicker,
  DatePickerStateContext,
  DateSegment,
  Dialog as AriaDialog,
  DialogTrigger,
  Group,
  ListBox,
  ListBoxItem,
  Popover as AriaPopover,
  TimeField as AriaTimeField,
  useLocale,
} from "react-aria-components";
import type { DatePickerProps as AriaDatePickerProps, DateValue, TimeFieldProps as AriaTimeFieldProps, TimeValue, ValidationResult } from "react-aria-components";
import { Time } from "@internationalized/date";
import { RiCalendarLine, RiCheckLine, RiTimeLine } from "@remixicon/react";
import { Button } from "../button/button";
import { MonthPanel } from "../date-picker/shared";
import { focusRingNative } from "../../recipes/focus-ring";
import { FIELD_BUTTON, FIELD_SEGMENT, fieldShell, type FieldSize } from "../../recipes/field";
import { MENU_ITEM, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { FLOATING_SURFACE, POPOVER_MOTION } from "../../recipes/overlay";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";
import { TimeField } from "../date-field/date-field";

/**
 * TimePicker: a time you can type segment by segment, or pick from a list of
 * slots every `interval` minutes (09:00, 09:30, …). The list opens from the
 * clock button and lands on the current value.
 *
 * DateTimePicker: a date and a time in one field. The calendar button opens
 * a month grid with the time underneath; Done closes it.
 */

/** Any TimeValue (Time, CalendarDateTime, ZonedDateTime) reduced to a wall-clock Time. */
const toTime = (value?: TimeValue | null) => (value ? new Time(value.hour, value.minute, value.second) : null);

const keyOf = (time: Time) => `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;

/** Every slot from 00:00 to 23:59, `interval` minutes apart, within the bounds. */
export function timeSlots(interval = 30, minValue?: Time | null, maxValue?: Time | null) {
  const slots: Time[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
    const time = new Time(Math.floor(minutes / 60), minutes % 60);
    if (minValue && time.compare(minValue) < 0) continue;
    if (maxValue && time.compare(maxValue) > 0) continue;
    slots.push(time);
  }
  return slots;
}

interface FieldChrome {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  size?: FieldSize;
  className?: string;
}

export interface TimePickerProps extends Omit<AriaTimeFieldProps<Time>, "className">, FieldChrome {
  /** Minutes between slots in the list. Default 30. */
  interval?: number;
}

export function TimePicker({ label, description, errorMessage, size = "md", className, interval = 30, ...props }: TimePickerProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Time | null>(props.defaultValue ?? null);
  const value = props.value !== undefined ? props.value : draft;
  const [isOpen, setOpen] = useState(false);
  const { locale } = useLocale();
  const slots = useMemo(() => timeSlots(interval, toTime(props.minValue), toTime(props.maxValue)), [interval, props.minValue, props.maxValue]);
  const format = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hourCycle: props.hourCycle === 24 ? "h23" : props.hourCycle === 12 ? "h12" : undefined }),
    [locale, props.hourCycle],
  );

  const set = (next: Time | null) => {
    setDraft(next);
    props.onChange?.(next);
  };

  return (
    <AriaTimeField {...props} value={value} onChange={set} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <Group ref={groupRef} className={(state) => cx(fieldShell(state, size), "pe-1.5")}>
        <DateInput className="flex flex-1 items-center text-body-md">{(segment) => <DateSegment segment={segment} className={FIELD_SEGMENT} />}</DateInput>
        <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
          <AriaButton aria-label="Choose a time" isDisabled={props.isDisabled || props.isReadOnly} className={FIELD_BUTTON}>
            <RiTimeLine aria-hidden className="size-4" />
          </AriaButton>
          <AriaPopover triggerRef={groupRef} placement="bottom end" offset={4} className={cx(MENU_POPOVER_SURFACE, "w-44 p-1.5")}>
            <AriaDialog aria-label="Times" className="outline-none">
              <ListBox
                aria-label="Times"
                autoFocus
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={value ? [keyOf(new Time(value.hour, value.minute))] : []}
                onSelectionChange={(keys) => {
                  const key = [...keys][0];
                  const slot = slots.find((s) => keyOf(s) === key);
                  if (slot) set(slot);
                  setOpen(false);
                }}
                items={slots.map((time) => ({ id: keyOf(time), time }))}
                className={cx(MENU_ITEMS_CONTAINER, "max-h-64 overflow-auto")}
              >
                {({ id, time }) => (
                  <ListBoxItem
                    id={id}
                    textValue={format.format(new Date(2000, 0, 1, time.hour, time.minute))}
                    className={({ isFocused }) => cx(MENU_ITEM, "py-1.5 text-body-md tabular-nums", isFocused && "bg-surface-hover")}
                  >
                    {({ isSelected }) => (
                      <>
                        <span className="flex-1">{format.format(new Date(2000, 0, 1, time.hour, time.minute))}</span>
                        {isSelected && <RiCheckLine aria-hidden className="size-4 text-accent-600" />}
                      </>
                    )}
                  </ListBoxItem>
                )}
              </ListBox>
            </AriaDialog>
          </AriaPopover>
        </DialogTrigger>
      </Group>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}

export interface DateTimePickerProps<T extends DateValue> extends Omit<AriaDatePickerProps<T>, "className" | "granularity">, FieldChrome {
  /** Default "minute". */
  granularity?: "hour" | "minute" | "second";
}

/** The time row under the calendar, bound to the picker's own time value. */
function PickerTime() {
  const state = useContext(DatePickerStateContext);
  if (!state) return null;
  return (
    <TimeField
      label="Time"
      size="sm"
      value={state.timeValue}
      onChange={(time) => time && state.setTimeValue(time)}
      granularity={state.granularity === "day" ? "minute" : state.granularity}
    />
  );
}

export function DateTimePicker<T extends DateValue>({ label, description, errorMessage, size = "md", className, granularity = "minute", ...props }: DateTimePickerProps<T>) {
  return (
    <AriaDatePicker {...props} granularity={granularity} shouldCloseOnSelect={false} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <Group className={(state) => cx(fieldShell(state, size), "pe-1.5")}>
        <DateInput className="flex flex-1 flex-wrap items-center text-body-md">{(segment) => <DateSegment segment={segment} className={FIELD_SEGMENT} />}</DateInput>
        <AriaButton aria-label="Open calendar" className={FIELD_BUTTON}>
          <RiCalendarLine aria-hidden className="size-4" />
        </AriaButton>
      </Group>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
      <AriaPopover placement="bottom start" offset={6} className={cx(FLOATING_SURFACE, POPOVER_MOTION)}>
        <AriaDialog aria-label="Choose a date and time" className={cx("flex flex-col gap-4 rounded-overlay p-4", focusRingNative)}>
          {({ close }) => (
            <>
              <AriaCalendar>
                <MonthPanel offset={0} showPrev showNext bare />
              </AriaCalendar>
              <div className="flex items-end gap-3 border-t border-line pt-4">
                <div className="flex-1">
                  <PickerTime />
                </div>
                <Button size="sm" onPress={close}>
                  Done
                </Button>
              </div>
            </>
          )}
        </AriaDialog>
      </AriaPopover>
    </AriaDatePicker>
  );
}
