import type { CSSProperties, PointerEvent } from "react";

/**
 * Light for the glass: the colours a pane can hold inside it, the highlight that
 * follows the pointer, and backdrops worth putting glass on.
 *
 * Glass needs something behind it. On a plain page it has nothing to bend and
 * reads as a white box, so `GLASS_SCENES` gives demos and empty stages some
 * colour. They're gradients built from tokens, so they carry no images.
 */

export type GlowTone = "sky" | "sun" | "ember" | "mint" | "iris";

/** Sets the light held by a `glass-glow` element, and by anything using `--glow`. */
export const glowStyle = (tone: GlowTone) => ({ "--glow": `var(--ds-color-glass-glow-${tone})` }) as CSSProperties;

/**
 * Spread onto a `glass-sheen` element. They write CSS variables straight to the
 * element, so following the pointer never re-renders. Only a mouse has a
 * position to follow: touch has nothing to hover.
 */
export const sheenHandlers = {
  onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const { style } = event.currentTarget;
    style.setProperty("--sheen-x", `${event.clientX - box.left}px`);
    style.setProperty("--sheen-y", `${event.clientY - box.top}px`);
    style.setProperty("--sheen-on", "1");
  },
  onPointerLeave(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--sheen-on", "0");
  },
};

export type GlassScene = "aurora" | "dune" | "lagoon" | "ember" | "orchid" | "mist" | "noir" | "paper";

const glow = (tone: GlowTone) => `var(--ds-color-glass-glow-${tone})`;
const ios = (name: string) => `var(--ds-color-ios-${name})`;
const pool = (shape: string, color: string, stop = 70) => `radial-gradient(${shape}, ${color} 0%, transparent ${stop}%)`;

/** Which theme reads on each scene: glass takes its tone from what's behind it. */
export const SCENE_THEME: Record<GlassScene, "light" | "dark"> = {
  aurora: "dark",
  dune: "light",
  lagoon: "light",
  ember: "dark",
  orchid: "dark",
  mist: "light",
  noir: "dark",
  paper: "light",
};

/** CSS backgrounds, for a `style={{ background }}`. */
export const GLASS_SCENES: Record<GlassScene, string> = {
  aurora: [
    pool("60% 90% at 18% 112%", glow("mint")),
    pool("52% 84% at 68% 104%", glow("iris"), 72),
    pool("70% 58% at 92% 8%", glow("sky"), 64),
    `linear-gradient(180deg, ${ios("gray6-dark")}, ${ios("black")})`,
  ].join(", "),
  dune: [
    pool("120% 58% at 14% 104%", glow("ember"), 62),
    pool("110% 66% at 86% 112%", glow("sun"), 66),
    `linear-gradient(165deg, ${ios("gray6")}, ${glow("sun")})`,
  ].join(", "),
  lagoon: [
    pool("70% 60% at 22% 18%", glow("mint"), 66),
    pool("80% 70% at 82% 88%", glow("sky"), 72),
    `conic-gradient(from 200deg at 60% 130%, var(--ds-color-azure-700), ${glow("sky")}, ${glow("mint")}, var(--ds-color-azure-700))`,
  ].join(", "),
  ember: [
    pool("46% 62% at 50% 56%", glow("sun"), 64),
    pool("84% 92% at 50% 62%", glow("ember"), 72),
    `linear-gradient(180deg, ${ios("gray6-dark")}, ${ios("black")})`,
  ].join(", "),
  orchid: [
    pool("56% 62% at 80% 18%", glow("ember"), 66),
    pool("70% 72% at 14% 84%", glow("sky"), 70),
    `conic-gradient(from 150deg at 42% 120%, ${glow("iris")}, ${glow("ember")}, ${glow("sun")}, ${glow("sky")}, ${glow("iris")})`,
  ].join(", "),
  mist: [
    pool("60% 54% at 24% 22%", ios("white"), 74),
    pool("64% 60% at 80% 84%", ios("gray3"), 74),
    `linear-gradient(150deg, ${ios("gray5")}, ${ios("gray4")})`,
  ].join(", "),
  noir: [
    pool("70% 46% at 74% 6%", ios("gray4-dark"), 72),
    pool("54% 40% at 16% 96%", ios("gray5-dark"), 74),
    ios("black"),
  ].join(", "),
  paper: [pool("70% 60% at 30% 24%", ios("white"), 76), ios("gray5")].join(", "),
};
