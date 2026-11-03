"use client";

import { useContext, type ReactNode } from "react";
import {
  Button as AriaButton,
  ColorArea as AriaColorArea,
  ColorField as AriaColorField,
  ColorPicker as AriaColorPicker,
  ColorPickerStateContext,
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
 * Colour picking, flat on the paper.
 *
 * - `ColorPicker`   a trigger (swatch, label, chevron) that opens the editor in
 *                   a popover, or, with `variant="inline"`, the editor itself
 *                   under its label.
 * - `ColorWell`     where space is tight: just a crisp square swatch that opens
 *                   the same editor. Size it with `wellClassName`.
 * - `ColorEditor`   the editor on its own, for building other layouts inside a
 *                   ColorPicker: a saturation/brightness area, a hue rail, an
 *                   optional opacity rail over a checkerboard (`showAlpha`), a
 *                   hex field, the value read out as HEX, RGB and HSL in mono
 *                   figures, and preset swatches.
 *
 * Each part (ColorArea, ColorSlider, ColorField, ColorSwatch,
 * ColorSwatchPicker) is exported on its own too; inside a ColorPicker they all
 * share its value. Every part is keyboard operable and announces the colour by
 * name ("dark vibrant red"), not only by number. In right-to-left layouts the
 * rails run from the right, and the hex field stays left to right.
 *
 * Note: the preset swatches are colour *values* the person picks, which is
 * why they're written as hex. Styling elsewhere still comes from tokens.
 */

/** Default presets: a warm, editorial spread. Pass `swatches` to replace them. */
export const DEFAULT_COLOR_SWATCHES = ["#1f1a17", "#7c6f64", "#c2410c", "#d97706", "#65a30d", "#0f766e", "#2563eb", "#7c3aed", "#be185d"];

// A paper ring with an ink hairline, no drop shadow; it grows while dragged.
const THUMB = cx(
  "size-4.5 rounded-full border-2 border-surface ring-1 ring-fg",
  "transition-[width,height] duration-(--ds-motion-duration-fast) data-[dragging]:size-5.5",
  focusRing,
);

/* ----------------------------------------------------------------- editor */

export interface ColorEditorProps {
  /** Add an opacity rail, and read the value out with its alpha. */
  showAlpha?: boolean;
  /** Read the value out as HEX, RGB and HSL under the hex field. Default true. */
  showReadouts?: boolean;
  swatches?: string[];
  className?: string;
}

/** The value as HEX, RGB and HSL, in mono figures. Reads the surrounding ColorPicker. */
function ColorReadouts({ showAlpha }: { showAlpha: boolean }) {
  const state = useContext(ColorPickerStateContext);
  if (!state) return null;
  // HSL in whole numbers: React Aria prints two decimals, which overflow the editor.
  const hsl = state.color.toFormat("hsl");
  const [h, s, l] = (["hue", "saturation", "lightness"] as const).map((channel) => Math.round(hsl.getChannelValue(channel)));
  const alpha = Number(hsl.getChannelValue("alpha").toFixed(2));
  const rows: [string, string][] = [
    ["HEX", state.color.toString(showAlpha ? "hexa" : "hex")],
    ["RGB", state.color.toString(showAlpha ? "rgba" : "rgb")],
    ["HSL", showAlpha ? `hsla(${h}, ${s}%, ${l}%, ${alpha})` : `hsl(${h}, ${s}%, ${l}%)`],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border-t border-line pt-2">
      {rows.map(([name, value]) => (
        <div key={name} className="contents">
          <dt className="font-mono text-caption text-fg-tertiary">{name}</dt>
          <dd dir="ltr" className="truncate font-mono text-caption tabular-nums text-fg">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The full editor. Must sit inside a ColorPicker (or ColorWell), which owns the value. */
export function ColorEditor({ showAlpha = false, showReadouts = true, swatches = DEFAULT_COLOR_SWATCHES, className }: ColorEditorProps) {
  return (
    <div className={cx("flex w-56 flex-col gap-3", className)}>
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
      <ColorSlider colorSpace="hsb" channel="hue" />
      {showAlpha && <ColorSlider colorSpace="hsb" channel="alpha" label="Opacity" />}
      <ColorField label="Hex" />
      {showReadouts && <ColorReadouts showAlpha={showAlpha} />}
      {swatches.length > 0 && (
        <ColorSwatchPicker aria-label="Presets">
          {swatches.map((color) => (
            <ColorSwatchPickerItem key={color} color={color} />
          ))}
        </ColorSwatchPicker>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- picker */

export interface ColorPickerProps extends Omit<AriaColorPickerProps, "children"> {
  /** The trigger's label, also the picker dialog's name. Default "Colour". */
  label?: string;
  /** Show the label next to the swatch in the trigger. Default true. */
  showLabel?: boolean;
  /** `popover` (default) opens the editor from a trigger; `inline` shows it in place. */
  variant?: "popover" | "inline";
  /** Add an opacity rail. */
  showAlpha?: boolean;
  /** Read the value out as HEX, RGB and HSL. Default true. */
  showReadouts?: boolean;
  swatches?: string[];
  className?: string;
}

export function ColorPicker({
  label = "Colour",
  showLabel = true,
  variant = "popover",
  showAlpha = false,
  showReadouts = true,
  swatches = DEFAULT_COLOR_SWATCHES,
  className,
  ...props
}: ColorPickerProps) {
  const editor = <ColorEditor showAlpha={showAlpha} showReadouts={showReadouts} swatches={swatches} />;

  if (variant === "inline") {
    return (
      <AriaColorPicker {...props}>
        <div role="group" aria-label={label} className={cx("flex w-fit flex-col gap-2", className)}>
          {showLabel && (
            <div className="flex items-center gap-2">
              <ColorSwatch className="size-5 rounded-control-xs" />
              <FieldLabel>{label}</FieldLabel>
            </div>
          )}
          {editor}
        </div>
      </AriaColorPicker>
    );
  }

  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        <AriaButton
          aria-label={showLabel ? undefined : label}
          className={cx(
            "inline-flex h-control-md cursor-pointer items-center gap-2 rounded-control-md border border-line-control bg-surface ps-1.5 pe-2 text-body-md-strong text-fg",
            "transition-colors duration-(--ds-motion-duration-base) data-[hovered]:border-fg",
            focusRing,
            className,
          )}
        >
          <ColorSwatch className="size-6 rounded-control-xs" />
          {showLabel && <span>{label}</span>}
          <ChevronDownSmall aria-hidden className="size-4 text-fg-secondary" />
        </AriaButton>
        <Popover aria-label={label} placement="bottom start" showArrow={false}>
          {editor}
        </Popover>
      </DialogTrigger>
    </AriaColorPicker>
  );
}

/* ------------------------------------------------------------------- well */

export interface ColorWellProps extends Omit<AriaColorPickerProps, "children"> {
  /** Names the well and the editor it opens. Required: the well has no visible text. */
  "aria-label": string;
  /** Size (or otherwise style) the swatch, e.g. "size-6". Default size-8. */
  wellClassName?: string;
  showAlpha?: boolean;
  showReadouts?: boolean;
  swatches?: string[];
  className?: string;
}

/** A crisp square swatch that opens the colour editor, for tight rows (label colours, series). */
export function ColorWell({
  "aria-label": label,
  wellClassName,
  showAlpha = false,
  showReadouts = true,
  swatches = DEFAULT_COLOR_SWATCHES,
  className,
  ...props
}: ColorWellProps) {
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        <AriaButton
          aria-label={label}
          className={cx(
            "inline-flex shrink-0 cursor-pointer rounded-control-sm p-0.5 outline-1 -outline-offset-1 outline-transparent",
            "transition-[outline-color] duration-(--ds-motion-duration-base) data-[hovered]:outline-line-control-hover",
            focusRing,
            className,
          )}
        >
          <ColorSwatch className={cx("size-8 rounded-control-xs", wellClassName)} />
        </AriaButton>
        <Popover aria-label={label} placement="bottom start" showArrow={false}>
          <ColorEditor showAlpha={showAlpha} showReadouts={showReadouts} swatches={swatches} />
        </Popover>
      </DialogTrigger>
    </AriaColorPicker>
  );
}

/* ------------------------------------------------------------------ parts */

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
  const isAlpha = props.channel === "alpha";
  const track = (
    <SliderTrack className="h-3 w-full rounded-control-xs">
      <ColorThumb className={cx(THUMB, "top-1/2")} />
    </SliderTrack>
  );
  return (
    <AriaColorSlider {...props} className={cx("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <FieldLabel>{label}</FieldLabel>
          <SliderOutput className="font-mono text-caption tabular-nums text-fg-secondary" />
        </div>
      )}
      {/* A translucent rail sits on a checkerboard, so transparency reads as transparency. */}
      {isAlpha ? <div className="bg-checker rounded-control-xs">{track}</div> : track}
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
        {/* Hex is read left to right in every language. */}
        <Input dir="ltr" className={cx(FIELD_INPUT, "font-mono text-body-sm uppercase")} />
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
