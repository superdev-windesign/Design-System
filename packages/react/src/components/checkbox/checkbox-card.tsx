"use client";
// The card structure was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.

import type { ReactNode, Ref } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import type { CheckboxProps as AriaCheckboxProps } from "react-aria-components";
import { cx } from "../../utils/cx";
import { CheckboxGlyph } from "./checkbox-glyph";

/**
 * Selectable card: title + description on the left, checkbox on the right.
 *
 * Card chrome (shared by CheckboxCard, RadioCard and SwitchCard):
 *   card    rounded-surface, 1px line border, pl 16 pr 20 py 12
 *   hover   surface-hover fill
 *   checked border takes the accent, matching the mark inside
 *   title   text-body-md-strong, fg; description text-body-md, fg-secondary
 *
 * The whole card toggles the checkbox (react-aria Checkbox renders the label),
 * so a click anywhere flips the state.
 */

export interface CheckboxCardProps extends Omit<AriaCheckboxProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  ref?: Ref<HTMLLabelElement>;
}

export function CheckboxCard({
  className,
  title,
  description,
  ref,
  ...props
}: CheckboxCardProps) {
  return (
    <AriaCheckbox
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group flex w-full items-center justify-between gap-3 rounded-surface border py-3 pe-5 ps-4 select-none",
          state.isSelected || state.isIndeterminate ? "border-accent-600" : "border-line",
          "transition-colors duration-150 ease",
          state.isHovered && !state.isDisabled
            ? "bg-surface-hover"
            : "bg-surface",
          state.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(state) => (
        <>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-body-md-strong text-fg">{title}</span>
            {description !== undefined && description !== null && (
              <span className="truncate text-body-md text-fg-secondary">{description}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center py-1">
            <CheckboxGlyph state={state} />
          </span>
        </>
      )}
    </AriaCheckbox>
  );
}
