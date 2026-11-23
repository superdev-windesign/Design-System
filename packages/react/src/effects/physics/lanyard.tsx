"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useCalmMotion, useOnScreen } from "../shared";

/**
 * Lanyard: a badge hanging on a strap from the top of the panel. Grab the badge
 * and swing it; let go and it sways back to rest, the strap bending as it goes.
 * Put a name card, a ticket or a pass in `children`. The badge's content is
 * ordinary content; the strap is decorative. With reduced motion it simply
 * hangs.
 */

export interface LanyardProps {
  children: ReactNode;
  className?: string;
}

const LINKS = 12;
const LENGTH = 13;

type Pt = { x: number; y: number; px: number; py: number };

export function Lanyard({ children, className }: LanyardProps) {
  const host = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const strap = useRef<SVGPathElement>(null);
  const shine = useRef<SVGPathElement>(null);
  const calm = useCalmMotion();
  const onScreen = useOnScreen(host);

  useEffect(() => {
    const el = host.current;
    const badge = card.current;
    if (!el || !badge) return;
    const anchor = { x: el.clientWidth / 2, y: -6 };
    const pts: Pt[] = Array.from({ length: LINKS + 1 }, (_, i) => ({ x: anchor.x, y: anchor.y + i * LENGTH, px: anchor.x, py: anchor.y + i * LENGTH }));
    let held: { id: number; x: number; y: number } | null = null;

    const render = () => {
      const end = pts[LINKS]!;
      const prev = pts[LINKS - 1]!;
      const angle = Math.atan2(end.x - prev.x, end.y - prev.y);
      badge.style.transform = `translate(${end.x - badge.offsetWidth / 2}px, ${end.y}px) rotate(${-angle}rad)`;
      const d = `M${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")}`;
      strap.current?.setAttribute("d", d);
      shine.current?.setAttribute("d", d);
    };

    const down = (e: PointerEvent) => {
      if (calm) return;
      badge.setPointerCapture(e.pointerId);
      const b = el.getBoundingClientRect();
      held = { id: e.pointerId, x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const move = (e: PointerEvent) => {
      if (!held || held.id !== e.pointerId) return;
      const b = el.getBoundingClientRect();
      held.x = e.clientX - b.left;
      held.y = e.clientY - b.top;
    };
    const up = () => (held = null);
    badge.addEventListener("pointerdown", down);
    badge.addEventListener("pointermove", move);
    badge.addEventListener("pointerup", up);
    badge.addEventListener("pointercancel", up);

    let raf = 0;
    const step = () => {
      // Verlet: each point keeps its momentum, gravity pulls, and the links pull it back into length.
      for (let i = 1; i <= LINKS; i++) {
        const p = pts[i]!;
        const vx = (p.x - p.px) * 0.985;
        const vy = (p.y - p.py) * 0.985;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + 0.6;
      }
      if (held) {
        const end = pts[LINKS]!;
        end.x = held.x;
        end.y = held.y - 10;
      }
      for (let k = 0; k < 14; k++) {
        pts[0]!.x = anchor.x;
        pts[0]!.y = anchor.y;
        for (let i = 0; i < LINKS; i++) {
          const a = pts[i]!;
          const b = pts[i + 1]!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const diff = (d - LENGTH) / d;
          if (i === 0) {
            b.x -= dx * diff;
            b.y -= dy * diff;
          } else {
            a.x += dx * diff * 0.5;
            a.y += dy * diff * 0.5;
            b.x -= dx * diff * 0.5;
            b.y -= dy * diff * 0.5;
          }
        }
      }
      render();
      raf = requestAnimationFrame(step);
    };
    render();
    if (!calm && onScreen) raf = requestAnimationFrame(step);
    else if (!calm) {
      // Off screen: give it a little swing to start with when it comes back.
      pts[LINKS]!.px -= 6;
    }

    return () => {
      cancelAnimationFrame(raf);
      badge.removeEventListener("pointerdown", down);
      badge.removeEventListener("pointermove", move);
      badge.removeEventListener("pointerup", up);
      badge.removeEventListener("pointercancel", up);
    };
  }, [calm, onScreen]);

  return (
    <div ref={host} className={cx("relative h-96 w-full overflow-hidden", className)}>
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible" fill="none">
        <path ref={strap} className="stroke-accent-600" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <path ref={shine} className="stroke-accent-400" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      </svg>
      <div ref={card} className="absolute top-0 left-0 w-44 origin-top cursor-grab touch-none select-none active:cursor-grabbing">
        {/* The clip that holds the badge to the strap. */}
        <span aria-hidden className="mx-auto -mb-1 block h-4 w-8 rounded-xs border-2 border-line-control bg-muted" />
        <div className="overflow-hidden rounded-surface border border-line bg-surface shadow-overlay">{children}</div>
      </div>
    </div>
  );
}
