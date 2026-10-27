"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Autocomplete,
  Dialog,
  Header,
  Input,
  Keyboard,
  Menu,
  MenuItem,
  MenuSection,
  Modal,
  ModalOverlay,
  SearchField,
  Text,
  useFilter,
} from "react-aria-components";
import type { AutocompleteProps, Key, MenuItemProps } from "react-aria-components";
import { RiSearchLine } from "@remixicon/react";
import { motion, useReducedMotion } from "motion/react";
import type { IconComponent } from "../button/button";
import { Kbd } from "../kbd/kbd";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Command palette: a searchable list of actions in a modal, usually opened
 * with ⌘K / Ctrl K.
 *
 * Behavior is React Aria's Autocomplete wrapping a Menu: focus stays in the
 * search field and arrow keys move a virtual focus through the items
 * (`aria-activedescendant`), so typing and navigating never fight. The
 * highlighted row is the focus indicator; it glides between rows with
 * `layoutSpring` and snaps when reduced motion is on.
 */

interface PaletteContextValue {
  highlightId: string;
  reduceMotion: boolean;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

type Filter = NonNullable<AutocompleteProps<object>["filter"]>;

export interface CommandMenuProps {
  placeholder?: string;
  /** Accessible name for the list of commands. */
  "aria-label"?: string;
  /** Called with the item's `id` after any item is chosen. */
  onAction?: (key: Key) => void;
  /** Shown when nothing matches the query. */
  renderEmptyState?: (query: string) => ReactNode;
  /** Hide the keyboard hints row. */
  hideFooter?: boolean;
  /** Move focus into the search field on mount. */
  autoFocus?: boolean;
  /** Show Esc hints; on when the menu sits in something Esc closes. */
  showCloseHint?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * The search field and command list on their own, for embedding in a page,
 * panel or popover. `CommandPalette` puts one in a modal.
 */
export function CommandMenu({
  placeholder = "Type a command or search…",
  "aria-label": ariaLabel = "Commands",
  onAction,
  renderEmptyState,
  hideFooter = false,
  autoFocus,
  showCloseHint = false,
  children,
  className,
}: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const highlightId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const { contains } = useFilter({ sensitivity: "base" });

  // Match the label first, then any keywords the item declares.
  const filter: Filter = (textValue, inputValue, node) => {
    if (contains(textValue, inputValue)) return true;
    const keywords = (node.props as Record<string, unknown> | undefined)?.["data-keywords"];
    return typeof keywords === "string" && contains(keywords, inputValue);
  };

  return (
    <div className={cx("flex min-h-0 flex-col overflow-hidden rounded-overlay border border-line bg-surface", className)}>
      <PaletteContext.Provider value={{ highlightId, reduceMotion }}>
        <Autocomplete filter={filter} inputValue={query} onInputChange={setQuery}>
          <SearchField aria-label="Search commands" autoFocus={autoFocus} className="flex shrink-0 items-center gap-2.5 border-b border-line px-4">
            <RiSearchLine aria-hidden className="size-5 shrink-0 text-icon-secondary" />
            {/* Focus never leaves this field (items use virtual focus), so the
                caret and the highlighted row stand in for a focus ring. */}
            <Input
              placeholder={placeholder}
              className={cx(
                "h-13 min-w-0 flex-1 bg-transparent text-body-md text-fg caret-accent-500 outline-none",
                "placeholder:text-fg-placeholder [&::-webkit-search-cancel-button]:hidden",
              )}
            />
            {showCloseHint && (
              <Kbd aria-hidden className="px-1.5">
                Esc
              </Kbd>
            )}
          </SearchField>

          <motion.div layoutScroll className="min-h-0 flex-1 overflow-y-auto">
            <Menu
              aria-label={ariaLabel}
              onAction={onAction}
              renderEmptyState={() =>
                renderEmptyState ? (
                  renderEmptyState(query)
                ) : (
                  <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
                    <p className="text-body-md-strong text-fg">No results for “{query}”</p>
                    <p className="text-body-sm text-fg-secondary">Try a different word, or fewer of them.</p>
                  </div>
                )
              }
              className="flex flex-col p-2 outline-none"
            >
              {children}
            </Menu>
          </motion.div>
        </Autocomplete>
      </PaletteContext.Provider>

      {!hideFooter && (
        <div
          aria-hidden
          className="flex shrink-0 items-center gap-4 border-t border-line px-4 py-2.5 text-body-sm text-fg-secondary max-sm:hidden"
        >
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            Select
          </span>
          {showCloseHint && (
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              Close
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export interface CommandPaletteProps extends Omit<CommandMenuProps, "autoFocus" | "showCloseHint"> {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * ⌘ (Mac) or Ctrl plus this key toggles the palette from anywhere on the
   * page. Off by default so it can't clash with the host app's shortcuts.
   */
  shortcut?: string;
}

/** A `CommandMenu` in a modal. Choosing a command closes it; so do Esc and clicking outside. */
export function CommandPalette({
  isOpen,
  defaultOpen = false,
  onOpenChange,
  shortcut,
  "aria-label": ariaLabel = "Command palette",
  onAction,
  className,
  ...menuProps
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isOpen ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (isOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpen, onOpenChange],
  );

  // The shortcut listener is registered once; refs give it the latest state.
  const openRef = useRef(open);
  const setOpenRef = useRef(setOpen);
  openRef.current = open;
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== shortcut.toLowerCase() || !(event.metaKey || event.ctrlKey) || event.altKey) return;
      event.preventDefault();
      setOpenRef.current(!openRef.current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={setOpen}
      isDismissable
      className={cx(
        "fixed inset-0 z-50 flex items-start justify-center bg-scrim px-4 pt-16 sm:pt-24",
        "transition-opacity duration-(--ds-motion-duration-moderate) ease-out",
        "data-[entering]:opacity-0 data-[exiting]:opacity-0 motion-reduce:transition-none",
      )}
    >
      <Modal
        className={cx(
          "w-full max-w-xl transition duration-(--ds-motion-duration-moderate) ease-enter",
          "data-[entering]:scale-96 data-[entering]:opacity-0 data-[entering]:blur-enter",
          "data-[exiting]:scale-98 data-[exiting]:opacity-0",
          "motion-reduce:transition-none",
        )}
      >
        <Dialog aria-label={ariaLabel}>
          <CommandMenu
            {...menuProps}
            autoFocus
            showCloseHint
            aria-label={ariaLabel}
            onAction={(key) => {
              onAction?.(key);
              setOpen(false);
            }}
            className={cx("max-h-[calc(100dvh-8rem)] shadow-overlay", className)}
          />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export interface CommandGroupProps {
  title: string;
  children: ReactNode;
}

/** A titled section of commands. Hidden automatically when none of its items match. */
export function CommandGroup({ title, children }: CommandGroupProps) {
  return (
    <MenuSection className="flex flex-col gap-0.5 not-first:mt-2">
      <Header className="px-3 pt-2 pb-1 text-caption-strong text-fg-secondary">{title}</Header>
      {children}
    </MenuSection>
  );
}

export interface CommandItemProps extends Omit<MenuItemProps, "children" | "className" | "textValue"> {
  icon?: IconComponent;
  description?: ReactNode;
  /** Keys shown on the right, e.g. `["⌘", "N"]`. Display only; wire the shortcut yourself. */
  shortcut?: string[];
  /** Extra words that should match this item, e.g. synonyms. */
  keywords?: string[];
  /** Plain-text label for filtering. Required when `children` isn't a string. */
  textValue?: string;
  children: ReactNode;
  className?: string;
}

export function CommandItem({
  icon: Icon,
  description,
  shortcut,
  keywords,
  textValue,
  children,
  className,
  ...props
}: CommandItemProps) {
  const palette = useContext(PaletteContext);
  return (
    <MenuItem
      {...props}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      data-keywords={keywords?.join(" ")}
      className={cx(
        "relative isolate flex min-h-11 cursor-pointer items-center gap-3 rounded-control-md px-3 py-1.5 text-start text-body-md text-fg outline-none",
        "data-[disabled]:cursor-default data-[disabled]:text-fg-disabled",
        className,
      )}
    >
      {({ isFocused }) => (
        <>
          {isFocused && (
            <motion.span
              aria-hidden
              layoutId={palette ? `${palette.highlightId}-highlight` : undefined}
              transition={palette?.reduceMotion ? { duration: 0 } : layoutSpring}
              className="absolute inset-0 -z-10 rounded-control-md bg-muted"
            />
          )}
          {Icon && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-control-sm border border-line bg-surface shadow-hairline">
              <Icon aria-hidden className="size-4 text-icon-secondary" />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <Text slot="label" className="truncate">
              {children}
            </Text>
            {description && (
              <Text slot="description" className="truncate text-body-sm text-fg-secondary">
                {description}
              </Text>
            )}
          </span>
          {shortcut && (
            <Keyboard className="flex shrink-0 items-center gap-1">
              {shortcut.map((key) => (
                <Kbd key={key} className="min-w-5">
                  {key}
                </Kbd>
              ))}
            </Keyboard>
          )}
        </>
      )}
    </MenuItem>
  );
}
