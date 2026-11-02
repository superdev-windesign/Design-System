"use client";

import { Children, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { MenuTrigger } from "react-aria-components";
import { mergeProps, usePress } from "react-aria";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { MenubarMenuContext } from "./menu";

/**
 * Menubar: the row of menus along the top of an application window (File,
 * Edit, View). One tab stop for the whole bar; ← / → move along it, ↓, Enter
 * or Space open a menu, and once one is open, ← / → or hovering another
 * title switches menus.
 *
 * ```tsx
 * <Menubar aria-label="Editor">
 *   <MenubarMenu label="File">
 *     <Menu onAction={run}>…</Menu>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 */

interface MenubarContextValue {
  openIndex: number | null;
  focusIndex: number;
  openedBy: "keyboard" | "pointer";
  setOpen: (index: number | null, by?: "keyboard" | "pointer") => void;
  setFocusIndex: (index: number) => void;
  move: (from: number, direction: 1 | -1) => void;
  triggers: RefObject<(HTMLButtonElement | null)[]>;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);
const MenubarIndexContext = createContext(0);

export interface MenubarProps {
  "aria-label": string;
  children: ReactNode;
  className?: string;
}

export function Menubar({ children, className, "aria-label": ariaLabel }: MenubarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openedBy, setOpenedBy] = useState<"keyboard" | "pointer">("pointer");
  const [focusIndex, setFocusIndex] = useState(0);
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;

  const value = useMemo<MenubarContextValue>(
    () => ({
      openIndex,
      focusIndex,
      openedBy,
      setOpen: (index, by = "pointer") => {
        setOpenedBy(by);
        setOpenIndex(index);
        if (index !== null) setFocusIndex(index);
      },
      setFocusIndex,
      move: (from, direction) => {
        const next = (from + direction + count) % count;
        setFocusIndex(next);
        if (openIndex !== null) {
          setOpenedBy("keyboard");
          setOpenIndex(next);
        } else triggers.current[next]?.focus();
      },
      triggers,
    }),
    [openIndex, focusIndex, openedBy, count],
  );

  // The menus are non-modal (so hovering the bar can switch them); close on a press outside.
  useEffect(() => {
    if (openIndex === null) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (ref.current?.contains(target) || target.closest?.("[data-ds-menu-popover]")) return;
      setOpenIndex(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [openIndex]);

  return (
    <MenubarContext.Provider value={value}>
      <div ref={ref} role="menubar" aria-label={ariaLabel} className={cx("flex items-center gap-0.5 rounded-surface border border-line bg-surface p-1", className)}>
        {items.map((child, index) => (
          <MenubarIndexContext.Provider key={child.key ?? index} value={index}>
            {child}
          </MenubarIndexContext.Provider>
        ))}
      </div>
    </MenubarContext.Provider>
  );
}

export interface MenubarMenuProps {
  /** The title in the bar. */
  label: ReactNode;
  /** A Menu. */
  children: ReactNode;
  isDisabled?: boolean;
}

export function MenubarMenu({ label, children, isDisabled }: MenubarMenuProps) {
  const bar = useContext(MenubarContext);
  const index = useContext(MenubarIndexContext);
  if (!bar) throw new Error("MenubarMenu must be inside a Menubar");
  const isOpen = bar.openIndex === index;

  return (
    <MenuTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (open) bar.setOpen(index, "pointer");
        else if (bar.openIndex === index) bar.setOpen(null);
      }}
    >
      <MenubarTrigger index={index} isDisabled={isDisabled}>
        {label}
      </MenubarTrigger>
      <MenubarMenuContext.Provider value={{ onNavigate: (direction) => bar.move(index, direction), autoFocusFirst: bar.openedBy === "keyboard" }}>
        {children}
      </MenubarMenuContext.Provider>
    </MenuTrigger>
  );
}

function MenubarTrigger({ index, isDisabled, children }: { index: number; isDisabled?: boolean; children: ReactNode }) {
  const bar = useContext(MenubarContext)!;
  const ref = useRef<HTMLButtonElement>(null);
  // usePress receives the MenuTrigger's press, keyboard and ARIA props.
  const { pressProps, isPressed } = usePress({ ref, isDisabled });
  const isOpen = bar.openIndex === index;

  useEffect(() => {
    bar.triggers.current[index] = ref.current;
  });

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      disabled={isDisabled}
      tabIndex={bar.focusIndex === index ? 0 : -1}
      {...mergeProps(pressProps, {
        onFocus: () => bar.setFocusIndex(index),
        onPointerEnter: () => {
          if (bar.openIndex !== null && bar.openIndex !== index) bar.setOpen(index, "pointer");
        },
        onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
          event.preventDefault();
          bar.move(index, (event.key === "ArrowRight") !== rtl ? 1 : -1);
        },
      })}
      data-open={isOpen || undefined}
      className={cx(
        "flex h-control-sm cursor-pointer items-center rounded-control-sm px-2.5 text-body-md-strong text-fg",
        "transition-colors duration-(--ds-motion-duration-fast) hover:bg-surface-hover",
        (isOpen || isPressed) && "bg-surface-pressed",
        "disabled:cursor-not-allowed disabled:text-fg-disabled",
        focusRingNative,
      )}
    >
      {children}
    </button>
  );
}
