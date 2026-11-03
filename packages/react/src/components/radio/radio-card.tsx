"use client";
// Adapted from BoardUI (MIT) — components/base/radio/radio-card.tsx. See THIRD_PARTY_NOTICES.md.

import type { ReactNode, Ref } from "react";
import { Radio as AriaRadio } from "react-aria-components";
import type { RadioProps as AriaRadioProps } from "react-aria-components";
import { cx } from "../../utils/cx";
import { RadioDot } from "./radio";

/**
 * Selectable radio card, the radio flavour of CheckboxCard: title and
 * optional description on the left, the radio dot on the right.
 *
 * Card chrome (shared by CheckboxCard, RadioCard and SwitchCard):
 *   card    rounded-surface, 1px line border, pl 16 pr 20 py 12
 *   hover   surface-hover fill
 *   chosen  border takes the accent, matching the mark inside
 *   title   text-body-md-strong, fg; description text-body-md, fg-secondary
 *
 * The whole card selects the radio (react-aria Radio renders the label).
 * Must live inside a `RadioGroup`, which provides single-selection and
 * arrow-key navigation across cards.
 */

export interface RadioCardProps extends Omit<AriaRadioProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  ref?: Ref<HTMLLabelElement>;
}

export function RadioCard({ className, title, description, ref, ...props }: RadioCardProps) {
  return (
    <AriaRadio
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group flex w-full items-center justify-between gap-3 rounded-surface border py-3 pe-5 ps-4 select-none",
          state.isSelected ? "border-accent-600" : "border-line",
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
            <RadioDot size="md" selected={state.isSelected} focusVisible={state.isFocusVisible} hovered={state.isHovered && !state.isDisabled} />
          </span>
        </>
      )}
    </AriaRadio>
  );
}
