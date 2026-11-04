"use client";

import { useRef, useState } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { RiCheckLine, RiRestartLine } from "@remixicon/react";
import { Button } from "../button/button";
import { ColorPicker } from "../color-picker/color-picker";
import { ACCENT_PRESETS, BRANDS, DEFAULT_ACCENT, contrastWithWhite, useTheme, type TransitionOrigin } from "../../foundations/theme";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * AccentPicker: re-tints the whole interface from one row of swatches.
 * Picking a preset sends the new accent out across the page in a circle from
 * the swatch; a custom colour re-tints live as you drag; Reset goes back to
 * the brand's own accent. Reads and writes the accent through `useTheme()`, so it needs a
 * ThemeProvider above it.
 *
 * The presets are checked for readable button text and visible marks in both
 * themes. A custom colour isn't, so the picker says when white text on it
 * would be hard to read.
 */

export interface AccentPickerProps {
  /** Offer a custom colour after the presets. Default true. */
  showCustom?: boolean;
  /** Offer a Reset button. Default true. */
  showReset?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** The centre of the control that has focus, for keyboard-driven changes. */
function focusedCentre(): TransitionOrigin | undefined {
  const el = (document.activeElement as HTMLElement | null)?.closest("label") ?? (document.activeElement as HTMLElement | null);
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function AccentPicker({ showCustom = true, showReset = true, "aria-label": ariaLabel = "Accent colour", className }: AccentPickerProps) {
  const { accent, setAccent, brand } = useTheme();
  // The first swatch is the brand's own accent: terracotta, or Moon's Piccolo.
  const own = BRANDS.find((b) => b.id === brand)!;
  const swatchLabel = (preset: (typeof ACCENT_PRESETS)[number]) => (preset.id === DEFAULT_ACCENT ? own.accentLabel : preset.label);
  const pointer = useRef<TransitionOrigin | undefined>(undefined);
  const isPreset = ACCENT_PRESETS.some((p) => p.id === accent);
  const [custom, setCustom] = useState(isPreset ? "#2f6f8f" : accent);
  const contrast = !isPreset ? contrastWithWhite(accent) : 21;

  // A click animates from the pointer; a key press from the focused swatch.
  const origin = () => {
    const from = pointer.current ?? focusedCentre();
    pointer.current = undefined;
    return from;
  };

  return (
    <div
      className={cx("flex flex-col gap-3", className)}
      onPointerDownCapture={(event) => (pointer.current = { x: event.clientX, y: event.clientY })}
      onKeyDownCapture={() => (pointer.current = undefined)}
    >
      <div className="flex flex-wrap items-center gap-3">
        <RadioGroup aria-label={ariaLabel} orientation="horizontal" value={isPreset ? accent : null} onChange={(value) => setAccent(value, origin())} className="flex flex-wrap gap-2.5">
          {ACCENT_PRESETS.map((preset) => (
            <Radio
              key={preset.id}
              value={preset.id}
              aria-label={swatchLabel(preset)}
              style={{ background: preset.id === DEFAULT_ACCENT ? own.accentColor : `var(--ds-color-${preset.hue}-${600 + preset.shift})` }}
              className={cx(
                "flex size-9 cursor-pointer items-center justify-center rounded-full shadow-hairline",
                "transition-[transform,box-shadow] duration-(--ds-motion-duration-base) data-[hovered]:scale-105 data-[pressed]:scale-95 motion-reduce:transition-none",
                "data-[selected]:ring-2 data-[selected]:ring-fg data-[selected]:ring-offset-2 data-[selected]:ring-offset-surface",
                focusRing,
              )}
            >
              {({ isSelected }) => (isSelected ? <RiCheckLine aria-hidden className="size-4.5 text-on-action" /> : null)}
            </Radio>
          ))}
        </RadioGroup>

        {showCustom && (
          <span className={cx("rounded-control-md", !isPreset && "ring-2 ring-fg ring-offset-2 ring-offset-surface")}>
            <ColorPicker
              label="Custom"
              value={custom}
              swatches={[]}
              onChange={(color) => {
                const hex = color.toString("hex");
                setCustom(hex);
                // Live while dragging, so no reveal animation here.
                setAccent(hex);
              }}
            />
          </span>
        )}

        {showReset && (
          <Button variant="tertiary" size="sm" leadingIcon={RiRestartLine} isDisabled={accent === DEFAULT_ACCENT} onPress={() => setAccent(DEFAULT_ACCENT, origin())}>
            Reset
          </Button>
        )}
      </div>
      <p role="status" className={cx("text-body-sm", contrast < 4.5 ? "text-status-warning-text" : "sr-only")}>
        {contrast < 4.5
          ? `White text on this colour is hard to read (${contrast.toFixed(1)}:1). Pick a darker one so buttons stay legible.`
          : `Accent: ${isPreset ? swatchLabel(ACCENT_PRESETS.find((p) => p.id === accent)!) : accent}`}
      </p>
    </div>
  );
}
