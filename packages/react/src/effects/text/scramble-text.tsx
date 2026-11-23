"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { cx } from "../../utils/cx";
import { useCalmMotion, useOnScreen } from "../shared";

/**
 * ScrambleText: random glyphs settle, left to right, into the real text. It can
 * run on mount, when the text scrolls into view, or each time it's hovered or
 * focused. The text is the element's accessible name throughout, so nothing
 * reads the noise aloud.
 */

export type ScrambleTrigger = "mount" | "view" | "hover";

export interface ScrambleTextProps {
  text: string;
  trigger?: ScrambleTrigger;
  /** Glyphs used for the noise. */
  glyphs?: string;
  /** Frames each character spends scrambling before it settles. */
  settleFrames?: number;
  as?: ElementType;
  className?: string;
}

const DEFAULT_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

export function ScrambleText({ text, trigger = "view", glyphs = DEFAULT_GLYPHS, settleFrames = 3, as: Tag = "span", className }: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(text);
  const raf = useRef(0);
  const calm = useCalmMotion();
  const onScreen = useOnScreen(ref, "0px");
  const played = useRef(false);

  const play = useCallback(() => {
    if (calm) return setShown(text);
    cancelAnimationFrame(raf.current);
    let frame = 0;
    const tick = () => {
      frame++;
      const settled = Math.floor(frame / settleFrames);
      setShown(
        [...text]
          .map((char, i) => (i < settled || char === " " ? char : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join(""),
      );
      if (settled < text.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [calm, glyphs, settleFrames, text]);

  useEffect(() => {
    if (trigger === "mount") play();
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, play]);

  useEffect(() => {
    if (trigger === "view" && onScreen && !played.current) {
      played.current = true;
      play();
    }
  }, [trigger, onScreen, play]);

  useEffect(() => setShown(text), [text]);

  const hover = trigger === "hover" ? { onPointerEnter: play, onFocus: play } : {};

  return (
    <Tag ref={ref} aria-label={text} className={cx("inline-block whitespace-pre", className)} {...hover}>
      <span aria-hidden>{shown}</span>
    </Tag>
  );
}
