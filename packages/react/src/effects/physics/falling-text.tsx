"use client";

import { useRef, useState } from "react";
import { RiArrowGoBackLine, RiArrowDownLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";
import { usePhysicsBodies } from "./use-physics-bodies";

/**
 * FallingText: a sentence whose words come loose and tumble to the bottom of
 * the box when you press "Drop", then can be thrown about. `highlight` picks
 * words to set in the accent. The words never leave the document, so the
 * sentence still reads in order to assistive tech. With reduced motion the
 * button is hidden and the text stays put.
 */

export interface FallingTextProps {
  text: string;
  highlight?: string[];
  className?: string;
}

export function FallingText({ text, highlight = [], className }: FallingTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dropped, setDropped] = useState(false);
  const [run, setRun] = useState(0);
  const calm = useCalmMotion();
  usePhysicsBodies(ref, dropped && !calm);
  const marked = new Set(highlight.map((w) => w.toLowerCase()));

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div ref={ref} key={run} className="relative flex h-64 flex-wrap content-start gap-x-2 gap-y-1 overflow-hidden rounded-surface border border-line bg-surface p-5">
        {text.split(" ").map((word, i) => (
          <span
            key={i}
            data-body
            className={cx(
              "cursor-grab touch-none text-title-lg-strong select-none active:cursor-grabbing",
              marked.has(word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")) ? "text-accent-600" : "text-fg",
            )}
          >
            {word}
          </span>
        ))}
      </div>
      {!calm && (
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={dropped ? RiArrowGoBackLine : RiArrowDownLine}
          className="self-start"
          onPress={() => {
            if (dropped) setRun((r) => r + 1);
            setDropped(!dropped);
          }}
        >
          {dropped ? "Put the words back" : "Drop"}
        </Button>
      )}
    </div>
  );
}
