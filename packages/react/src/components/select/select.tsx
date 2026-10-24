// Adapted from BoardUI (MIT) — components/base/select/select.tsx. See THIRD_PARTY_NOTICES.md.
import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
} from "react-aria-components";
import type {
  ListBoxItemProps as AriaListBoxItemProps,
  SelectProps as AriaSelectProps,
  SelectValueRenderProps as AriaSelectValueRenderProps,
} from "react-aria-components";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import {
  MENU_ITEM,
  MENU_ITEM_ACTIVE,
  MENU_ITEMS_CONTAINER,
  MENU_POPOVER_SURFACE,
  MENU_POPOVER_WIDTH,
} from "../../recipes/menu";
import { cx } from "../../utils/cx";
import { useDismissOnOutsidePress, useTriggerToggle } from "../../utils/use-dismiss-on-outside-press";

/**
 * Visual parity with BoardUI's Select (Figma nodes 3731:3208 / 3731:3264).
 *
 *   trigger  surface + 1px border + raised shadow, px 10 py 8, radius 10, gap 6,
 *            body-md-strong text, 16px chevron in text.secondary (rotates when open)
 *   popover  shared menu recipe: radius 16 panel, p 8, overlay shadow,
 *            150ms fade/scale/blur, radius 10 rows with the hover surface
 *
 * The popover is `isNonModal` (as in BoardUI): React Aria's modal scroll lock
 * sets `overflow: hidden` on <html>, which jumps sticky layouts. Non-modal
 * also turns off outside-press dismissal, so open state is controlled here
 * and dismissal is restored with `useDismissOnOutsidePress`.
 *
 * Item content is free-form (status dots, avatars). Always pass `textValue`
 * so typeahead and the trigger label stay correct.
 */

export type SelectSize = "sm" | "md";

const SelectSizeContext = createContext<SelectSize>("md");

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, "children"> {
  /** Width of the whole control. The menu always uses the shared 266px width. */
  className?: string;
  triggerClassName?: string;
  /** Classes for the open popover (e.g. to constrain its width). */
  popoverClassName?: string;
  /** `md` (default) or `sm` for dense contexts such as compact tables. */
  size?: SelectSize;
  children: ReactNode;
  items?: Iterable<T>;
  /** Custom trigger content. Falls back to the selected item's own content. */
  renderValue?: ReactNode | ((values: AriaSelectValueRenderProps<T>) => ReactNode);
  ref?: Ref<HTMLDivElement>;
}

export function Select<T extends object>({
  className,
  triggerClassName,
  popoverClassName,
  size = "md",
  children,
  items,
  renderValue,
  ref,
  ...props
}: SelectProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);
  // Pressing the trigger while open closes the popover instead of reopening it.
  const allowOpenChange = useTriggerToggle(isOpen, triggerRef);

  return (
    <AriaSelect
      ref={ref}
      {...props}
      isOpen={isOpen}
      onOpenChange={(open) => allowOpenChange(open) && setIsOpen(open)}
      className={cx("group flex flex-col", className)}
    >
      {({ isOpen }) => (
        <>
          <AriaButton
            ref={triggerRef}
            className={cx(
              "flex w-full cursor-pointer items-center justify-between rounded-control-md",
              "border border-line bg-surface text-fg shadow-raised",
              "transition-[background-color,border-color,box-shadow,padding,font-size] duration-(--ds-motion-duration-moderate)",
              "data-[hovered]:border-line-hover data-[hovered]:bg-surface-hover",
              focusRing,
              "data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-disabled data-[disabled]:text-fg-tertiary data-[disabled]:shadow-none",
              size === "sm" ? "gap-1 px-1.75 py-1 text-body-sm-strong" : "gap-1.5 px-2.5 py-2 text-body-md-strong",
              triggerClassName,
            )}
          >
            <AriaSelectValue
              className={cx("flex min-w-0 items-center truncate", size === "sm" ? "gap-1" : "gap-1.25")}
            >
              {renderValue as never /* React Aria accepts a node or a render prop */}
            </AriaSelectValue>
            <ChevronDownSmall
              className={cx(
                "shrink-0 text-fg-secondary transition-transform duration-(--ds-motion-duration-moderate)",
                size === "sm" ? "size-3.5" : "size-4",
                isOpen && "rotate-180",
              )}
            />
          </AriaButton>
          <AriaPopover
            ref={popoverRef}
            isNonModal
            offset={4}
            className={cx(
              MENU_POPOVER_WIDTH,
              MENU_POPOVER_SURFACE,
              // Listbox rows already sit 4px apart, so this surface is a touch tighter than a menu's.
              "p-2",
              popoverClassName,
            )}
          >
            <AriaListBox items={items} className={cx(MENU_ITEMS_CONTAINER, "max-h-60 overflow-auto")}>
              <SelectSizeContext.Provider value={size}>{children}</SelectSizeContext.Provider>
            </AriaListBox>
          </AriaPopover>
        </>
      )}
    </AriaSelect>
  );
}

export interface SelectItemProps extends Omit<AriaListBoxItemProps, "children"> {
  children?: ReactNode;
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  const size = useContext(SelectSizeContext);
  return (
    <AriaListBoxItem
      {...props}
      className={(state) =>
        cx(
          MENU_ITEM,
          size === "sm" ? "px-2 py-1.5 text-body-sm-strong" : "text-body-md-strong",
          (state.isFocused || state.isSelected) && MENU_ITEM_ACTIVE,
          state.isDisabled && "cursor-not-allowed text-fg-disabled",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaListBoxItem>
  );
}
