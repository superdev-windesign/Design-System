import { Children } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * OrbitingCircles: small things (logos, avatars, icons) travelling round a
 * centre on a faint circular path, evenly spaced. Stack two or three at
 * different radii and directions around a central mark for an integrations or
 * ecosystem picture. Fill the centre with your own element. Decorative, and
 * still with reduced motion.
 */

export interface OrbitingCirclesProps {
  children: ReactNode;
  /** Orbit radius in spacing units. */
  radius?: number;
  /** Multiplies the lap time: 2 is half as fast. */
  speed?: number;
  reverse?: boolean;
  /** Draw the orbit's path. */
  path?: boolean;
  className?: string;
}

export function OrbitingCircles({ children, radius = 24, speed = 1, reverse = false, path = true, className }: OrbitingCirclesProps) {
  const items = Children.toArray(children);
  const r = `calc(var(--spacing) * ${radius})`;
  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0 flex items-center justify-center", className)}>
      {path && <span className="absolute rounded-full border border-line" style={{ width: `calc(${r} * 2)`, height: `calc(${r} * 2)` }} />}
      {items.map((item, i) => (
        <span
          key={i}
          className="animate-orbit absolute flex items-center justify-center"
          style={
            {
              "--orbit-radius": r,
              "--orbit-start": `${(360 / items.length) * i}deg`,
              "--orbit-speed": speed,
              animationDirection: reverse ? "reverse" : undefined,
            } as CSSProperties
          }
        >
          {item}
        </span>
      ))}
    </div>
  );
}
