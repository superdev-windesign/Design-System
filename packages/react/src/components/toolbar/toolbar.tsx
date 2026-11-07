"use client";

import { Group, Separator, Toolbar as AriaToolbar } from "react-aria-components";
import type { GroupProps, ToolbarProps as AriaToolbarProps } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Toolbar: a strip of related controls (formatting, view switches, zoom)
 * that is one tab stop; arrow keys move between the controls inside. Fill it
 * with ToggleButton, ToggleButtonGroup, Button and MenuTrigger, split into
 * ToolbarGroups with ToolbarSeparators between them.
 *
 * Give it an `aria-label` ("Text formatting") so it's announced by purpose.
 */

export interface ToolbarProps extends Omit<AriaToolbarProps, "className"> {
  className?: string;
}

export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <AriaToolbar
      {...props}
      className={cx(
        "bui-toolbar flex flex-wrap items-center gap-1 rounded-surface border border-line bg-surface p-1 shadow-raised",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
    />
  );
}

export interface ToolbarGroupProps extends Omit<GroupProps, "className"> {
  className?: string;
}

/** A labelled cluster of controls inside a Toolbar. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <Group {...props} className={cx("flex items-center gap-0.5", className)} />;
}

export function ToolbarSeparator({ orientation = "vertical", className }: { orientation?: "vertical" | "horizontal"; className?: string }) {
  return (
    <Separator
      orientation={orientation}
      className={cx("shrink-0 border-0 bg-line", orientation === "vertical" ? "mx-1 h-5 w-px" : "my-1 h-px w-full", className)}
    />
  );
}
