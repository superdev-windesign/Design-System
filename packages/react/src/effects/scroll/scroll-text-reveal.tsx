"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ScrollTextReveal: a statement whose words light up one after another as you
 * scroll through it, from faint to full ink, so reading and scrolling move
 * together. The words are ordinary text the whole time; only their opacity
 * changes. With reduced motion it's simply full strength.
 */

export interface ScrollTextRevealProps {
  text: string;
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
}

function Word({ word, progress, from, to }: { word: string; progress: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(progress, [from, to], [0.18, 1]);
  return <motion.span style={{ opacity }}>{word}</motion.span>;
}

export function ScrollTextReveal({ text, scrollRef, className }: ScrollTextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const calm = useCalmMotion();
  const { scrollYProgress } = useScroll({ target: ref, container: scrollRef, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cx("text-display-sm text-fg", className)}>
      {words.map((word, i) => (
        <span key={i}>
          {calm ? word : <Word word={word} progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length} />}{" "}
        </span>
      ))}
    </p>
  );
}
