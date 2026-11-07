"use client";

import type { ReactNode } from "react";
import { Button as AriaButton, Group, Input, NumberField as AriaNumberField } from "react-aria-components";
import type { NumberFieldProps as AriaNumberFieldProps, ValidationResult } from "react-aria-components";
import { RiAddLine, RiSubtractLine } from "@remixicon/react";
import { FIELD_BUTTON, FIELD_INPUT, fieldShell, type FieldSize } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * NumberField: a number with − and + steppers. It formats as you leave the
 * field (currency, percent, units through `formatOptions`), clamps to
 * `minValue` / `maxValue`, and steps with the buttons, ↑ / ↓, Page Up / Down
 * and the mouse wheel while focused.
 *
 * ```tsx
 * <NumberField label="Seats" defaultValue={5} minValue={1} maxValue={50} />
 * <NumberField label="Budget" formatOptions={{ style: "currency", currency: "EUR" }} />
 * ```
 */

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  size?: FieldSize;
  className?: string;
}

export function NumberField({ label, description, errorMessage, placeholder, size = "md", className, ...props }: NumberFieldProps) {
  return (
    <AriaNumberField {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <Group className={(state) => fieldShell(state, size)}>
        <AriaButton slot="decrement" className={cx("bui-number-step", FIELD_BUTTON, "-ms-1")}>
          <RiSubtractLine aria-hidden className="size-4" />
        </AriaButton>
        <Input placeholder={placeholder} className={cx(FIELD_INPUT, "text-center tabular-nums")} />
        <AriaButton slot="increment" className={cx("bui-number-step", FIELD_BUTTON, "-me-1")}>
          <RiAddLine aria-hidden className="size-4" />
        </AriaButton>
      </Group>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
