import { cx } from "../utils/cx";

/**
 * The text-field shell shared by every field built after Input: ComboBox,
 * NumberField, SearchField, PasswordField, DateField, TimeField, ColorField
 * and MultiSelect. It matches Input's look, a ledger field: a surface with a
 * crisp 1px control outline that darkens on hover. Focus turns the outline
 * to the focus colour and draws a pen rule along the bottom edge from the
 * start; an invalid field holds that rule in danger red (thickening the
 * outline while focused) instead of tinting the whole field. Disabled is a
 * flat fill.
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

/**
 * The pen rule along a field's bottom edge, drawn from the start. Add
 * `after:scale-x-100` to show it; `after:bg-line-danger` recolours it.
 */
export const FIELD_RULE = cx(
  "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-b-control-md after:bg-focus",
  "after:origin-left after:scale-x-0 after:transition-[scale] after:duration-(--ds-motion-duration-moderate) after:ease-out",
  "rtl:after:origin-right motion-reduce:after:transition-none",
);

export function fieldShell(state: FieldShellState, size: FieldSize = "md") {
  const focused = (state.isFocusWithin || state.isFocused) && !state.isDisabled;
  return cx(
    "relative flex w-full items-center rounded-control-md bg-surface text-icon-tertiary ring-1 ring-inset ring-line-control",
    "transition-[background-color,box-shadow,color] duration-(--ds-motion-duration-base) ease-out",
    FIELD_RULE,
    size === "md" ? "min-h-control-md gap-1.5 px-2.5" : "min-h-control-sm gap-1 px-2",
    state.isHovered && !focused && !state.isDisabled && !state.isInvalid && "ring-line-control-hover",
    focused && !state.isInvalid && "ring-focus after:scale-x-100",
    state.isInvalid && "ring-line-danger text-icon-danger after:scale-x-100 after:bg-line-danger",
    state.isInvalid && focused && "ring-2",
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

/** One segment of a date or time input. The highlighted segment is its focus indicator. */
export const FIELD_SEGMENT = cx(
  "rounded-xs px-0.5 text-end tabular-nums text-fg caret-transparent outline-none",
  "data-[placeholder]:text-fg-tertiary data-[type=literal]:px-0 data-[type=literal]:text-fg-tertiary",
  "data-[focused]:bg-accent-600 data-[focused]:text-on-action data-[focused]:data-[placeholder]:text-on-action",
  "data-[disabled]:text-field-fg-disabled",
);
