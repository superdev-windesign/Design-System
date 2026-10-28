"use client";

import { motion, useReducedMotion } from "motion/react";
import { easing } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Generated Image: a stand-in for model output. A prompt deterministically
 * becomes layered gradients in the chart palette, so demos and loading
 * states look like distinct images without bundling or fetching any.
 * While `progress` is set, the art resolves from a blur behind a shimmer.
 * Pass `src` to show a real image in the same frame.
 */

export type AspectRatio = "1:1" | "3:2" | "2:3" | "16:9";

const RATIO: Record<AspectRatio, string> = { "1:1": "aspect-square", "3:2": "aspect-3/2", "2:3": "aspect-2/3", "16:9": "aspect-video" };

function hash(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Background layers for a prompt: three soft blobs over a two-colour wash. */
export function promptArt(prompt: string) {
  let h = hash(prompt);
  const next = () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return h / 4294967296;
  };
  const hue = () => `var(--ds-color-chart-${1 + Math.floor(next() * 9)})`;
  const blobs = Array.from({ length: 3 }, () => {
    const x = Math.round(next() * 100);
    const y = Math.round(next() * 100);
    const size = 35 + Math.round(next() * 40);
    return `radial-gradient(circle at ${x}% ${y}%, ${hue()} 0%, transparent ${size}%)`;
  });
  const angle = Math.round(next() * 360);
  return [...blobs, `linear-gradient(${angle}deg, ${hue()}, ${hue()})`].join(", ");
}

export interface GeneratedImageProps {
  prompt: string;
  aspect?: AspectRatio;
  /** 0–1 while generating. */
  progress?: number;
  /** A real image; the prompt art shows until it loads. */
  src?: string;
  className?: string;
}

export function GeneratedImage({ prompt, aspect = "1:1", progress, src, className }: GeneratedImageProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const generating = progress !== undefined && progress < 1;
  return (
    <figure className={cx("relative overflow-hidden rounded-xl bg-muted", RATIO[aspect], className)}>
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: promptArt(prompt) }}
        initial={false}
        animate={{ filter: generating ? `blur(${Math.round(24 * (1 - (progress ?? 0)))}px) saturate(0.6)` : "blur(0px) saturate(1)", scale: generating ? 1.1 : 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: easing.enter }}
      />
      {src && <img src={src} alt="" className="absolute inset-0 size-full object-cover" />}
      {generating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-scrim/20">
          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-caption-strong text-fg tabular-nums shadow-raised">
            Generating {Math.round((progress ?? 0) * 100)}%
          </span>
        </div>
      )}
      <figcaption className="sr-only">{generating ? `Generating: ${prompt}` : prompt}</figcaption>
    </figure>
  );
}
