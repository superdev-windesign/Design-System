"use client";

import { useEffect, useId, useState, type HTMLAttributes, type Ref } from "react";
import { cx } from "../../utils/cx";

/**
 * Liquid Glass: the material the floating controls layer is made of. It blurs
 * and saturates what's behind it, carries a lit edge, and, where the browser
 * allows, bends the backdrop near its rim the way a thick lens would.
 *
 * Glass belongs to controls and navigation floating above content, not to the
 * content itself, and it should be used sparingly: a tab bar, a toolbar, a menu.
 * Use `regular` almost everywhere, and `clear` only over photos and video, on
 * top of `bg-glass-dim`.
 *
 * Everything here reads tokens, so in a brand without real glass this is just a
 * solid raised surface. Refraction needs an SVG filter as a backdrop filter,
 * which only Chromium-based browsers support; elsewhere the material keeps its
 * blur and rim and simply doesn't bend.
 */

export type GlassVariant = "regular" | "clear";

interface RefractionOptions {
  /** How far in from the edge the surface curves, in px. */
  bezel: number;
  /** How thick the glass is, in px. Thicker bends more. */
  depth: number;
}

interface RefractionFilter {
  id: string;
  map: string;
  width: number;
  height: number;
  scale: number;
}

const REFRACTIVE_INDEX = 1.5;
const SAMPLES = 128;

/** The edge's height across the bezel: a squircle, which meets the flat top smoothly. */
const surface = (t: number) => (1 - (1 - t) ** 4) ** 0.25;

/**
 * How far a straight-down ray is displaced at each point across the bezel, by
 * Snell's law: it hits the curved surface at an angle, bends, and travels on
 * through the glass to the backdrop.
 */
export function refractionProfile({ bezel, depth }: RefractionOptions) {
  const table = new Float32Array(SAMPLES);
  const step = 0.001;
  for (let i = 0; i < SAMPLES; i += 1) {
    const t = (i + 0.5) / SAMPLES;
    const slope = ((surface(Math.min(t + step, 1)) - surface(Math.max(t - step, 0))) / (2 * step)) * (depth / bezel);
    const incidence = Math.atan(Math.abs(slope));
    const refracted = Math.asin(Math.sin(incidence) / REFRACTIVE_INDEX);
    table[i] = (surface(t) * depth + depth / 2) * Math.tan(incidence - refracted);
  }
  return table;
}

/** Distance in from a rounded rectangle's edge, and the direction pointing inward. */
export function roundedRectInset(x: number, y: number, width: number, height: number, radius: number) {
  const qx = Math.abs(x - width / 2) - (width / 2 - radius);
  const qy = Math.abs(y - height / 2) - (height / 2 - radius);
  const signX = x < width / 2 ? 1 : -1;
  const signY = y < height / 2 ? 1 : -1;
  if (qx > 0 && qy > 0) {
    const length = Math.hypot(qx, qy) || 1;
    return { distance: radius - length, nx: (signX * qx) / length, ny: (signY * qy) / length };
  }
  const edgeNearest = Math.max(qx, qy);
  return { distance: radius - edgeNearest, nx: qx >= qy ? signX : 0, ny: qx >= qy ? 0 : signY };
}

const maps = new Map<string, { map: string; scale: number }>();

/** Draws the displacement map: red pushes sideways, green up and down, 128 leaves a pixel alone. */
function displacementMap(width: number, height: number, radius: number, options: RefractionOptions) {
  const key = [width, height, radius, options.bezel, options.depth].join("/");
  const cached = maps.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const profile = refractionProfile(options);
  const strongest = Math.max(...profile);
  const image = context.createImageData(width, height);
  const { data } = image;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const { distance, nx, ny } = roundedRectInset(x + 0.5, y + 0.5, width, height, radius);
      const inBezel = distance > 0 && distance < options.bezel;
      const strength = inBezel ? profile[Math.min(SAMPLES - 1, Math.floor((distance / options.bezel) * SAMPLES))]! / strongest : 0;
      data[offset] = 128 + 127 * strength * nx;
      data[offset + 1] = 128 + 127 * strength * ny;
      data[offset + 2] = 128;
      data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  // feDisplacementMap moves a pixel by scale × (channel − 0.5), so full strength needs twice the distance.
  const result = { map: canvas.toDataURL("image/png"), scale: strongest * 2 };
  if (maps.size > 40) maps.delete(maps.keys().next().value!);
  maps.set(key, result);
  return result;
}

const browserRefracts = () => typeof navigator !== "undefined" && /Chrome\/\d/.test(navigator.userAgent);

/** Builds a filter fitted to an element, and rebuilds it when its size or the brand changes. */
function useRefraction(element: HTMLElement | null, options: RefractionOptions, enabled: boolean) {
  const baseId = useId();
  const [filter, setFilter] = useState<RefractionFilter | null>(null);
  const { bezel, depth } = options;

  useEffect(() => {
    if (!element || !enabled || !browserRefracts() || typeof ResizeObserver === "undefined") {
      setFilter(null);
      return;
    }
    const measure = () => {
      const style = getComputedStyle(element);
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (style.getPropertyValue("--ds-effect-glass-refraction").trim() !== "1" || !width || !height) {
        setFilter(null);
        return;
      }
      const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, width / 2, height / 2);
      const built = displacementMap(width, height, radius, { bezel, depth });
      if (!built) return;
      const id = `glass-${baseId.replace(/[^a-z0-9]/gi, "")}-${width}-${height}`;
      setFilter({ id, width, height, ...built });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const brand = new MutationObserver(measure);
    brand.observe(document.documentElement, { attributes: true, attributeFilter: ["data-brand"] });
    return () => {
      resize.disconnect();
      brand.disconnect();
    };
  }, [element, enabled, bezel, depth, baseId]);

  return filter;
}

export interface GlassMaterialProps extends Partial<RefractionOptions> {
  variant?: GlassVariant;
  /** Bend the backdrop near the edge. Keep this to small pieces: bars, knobs, buttons. */
  refract?: boolean;
  className?: string;
}

/**
 * The material on its own, filling its parent. Use it when the host has to be
 * something specific, like a button: give the host `relative isolate` and a
 * radius, and put this inside it. The host's content sits on top.
 */
export function GlassMaterial({ variant = "regular", refract = false, bezel = 16, depth = 16, className }: GlassMaterialProps) {
  const [element, setElement] = useState<HTMLSpanElement | null>(null);
  const filter = useRefraction(element, { bezel, depth }, refract);
  // The blur has to come first: Chrome drops filters that follow a url() here.
  const backdrop = filter ? `var(--ds-effect-glass-${variant === "regular" ? "lens" : "clear"}) url(#${filter.id})` : undefined;

  return (
    <>
      <span
        ref={setElement}
        aria-hidden
        data-refracting={filter ? "" : undefined}
        className={cx("pointer-events-none absolute inset-0 -z-10 rounded-inherit", variant === "regular" ? "glass" : "glass-clear", className)}
        style={backdrop ? { backdropFilter: backdrop, WebkitBackdropFilter: backdrop } : undefined}
      />
      {filter && (
        <svg aria-hidden width="0" height="0" className="pointer-events-none absolute" colorInterpolationFilters="sRGB">
          <filter id={filter.id} x="0" y="0" width={filter.width} height={filter.height} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
            <feImage href={filter.map} x="0" y="0" width={filter.width} height={filter.height} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={filter.scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </>
  );
}

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement>, GlassMaterialProps {
  ref?: Ref<HTMLDivElement>;
}

/** A piece of glass. Size and round it with `className`; its children sit on top. */
export function LiquidGlass({ variant, refract, bezel, depth, className, children, ref, ...props }: LiquidGlassProps) {
  return (
    <div ref={ref} className={cx("glass-rim relative isolate", className)} {...props}>
      <GlassMaterial variant={variant} refract={refract} bezel={bezel} depth={depth} />
      {children}
    </div>
  );
}
