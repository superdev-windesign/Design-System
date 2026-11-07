"use client";

import { useState, type ReactNode } from "react";
import { Button as AriaButton, Slider, SliderThumb, SliderTrack, ToggleButton } from "react-aria-components";
import { RiPauseFill, RiPlayFill, RiSkipForwardFill } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { GlassMaterial, LiquidGlass } from "./liquid-glass";

/**
 * Control center: a panel of quick settings on clear glass, meant to sit over a
 * photo or wallpaper with `bg-glass-dim` beneath it. A cluster of round toggles,
 * a media tile, a wide focus toggle, small shortcuts, and two tall sliders.
 *
 * Only the things that are switched on take colour, so state reads at a glance.
 * The toggles are React Aria ToggleButtons and the sliders are real vertical
 * sliders, so arrow keys and screen readers work throughout.
 */

export interface ControlToggle {
  id: string;
  label: string;
  icon: IconComponent;
  defaultSelected?: boolean;
  /** A word under the label, e.g. the network's name. */
  detail?: string;
}

export interface ControlCenterMedia {
  title: string;
  artist: string;
  /** CSS background for the artwork. */
  artwork?: string;
}

export interface ControlSliderConfig {
  label: string;
  icon: IconComponent;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export interface ControlCenterProps {
  /** Up to four, in a two-by-two cluster. */
  connectivity: ControlToggle[];
  media?: ControlCenterMedia;
  /** Wide toggle, such as Focus. */
  focus?: ControlToggle;
  /** Small round toggles. */
  shortcuts?: ControlToggle[];
  brightness?: ControlSliderConfig;
  volume?: ControlSliderConfig;
  onToggle?: (id: string, selected: boolean) => void;
  "aria-label"?: string;
  className?: string;
}

const toggleState = (isSelected: boolean) => (isSelected ? "bg-accent-600 text-on-action" : "bg-glass-clear text-on-glass data-[hovered]:bg-glass-lens data-[hovered]:text-fg");

function RoundToggle({ toggle, onToggle, className }: { toggle: ControlToggle; onToggle?: ControlCenterProps["onToggle"]; className?: string }) {
  const Icon = toggle.icon;
  return (
    <ToggleButton
      aria-label={toggle.label}
      defaultSelected={toggle.defaultSelected}
      onChange={(selected) => onToggle?.(toggle.id, selected)}
      className={({ isSelected }) =>
        cx("flex cursor-pointer items-center justify-center rounded-full transition-[background-color,color,scale] data-[pressed]:scale-95 motion-reduce:transition-none", toggleState(isSelected), focusRing, className)
      }
    >
      <Icon aria-hidden className="size-6" />
    </ToggleButton>
  );
}

function TallSlider({ config, className }: { config: ControlSliderConfig; className?: string }) {
  const Icon = config.icon;
  return (
    <Slider aria-label={config.label} orientation="vertical" defaultValue={config.defaultValue ?? 50} onChange={(value) => config.onChange?.(value as number)} className={cx("min-h-0", className)}>
      <SliderTrack className="glass-rim relative isolate h-full w-full cursor-pointer overflow-hidden rounded-panel">
        {({ state }) => (
          <>
            <GlassMaterial variant="clear" />
            <span aria-hidden className="absolute inset-x-0 bottom-0 bg-on-glass" style={{ height: `${state.getThumbPercent(0) * 100}%` }} />
            <SliderThumb className={cx("h-1 w-full cursor-grab rounded-full active:cursor-grabbing", focusRing)} />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center text-on-glass mix-blend-difference">
              <Icon className="size-6" />
            </span>
          </>
        )}
      </SliderTrack>
    </Slider>
  );
}

function MediaTile({ media, className }: { media: ControlCenterMedia; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const Icon = playing ? RiPauseFill : RiPlayFill;
  return (
    <LiquidGlass variant="clear" className={cx("flex flex-col justify-between gap-2 rounded-panel p-3 text-on-glass", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {media.artwork && <span aria-hidden className="size-10 shrink-0 rounded-item" style={{ background: media.artwork }} />}
        <div className="min-w-0">
          <p className="truncate text-body-sm-strong">{media.title}</p>
          <p className="truncate text-caption text-on-glass-secondary">{media.artist}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <AriaButton aria-label={playing ? "Pause" : "Play"} onPress={() => setPlaying((value) => !value)} className={cx("flex size-11 cursor-pointer items-center justify-center rounded-full transition-[scale] data-[pressed]:scale-90 motion-reduce:transition-none", focusRing)}>
          <Icon aria-hidden className="size-7" />
        </AriaButton>
        <AriaButton aria-label="Next" className={cx("flex size-11 cursor-pointer items-center justify-center rounded-full transition-[scale] data-[pressed]:scale-90 motion-reduce:transition-none", focusRing)}>
          <RiSkipForwardFill aria-hidden className="size-6" />
        </AriaButton>
      </div>
    </LiquidGlass>
  );
}

export function ControlCenter({ connectivity, media, focus, shortcuts = [], brightness, volume, onToggle, "aria-label": ariaLabel = "Control center", className }: ControlCenterProps) {
  const FocusIcon = focus?.icon;
  return (
    <section aria-label={ariaLabel} className={cx("grid w-full max-w-sm auto-rows-fr grid-cols-4 gap-3", className)}>
      <LiquidGlass variant="clear" className="col-span-2 row-span-2 grid aspect-square grid-cols-2 place-items-center gap-2 rounded-panel p-3">
        {connectivity.slice(0, 4).map((toggle) => (
          <RoundToggle key={toggle.id} toggle={toggle} onToggle={onToggle} className="size-14" />
        ))}
      </LiquidGlass>

      {media && <MediaTile media={media} className="col-span-2 row-span-2" />}

      {focus && FocusIcon && (
        <ToggleButton
          defaultSelected={focus.defaultSelected}
          onChange={(selected) => onToggle?.(focus.id, selected)}
          className={({ isSelected }) =>
            cx("glass-rim relative isolate col-span-2 flex cursor-pointer items-center gap-3 rounded-full px-3 transition-colors motion-reduce:transition-none", isSelected ? "bg-accent-600 text-on-action" : "text-on-glass", focusRing)
          }
        >
          {({ isSelected }) => (
            <>
              {!isSelected && <GlassMaterial variant="clear" />}
              <FocusIcon aria-hidden className="size-6 shrink-0" />
              <span className="min-w-0 text-start">
                <span className="block truncate text-body-sm-strong">{focus.label}</span>
                {focus.detail && <span className="block truncate text-caption">{focus.detail}</span>}
              </span>
            </>
          )}
        </ToggleButton>
      )}

      {brightness && <TallSlider config={brightness} className="row-span-2" />}
      {volume && <TallSlider config={volume} className="row-span-2" />}

      {shortcuts.slice(0, 2).map((toggle) => (
        <RoundToggle key={toggle.id} toggle={toggle} onToggle={onToggle} className="glass-clear aspect-square w-full" />
      ))}
    </section>
  );
}

/** Lays clear glass over a picture with the dimming layer it needs. */
export function GlassBackdrop({ image, className, children }: { image: string; className?: string; children: ReactNode }) {
  return (
    <div className={cx("relative isolate overflow-hidden", className)} style={{ background: image }}>
      <span aria-hidden className="absolute inset-0 -z-10 bg-glass-dim" />
      {children}
    </div>
  );
}
