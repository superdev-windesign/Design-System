// The non-modal popover handling was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.
import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import {
  Autocomplete,
  Button as AriaButton,
  Group,
  Input,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  SearchField,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
} from "react-aria-components";
import { useFilter } from "react-aria";
import { RiSearchLine } from "@remixicon/react";
import type {
  ListBoxItemProps as AriaListBoxItemProps,
  SelectProps as AriaSelectProps,
  SelectValueRenderProps as AriaSelectValueRenderProps,
} from "react-aria-components";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import { FIELD_INPUT, FIELD_RULE, fieldShell } from "../../recipes/field";
import {
  MENU_ITEM,
  MENU_ITEM_ACTIVE,
  MENU_ITEM_CHOSEN,
  MENU_ITEMS_CONTAINER,
  MENU_POPOVER_SURFACE,
  MENU_POPOVER_WIDTH,
} from "../../recipes/menu";
import { cx } from "../../utils/cx";
import { useDismissOnOutsidePress, useTriggerToggle } from "../../utils/use-dismiss-on-outside-press";

/**
 * Select, set as a ledger field like Input:
 *
 *   trigger  the field outline (no shadow), px 10, body-md value text, a 16px
 *            chevron that turns while open; open draws the same pen rule
 *            along the bottom edge that a focused field does
 *   popover  shared menu recipe (recipes/menu.ts)
 *   option   the focused row takes the hover surface; the chosen row carries
 *            a short accent rule in its margin and the strong weight
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
  /**
   * Put a search field at the top of the list that filters the options as
   * you type (by each option's `textValue`). Worth it past a dozen options.
   */
  isSearchable?: boolean;
  /** Placeholder for the search field. Default "Search". */
  searchPlaceholder?: string;
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
  isSearchable = false,
  searchPlaceholder = "Search",
  ref,
  ...props
}: SelectProps<T>) {
  const { contains } = useFilter({ sensitivity: "base" });
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
              "relative flex w-full cursor-pointer items-center justify-between rounded-control-md",
              "border border-line-control bg-surface text-fg",
              "transition-[background-color,border-color,padding,font-size] duration-(--ds-motion-duration-moderate)",
              "data-[hovered]:border-line-control-hover",
              FIELD_RULE,
              isOpen && "border-focus after:scale-x-100",
              focusRing,
              "data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-disabled data-[disabled]:text-fg-tertiary",
              size === "sm" ? "gap-1 px-1.75 py-1 text-body-sm" : "gap-1.5 px-2.5 py-2 text-body-md",
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
            {isSearchable ? (
              <Autocomplete filter={contains}>
                <SearchField aria-label={searchPlaceholder} autoFocus className="mb-1.5">
                  <Group className={(state) => fieldShell(state, "sm")}>
                    <RiSearchLine aria-hidden className="size-4 shrink-0" />
                    <Input placeholder={searchPlaceholder} className={cx(FIELD_INPUT, "text-body-sm [&::-webkit-search-cancel-button]:hidden")} />
                  </Group>
                </SearchField>
                <AriaListBox
                  items={items}
                  renderEmptyState={() => <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">No matches</p>}
                  className={cx(MENU_ITEMS_CONTAINER, "max-h-60 overflow-auto")}
                >
                  <SelectSizeContext.Provider value={size}>{children}</SelectSizeContext.Provider>
                </AriaListBox>
              </Autocomplete>
            ) : (
              <AriaListBox items={items} className={cx(MENU_ITEMS_CONTAINER, "max-h-60 overflow-auto")}>
                <SelectSizeContext.Provider value={size}>{children}</SelectSizeContext.Provider>
              </AriaListBox>
            )}
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
          size === "sm" && "px-2 py-1.5",
          state.isSelected
            ? size === "sm" ? "text-body-sm-strong" : "text-body-md-strong"
            : size === "sm" ? "text-body-sm" : "text-body-md",
          state.isFocused && MENU_ITEM_ACTIVE,
          // The chosen option: a short accent rule in the row's margin.
          state.isSelected && MENU_ITEM_CHOSEN,
          state.isDisabled && "cursor-not-allowed text-fg-disabled",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaListBoxItem>
  );
}
