import { useMemo } from "react";
import { cx } from "../../utils/cx";
import { seeded } from "../shared";

/**
 * Meteors: thin streaks of light falling diagonally across a panel, each with a
 * fading tail, at staggered times. A small, cheap flourish for a dark card or
 * an empty state. It fills its positioned parent; with reduced motion there
 * are none.
 */

export interface MeteorsProps {
  count?: number;
  className?: string;
}

export function Meteors({ count = 14, className }: MeteorsProps) {
  const meteors = useMemo(() => {
    const rand = seeded(count);
    return Array.from({ length: count }, () => ({ left: rand() * 110 - 5, delay: rand() * 6, speed: 0.8 + rand() * 1.6 }));
  }, [count]);

  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((m, i) => (
        <span
          key={i}
          className="animate-meteor absolute -top-2 size-0.5 rounded-full bg-fg-secondary"
          style={{ left: `${m.left}%`, animationDelay: `${m.delay}s`, animationDuration: `calc(var(--ds-motion-duration-sweep) * ${m.speed})` }}
        >
          <span className="absolute top-1/2 left-0 h-px w-14 -translate-y-1/2 bg-linear-to-r from-fg-secondary to-transparent" />
        </span>
      ))}
    </div>
  );
}
