"use client";

import type { ReactNode } from "react";
import {
  Button as AriaButton,
  ColorArea as AriaColorArea,
  ColorField as AriaColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  ColorThumb,
  DialogTrigger,
  Group,
  Input,
  SliderOutput,
  SliderTrack,
} from "react-aria-components";
import type {
  ColorAreaProps as AriaColorAreaProps,
  ColorFieldProps as AriaColorFieldProps,
  ColorPickerProps as AriaColorPickerProps,
  ColorSliderProps as AriaColorSliderProps,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerProps as AriaColorSwatchPickerProps,
  ColorSwatchProps as AriaColorSwatchProps,
} from "react-aria-components";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import { FIELD_INPUT, fieldShell } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldLabel } from "../form/form";
import { Popover } from "../popover/popover";

/**
 * ColorPicker: a swatch button that opens a picker with a saturation /
 * brightness area, a hue slider, a hex field and preset swatches. Each part
 * is exported on its own (ColorArea, ColorSlider, ColorField, ColorSwatch,
 * ColorSwatchPicker) for building other layouts; inside a ColorPicker they
 * all share its value.
 *
 * Every part is keyboard operable and announces the colour by name
 * ("dark vibrant red"), not only by number.
 *
 * Note: the preset swatches are colour *values* the person picks, which is
 * why they're written as hex. Styling elsewhere still comes from tokens.
 */

/** Default presets: a warm, editorial spread. Pass `swatches` to replace them. */
export const DEFAULT_COLOR_SWATCHES = ["#1f1a17", "#7c6f64", "#c2410c", "#d97706", "#65a30d", "#0f766e", "#2563eb", "#7c3aed", "#be185d"];

const THUMB = cx(
  "size-5 rounded-full border-2 border-surface shadow-raised ring-1 ring-line",
  "transition-[width,height] duration-(--ds-motion-duration-fast) data-[dragging]:size-6",
  focusRing,
);

export interface ColorPickerProps extends Omit<AriaColorPickerProps, "children"> {
  /** The trigger's label, also the picker dialog's name. Default "Colour". */
  label?: string;
  /** Show the label next to the swatch in the trigger. Default true. */
  showLabel?: boolean;
  swatches?: string[];
  className?: string;
}

export function ColorPicker({ label = "Colour", showLabel = true, swatches = DEFAULT_COLOR_SWATCHES, className, ...props }: ColorPickerProps) {
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        <AriaButton
          aria-label={showLabel ? undefined : label}
          className={cx(
            "inline-flex h-control-md cursor-pointer items-center gap-2 rounded-control-md border border-line-control bg-surface ps-1.5 pe-2 text-body-md-strong text-fg shadow-raised",
            "transition-colors duration-(--ds-motion-duration-base) data-[hovered]:border-line-control-hover data-[hovered]:bg-surface-hover",
            focusRing,
            className,
          )}
        >
          <ColorSwatch className="size-6 rounded-control-xs" />
          {showLabel && <span>{label}</span>}
          <ChevronDownSmall aria-hidden className="size-4 text-fg-secondary" />
        </AriaButton>
        <Popover aria-label={label} placement="bottom start" showArrow={false}>
          <div className="flex w-56 flex-col gap-3">
            <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
            <ColorSlider colorSpace="hsb" channel="hue" />
            <ColorField label="Hex" />
            {swatches.length > 0 && (
              <ColorSwatchPicker aria-label="Presets">
                {swatches.map((color) => (
                  <ColorSwatchPickerItem key={color} color={color} />
                ))}
              </ColorSwatchPicker>
            )}
          </div>
        </Popover>
      </DialogTrigger>
    </AriaColorPicker>
  );
}

export interface ColorAreaProps extends Omit<AriaColorAreaProps, "className"> {
  className?: string;
}

export function ColorArea({ className, ...props }: ColorAreaProps) {
  return (
    <AriaColorArea {...props} className={cx("aspect-square w-full shrink-0 rounded-surface data-[disabled]:opacity-40", className)}>
      <ColorThumb className={THUMB} />
    </AriaColorArea>
  );
}

export interface ColorSliderProps extends Omit<AriaColorSliderProps, "className"> {
  label?: ReactNode;
  className?: string;
}

export function ColorSlider({ label, className, ...props }: ColorSliderProps) {
  return (
    <AriaColorSlider {...props} className={cx("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <FieldLabel>{label}</FieldLabel>
          <SliderOutput className="font-mono text-caption tabular-nums text-fg-secondary" />
        </div>
      )}
      <SliderTrack className="h-4 w-full rounded-full">
        <ColorThumb className={cx(THUMB, "top-1/2")} />
      </SliderTrack>
    </AriaColorSlider>
  );
}

export interface ColorFieldProps extends Omit<AriaColorFieldProps, "className"> {
  label?: ReactNode;
  className?: string;
}

export function ColorField({ label, className, ...props }: ColorFieldProps) {
  return (
    <AriaColorField {...props} className={cx("flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Group className={(state) => fieldShell(state, "sm")}>
        <Input className={cx(FIELD_INPUT, "font-mono text-body-sm uppercase")} />
      </Group>
    </AriaColorField>
  );
}

export interface ColorSwatchProps extends Omit<AriaColorSwatchProps, "className"> {
  className?: string;
}

/** The colour itself, drawn with a hairline so pale colours hold their edge. */
export function ColorSwatch({ className, ...props }: ColorSwatchProps) {
  return <AriaColorSwatch {...props} className={cx("size-8 shrink-0 rounded-control-sm shadow-hairline", className)} />;
}

export interface ColorSwatchPickerProps extends Omit<AriaColorSwatchPickerProps, "className"> {
  className?: string;
}

export function ColorSwatchPicker({ className, ...props }: ColorSwatchPickerProps) {
  return <AriaColorSwatchPicker {...props} className={cx("flex flex-wrap gap-1.5", className)} />;
}

export function ColorSwatchPickerItem({ className, ...props }: Omit<ColorSwatchPickerItemProps, "className"> & { className?: string }) {
  return (
    <AriaColorSwatchPickerItem
      {...props}
      className={cx(
        "relative cursor-pointer rounded-control-sm",
        "data-[selected]:outline-2 data-[selected]:outline-offset-2 data-[selected]:outline-fg",
        focusRing,
        className,
      )}
    >
      <ColorSwatch className="size-5.5 rounded-control-xs" />
    </AriaColorSwatchPickerItem>
  );
}
