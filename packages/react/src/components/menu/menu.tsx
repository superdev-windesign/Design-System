"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  Header,
  Keyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger,
  Popover as AriaPopover,
  Separator,
  SubmenuTrigger,
  Text,
} from "react-aria-components";
import type { MenuItemProps as AriaMenuItemProps, MenuProps as AriaMenuProps, MenuSectionProps as AriaMenuSectionProps, PopoverProps } from "react-aria-components";
import { RiArrowRightSLine, RiCheckLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * Menu: a real ARIA menu of actions, with sections, separators, keyboard
 * shortcuts, nested submenus and checkable items. (Dropdown is a free-form
 * panel; reach for Menu whenever the rows are commands.)
 *
 * ```tsx
 * <MenuTrigger>
 *   <Button variant="secondary">Edit</Button>
 *   <Menu onAction={run}>
 *     <MenuItem id="undo" shortcut="⌘Z">Undo</MenuItem>
 *     <MenuSeparator />
 *     <SubmenuTrigger>
 *       <MenuItem id="share">Share</MenuItem>
 *       <Menu>…</Menu>
 *     </SubmenuTrigger>
 *   </Menu>
 * </MenuTrigger>
 * ```
 *
 * Pass `selectionMode="single" | "multiple"` and `selectedKeys` for checkable
 * items; checked rows show a terracotta tick. Arrow keys move, typing jumps
 * to a label, → opens a submenu and Escape closes one level at a time.
 */

export { MenuTrigger, SubmenuTrigger };

/** Set by Menubar so its menus stay non-modal and can hand off ← / → to the next menu. */
export interface MenubarMenuContextValue {
  onNavigate: (direction: 1 | -1) => void;
  autoFocusFirst: boolean;
}

export const MenubarMenuContext = createContext<MenubarMenuContextValue | null>(null);

export interface MenuProps<T extends object> extends Omit<AriaMenuProps<T>, "className"> {
  className?: string;
  popoverClassName?: string;
  placement?: PopoverProps["placement"];
  offset?: number;
}

export function Menu<T extends object>({ className, popoverClassName, placement, offset, autoFocus, ...props }: MenuProps<T>) {
  const menubar = useContext(MenubarMenuContext);

  return (
    <AriaPopover
      data-ds-menu-popover=""
      placement={placement}
      offset={offset}
      isNonModal={menubar ? true : undefined}
      className={cx(MENU_POPOVER_SURFACE, "min-w-52 p-1.5", popoverClassName)}
    >
      <div
        className="contents"
        onKeyDownCapture={
          menubar
            ? (event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                // Events from a submenu bubble here through React's tree; only this menu's own rows hand off.
                const target = event.target as HTMLElement;
                if (!event.currentTarget.contains(target)) return;
                // → on a submenu trigger opens the submenu, not the next menu.
                if (event.key === "ArrowRight" && target.getAttribute("aria-haspopup")) return;
                const rtl = getComputedStyle(target).direction === "rtl";
                const forward = event.key === "ArrowRight" ? !rtl : rtl;
                event.preventDefault();
                event.stopPropagation();
                menubar.onNavigate(forward ? 1 : -1);
              }
            : undefined
        }
      >
        {/* Submenus are popovers of their own and don't hand off to the bar. */}
        <MenubarMenuContext.Provider value={null}>
          <AriaMenu {...props} autoFocus={autoFocus ?? (menubar?.autoFocusFirst ? "first" : undefined)} className={cx(MENU_ITEMS_CONTAINER, "gap-0.5", className)} />
        </MenubarMenuContext.Provider>
      </div>
    </AriaPopover>
  );
}

export interface MenuItemProps<T extends object = object> extends Omit<AriaMenuItemProps<T>, "children"> {
  children: ReactNode;
  icon?: IconComponent;
  /** A second line in secondary text. */
  description?: ReactNode;
  /** A keyboard shortcut shown at the end, e.g. "⌘D". Display only; wire the keys yourself. */
  shortcut?: string;
  /** Destructive actions read in the danger colour. */
  variant?: "default" | "danger";
}

export function MenuItem<T extends object = object>({ children, icon: Icon, description, shortcut, variant = "default", className, textValue, ...props }: MenuItemProps<T>) {
  return (
    <AriaMenuItem
      {...props}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      className={(state) =>
        cx(
          "group flex w-full cursor-pointer items-start gap-2 rounded-control-md px-2 py-1.75 text-start text-body-md-strong outline-none",
          "transition-colors duration-(--ds-motion-duration-fast)",
          variant === "danger" ? "text-fg-danger" : "text-fg",
          state.isFocused && (variant === "danger" ? "bg-danger-subtle" : "bg-surface-hover"),
          state.isOpen && "bg-surface-hover",
          state.isPressed && variant !== "danger" && "bg-surface-pressed",
          state.isDisabled && "cursor-not-allowed text-fg-disabled",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ selectionMode, isSelected, hasSubmenu }) => (
        <>
          {selectionMode !== "none" && (
            <span aria-hidden className="flex h-5 w-4 shrink-0 items-center justify-center text-accent-600">
              {isSelected && <RiCheckLine className="size-4" />}
            </span>
          )}
          {Icon && <Icon aria-hidden className={cx("mt-0.5 size-4 shrink-0", variant === "danger" ? "text-icon-danger" : "text-icon-secondary group-data-[focused]:text-fg")} />}
          <span className="flex min-w-0 flex-1 flex-col">
            <Text slot="label" className="truncate">
              {children}
            </Text>
            {description && (
              <Text slot="description" className="text-body-sm text-fg-secondary">
                {description}
              </Text>
            )}
          </span>
          {shortcut && <Keyboard className="ms-4 shrink-0 self-center font-mono text-caption tracking-wide text-fg-secondary">{shortcut}</Keyboard>}
          {hasSubmenu && <RiArrowRightSLine aria-hidden className="size-4 shrink-0 self-center text-icon-secondary rtl:rotate-180" />}
        </>
      )}
    </AriaMenuItem>
  );
}

export interface MenuSectionProps<T extends object> extends Omit<AriaMenuSectionProps<T>, "className" | "children"> {
  children: ReactNode;
  /** A small mono heading over the section. Without it, pass `aria-label`. */
  title?: ReactNode;
  className?: string;
}

export function MenuSection<T extends object>({ title, className, children, ...props }: MenuSectionProps<T>) {
  return (
    <AriaMenuSection {...props} className={cx("flex flex-col gap-0.5", className)}>
      {title && <Header className="px-2 pt-2 pb-1 font-mono text-caption tracking-wide text-fg-secondary uppercase">{title}</Header>}
      {children}
    </AriaMenuSection>
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return <Separator className={cx("mx-1 my-1 h-px border-0 bg-line", className)} />;
}
