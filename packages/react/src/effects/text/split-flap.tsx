"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * SplitFlap: a departures-board display. When `text` changes, each cell flips
 * through the alphabet until it reaches its new character, so the board ripples
 * as it settles. Cells further along start a beat later.
 *
 * The board is named with the current text and its cells are hidden, so a
 * screen reader reads one word, not every flip. With reduced motion cells
 * change at once.
 */

export interface SplitFlapProps {
  text: string;
  /** Cells on the board; shorter text is padded with blanks. Defaults to the text's length. */
  length?: number;
  /** The order cells flip through. */
  alphabet?: string;
  className?: string;
}

const DEFAULT_ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-";

function Cell({ target, alphabet, delay }: { target: string; alphabet: string; delay: number }) {
  const [char, setChar] = useState(target);
  const calm = useCalmMotion();
  const current = useRef(target);

  useEffect(() => {
    if (calm || !alphabet.includes(target)) {
      current.current = target;
      return setChar(target);
    }
    let timer = setTimeout(function step() {
      const at = alphabet.indexOf(current.current);
      const next = alphabet[(Math.max(0, at) + 1) % alphabet.length]!;
      current.current = next;
      setChar(next);
      if (next !== target) timer = setTimeout(step, 45);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, alphabet, delay, calm]);

  return (
    <span className="relative flex h-10 w-7 items-center justify-center overflow-hidden rounded-xs bg-fg font-mono text-title-sm-strong text-canvas shadow-raised perspective-distant">
      <span key={char} className="animate-flap">
        {char === " " ? " " : char}
      </span>
      {/* The hinge across the middle. */}
      <span aria-hidden className="absolute inset-x-0 top-1/2 border-t border-canvas opacity-40" />
    </span>
  );
}

export function SplitFlap({ text, length, alphabet = DEFAULT_ALPHABET, className }: SplitFlapProps) {
  const upper = text.toUpperCase();
  const cells = [...upper.padEnd(length ?? upper.length, " ")];
  return (
    <span role="img" aria-label={text} className={cx("inline-flex gap-1", className)}>
      {cells.map((c, i) => (
        <Cell key={i} target={c} alphabet={alphabet} delay={i * 40} />
      ))}
    </span>
  );
}
