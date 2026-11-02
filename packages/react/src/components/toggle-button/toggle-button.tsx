"use client";

import type { ReactNode } from "react";
import { ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, composeRenderProps } from "react-aria-components";
import type { ToggleButtonGroupProps as AriaToggleButtonGroupProps, ToggleButtonProps as AriaToggleButtonProps } from "react-aria-components";
import type { IconComponent } from "../button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * ToggleButton: a button that stays pressed (bold, italic, "pin", "mute").
 * Screen readers hear it as a pressed / not pressed toggle.
 *
 * ToggleButtonGroup joins several into one control. With
 * `selectionMode="single"` it behaves like a segmented choice (text
 * alignment); with `"multiple"`, each toggles on its own (bold, italic,
 * underline). Arrow keys move between the buttons.
 */

export type ToggleButtonSize = "md" | "sm";

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, "children" | "className"> {
  icon?: IconComponent;
  children?: ReactNode;
  size?: ToggleButtonSize;
  className?: string;
}

const SIZE: Record<ToggleButtonSize, { box: string; icon: string; square: string }> = {
  md: { box: "h-control-md gap-1.5 px-2.5 text-body-md-strong", icon: "size-icon-md", square: "w-control-md px-0" },
  sm: { box: "h-control-sm gap-1 px-2 text-body-sm-strong", icon: "size-icon-sm", square: "w-control-sm px-0" },
};

export function ToggleButton({ icon: Icon, children, size = "md", className, ...props }: ToggleButtonProps) {
  const s = SIZE[size];
  const iconOnly = Icon && children == null;
  return (
    <AriaToggleButton
      {...props}
      className={composeRenderProps(className, (className) =>
        cx(
          "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control-md text-fg-secondary select-none",
          "transition-[background-color,color,box-shadow] duration-(--ds-motion-duration-base)",
          "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-pressed",
          "data-[selected]:bg-muted data-[selected]:text-fg data-[selected]:ring-1 data-[selected]:ring-line-control data-[selected]:ring-inset",
          "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled data-[disabled]:data-[selected]:bg-surface-disabled",
          s.box,
          iconOnly && s.square,
          focusRing,
          className,
        ),
      )}
    >
      {Icon && <Icon aria-hidden className={cx("shrink-0", s.icon)} />}
      {children}
    </AriaToggleButton>
  );
}

export interface ToggleButtonGroupProps extends Omit<AriaToggleButtonGroupProps, "className"> {
  className?: string;
}

export function ToggleButtonGroup({ className, ...props }: ToggleButtonGroupProps) {
  return (
    <AriaToggleButtonGroup
      {...props}
      className={cx(
        "inline-flex gap-0.5 rounded-control-md border border-line-control bg-surface p-0.5",
        "data-[orientation=vertical]:flex-col",
        "[&>*]:rounded-control-sm",
        className,
      )}
    />
  );
}
