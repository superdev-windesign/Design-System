import { cx } from "../utils/cx";

/**
 * The text-field shell shared by every field built after Input: ComboBox,
 * NumberField, SearchField, PasswordField, DateField, TimeField, ColorField
 * and MultiSelect. It matches Input's look: a surface with an inset control
 * ring that darkens on hover, a 2px focus ring while anything inside has
 * focus, a danger tint when invalid and a flat fill when disabled.
 *
 * Pass the render state of the React Aria `Group` (or field) that wraps the
 * input; every flag is optional so plain elements can use it too.
 */
export interface FieldShellState {
  isHovered?: boolean;
  isFocusWithin?: boolean;
  isFocused?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export type FieldSize = "md" | "sm";

export function fieldShell(state: FieldShellState, size: FieldSize = "md") {
  const focused = (state.isFocusWithin || state.isFocused) && !state.isDisabled;
  return cx(
    "relative flex w-full items-center rounded-2lg bg-surface text-icon-tertiary ring-1 ring-inset ring-line-control",
    "transition-[background-color,box-shadow,color] duration-(--ds-motion-duration-base) ease-out",
    size === "md" ? "min-h-control-md gap-1.5 px-2.5" : "min-h-control-sm gap-1 px-2",
    state.isHovered && !focused && !state.isDisabled && !state.isInvalid && "ring-line-control-hover",
    focused && !state.isInvalid && "ring-2 ring-focus",
    state.isInvalid && "bg-danger-subtle text-icon-danger",
    state.isInvalid && focused && "ring-2 ring-line-danger",
    state.isDisabled && "cursor-not-allowed bg-field-disabled text-field-icon-disabled",
  );
}

/** The bare `<input>` inside a field shell: the shell draws focus, so the input doesn't. */
export const FIELD_INPUT = cx(
  "min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 text-body-md text-fg outline-none",
  "placeholder:text-fg-tertiary disabled:cursor-not-allowed disabled:text-field-fg-disabled",
);

/** A small square button inside a field (clear, step, reveal, open). */
export const FIELD_BUTTON = cx(
  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-control-xs text-icon-secondary",
  "transition-colors duration-(--ds-motion-duration-base)",
  "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-pressed",
  "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-0 data-[focus-visible]:outline-focus",
);

/** Field label, description and error text, matching Input's Label and HintText. */
export const FIELD_LABEL = "flex items-center gap-0.5 text-body-md-strong text-fg";
export const FIELD_DESCRIPTION = "pt-px text-caption-strong text-fg-secondary";
export const FIELD_ERROR = "pt-px text-caption-strong text-fg-danger";
