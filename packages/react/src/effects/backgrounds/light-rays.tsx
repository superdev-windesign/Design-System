import { cx } from "../../utils/cx";

/**
 * LightRays: shafts of light falling from the top of a panel and rocking
 * slowly, as if through a high window. They use the brand's effect colours and
 * fill their positioned parent. Decorative; with reduced motion they hold
 * still.
 */

export interface LightRaysProps {
  className?: string;
}

const RAYS = [
  { left: "8%", width: "w-20", color: "var(--ds-color-effect-1)", delay: 0, speed: 1 },
  { left: "22%", width: "w-32", color: "var(--ds-color-effect-2)", delay: -2, speed: 1.3 },
  { left: "40%", width: "w-16", color: "var(--ds-color-effect-4)", delay: -4, speed: 0.9 },
  { left: "55%", width: "w-36", color: "var(--ds-color-effect-1)", delay: -1, speed: 1.5 },
  { left: "72%", width: "w-24", color: "var(--ds-color-effect-5)", delay: -3, speed: 1.1 },
  { left: "86%", width: "w-20", color: "var(--ds-color-effect-2)", delay: -5, speed: 1.25 },
];

export function LightRays({ className }: LightRaysProps) {
  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {RAYS.map((ray, i) => (
        <span
          key={i}
          className={cx("animate-sway absolute -top-1/4 h-full origin-top blur-glow", ray.width)}
          style={{
            left: ray.left,
            background: `linear-gradient(to bottom, ${ray.color}, transparent 85%)`,
            animationDelay: `${ray.delay}s`,
            animationDuration: `calc(var(--ds-motion-duration-loop) * ${ray.speed})`,
          }}
        />
      ))}
    </div>
  );
}
