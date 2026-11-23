import type { ElementType, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * BorderBeam: a beam of light laps the border of whatever it wraps, with a soft
 * glow spilling past the edge. It marks something as live or working (an agent
 * running, a field being filled in, a plan that's "recommended") without
 * moving the content. Turn it off with `isActive={false}`; with reduced motion
 * the beam holds still.
 *
 * The beam follows the wrapper's corners, so give it the same radius as the
 * surface inside (the default is `rounded-surface`).
 */

export interface BorderBeamProps {
  children: ReactNode;
  isActive?: boolean;
  as?: ElementType;
  className?: string;
}

export function BorderBeam({ children, isActive = true, as: Tag = "div", className }: BorderBeamProps) {
  return (
    <Tag data-paused={isActive ? undefined : ""} className={cx("border-beam rounded-surface", className)}>
      {children}
    </Tag>
  );
}
