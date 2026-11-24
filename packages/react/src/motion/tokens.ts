/**
 * JS mirror of the motion tokens for the `motion` library, which takes numbers
 * (bezier arrays, seconds) rather than CSS strings. `tokens.test.ts` fails if
 * these drift from @windesign-ds/tokens, so change values in packages/tokens first.
 */
export const easing = {
  /** motion.easing.enter — decelerating entrances and state changes */
  enter: [0.22, 1, 0.36, 1],
  /** motion.easing.standard — in-place state changes */
  standard: [0.4, 0, 0.2, 1],
  /** motion.easing.overshoot — small settle past the target */
  overshoot: [0.34, 1.2, 0.64, 1],
} as const;

/**
 * Spring for layout moves: rows shifting and shared-layout elements gliding
 * between positions. Springs have no CSS equivalent, so this lives only here.
 */
export const layoutSpring = { type: "spring", stiffness: 260, damping: 30, mass: 0.8 } as const;

/**
 * Effect timings in seconds, for the canvas and `motion` driven effects
 * (motion.duration.* in @windesign-ds/tokens). `tokens.test.ts` checks them too.
 */
export const effectDuration = {
  reveal: 0.6,
  hold: 1.2,
  sweep: 2.4,
  loop: 6,
  ambient: 12,
  marquee: 40,
} as const;
