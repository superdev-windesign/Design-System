"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useCalmMotion, useOnScreen } from "../shared";

/**
 * IconCloud: icons spread over the surface of a sphere that turns slowly; the
 * ones in front are large and sharp, the ones behind small and faint. Drag to
 * spin it and let go to fling it. Use it for "works with" and integrations
 * sections. It's an image to assistive tech, named by `aria-label`, so list
 * what's in it there. With reduced motion it stands still.
 */

export interface IconCloudProps {
  "aria-label": string;
  icons: ReactNode[];
  className?: string;
}

export function IconCloud({ "aria-label": label, icons, className }: IconCloudProps) {
  const host = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ ax: 0.25, ay: 0, vx: 0.003, vy: 0.006, drag: null as null | { x: number; y: number } });
  const calm = useCalmMotion();
  const onScreen = useOnScreen(host);

  useEffect(() => {
    const n = icons.length;
    // Even spacing over the sphere: the Fibonacci lattice.
    const points = Array.from({ length: n }, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const t = Math.PI * (3 - Math.sqrt(5)) * i;
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });
    let raf = 0;
    const draw = () => {
      const s = state.current;
      if (!s.drag && !calm) {
        s.ax += s.vx;
        s.ay += s.vy;
        s.vx += (0.003 - s.vx) * 0.02;
        s.vy += (0.006 - s.vy) * 0.02;
      }
      const radius = (host.current?.offsetWidth ?? 280) * 0.38;
      const [sx, cx0, sy, cy0] = [Math.sin(s.ax), Math.cos(s.ax), Math.sin(s.ay), Math.cos(s.ay)];
      points.forEach((p, i) => {
        const el = items.current[i];
        if (!el) return;
        const x1 = p.x * cy0 + p.z * sy;
        const z1 = -p.x * sy + p.z * cy0;
        const y2 = p.y * cx0 - z1 * sx;
        const z2 = p.y * sx + z1 * cx0;
        const depth = (z2 + 1) / 2;
        el.style.transform = `translate(-50%, -50%) translate(${x1 * radius}px, ${y2 * radius}px) scale(${0.55 + depth * 0.65})`;
        el.style.opacity = String(0.2 + depth * 0.8);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.filter = depth < 0.4 ? "blur(1px)" : "";
      });
      if (!calm && onScreen) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [icons.length, calm, onScreen]);

  const down = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    state.current.drag = { x: event.clientX, y: event.clientY };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    if (!s.drag) return;
    s.vy = (event.clientX - s.drag.x) * 0.002;
    s.vx = (event.clientY - s.drag.y) * -0.002;
    s.ax += s.vx;
    s.ay += s.vy;
    s.drag = { x: event.clientX, y: event.clientY };
  };
  const up = () => (state.current.drag = null);

  return (
    <div
      ref={host}
      role="img"
      aria-label={label}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={cx("relative aspect-square w-72 max-w-full cursor-grab touch-none select-none active:cursor-grabbing", className)}
    >
      {icons.map((icon, i) => (
        <span
          key={i}
          aria-hidden
          ref={(el) => {
            items.current[i] = el;
          }}
          className="absolute top-1/2 left-1/2 flex size-10 items-center justify-center will-change-transform"
        >
          {icon}
        </span>
      ))}
    </div>
  );
}
