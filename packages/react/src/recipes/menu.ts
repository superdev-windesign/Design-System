// The shared-recipe split was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.

/**
 * Shared visual recipe for menu surfaces: Select, Dropdown, Menu, ComboBox
 * and the other popover lists keep their own React Aria semantics but import
 * their panel, motion and row styles from here, so they can't drift apart.
 *
 * The panel lifts off the page (the overlay shadow) and slides a few pixels
 * out from its trigger's side as it fades in. Rows have crisp 4px corners;
 * the row under the pointer or keyboard takes the hover surface, and the
 * chosen row carries a short accent rule in its margin.
 */
export const MENU_POPOVER_SURFACE = [
  "max-w-[calc(100vw-32px)] overflow-y-auto",
  "rounded-overlay border glass-panel p-2.5 shadow-overlay",
  "transition-[opacity,translate] duration-(--ds-motion-duration-base) ease-out motion-reduce:transition-none",
  "data-[entering]:opacity-0 data-[exiting]:opacity-0",
  "data-[placement=bottom]:data-[entering]:-translate-y-1 data-[placement=top]:data-[entering]:translate-y-1",
  "data-[placement=left]:data-[entering]:translate-x-1 data-[placement=right]:data-[entering]:-translate-x-1",
  "data-[placement=bottom]:origin-top-left rtl:data-[placement=bottom]:origin-top-right",
  "data-[placement=top]:origin-bottom-left rtl:data-[placement=top]:origin-bottom-right",
  "data-[placement=left]:origin-right data-[placement=right]:origin-left",
].join(" ");

/** 266px, shared by every menu surface. */
export const MENU_POPOVER_WIDTH = "w-66.5";

export const MENU_ITEMS_CONTAINER = "flex w-full flex-col gap-1 outline-none";

export const MENU_ITEM = [
  "relative flex w-full cursor-pointer items-center gap-2 rounded-control-sm p-2 text-start",
  "text-fg outline-none transition-colors",
].join(" ");

export const MENU_ITEM_ACTIVE = "bg-surface-hover";

/** The chosen row: a short accent rule in its margin (as on the sidebar's current page). */
export const MENU_ITEM_CHOSEN =
  "bui-menu-chosen before:absolute before:inset-y-2 before:start-0.5 before:w-0.5 before:rounded-full before:bg-accent-600";

/** A group heading inside a menu panel, set like a running head. */
export const MENU_GROUP_LABEL = "ps-2 font-mono text-caption uppercase text-fg-secondary";

/** For rows that track hover and keyboard focus with CSS rather than render state. */
export const MENU_ITEM_INTERACTIVE = "hover:bg-surface-hover focus-visible:bg-surface-hover";
