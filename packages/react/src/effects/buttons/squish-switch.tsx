"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Switch as AriaSwitch } from "react-aria-components";
import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * SquishSwitch: a switch whose knob behaves like something soft. Pressing
 * stretches it toward where it's going; it slides over on a spring and squashes
 * as it lands. It's the React Aria switch underneath, so the keyboard, labels
 * and states all work as usual. With reduced motion the knob just moves.
 */

export interface SquishSwitchProps extends Omit<AriaSwitchProps, "children" | "className"> {
  children?: ReactNode;
  className?: string;
}

const spring = { type: "spring", stiffness: 520, damping: 26, mass: 0.7 } as const;

export function SquishSwitch({ children, className, ...props }: SquishSwitchProps) {
  const calm = useCalmMotion();
  return (
    <AriaSwitch {...props} className={cx("group inline-flex cursor-pointer items-center gap-3 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50", className)}>
      {({ isSelected, isPressed, isFocusVisible }) => (
        <>
          <span
            className={cx(
              "flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-(--ds-motion-duration-moderate)",
              isSelected ? "justify-end border-accent-600 bg-accent-600" : "justify-start border-line-control bg-muted",
              isFocusVisible && "outline-2 outline-offset-2 outline-focus",
            )}
          >
            <motion.span
              layout={!calm}
              transition={spring}
              animate={calm ? undefined : { scaleY: isPressed ? 0.82 : 1 }}
              className={cx("block h-6 rounded-full bg-surface shadow-switch-thumb", isPressed && !calm ? "w-8" : "w-6")}
            />
          </span>
          {children && <span className="text-body-md text-fg">{children}</span>}
        </>
      )}
    </AriaSwitch>
  );
}
