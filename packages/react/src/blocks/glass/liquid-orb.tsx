"use client";

import { Button as AriaButton } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { glowStyle, type GlowTone } from "./liquid-light";

/**
 * Liquid orb: a round control with light inside it, in a lens set into a frosted
 * ring. It suits a single always-there action, like a voice assistant or a home
 * button. With `iris` the rim catches every colour; while `isActive` the rim
 * turns, which reads as "listening" without saying so, so `aria-pressed` and the
 * label carry that state for anyone who can't see it.
 */

export type LiquidOrbSize = "md" | "lg";

export interface LiquidOrbProps extends Omit<AriaButtonProps, "children" | "className"> {
  icon: IconComponent;
  /** Required: an icon alone has no name. */
  "aria-label": string;
  tone?: GlowTone;
  size?: LiquidOrbSize;
  /** An iridescent rim. */
  iris?: boolean;
  /** On or listening. Leave undefined for a plain button. */
  isActive?: boolean;
  className?: string;
}

const SIZE: Record<LiquidOrbSize, { host: string; lens: string; icon: string }> = {
  md: { host: "size-18", lens: "inset-1.5", icon: "size-7" },
  lg: { host: "size-28", lens: "inset-2.5", icon: "size-10" },
};

export function LiquidOrb({ icon: Icon, tone = "sky", size = "lg", iris = false, isActive, className, ...props }: LiquidOrbProps) {
  const s = SIZE[size];
  return (
    <AriaButton
      {...props}
      aria-pressed={isActive}
      style={glowStyle(tone)}
      className={cx(
        "glass-frost relative isolate flex cursor-pointer items-center justify-center rounded-full text-fg press-motion",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
        s.host,
        (iris || isActive) && "glass-iris",
        isActive && "animate-iris",
        focusRing,
        className,
      )}
    >
      <span aria-hidden className={cx("glass-glow absolute rounded-full shadow-glass-bevel", s.lens)} />
      <Icon aria-hidden className={cx("relative", s.icon)} />
    </AriaButton>
  );
}
