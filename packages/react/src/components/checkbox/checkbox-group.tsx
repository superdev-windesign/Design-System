"use client";

import type { ReactNode } from "react";
import { CheckboxGroup as AriaCheckboxGroup } from "react-aria-components";
import type { CheckboxGroupProps as AriaCheckboxGroupProps, ValidationResult } from "react-aria-components";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * CheckboxGroup: several Checkboxes that make up one answer ("Notify me
 * about…"). The group carries the label, the help text and validation, and
 * its value is the array of checked `value`s.
 *
 * ```tsx
 * <CheckboxGroup label="Notify me about" defaultValue={["mentions"]}>
 *   <Checkbox value="mentions">Mentions</Checkbox>
 *   <Checkbox value="replies">Replies</Checkbox>
 * </CheckboxGroup>
 * ```
 */

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  orientation?: "vertical" | "horizontal";
  children: ReactNode;
  className?: string;
}

export function CheckboxGroup({ label, description, errorMessage, orientation = "vertical", children, className, ...props }: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup {...props} className={cx("flex flex-col gap-2", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <div className={cx("flex", orientation === "vertical" ? "flex-col gap-2.5" : "flex-wrap gap-x-5 gap-y-2.5")}>{children}</div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
}
