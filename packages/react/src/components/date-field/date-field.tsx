"use client";

import type { ReactNode } from "react";
import { DateField as AriaDateField, DateInput, DateSegment, TimeField as AriaTimeField } from "react-aria-components";
import type { DateFieldProps as AriaDateFieldProps, DateValue, TimeFieldProps as AriaTimeFieldProps, TimeValue, ValidationResult } from "react-aria-components";
import { RiCalendarLine, RiTimeLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { FIELD_SEGMENT, fieldShell, type FieldSize } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * DateField and TimeField: typed dates and times, one segment at a time
 * (day, month, year; hour, minute, second, period). Segments follow the
 * locale's order, digits and separators, and the reading direction.
 *
 * Keyboard: each segment is a tab stop. Typing digits fills it and moves on,
 * ↑ / ↓ step it, ← / → move between segments, Backspace clears one, and in a
 * 12-hour clock A and P set the period. Screen readers hear every segment
 * by name and value.
 *
 * `minValue` / `maxValue` (and `isRequired`) validate the value. While it's
 * invalid, the error takes the place of the `description`, so there's one
 * line of help, not two. Errors show once the form is submitted, or as
 * people type with `validationBehavior="aria"`.
 *
 * Values are @internationalized/date objects: `CalendarDate`, `CalendarDateTime`
 * or `ZonedDateTime` for DateField, `Time` for TimeField.
 */

interface SharedProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  size?: FieldSize;
  /** The icon at the end of the field. Defaults to a calendar / clock; `null` hides it. */
  icon?: IconComponent | null;
  /** Hide the icon. Same as `icon={null}`. */
  hideIcon?: boolean;
  className?: string;
}

function Body({
  label,
  description,
  errorMessage,
  size,
  Icon,
  isInvalid,
  isRequired,
}: {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: SharedProps["errorMessage"];
  size: FieldSize;
  Icon: IconComponent | null;
  isInvalid: boolean;
  isRequired?: boolean;
}) {
  return (
    <>
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <div className="relative">
        <DateInput className={(state) => cx(fieldShell(state, size), "gap-0 text-body-md", Icon && "pe-9")}>
          {(segment) => <DateSegment segment={segment} className={FIELD_SEGMENT} />}
        </DateInput>
        {Icon && (
          <Icon
            aria-hidden
            className={cx(
              "pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2",
              isInvalid ? "text-icon-danger" : "text-icon-tertiary group-data-[disabled]:text-field-icon-disabled",
            )}
          />
        )}
      </div>
      {/* One line of help: the error replaces the description while the value is invalid. */}
      {description && !isInvalid && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </>
  );
}

const pickIcon = (icon: IconComponent | null | undefined, hideIcon: boolean | undefined, fallback: IconComponent) =>
  hideIcon || icon === null ? null : (icon ?? fallback);

export interface DateFieldProps<T extends DateValue> extends Omit<AriaDateFieldProps<T>, "className" | "children">, SharedProps {}

export function DateField<T extends DateValue>({ label, description, errorMessage, size = "md", icon, hideIcon, className, ...props }: DateFieldProps<T>) {
  const Icon = pickIcon(icon, hideIcon, RiCalendarLine);
  return (
    <AriaDateField {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {({ isInvalid }) => (
        <Body label={label} description={description} errorMessage={errorMessage} size={size} Icon={Icon} isInvalid={isInvalid} isRequired={props.isRequired} />
      )}
    </AriaDateField>
  );
}

export interface TimeFieldProps<T extends TimeValue> extends Omit<AriaTimeFieldProps<T>, "className" | "children">, SharedProps {}

export function TimeField<T extends TimeValue>({ label, description, errorMessage, size = "md", icon, hideIcon, className, ...props }: TimeFieldProps<T>) {
  const Icon = pickIcon(icon, hideIcon, RiTimeLine);
  return (
    <AriaTimeField {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {({ isInvalid }) => (
        <Body label={label} description={description} errorMessage={errorMessage} size={size} Icon={Icon} isInvalid={isInvalid} isRequired={props.isRequired} />
      )}
    </AriaTimeField>
  );
}
