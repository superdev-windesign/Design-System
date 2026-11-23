import type { CSSProperties } from "react";
import { cx } from "../../utils/cx";

/**
 * ProgressiveBlur: blur that deepens toward an edge, laid over the end of a
 * scrolling list or a photo so content softens away instead of being cut off by
 * a hard line. Four stacked layers each blur a little more, and each is masked
 * to its own band. Place it inside a positioned container; size it with
 * `className` (an `h-*` for top and bottom edges).
 */

export interface ProgressiveBlurProps {
  position?: "top" | "bottom";
  className?: string;
}

export function ProgressiveBlur({ position = "bottom", className }: ProgressiveBlurProps) {
  return (
    <div
      aria-hidden
      style={{ "--pb-dir": position === "top" ? "to top" : "to bottom" } as CSSProperties}
      className={cx("progressive-blur absolute inset-x-0 h-24", position === "top" ? "top-0" : "bottom-0", className)}
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
