"use client";

import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button as AriaButton } from "react-aria-components";
import { RiAddLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * FanMenu: a floating action button that blooms into its actions. `arc` fans
 * them round the corner like petals; `stack` lifts them into a column with
 * their labels. The plus turns into a cross while it's open. Escape closes it
 * and returns focus to the button, and closed actions aren't in the tab order.
 */

export interface FanMenuAction {
  id: string;
  label: string;
  icon: IconComponent;
  onAction: () => void;
}

export type FanMenuLayout = "arc" | "stack";

export interface FanMenuProps {
  actions: FanMenuAction[];
  layout?: FanMenuLayout;
  /** The main button's name. */
  label?: string;
  className?: string;
}

const RADIUS = 84;

export function FanMenu({ actions, layout = "arc", label = "Quick actions", className }: FanMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const calm = useCalmMotion();

  const place = (i: number) => {
    if (layout === "stack") return { x: 0, y: -(i + 1) * 52 };
    // From straight left (180°) round to straight up (270°).
    const angle = ((180 + (90 * i) / Math.max(1, actions.length - 1)) * Math.PI) / 180;
    return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      (event.currentTarget.querySelector("[data-fan-trigger]") as HTMLElement | null)?.focus();
    }
  };

  return (
    <div className={cx("relative inline-flex", className)} onKeyDown={onKeyDown}>
      <AriaButton
        data-fan-trigger
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onPress={() => setOpen((v) => !v)}
        className={cx("relative z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent-600 text-on-action shadow-overlay press-motion", focusRing)}
      >
        <motion.span animate={{ rotate: open ? 135 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 20 }} className="flex">
          <RiAddLine aria-hidden className="size-6" />
        </motion.span>
      </AriaButton>
      <ul id={menuId} className="absolute inset-0">
        <AnimatePresence>
          {open &&
            actions.map((action, i) => {
              const Icon = action.icon;
              const to = place(i);
              return (
                <motion.li
                  key={action.id}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                  animate={{ ...to, scale: 1, opacity: 1 }}
                  exit={{ x: 0, y: 0, scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
                  transition={calm ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 22, delay: i * 0.04 }}
                >
                  <AriaButton
                    aria-label={layout === "arc" ? action.label : undefined}
                    onPress={() => {
                      action.onAction();
                      setOpen(false);
                    }}
                    className={cx(
                      "flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface text-fg shadow-raised transition-colors hover:bg-surface-hover",
                      layout === "arc" ? "size-11 justify-center" : "absolute end-1 h-10 px-3.5 text-body-sm-strong whitespace-nowrap",
                      focusRing,
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                    {layout === "stack" && action.label}
                  </AriaButton>
                </motion.li>
              );
            })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
