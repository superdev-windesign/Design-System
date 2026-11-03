"use client";
// The card structure was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.

import type { ComponentType, ReactNode, Ref } from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx } from "../../utils/cx";
import { SwitchTrack } from "./switch";
import type { SwitchShape, SwitchSize } from "./switch";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/**
 * Selectable settings card: title + description on the left, Switch on the
 * right. The whole card toggles (react-aria Switch renders the label), so a
 * click anywhere flips the state — the switch counterpart to CheckboxCard.
 *
 * Card chrome (shared by CheckboxCard, RadioCard and SwitchCard):
 *   card    rounded-surface, 1px line border, pl 16 pr 20 py 12
 *   hover   surface-hover fill
 *   on      border takes the accent, matching the mark inside
 *   title   text-body-md-strong, fg; description text-body-md, fg-secondary
 */

export interface SwitchCardProps extends Omit<AriaSwitchProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  /** Optional 24×24 leading icon — pass a Remix Icon component (`RiMailLine`, not `<RiMailLine />`). */
  icon?: IconComponent;
  size?: SwitchSize;
  shape?: SwitchShape;
  ref?: Ref<HTMLLabelElement>;
}

export function SwitchCard({
  className,
  title,
  description,
  icon: Icon,
  size = "md",
  shape = "pill",
  ref,
  ...props
}: SwitchCardProps) {
  return (
    <AriaSwitch
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
          <span className="flex min-w-0 items-center gap-3">
            {Icon && <Icon className="size-6 shrink-0 text-icon-secondary" aria-hidden />}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-body-md-strong text-fg">{title}</span>
              {description !== undefined && description !== null && (
                <span className="truncate text-body-md text-fg-secondary">{description}</span>
              )}
            </span>
          </span>
          <span className="flex shrink-0 items-center">
            <SwitchTrack state={state} size={size} shape={shape} />
          </span>
        </>
      )}
    </AriaSwitch>
  );
}
