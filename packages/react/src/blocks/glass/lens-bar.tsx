"use client";

import { useId } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import type { IconComponent } from "../../components/button/button";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Lens bar: a short row of destinations where the current one sits under a lens
 * that stands proud of the bar, above and below. The lens slides on a spring as
 * the choice moves, and the label only shows inside it, so the bar stays small.
 * Two tones: `frost` for light surfaces and `ink` for a solid pill over colour.
 *
 * It's a single-select React Aria group: the arrow keys move along it, and
 * every item stays named when its label isn't showing.
 */

export interface LensBarItem {
  id: string;
  label: string;
  icon: IconComponent;
}

export interface LensBarProps {
  "aria-label": string;
  items: LensBarItem[];
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectionChange?: (id: string) => void;
  tone?: "frost" | "ink";
  className?: string;
}

export function LensBar({ "aria-label": ariaLabel, items, selectedId, defaultSelectedId, onSelectionChange, tone = "frost", className }: LensBarProps) {
  const lens = useId();
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={selectedId === undefined ? undefined : [selectedId]}
      defaultSelectedKeys={[defaultSelectedId ?? items[0]?.id ?? ""]}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next !== undefined) onSelectionChange?.(String(next));
      }}
      className={cx("inline-flex items-center gap-1 rounded-full px-2", tone === "ink" ? "bg-fg text-canvas" : "glass-frost text-fg", className)}
    >
      {items.map(({ id, label, icon: Icon }) => (
        <ToggleButton
          key={id}
          id={id}
          aria-label={label}
          className={({ isSelected }) =>
            cx(
              "relative flex h-13 cursor-pointer items-center justify-center rounded-full transition-[width] duration-(--ds-motion-duration-moderate) ease-standard motion-reduce:transition-none",
              isSelected ? "w-21" : "w-13",
              focusRing,
            )
          }
        >
          {({ isSelected }) => (
            <>
              {isSelected && (
                <motion.span
                  layoutId={lens}
                  aria-hidden
                  transition={reduceMotion ? { duration: 0 } : layoutSpring}
                  className="glass-panel absolute -inset-y-2.5 inset-x-0 rounded-panel border shadow-glass-lens"
                />
              )}
              <span className={cx("relative flex flex-col items-center gap-0.5", isSelected && "text-fg")}>
                <Icon aria-hidden className="size-5" />
                {isSelected && (
                  <span aria-hidden className="text-caption-strong">
                    {label}
                  </span>
                )}
              </span>
            </>
          )}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
