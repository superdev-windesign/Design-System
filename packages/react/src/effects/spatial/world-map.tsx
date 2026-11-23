import { useId, useMemo } from "react";
import { cx } from "../../utils/cx";
import { LAND_NORTH, LAND_SOUTH, landPoints } from "./world-land";

/**
 * WorldMap: a dotted map of the world with arcs of light travelling between
 * places, for offices, data centres or a delivery network. Markers can carry a
 * short label. It's an SVG image named by `aria-label`, so describe the
 * connections in words there too. With reduced motion the arcs are drawn but
 * the light doesn't travel.
 */

export interface WorldMapPlace {
  lat: number;
  lon: number;
  label?: string;
}

export interface WorldMapProps {
  "aria-label": string;
  places?: WorldMapPlace[];
  /** Pairs of place indexes to connect. */
  routes?: [number, number][];
  className?: string;
}

const W = 720;
const STEP = 3;
const H = ((LAND_NORTH - LAND_SOUTH) / 360) * W;

const at = (lat: number, lon: number) => ({ x: ((lon + 180) / 360) * W, y: ((LAND_NORTH - lat) / (LAND_NORTH - LAND_SOUTH)) * H });

export function WorldMap({ "aria-label": label, places = [], routes = [], className }: WorldMapProps) {
  const id = useId().replace(/:/g, "");
  const dots = useMemo(() => landPoints(STEP).map(([lat, lon]) => at(lat, lon)), []);

  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${H}`} className={cx("h-auto w-full", className)}>
      <defs>
        <linearGradient id={`route-${id}`} x1="0" x2="1">
          <stop offset="0%" style={{ stopColor: "var(--ds-color-effect-1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ds-color-accent-500)" }} />
        </linearGradient>
      </defs>
      <g className="fill-fg-secondary" opacity={0.35}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.6} />
        ))}
      </g>
      {routes.map(([a, b], i) => {
        const from = places[a];
        const to = places[b];
        if (!from || !to) return null;
        const p = at(from.lat, from.lon);
        const q = at(to.lat, to.lon);
        const lift = Math.min(120, Math.hypot(q.x - p.x, q.y - p.y) * 0.35);
        const d = `M${p.x} ${p.y} Q${(p.x + q.x) / 2} ${Math.min(p.y, q.y) - lift} ${q.x} ${q.y}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={`url(#route-${id})`} strokeWidth={1.2} opacity={0.35} />
            <path
              d={d}
              fill="none"
              pathLength={1}
              stroke={`url(#route-${id})`}
              strokeWidth={2}
              strokeLinecap="round"
              className="animate-path-travel"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          </g>
        );
      })}
      {places.map((place, i) => {
        const p = at(place.lat, place.lon);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={7} className="animate-twinkle fill-accent-500" opacity={0.25} />
            <circle cx={p.x} cy={p.y} r={3.2} className="fill-accent-500" />
            {place.label && (
              <text x={p.x + 7} y={p.y - 7} className="fill-fg text-caption-strong" style={{ fontSize: 11 }}>
                {place.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
