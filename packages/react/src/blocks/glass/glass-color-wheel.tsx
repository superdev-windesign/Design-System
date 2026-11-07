"use client";

import { useState } from "react";
import {
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorThumb,
  ColorWheel,
  ColorWheelTrack,
  parseColor,
} from "react-aria-components";
import type { Color } from "react-aria-components";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Glass colour wheel: a hue ring set in a disc of glass, with the current colour
 * held in a lens at its centre and a row of saved swatches below. The thumb is
 * a drop of glass tinted by what it's sitting on.
 *
 * It's a React Aria ColorWheel, so arrow keys turn it and the hue is announced
 * by name. For a full picker with saturation and opacity, use ColorPicker.
 */

export interface GlassColorWheelProps {
  /** Any CSS colour string. */
  defaultValue?: string;
  onChange?: (color: Color) => void;
  /** Saved colours, as CSS colour strings. */
  swatches?: string[];
  /** Width of the wheel, in px. Default 224. */
  size?: number;
  "aria-label"?: string;
  className?: string;
}

export function GlassColorWheel({ defaultValue = "hsl(205, 100%, 50%)", onChange, swatches = [], size = 224, "aria-label": ariaLabel = "Colour", className }: GlassColorWheelProps) {
  const [color, setColor] = useState<Color>(() => parseColor(defaultValue).toFormat("hsl"));
  const update = (next: Color) => {
    const hsl = next.toFormat("hsl");
    setColor(hsl);
    onChange?.(hsl);
  };

  return (
    <div className={cx("glass-panel glass-slab flex w-fit flex-col items-center gap-4 rounded-panel border p-5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <ColorWheel aria-label={ariaLabel} value={color} onChange={update} outerRadius={size / 2} innerRadius={size * 0.32}>
          <ColorWheelTrack className="rounded-full" />
          <ColorThumb className={cx("size-8 rounded-full border-2 border-glass-frost shadow-glass-lens", focusRing)} />
        </ColorWheel>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          <ColorSwatch color={color} className="size-16 rounded-full shadow-glass-lens" />
          <span className="text-caption tabular-nums text-fg-secondary">{color.toString("hex")}</span>
        </div>
      </div>
      {swatches.length > 0 && (
        <ColorSwatchPicker aria-label="Saved colours" value={color} onChange={update} className="flex flex-wrap justify-center gap-2">
          {swatches.map((swatch) => (
            <ColorSwatchPickerItem key={swatch} color={swatch} className={cx("cursor-pointer rounded-full data-[selected]:outline-2 data-[selected]:outline-offset-2 data-[selected]:outline-focus", focusRing)}>
              <ColorSwatch className="size-7 rounded-full shadow-glass-bevel" />
            </ColorSwatchPickerItem>
          ))}
        </ColorSwatchPicker>
      )}
    </div>
  );
}
