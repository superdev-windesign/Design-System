"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * FocusCards: a gallery where pointing at one card (or tabbing to it) brings it
 * forward and lets the others soften and blur, so the eye lands where the hand
 * is. Each card is a link. The blur is only a hint: every card stays readable
 * and reachable, and with reduced motion the change is instant.
 */

export interface FocusCardItem {
  title: string;
  href: string;
  media: ReactNode;
}

export interface FocusCardsProps {
  items: FocusCardItem[];
  className?: string;
}

export function FocusCards({ items, className }: FocusCardsProps) {
  const [focused, setFocused] = useState<number | null>(null);
  return (
    <ul className={cx("grid grid-cols-1 gap-4 sm:grid-cols-3", className)} onPointerLeave={() => setFocused(null)}>
      {items.map((item, i) => (
        <li key={item.title}>
          <a
            href={item.href}
            onPointerEnter={() => setFocused(i)}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(null)}
            className={cx(
              "relative block h-48 overflow-hidden rounded-surface transition-[filter,opacity,scale] duration-(--ds-motion-duration-slow) ease-out motion-reduce:transition-none",
              focused !== null && focused !== i && "scale-98 opacity-60 blur-soft",
              focusRingNative,
            )}
          >
            <span aria-hidden className="absolute inset-0">
              {item.media}
            </span>
            <span
              className={cx(
                "absolute inset-x-0 bottom-0 bg-scrim px-4 py-3 text-body-md-strong text-on-action transition-opacity duration-(--ds-motion-duration-slow)",
                focused === i ? "opacity-100" : "opacity-90",
              )}
            >
              {item.title}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
