import { cx } from "../../utils/cx";

/**
 * AuroraBackground: soft pools of the brand's effect colours drifting slowly
 * behind a hero, like light through fog. It fills its positioned parent; put
 * content in a sibling above it. Decorative only; with reduced motion the pools
 * hold still.
 */

export interface AuroraBackgroundProps {
  /** How strongly the colour shows, 0–1. */
  intensity?: number;
  className?: string;
}

const POOLS = [
  { color: "var(--ds-color-effect-1)", left: "-10%", top: "-20%", size: "60%", speed: 1, delay: 0 },
  { color: "var(--ds-color-effect-2)", left: "40%", top: "-30%", size: "55%", speed: 1.3, delay: -3 },
  { color: "var(--ds-color-effect-5)", left: "10%", top: "35%", size: "50%", speed: 1.6, delay: -6 },
  { color: "var(--ds-color-effect-3)", left: "60%", top: "30%", size: "45%", speed: 1.15, delay: -9 },
];

export function AuroraBackground({ intensity = 0.55, className }: AuroraBackgroundProps) {
  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {POOLS.map((pool, i) => (
        <span
          key={i}
          className="animate-drift absolute aspect-square rounded-full blur-haze"
          style={{
            background: pool.color,
            left: pool.left,
            top: pool.top,
            width: pool.size,
            opacity: intensity,
            animationDuration: `calc(var(--ds-motion-duration-ambient) * ${pool.speed})`,
            animationDelay: `${pool.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
