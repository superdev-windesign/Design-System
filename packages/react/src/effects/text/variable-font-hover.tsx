"use client";

import { useEffect, useRef } from "react";
import type { ElementType } from "react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * VariableFontHover: letters thicken as the pointer nears them and thin out as
 * it leaves, using the variable font's weight axis, so a heading seems to swell
 * under the cursor. Every brand's fonts are variable, so it works in each.
 *
 * Letters are updated straight on the DOM, so following the pointer never
 * re-renders. The heading's text is its accessible name; with reduced motion,
 * or on touch, it stays at the resting weight.
 */

export interface VariableFontHoverProps {
  text: string;
  /** Resting and peak weights. */
  from?: number;
  to?: number;
  /** How far, in pixels, the pointer's influence reaches. */
  radius?: number;
  as?: ElementType;
  className?: string;
}

export function VariableFontHover({ text, from = 300, to = 800, radius = 120, as: Tag = "span", className }: VariableFontHoverProps) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalmMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || calm) return;
    const letters = [...el.querySelectorAll<HTMLElement>("[data-letter]")];
    let raf = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        for (const letter of letters) {
          const box = letter.getBoundingClientRect();
          const d = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2));
          const t = Math.max(0, 1 - d / radius);
          letter.style.fontVariationSettings = `"wght" ${Math.round(from + (to - from) * t * t)}`;
        }
      });
    };
    const move = (e: PointerEvent) => e.pointerType === "mouse" && set(e.clientX, e.clientY);
    const leave = () => set(-1e4, -1e4);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [calm, from, to, radius]);

  return (
    <Tag ref={ref} aria-label={text} className={cx("inline-block", className)} style={{ fontVariationSettings: `"wght" ${from}` }}>
      {[...text].map((char, i) => (
        <span
          key={i}
          aria-hidden
          data-letter
          className="inline-block whitespace-pre transition-[font-variation-settings] duration-(--ds-motion-duration-base) ease-out"
          style={{ fontVariationSettings: `"wght" ${from}` }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
