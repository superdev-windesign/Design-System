"use client";

import type { ReactNode } from "react";
import { DateField as AriaDateField, DateInput, DateSegment, TimeField as AriaTimeField } from "react-aria-components";
import type { DateFieldProps as AriaDateFieldProps, DateValue, TimeFieldProps as AriaTimeFieldProps, TimeValue, ValidationResult } from "react-aria-components";
import { RiCalendarLine, RiTimeLine } from "@remixicon/react";
import { fieldShell, type FieldSize } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * DateField and TimeField: typed dates and times, one segment at a time
 * (day, month, year; hour, minute, period). Segments follow the locale's order
 * and separators, ↑ / ↓ step a segment, and typing moves to the next one.
 * Use DatePicker when people should be able to pick from a calendar too.
 *
 * Values are @internationalized/date objects: `CalendarDate`, `CalendarDateTime`
 * or `ZonedDateTime` for DateField, `Time` for TimeField.
 */

interface SharedProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  size?: FieldSize;
  /** Hide the leading calendar / clock icon. */
  hideIcon?: boolean;
  className?: string;
}

const SEGMENT = cx(
  "rounded-xs px-0.5 text-end tabular-nums text-fg caret-transparent outline-none",
  "data-[placeholder]:text-fg-tertiary data-[type=literal]:px-0 data-[type=literal]:text-fg-tertiary",
  // The highlighted segment is the focus indicator.
  "data-[focused]:bg-accent-600 data-[focused]:text-on-action data-[focused]:data-[placeholder]:text-on-action",
  "data-[disabled]:text-field-fg-disabled",
);

function Segments({ size, hasIcon }: { size: FieldSize; hasIcon: boolean }) {
  return (
    <DateInput className={(state) => cx(fieldShell(state, size), "gap-0 text-body-md", hasIcon && "pe-9")}>
      {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
    </DateInput>
  );
}

export interface DateFieldProps<T extends DateValue> extends Omit<AriaDateFieldProps<T>, "className">, SharedProps {}

export function DateField<T extends DateValue>({ label, description, errorMessage, size = "md", hideIcon, className, ...props }: DateFieldProps<T>) {
  return (
    <AriaDateField {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <div className="relative">
        <Segments size={size} hasIcon={!hideIcon} />
        {!hideIcon && <RiCalendarLine aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-icon-tertiary" />}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

export interface TimeFieldProps<T extends TimeValue> extends Omit<AriaTimeFieldProps<T>, "className">, SharedProps {}

export function TimeField<T extends TimeValue>({ label, description, errorMessage, size = "md", hideIcon, className, ...props }: TimeFieldProps<T>) {
  return (
    <AriaTimeField {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <div className="relative">
        <Segments size={size} hasIcon={!hideIcon} />
        {!hideIcon && <RiTimeLine aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-icon-tertiary" />}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}
