// Adapted from BoardUI (MIT) — components/base/dropdown/menu-styles.ts. See THIRD_PARTY_NOTICES.md.

/**
 * Shared visual recipe for menu surfaces. Select (listbox) and a future
 * Menu (actions) keep different React Aria semantics but import their panel,
 * motion and row styles from here, so they can't drift apart.
 */
export const MENU_POPOVER_SURFACE = [
  "max-w-[calc(100vw-32px)] overflow-y-auto",
  "rounded-overlay border border-line bg-surface p-2.5 shadow-overlay",
  "transition duration-(--ds-motion-duration-base) ease-out",
  "data-[entering]:scale-95 data-[entering]:opacity-0 data-[entering]:blur-enter",
  "data-[exiting]:scale-95 data-[exiting]:opacity-0 data-[exiting]:blur-enter",
  "data-[placement=bottom]:origin-top-left rtl:data-[placement=bottom]:origin-top-right",
  "data-[placement=top]:origin-bottom-left rtl:data-[placement=top]:origin-bottom-right",
  "data-[placement=left]:origin-right data-[placement=right]:origin-left",
].join(" ");

/** 266px, shared by every menu surface. */
export const MENU_POPOVER_WIDTH = "w-66.5";

export const MENU_ITEMS_CONTAINER = "flex w-full flex-col gap-1 outline-none";

export const MENU_ITEM = [
  "flex w-full cursor-pointer items-center gap-2 rounded-control-md p-2 text-start",
  "text-fg outline-none transition-colors",
].join(" ");

export const MENU_ITEM_ACTIVE = "bg-surface-hover";
