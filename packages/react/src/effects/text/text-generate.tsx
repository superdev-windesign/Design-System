"use client";

import { useRef } from "react";
import type { ElementType } from "react";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { cx } from "../../utils/cx";
import { useOnScreen } from "../shared";

/**
 * TextGenerate: words arrive one by one, each fading up out of a soft blur, the
 * way a generated answer streams in. It starts when the text scrolls into view.
 *
 * The whole sentence is in the accessibility tree from the start, so a screen
 * reader doesn't wait for the animation. With reduced motion the text is simply
 * there.
 */

export interface TextGenerateProps {
  text: string;
  /** Seconds between one word and the next. */
  stagger?: number;
  /** Wait for the text to scroll into view before starting. */
  startOnView?: boolean;
  as?: ElementType;
  className?: string;
}

export function TextGenerate({ text, stagger = 0.06, startOnView = true, as: Tag = "p", className }: TextGenerateProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useRef(false);
  const onScreen = useOnScreen(ref, "0px");
  if (onScreen) seen.current = true;
  const run = !startOnView || seen.current;
  const words = text.split(/(\s+)/);

  return (
    <Tag ref={ref} className={className}>
      <VisuallyHidden>{text}</VisuallyHidden>
      <span aria-hidden className={cx(!run && "invisible")}>
        {words.map((word, i) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span key={i} className={cx("inline-block", run && "animate-word-in")} style={{ animationDelay: `${(i / 2) * stagger}s` }}>
              {word}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
