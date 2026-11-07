import { cx } from "../utils/cx";

/**
 * Shared overlay recipes: the dimmed backdrop under modals and drawers, the
 * floating panel surface and its motion. Menu surfaces keep their own recipe
 * in `menu.ts`; these are for dialogs, popovers and cards.
 */

/** The full-screen scrim behind Modal, AlertDialog and Drawer. */
export const OVERLAY_SCRIM = cx(
  "bui-scrim fixed inset-0 z-50 bg-scrim",
  "transition-opacity duration-(--ds-motion-duration-moderate) ease-out",
  "data-[entering]:opacity-0 data-[exiting]:opacity-0 motion-reduce:transition-none",
);

/** A floating panel: a pane (paper, or glass where the brand has it), a rule and the overlay shadow. */
export const FLOATING_SURFACE = "rounded-overlay border glass-panel shadow-overlay";

/** Popover motion: fade and a slight scale from the side nearest the trigger. */
export const POPOVER_MOTION = cx(
  "transition duration-(--ds-motion-duration-base) ease-out motion-reduce:transition-none",
  "data-[entering]:scale-96 data-[entering]:opacity-0 data-[exiting]:scale-98 data-[exiting]:opacity-0",
  "data-[placement=bottom]:origin-top data-[placement=top]:origin-bottom",
  "data-[placement=left]:origin-right data-[placement=right]:origin-left",
);

/** Overlay arrow: a surface-filled triangle with the hairline rule along its edges. */
export const OVERLAY_ARROW_SVG = "bui-overlay-arrow block fill-surface stroke-line";
