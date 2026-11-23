"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Plumbing for the effects in this folder.
 *
 * Canvas can't read CSS variables, so `resolveColor` turns a token reference into
 * the colour it resolves to *at that element*, in its theme and brand. Effects
 * re-resolve whenever the theme, brand or accent changes (`useThemeVersion`).
 *
 * Every animated effect respects reduced motion: it draws one still frame, or
 * shows its end state, and stops. Loops also pause while off screen or in a
 * hidden tab, so a page full of effects costs nothing it isn't showing.
 */

/** The decorative palette effects draw with (color.effect.1–5, set per brand and theme), then the accent. */
export const EFFECT_PALETTE = [
  "var(--ds-color-effect-1)",
  "var(--ds-color-effect-2)",
  "var(--ds-color-effect-3)",
  "var(--ds-color-effect-4)",
  "var(--ds-color-effect-5)",
  "var(--ds-color-accent-500)",
] as const;

/** True when the person asked for less motion. */
export function useCalmMotion(): boolean {
  return useReducedMotion() ?? false;
}

/** The computed colour a CSS colour value resolves to inside `el`. */
export function resolveColor(el: Element, color: string): string {
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = color;
  // A canvas's children are fallback content, so probe beside it instead.
  const host = el instanceof HTMLCanvasElement ? (el.parentElement ?? el) : el;
  host.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value || color;
}

/** Bumps whenever the theme, brand or accent changes on the root. */
export function useThemeVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => setVersion((v) => v + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-brand", "style"] });
    return () => observer.disconnect();
  }, []);
  return version;
}

/** Whether `ref` is on screen. Defaults to true where IntersectionObserver is missing. */
export function useOnScreen(ref: RefObject<Element | null>, margin = "64px"): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), { rootMargin: margin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);
  return visible;
}

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D;
  /** CSS pixels. */
  width: number;
  height: number;
  /** Seconds since the effect started. */
  time: number;
  /** Seconds since the last frame, capped so a backgrounded tab doesn't jump. */
  dt: number;
  /** `colors`, resolved for the canvas's theme and brand. */
  colors: string[];
  /** True on the single still frame drawn for reduced motion. */
  still: boolean;
  /** True on the first frame after a resize or theme change: rebuild anything sized or coloured. */
  reset: boolean;
}

export interface CanvasEffectOptions {
  /** Token colours to resolve, available as `frame.colors`. */
  colors?: readonly string[];
  /** False draws once (and again on resize or theme change) instead of looping. */
  animate?: boolean;
}

/**
 * Runs `draw` on a canvas that fills its parent, at device resolution. Returns
 * the ref for the canvas. `draw` may change between renders without restarting
 * the loop.
 */
export function useCanvasEffect(draw: (frame: CanvasFrame) => void, { colors = [], animate = true }: CanvasEffectOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const calm = useCalmMotion();
  const theme = useThemeVersion();
  const onScreen = useOnScreen(canvasRef);
  const colorKey = colors.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let reset = true;
    let resolved = colorKey ? colorKey.split("|").map((c) => resolveColor(canvas, c)) : [];
    const start = performance.now();
    let last = start;
    let raf = 0;

    const frame = (now: number, still: boolean) => {
      // A frame's timestamp can predate the effect's start by a hair; never let time run backwards.
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (!width || !height) return;
      ctx.save();
      drawRef.current({ ctx, width, height, time: Math.max(0, (now - start) / 1000), dt, colors: resolved, still, reset });
      ctx.restore();
      reset = false;
    };

    const size = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = box.width;
      height = box.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resolved = colorKey ? colorKey.split("|").map((c) => resolveColor(canvas, c)) : [];
      reset = true;
      if (calm || !animate) frame(performance.now(), calm);
    };

    size();
    const observer = new ResizeObserver(size);
    observer.observe(canvas);

    const loop = (now: number) => {
      if (!document.hidden) frame(now, false);
      raf = requestAnimationFrame(loop);
    };
    if (!calm && animate && onScreen) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [calm, animate, onScreen, theme, colorKey]);

  return canvasRef;
}

/** Pointer position inside `ref`, kept in a ref so following the pointer never re-renders. */
export function usePointer(ref: RefObject<HTMLElement | null>) {
  const pointer = useRef({ x: -9999, y: -9999, inside: false, down: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      pointer.current.x = event.clientX - box.left;
      pointer.current.y = event.clientY - box.top;
      pointer.current.inside = true;
    };
    const leave = () => {
      pointer.current.inside = false;
      pointer.current.down = false;
    };
    const down = () => (pointer.current.down = true);
    const up = () => (pointer.current.down = false);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
  return pointer;
}

/** A small seeded random generator, so effects lay out the same on every render. */
export function seeded(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** `color` at `alpha` opacity, for inline CSS (canvas code sets `globalAlpha` instead). */
export const withAlpha = (color: string, alpha: number) => `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`;
