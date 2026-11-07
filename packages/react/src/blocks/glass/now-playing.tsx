"use client";

import { useEffect, useState } from "react";
import { Button as AriaButton, Slider, SliderThumb, SliderTrack } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { RiPauseFill, RiPlayFill, RiSkipBackFill, RiSkipForwardFill, RiVolumeDownFill, RiVolumeUpFill } from "@remixicon/react";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { GlassBackdrop } from "./control-center";
import { GlassMaterial, LiquidGlass } from "./liquid-glass";

/**
 * Now playing: a player for a queue of tracks. The `full` card glows with its
 * artwork, which eases forward while playing, and the `mini` capsule fits a tab
 * bar's accessory slot. The scrubber is a quiet line until you grab it, when
 * its knob turns into a piece of glass.
 *
 * It keeps its own clock and plays no audio: wire `onPositionChange` and
 * `onPlayingChange` to a real player.
 */

export interface NowPlayingTrack {
  id: string;
  title: string;
  artist: string;
  /** CSS background for the artwork. */
  artwork: string;
  /** Length in seconds. */
  duration: number;
}

export interface NowPlayingProps {
  queue: NowPlayingTrack[];
  variant?: "full" | "mini";
  defaultIndex?: number;
  defaultPlaying?: boolean;
  onTrackChange?: (track: NowPlayingTrack) => void;
  onPlayingChange?: (playing: boolean) => void;
  onPositionChange?: (seconds: number) => void;
  className?: string;
}

/** 83 → "1:23". */
export function formatTrackTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

const ROUND = cx("flex cursor-pointer items-center justify-center rounded-full transition-[scale] data-[pressed]:scale-90 motion-reduce:transition-none", focusRing);

export function NowPlaying({ queue, variant = "full", defaultIndex = 0, defaultPlaying = false, onTrackChange, onPlayingChange, onPositionChange, className }: NowPlayingProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState(defaultIndex);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(defaultPlaying);
  const [volume, setVolume] = useState(60);
  const track = queue[index] ?? queue[0];

  const go = (next: number) => {
    const wrapped = (next + queue.length) % queue.length;
    setIndex(wrapped);
    setPosition(0);
    const nextTrack = queue[wrapped];
    if (nextTrack) onTrackChange?.(nextTrack);
  };

  useEffect(() => {
    if (!playing || !track) return;
    const timer = setInterval(() => setPosition((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [playing, track]);

  // Roll on to the next track at the end, outside the state update that noticed it.
  useEffect(() => {
    if (track && position >= track.duration) go(index + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  if (!track) return null;

  const toggle = () => {
    setPlaying(!playing);
    onPlayingChange?.(!playing);
  };
  const PlayIcon = playing ? RiPauseFill : RiPlayFill;

  if (variant === "mini") {
    return (
      <LiquidGlass refract aria-label="Now playing" role="group" className={cx("flex h-14 min-w-0 items-center gap-2 rounded-full ps-2 pe-1 text-fg", className)}>
        <span aria-hidden className="size-10 shrink-0 rounded-full" style={{ background: track.artwork }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm-strong">{track.title}</span>
          <span className="block truncate text-caption text-fg-secondary">{track.artist}</span>
        </span>
        <AriaButton aria-label={playing ? "Pause" : "Play"} onPress={toggle} className={cx(ROUND, "size-11 shrink-0")}>
          <PlayIcon aria-hidden className="size-6" />
        </AriaButton>
        <AriaButton aria-label="Next track" onPress={() => go(index + 1)} className={cx(ROUND, "size-11 shrink-0")}>
          <RiSkipForwardFill aria-hidden className="size-5" />
        </AriaButton>
      </LiquidGlass>
    );
  }

  return (
    <GlassBackdrop image={track.artwork} className={cx("flex w-full max-w-sm flex-col gap-5 rounded-panel p-6 text-on-glass", className)}>
      <section aria-label="Now playing" className="contents">
        <motion.div
          aria-hidden
          animate={{ scale: playing || reduceMotion ? 1 : 0.86 }}
          transition={reduceMotion ? { duration: 0 } : layoutSpring}
          className="aspect-square w-full rounded-surface shadow-glass"
          style={{ background: track.artwork }}
        />

        <div className="min-w-0">
          <p className="truncate text-title-sm-strong">{track.title}</p>
          <p className="truncate text-body-md text-on-glass-secondary">{track.artist}</p>
        </div>

        <Slider
          aria-label="Position"
          minValue={0}
          maxValue={track.duration}
          value={Math.min(position, track.duration)}
          onChange={(value) => {
            setPosition(value as number);
            onPositionChange?.(value as number);
          }}
          className="flex flex-col gap-1.5"
        >
          <SliderTrack className="group relative flex h-6 cursor-pointer items-center">
            {({ state }) => (
              <>
                <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-glass-clear transition-[height] group-data-[hovered]:h-2 motion-reduce:transition-none">
                  <span aria-hidden className="absolute inset-y-0 start-0 bg-on-glass" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
                </span>
                <SliderThumb className={cx("top-1/2 cursor-grab rounded-full active:cursor-grabbing", focusRing)}>
                  {({ isDragging }) => (
                    <span className={cx("glass-rim relative isolate block rounded-full transition-[width,height,background-color] motion-reduce:transition-none", isDragging ? "h-6 w-10" : "size-3 bg-on-glass")}>
                      {isDragging && <GlassMaterial refract bezel={8} depth={8} />}
                    </span>
                  )}
                </SliderThumb>
              </>
            )}
          </SliderTrack>
          <div aria-hidden className="flex justify-between text-caption tabular-nums text-on-glass-secondary">
            <span>{formatTrackTime(position)}</span>
            <span>-{formatTrackTime(track.duration - position)}</span>
          </div>
        </Slider>

        <div className="flex items-center justify-center gap-6">
          <AriaButton aria-label="Previous track" onPress={() => go(index - 1)} className={cx(ROUND, "size-14")}>
            <RiSkipBackFill aria-hidden className="size-8" />
          </AriaButton>
          <AriaButton aria-label={playing ? "Pause" : "Play"} onPress={toggle} className={cx(ROUND, "size-16")}>
            <PlayIcon aria-hidden className="size-11" />
          </AriaButton>
          <AriaButton aria-label="Next track" onPress={() => go(index + 1)} className={cx(ROUND, "size-14")}>
            <RiSkipForwardFill aria-hidden className="size-8" />
          </AriaButton>
        </div>

        <div className="flex items-center gap-3 text-on-glass-secondary">
          <RiVolumeDownFill aria-hidden className="size-5 shrink-0" />
          <Slider aria-label="Volume" value={volume} onChange={(value) => setVolume(value as number)} className="min-w-0 flex-1">
            <SliderTrack className="relative flex h-6 cursor-pointer items-center">
              {({ state }) => (
                <>
                  <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-glass-clear">
                    <span aria-hidden className="absolute inset-y-0 start-0 bg-on-glass" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
                  </span>
                  <SliderThumb className={cx("top-1/2 size-3 cursor-grab rounded-full bg-on-glass active:cursor-grabbing", focusRing)} />
                </>
              )}
            </SliderTrack>
          </Slider>
          <RiVolumeUpFill aria-hidden className="size-5 shrink-0" />
        </div>
      </section>
    </GlassBackdrop>
  );
}
