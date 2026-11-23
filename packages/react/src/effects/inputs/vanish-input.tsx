"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Input as AriaInput, TextField } from "react-aria-components";
import { RiArrowUpLine } from "@remixicon/react";
import { easing, effectDuration } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * VanishInput: a prompt field that suggests what to ask, cycling its
 * placeholder through examples, and on submit lets the text dissolve into
 * drifting specks rather than just vanish. The specks are drawn from the text's
 * own pixels on a canvas over the field.
 *
 * It's a labelled text field with a submit button; the visual is extra. With
 * reduced motion the placeholder stays on the first example and the text
 * clears plainly.
 */

export interface VanishInputProps {
  "aria-label": string;
  placeholders: string[];
  onSubmit: (value: string) => void;
  submitLabel?: string;
  className?: string;
}

type Speck = { x: number; y: number; vx: number; vy: number; r: number; life: number; color: string };

export function VanishInput({ "aria-label": label, placeholders, onSubmit, submitLabel = "Send", className }: VanishInputProps) {
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const [vanishing, setVanishing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const calm = useCalmMotion();

  useEffect(() => {
    if (calm || value || placeholders.length < 2) return;
    const id = setInterval(() => setHint((i) => (i + 1) % placeholders.length), effectDuration.sweep * 1000);
    return () => clearInterval(id);
  }, [calm, value, placeholders.length]);

  const dissolve = (text: string) => {
    const field = input.current;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!field || !c || !ctx) return;
    const box = c.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = box.width * dpr;
    c.height = box.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const style = getComputedStyle(field);
    const left = field.getBoundingClientRect().left - box.left + parseFloat(style.paddingLeft);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, left, box.height / 2);

    // Sample the drawn text every couple of pixels; each lit sample becomes a speck.
    const pixels = ctx.getImageData(0, 0, c.width, c.height).data;
    const specks: Speck[] = [];
    const step = Math.round(2 * dpr);
    for (let y = 0; y < c.height; y += step) {
      for (let x = 0; x < c.width; x += step) {
        const i = (y * c.width + x) * 4;
        if (pixels[i + 3]! > 128) {
          specks.push({ x: x / dpr, y: y / dpr, vx: 0.6 + Math.random() * 1.8, vy: (Math.random() - 0.5) * 1.4, r: 1, life: 1, color: style.color });
        }
      }
    }
    setVanishing(true);
    const width = box.width;
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, box.width, box.height);
      let alive = 0;
      for (const s of specks) {
        // Specks further right go first, so the text burns away from its end.
        if (s.x > width * (1 - (1 - s.life) * 3) || s.life < 1) {
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.02 + Math.random() * 0.02;
        }
        if (s.life <= 0) continue;
        alive++;
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      if (alive) raf = requestAnimationFrame(tick);
      else {
        ctx.clearRect(0, 0, box.width, box.height);
        setVanishing(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || vanishing) return;
    if (!calm) dissolve(value);
    setValue("");
    onSubmit(text);
  };

  return (
    <form onSubmit={submit} className={cx("relative w-full max-w-md", className)}>
      <TextField aria-label={label} value={value} onChange={setValue} className="relative">
        <AriaInput
          ref={input}
          className={cx(
            "h-12 w-full rounded-full border border-line-control bg-surface ps-5 pe-14 text-body-md text-fg shadow-raised transition-colors",
            "data-[hovered]:border-line-control-hover",
            vanishing && "text-transparent",
            focusRing,
          )}
        />
      </TextField>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      {!value && !vanishing && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 start-5 end-14 flex items-center overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={hint}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3, ease: easing.enter }}
              className="truncate text-body-md text-fg-placeholder"
            >
              {placeholders[hint]}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
      <button
        type="submit"
        aria-label={submitLabel}
        disabled={!value.trim()}
        className={cx(
          "absolute end-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-fg text-canvas transition-opacity disabled:cursor-not-allowed disabled:opacity-30",
          focusRing,
        )}
      >
        <RiArrowUpLine aria-hidden className="size-4" />
      </button>
    </form>
  );
}
