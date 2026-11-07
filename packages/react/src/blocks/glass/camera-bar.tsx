"use client";

import { useId } from "react";
import { Button as AriaButton, ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { RiCameraSwitchLine } from "@remixicon/react";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Camera bar: capture controls floating over a live picture. A strip of modes
 * sits above the shutter, flanked by the last shot and the lens flip. The chosen
 * mode lives under a sliding lens.
 *
 * Over a picture nothing can be assumed about the backdrop, so every label sits
 * on a dense pane rather than clear glass.
 */

export interface CameraMode {
  id: string;
  label: string;
}

export interface CameraBarProps {
  modes: CameraMode[];
  defaultMode?: string;
  onModeChange?: (id: string) => void;
  onCapture?: () => void;
  onFlip?: () => void;
  onOpenLast?: () => void;
  /** The last shot, as a CSS background. */
  lastShot?: string;
  className?: string;
}

const SIDE = cx("glass-thick flex size-13 cursor-pointer items-center justify-center rounded-full text-fg press-motion", focusRing);

export function CameraBar({ modes, defaultMode, onModeChange, onCapture, onFlip, onOpenLast, lastShot, className }: CameraBarProps) {
  const lens = useId();
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div className={cx("flex w-full max-w-sm flex-col items-center gap-3", className)}>
      <ToggleButtonGroup
        aria-label="Camera mode"
        selectionMode="single"
        disallowEmptySelection
        defaultSelectedKeys={[defaultMode ?? modes[0]?.id ?? ""]}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (next !== undefined) onModeChange?.(String(next));
        }}
        className="glass-panel flex max-w-full gap-0.5 overflow-x-auto scrollbar-none rounded-full border p-1"
      >
        {modes.map(({ id, label }) => (
          <ToggleButton key={id} id={id} className={cx("relative h-8 shrink-0 cursor-pointer rounded-full px-3.5 text-body-sm-strong text-fg", focusRing)}>
            {({ isSelected }) => (
              <>
                {isSelected && <motion.span layoutId={lens} aria-hidden transition={reduceMotion ? { duration: 0 } : layoutSpring} className="absolute inset-0 rounded-full bg-glass-hover shadow-glass-bevel" />}
                <span className="relative">{label}</span>
              </>
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <div className="flex w-full items-center justify-between">
        <AriaButton aria-label="Open last photo" onPress={onOpenLast} style={lastShot ? { background: lastShot } : undefined} className={SIDE} />
        <AriaButton aria-label="Take photo" onPress={onCapture} className={cx("glass-frost flex size-19 cursor-pointer items-center justify-center rounded-full press-motion", focusRing)}>
          <span aria-hidden className="size-14 rounded-full bg-fg shadow-glass-bevel" />
        </AriaButton>
        <AriaButton aria-label="Flip camera" onPress={onFlip} className={SIDE}>
          <RiCameraSwitchLine aria-hidden className="size-6" />
        </AriaButton>
      </div>
    </div>
  );
}
