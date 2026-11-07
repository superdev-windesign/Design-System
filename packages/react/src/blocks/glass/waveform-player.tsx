"use client";

import { useEffect, useMemo, useState } from "react";
import { Button as AriaButton, Slider, SliderThumb, SliderTrack } from "react-aria-components";
import { RiPauseFill, RiPlayFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { promptArt } from "../image-generation/generated-image";
import { formatTrackTime } from "./now-playing";

/**
 * Waveform player: a track on a pane of glass, scrubbed along its own waveform.
 * The played part of the wave is lit and the rest is quiet, so the bar is also
 * a picture of the song. The waveform is a React Aria slider, so it's reachable
 * by keyboard and reads out the time.
 */

export interface WaveformTrack {
  title: string;
  artist: string;
  /** Length in seconds. */
  duration: number;
  /** Cover art, as a CSS background. Defaults to art made from the title. */
  art?: string;
}

export interface WaveformPlayerProps {
  track: WaveformTrack;
  /** Heights of the wave, 0–1. Without them, a stable wave is made from the title. */
  peaks?: number[];
  defaultPlaying?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

/** A plausible, stable wave for a title: the same track always draws the same shape. */
export function wavePeaks(seed: string, count = 56) {
  let h = [...seed].reduce((sum, character) => Math.imul(sum ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return Array.from({ length: count }, (_, index) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const swell = Math.sin((index / count) * Math.PI) * 0.5 + 0.35;
    return Math.min(1, Math.max(0.12, swell * (0.45 + (h / 4294967296) * 0.75)));
  });
}

const ROUND = cx("flex cursor-pointer items-center justify-center rounded-full text-fg transition-[scale] data-[pressed]:scale-90 motion-reduce:transition-none", focusRing);

export function WaveformPlayer({ track, peaks, defaultPlaying = false, onPrevious, onNext, className }: WaveformPlayerProps) {
  const [playing, setPlaying] = useState(defaultPlaying);
  const [position, setPosition] = useState(0);
  const wave = useMemo(() => peaks ?? wavePeaks(track.title), [peaks, track.title]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPosition((seconds) => (seconds >= track.duration ? 0 : seconds + 1)), 1000);
    return () => clearInterval(timer);
  }, [playing, track.duration]);

  const played = track.duration ? position / track.duration : 0;

  return (
    <section aria-label={`${track.title} by ${track.artist}`} className={cx("glass-panel glass-slab flex w-full max-w-md flex-col gap-3 rounded-panel border p-4", className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden className="size-14 shrink-0 rounded-tile shadow-glass-lens" style={{ background: track.art ?? promptArt(track.title) }} />
        <div className="min-w-0">
          <h3 className="truncate text-title-sm-strong text-fg">{track.title}</h3>
          <p className="truncate text-body-sm text-fg-secondary">{track.artist}</p>
        </div>
      </div>
      <Slider aria-label="Position" minValue={0} maxValue={track.duration} value={position} onChange={setPosition} formatOptions={{ style: "unit", unit: "second" }} className="group">
        <SliderTrack className="relative flex h-12 w-full cursor-pointer items-center gap-px">
          {wave.map((peak, index) => (
            <span
              key={index}
              aria-hidden
              className={cx("min-w-px flex-1 rounded-full transition-colors duration-(--ds-motion-duration-base)", (index + 0.5) / wave.length <= played ? "bg-fg" : "bg-fg/25")}
              style={{ height: `${peak * 100}%` }}
            />
          ))}
          <SliderThumb className="top-1/2 h-full w-0.5 rounded-full bg-accent-600 group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-focus" />
        </SliderTrack>
      </Slider>
      <div className="flex items-center justify-between gap-2">
        <span className="w-12 text-caption tabular-nums text-fg-secondary">{formatTrackTime(position)}</span>
        <div className="flex items-center gap-1">
          <AriaButton aria-label="Previous" onPress={onPrevious} className={cx(ROUND, "size-10")}>
            <RiSkipBackFill aria-hidden className="size-5" />
          </AriaButton>
          <AriaButton aria-label={playing ? "Pause" : "Play"} onPress={() => setPlaying((on) => !on)} className={cx(ROUND, "glass-thick size-12")}>
            {playing ? <RiPauseFill aria-hidden className="size-6" /> : <RiPlayFill aria-hidden className="size-6" />}
          </AriaButton>
          <AriaButton aria-label="Next" onPress={onNext} className={cx(ROUND, "size-10")}>
            <RiSkipForwardFill aria-hidden className="size-5" />
          </AriaButton>
        </div>
        <span className="w-12 text-end text-caption tabular-nums text-fg-secondary">-{formatTrackTime(track.duration - position)}</span>
      </div>
    </section>
  );
}
