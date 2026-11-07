"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  Header,
  Keyboard,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  Separator,
} from "react-aria-components";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { GlassMaterial } from "./liquid-glass";

/**
 * Morph menu: a glass button that turns into its own menu. The panel opens over
 * the button and grows out of its shape, so the eye follows the action straight
 * into the choices, then shrinks back into the button when it closes.
 *
 * The behaviour is a React Aria Menu, so the keyboard model, typeahead and
 * focus handling are all standard. With reduced motion it simply appears.
 *
 * It opens when the press ends rather than when it starts, unlike a standard
 * menu trigger: the panel lands right under the pointer, so opening on press
 * would let the release choose whichever item appeared there.
 */

export interface MorphMenuItem {
  id: string;
  label: string;
  icon?: IconComponent;
  /** Shown at the end of the row, e.g. ⌘D. */
  shortcut?: string;
  isDestructive?: boolean;
  isDisabled?: boolean;
}

export interface MorphMenuSection {
  id: string;
  label?: string;
  items: MorphMenuItem[];
}

export interface MorphMenuProps {
  /** Names the button for assistive tech. */
  "aria-label": string;
  /** The button's face. */
  children: ReactNode;
  sections: MorphMenuSection[];
  onAction?: (id: string) => void;
  /** Which edge of the button the menu stays attached to. */
  align?: "start" | "end";
  /** Add `className` to the button. */
  className?: string;
  /** Add `className` to the panel. */
  menuClassName?: string;
}

const ITEM = cx(
  "flex h-11 cursor-pointer items-center gap-3 rounded-item px-3 text-body-md outline-none transition-colors",
  "data-[focus-visible]:bg-glass-lens data-[hovered]:bg-glass-lens data-[pressed]:bg-glass-lens data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
);

export function MorphMenu({ "aria-label": ariaLabel, children, sections, onAction, align = "start", className, menuClassName }: MorphMenuProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const height = trigger.current?.offsetHeight ?? 44;

  return (
    <>
      <AriaButton
        ref={trigger}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onPress={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") setOpen(true);
          else event.continuePropagation();
        }}
        className={cx(
          "glass-rim relative isolate flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-body-md-strong text-fg transition-[scale,opacity] duration-(--ds-motion-duration-base) data-[pressed]:scale-95 motion-reduce:transition-none",
          open && "opacity-0",
          focusRing,
          className,
        )}
      >
        <GlassMaterial refract />
        {children}
      </AriaButton>
      <Popover
        triggerRef={trigger}
        isOpen={open}
        onOpenChange={setOpen}
        placement={align === "end" ? "bottom end" : "bottom start"}
        offset={-height}
        data-align={align}
        style={{ "--morph-height": `${height}px`, "--morph-radius": `${height / 2}px` } as React.CSSProperties}
        className={cx("glass morph-menu min-w-60 overflow-hidden rounded-overlay p-1.5", menuClassName)}
      >
        <Menu
          aria-label={ariaLabel}
          autoFocus="first"
          onAction={(key) => onAction?.(String(key))}
          onClose={() => setOpen(false)}
          className="flex max-h-96 flex-col overflow-auto outline-none"
        >
          {sections.map((section, index) => (
            <MenuSection key={section.id} id={section.id}>
              {index > 0 && <Separator className="mx-3 my-1 border-t border-line" />}
              {section.label && <Header className="px-3 py-1 text-caption text-fg-secondary">{section.label}</Header>}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <MenuItem key={item.id} id={item.id} textValue={item.label} isDisabled={item.isDisabled} className={cx(ITEM, item.isDestructive ? "text-fg-danger" : "text-fg")}>
                    {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.shortcut && <Keyboard className="shrink-0 text-body-sm text-fg-secondary">{item.shortcut}</Keyboard>}
                  </MenuItem>
                );
              })}
            </MenuSection>
          ))}
        </Menu>
      </Popover>
    </>
  );
}
