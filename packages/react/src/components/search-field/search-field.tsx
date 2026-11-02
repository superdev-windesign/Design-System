"use client";

import type { ReactNode } from "react";
import { Button as AriaButton, Group, Input, SearchField as AriaSearchField } from "react-aria-components";
import type { SearchFieldProps as AriaSearchFieldProps } from "react-aria-components";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { FIELD_BUTTON, FIELD_INPUT, fieldShell, type FieldSize } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * SearchField: a search box with a magnifier and a clear button that shows
 * once there's text. Enter fires `onSubmit`; Escape (or the button) clears it
 * and fires `onClear`. Without a visible `label`, pass `aria-label`.
 */

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string;
  placeholder?: string;
  size?: FieldSize;
  className?: string;
}

export function SearchField({ label, description, errorMessage, placeholder = "Search", size = "md", className, ...props }: SearchFieldProps) {
  return (
    <AriaSearchField {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <Group className={(state) => fieldShell(state, size)}>
        <RiSearchLine aria-hidden className="size-4 shrink-0" />
        <Input placeholder={placeholder} className={cx(FIELD_INPUT, "[&::-webkit-search-cancel-button]:hidden")} />
        <AriaButton className={cx(FIELD_BUTTON, "-me-1 group-data-[empty]:invisible")}>
          <RiCloseLine aria-hidden className="size-4" />
        </AriaButton>
      </Group>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
