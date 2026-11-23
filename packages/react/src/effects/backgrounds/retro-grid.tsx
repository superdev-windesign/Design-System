import type { CSSProperties } from "react";
import { cx } from "../../utils/cx";

/**
 * RetroGrid: a floor of grid lines stretching to the horizon and rolling toward
 * you, synthwave style, fading out into the page at the top. It fills its
 * positioned parent. `tone="accent"` draws the lines in the accent. Decorative;
 * with reduced motion the floor holds still.
 */

export interface RetroGridProps {
  tone?: "line" | "accent";
  className?: string;
}

export function RetroGrid({ tone = "line", className }: RetroGridProps) {
  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0 overflow-hidden perspective-near", className)}>
      <div className="absolute inset-0 rotate-x-65">
        <div
          className="retro-grid absolute -inset-full"
          style={tone === "accent" ? ({ "--grid-line": "var(--ds-color-accent-500)" } as CSSProperties) : undefined}
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-transparent via-transparent to-canvas to-90%" />
    </div>
  );
}
