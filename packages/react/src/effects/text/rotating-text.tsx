"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { easing, effectDuration, layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * RotatingText: a word in a sentence that cycles through alternatives
 * ("Design for *teams*, *makers*, *agencies*"). The old word lifts away, the new
 * one rises in, and the slot eases to the new word's width so the sentence
 * doesn't jump.
 *
 * Changing text every few seconds would be noise to a screen reader, so it
 * hears the whole list once instead. With reduced motion the first word stays.
 */

export interface RotatingTextProps {
  words: string[];
  /** Seconds each word stays. */
  interval?: number;
  className?: string;
}

export function RotatingText({ words, interval = effectDuration.sweep, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const calm = useCalmMotion();

  useEffect(() => {
    if (calm || words.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval * 1000);
    return () => clearInterval(id);
  }, [calm, words.length, interval]);

  return (
    <span className={cx("inline-flex", className)}>
      <VisuallyHidden>{words.join(", ")}</VisuallyHidden>
      <motion.span aria-hidden layout transition={layoutSpring} className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[index]}
            className="inline-block whitespace-nowrap"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: effectDuration.reveal, ease: easing.enter }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
}
