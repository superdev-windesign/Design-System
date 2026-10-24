// Minimal CSS color parsing for the token tests: hex, oklch() and
// `color-mix(in srgb, <color> N%, transparent)` — the only forms the token
// sources use. Returns gamma-encoded sRGB channels in 0–1 plus alpha.
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function parseHex(hex: string): Rgba {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}

function parseOklch(body: string): Rgba {
  const [main = "", alpha] = body.split("/");
  // CSS Color 4 allows `none` for a missing component (Tailwind writes neutral hues that way).
  const num = (s: string) => (s === "none" ? 0 : parseFloat(s));
  const [lRaw = "0", cRaw = "0", hRaw = "0"] = main.trim().split(/\s+/);
  const L = lRaw.endsWith("%") ? num(lRaw) / 100 : num(lRaw);
  const C = num(cRaw);
  const H = (num(hRaw) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => toGamma(clamp(c)));
  return { r: lin[0]!, g: lin[1]!, b: lin[2]!, a: alpha ? parseFloat(alpha) : 1 };
}

export function parseColor(value: string): Rgba {
  const v = value.trim();
  if (v.startsWith("#")) return parseHex(v);
  if (v.startsWith("oklch(")) return parseOklch(v.slice(6, -1));
  const mix = /^color-mix\(in srgb,\s*(.+)\s+([\d.]+)%,\s*transparent\)$/.exec(v);
  if (mix) {
    const base = parseColor(mix[1]!);
    return { ...base, a: base.a * (parseFloat(mix[2]!) / 100) };
  }
  throw new Error(`Unsupported color value: ${value}`);
}

/** Composites `top` over an opaque `bottom` in gamma-encoded sRGB, as browsers do. */
export function over(top: Rgba, bottom: Rgba): Rgba {
  const mixChannel = (t: number, b: number) => t * top.a + b * (1 - top.a);
  return { r: mixChannel(top.r, bottom.r), g: mixChannel(top.g, bottom.g), b: mixChannel(top.b, bottom.b), a: 1 };
}

export function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
