import { useId, useMemo } from "react";
import { cx } from "../../utils/cx";
import { seeded } from "../shared";

/**
 * BackgroundBeams: faint curved paths sweeping across the panel, with dashes of
 * light travelling along them at different speeds, like signals through
 * fibre. It fills its positioned parent. Decorative; with reduced motion the
 * paths stay and the light stops.
 */

export interface BackgroundBeamsProps {
  count?: number;
  className?: string;
}

export function BackgroundBeams({ count = 14, className }: BackgroundBeamsProps) {
  const id = useId().replace(/:/g, "");
  const paths = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: count }, (_, i) => {
      const o = i * 18 - 120;
      const bend = 60 + rand() * 80;
      return {
        d: `M${-80 + o} ${340} C${80 + o} ${300 - bend}, ${260 + o} ${200 + bend * 0.4}, ${420 + o} ${120} S${700 + o} ${-40}, ${760 + o} ${-60}`,
        delay: rand() * 4,
        speed: 0.8 + rand() * 1.4,
      };
    });
  }, [count]);

  return (
    <svg aria-hidden viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice" fill="none" className={cx("pointer-events-none absolute inset-0 size-full", className)}>
      <defs>
        <linearGradient id={`beam-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--ds-color-effect-1)" }} />
          <stop offset="50%" style={{ stopColor: "var(--ds-color-accent-500)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ds-color-effect-2)" }} />
        </linearGradient>
      </defs>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} className="stroke-line" strokeWidth={0.6} opacity={0.5} />
          <path
            d={p.d}
            pathLength={1}
            stroke={`url(#beam-${id})`}
            strokeWidth={1.4}
            strokeLinecap="round"
            className="animate-path-travel"
            style={{ animationDelay: `${p.delay}s`, animationDuration: `calc(var(--ds-motion-duration-sweep) * ${p.speed * 1.6})` }}
          />
        </g>
      ))}
    </svg>
  );
}
