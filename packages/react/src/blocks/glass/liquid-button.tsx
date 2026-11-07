"use client";

import type { ReactNode } from "react";
import { Button as AriaButton, composeRenderProps } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { glowStyle, sheenHandlers, type GlowTone } from "./liquid-light";

/**
 * Liquid button: a pressable piece of thick glass. The light in it follows the
 * pointer, and it swells a little under a press rather than sinking.
 *
 *   frost  a soft lifted lozenge, for plain light surfaces where clear glass
 *          would have nothing to show
 *   glass  bevelled glass, for sitting over photos and colour
 *   glow   frost with light held inside it, in one of five tones
 *
 * A leading icon can stand on its own lit tile, and a small line can sit above
 * the label. For everyday actions use Button: this is for the one moment on a
 * screen that deserves the material.
 */

export type LiquidButtonVariant = "frost" | "glass" | "glow";
export type LiquidButtonSize = "sm" | "md" | "lg";

export interface LiquidButtonProps extends Omit<AriaButtonProps, "children"> {
  variant?: LiquidButtonVariant;
  size?: LiquidButtonSize;
  /** The light in a `glow` button or an icon tile. Default sky. */
  tone?: GlowTone;
  icon?: IconComponent;
  /** Put the icon on its own lit tile. */
  iconTile?: boolean;
  /** A small line above the label. */
  eyebrow?: ReactNode;
  children: ReactNode;
}

const VARIANT: Record<LiquidButtonVariant, string> = {
  frost: "glass-frost",
  glass: "glass-thick",
  glow: "glass-frost glass-glow",
};

const SIZE: Record<LiquidButtonSize, string> = {
  sm: "h-11 gap-2 px-5 text-body-md-strong",
  md: "h-14 gap-3 px-6 text-body-md-strong",
  lg: "h-20 gap-4 ps-5 pe-9 text-title-sm-strong",
};

const TILE: Record<LiquidButtonSize, string> = { sm: "size-7", md: "size-9", lg: "size-12" };
const ICON: Record<LiquidButtonSize, string> = { sm: "size-5", md: "size-6", lg: "size-7" };

export function LiquidButton({ variant = "frost", size = "md", tone = "sky", icon: Icon, iconTile = false, eyebrow, className, children, style, ...props }: LiquidButtonProps) {
  return (
    <AriaButton
      {...props}
      {...sheenHandlers}
      style={composeRenderProps(style, (given) => ({ ...glowStyle(tone), ...given }))}
      className={composeRenderProps(className, (given) =>
        cx(
          "glass-sheen relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full whitespace-nowrap text-fg press-motion",
          "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
          VARIANT[variant],
          SIZE[size],
          focusRing,
          given,
        ),
      )}
    >
      {Icon &&
        (iconTile ? (
          <span aria-hidden className={cx("glass-glow flex shrink-0 items-center justify-center rounded-tile shadow-glass-bevel", TILE[size])}>
            <Icon className={size === "lg" ? "size-6" : "size-5"} />
          </span>
        ) : (
          <Icon aria-hidden className={cx("shrink-0", ICON[size])} />
        ))}
      {eyebrow ? (
        <span className="flex flex-col items-start">
          <span className="text-body-sm text-fg-secondary">{eyebrow}</span>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </AriaButton>
  );
}
