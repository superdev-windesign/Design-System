"use client";

import { useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import { cx } from "../../utils/cx";
import { useCanvasEffect } from "../shared";
import { landPoints } from "./world-land";

/**
 * Globe: a dotted Earth turning slowly, with markers for places and arcs of
 * light travelling between them, for "where our customers are" or "global
 * network" moments. Drag to spin it. It's an image to assistive tech, named by
 * `aria-label`, so say in words what it shows. With reduced motion it holds
 * still.
 */

export interface GlobeMarker {
  lat: number;
  lon: number;
}

export interface GlobeProps {
  "aria-label": string;
  markers?: GlobeMarker[];
  /** Pairs of marker indexes to connect. */
  arcs?: [number, number][];
  className?: string;
}

const RAD = Math.PI / 180;

export function Globe({ "aria-label": label, markers = [], arcs = [], className }: GlobeProps) {
  const land = useMemo(() => landPoints(3), []);
  const spin = useRef({ lon: -20, lat: 15, drag: null as null | { x: number; y: number; lon: number; lat: number } });

  const canvas = useCanvasEffect(
    ({ ctx, width, height, dt, time, colors, still }) => {
      const s = spin.current;
      if (!s.drag && !still) s.lon += dt * 8;
      const r = Math.min(width, height) * 0.46;
      const cx0 = width / 2;
      const cy0 = height / 2;
      const rotLon = s.lon * RAD;
      const tilt = s.lat * RAD;

      // Orthographic projection with the globe turned and tipped toward you.
      const project = (lat: number, lon: number, lift = 1) => {
        const la = lat * RAD;
        const lo = lon * RAD + rotLon;
        const x = Math.cos(la) * Math.sin(lo);
        const y = Math.sin(la);
        const z = Math.cos(la) * Math.cos(lo);
        const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
        const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
        return { x: cx0 + x * r * lift, y: cy0 - y2 * r * lift, z: z2 };
      };

      ctx.clearRect(0, 0, width, height);
      // The sphere's rim.
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors[0]!;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx0, cy0, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors[0]!;
      for (const [lat, lon] of land) {
        const p = project(lat, lon);
        if (p.z <= 0) continue;
        ctx.globalAlpha = 0.25 + p.z * 0.55;
        ctx.fillRect(p.x - 0.9, p.y - 0.9, 1.8, 1.8);
      }

      // Arcs: sampled along the great circle and lifted off the surface in the middle.
      arcs.forEach(([a, b], i) => {
        const from = markers[a];
        const to = markers[b];
        if (!from || !to) return;
        const steps = 48;
        const head = still ? 1 : ((time * 0.35 + i * 0.37) % 1.4) / 1.4;
        ctx.strokeStyle = colors[2]!;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        let prev: { x: number; y: number; z: number } | null = null;
        for (let k = 0; k <= steps; k++) {
          const t = k / steps;
          const lat = from.lat + (to.lat - from.lat) * t;
          const lon = from.lon + (to.lon - from.lon) * t;
          const p = project(lat, lon, 1 + Math.sin(Math.PI * t) * 0.18);
          if (prev && p.z > 0.05 && prev.z > 0.05) {
            const near = still ? 0.7 : Math.max(0, 1 - Math.abs(t - head) * 4);
            ctx.globalAlpha = 0.15 + near * 0.85;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          prev = p;
        }
      });

      ctx.fillStyle = colors[1]!;
      for (const m of markers) {
        const p = project(m.lat, m.lon);
        if (p.z <= 0) continue;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + ((time * 6) % 8), 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { colors: ["var(--ds-color-text-secondary)", "var(--ds-color-accent-500)", "var(--ds-color-effect-1)"] },
  );

  const down = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    spin.current.drag = { x: event.clientX, y: event.clientY, lon: spin.current.lon, lat: spin.current.lat };
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    const d = spin.current.drag;
    if (!d) return;
    spin.current.lon = d.lon + (event.clientX - d.x) * 0.4;
    spin.current.lat = Math.max(-60, Math.min(60, d.lat + (event.clientY - d.y) * 0.3));
  };
  const up = () => (spin.current.drag = null);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={cx("aspect-square w-80 max-w-full cursor-grab touch-none active:cursor-grabbing", className)}
    />
  );
}
