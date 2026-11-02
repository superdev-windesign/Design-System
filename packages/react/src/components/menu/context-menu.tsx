"use client";

import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { MenuTrigger } from "react-aria-components";
import type { MenuTriggerProps } from "react-aria-components";
import { mergeProps, usePress } from "react-aria";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * ContextMenu: a Menu that opens where the pointer right-clicks (or on a long
 * press on touch screens, Shift+F10 or the Menu key) inside an area.
 *
 * ```tsx
 * <ContextMenu>
 *   <ContextMenuArea aria-label="Quarterly report.pdf">…</ContextMenuArea>
 *   <Menu onAction={run}>…</Menu>
 * </ContextMenu>
 * ```
 *
 * The area is focusable so keyboard users can reach the menu. A context menu
 * is never the only way to an action: offer the same commands elsewhere (a
 * row's "More" button, a toolbar).
 */

export interface ContextMenuProps extends Omit<MenuTriggerProps, "trigger"> {
  children: ReactNode;
}

export function ContextMenu(props: ContextMenuProps) {
  return <MenuTrigger {...props} trigger="contextMenu" />;
}

export interface ContextMenuAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ContextMenuArea({ className, children, role = "group", ...props }: ContextMenuAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  // usePress picks up the MenuTrigger's context-menu handlers.
  const { pressProps } = usePress({ ref });
  return (
    <div ref={ref} role={role} tabIndex={0} {...mergeProps(pressProps, props)} className={cx("select-none", focusRingNative, className)}>
      {children}
    </div>
  );
}
