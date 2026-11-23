import type { ElementType, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * ShimmerText: a soft highlight sweeps across secondary text, for work in
 * progress ("Thinking…", "Generating preview…"). It's the `text-shimmer`
 * utility as a component. With reduced motion it's plain secondary text, and in
 * forced colours plain system text.
 */

export interface ShimmerTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export function ShimmerText({ children, as: Tag = "span", className }: ShimmerTextProps) {
  return <Tag className={cx("text-shimmer", className)}>{children}</Tag>;
}
