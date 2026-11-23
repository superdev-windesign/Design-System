"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * A small rigid-body simulation for DOM elements: every `[data-body]` element
 * inside the container falls under gravity, lands, stacks and can be picked up
 * and thrown. Bodies are boxes that don't rotate, which is plenty for chips,
 * words and tags.
 *
 * Elements stay in the document flow; only a transform moves them, so their
 * order, text and focus behaviour are untouched. Nothing runs until `active`.
 */

export interface PhysicsOptions {
  /** Pixels per second squared. */
  gravity?: number;
  /** Bounce, 0–1. */
  restitution?: number;
}

type Body = {
  el: HTMLElement;
  ox: number;
  oy: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  held: null | { id: number; dx: number; dy: number; lx: number; ly: number; t: number };
};

export function usePhysicsBodies(containerRef: RefObject<HTMLElement | null>, active: boolean, { gravity = 2200, restitution = 0.3 }: PhysicsOptions = {}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;
    const box = container.getBoundingClientRect();
    const W = box.width;
    const H = box.height;
    const bodies: Body[] = [...container.querySelectorAll<HTMLElement>("[data-body]")].map((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left - box.left + r.width / 2;
      const y = r.top - box.top + r.height / 2;
      // A little sideways nudge so a row doesn't fall as one solid block.
      return { el, ox: x, oy: y, x, y, w: r.width, h: r.height, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120, held: null };
    });

    const local = (e: PointerEvent) => {
      const b = container.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const handlers = bodies.map((body) => {
      const down = (e: PointerEvent) => {
        const p = local(e);
        body.el.setPointerCapture(e.pointerId);
        body.held = { id: e.pointerId, dx: body.x - p.x, dy: body.y - p.y, lx: p.x, ly: p.y, t: performance.now() };
      };
      const move = (e: PointerEvent) => {
        const h = body.held;
        if (!h || h.id !== e.pointerId) return;
        const p = local(e);
        const now = performance.now();
        const dt = Math.max(1, now - h.t) / 1000;
        body.vx = (p.x - h.lx) / dt;
        body.vy = (p.y - h.ly) / dt;
        body.x = p.x + h.dx;
        body.y = p.y + h.dy;
        Object.assign(h, { lx: p.x, ly: p.y, t: now });
      };
      const up = () => (body.held = null);
      body.el.addEventListener("pointerdown", down);
      body.el.addEventListener("pointermove", move);
      body.el.addEventListener("pointerup", up);
      body.el.addEventListener("pointercancel", up);
      return () => {
        body.el.removeEventListener("pointerdown", down);
        body.el.removeEventListener("pointermove", move);
        body.el.removeEventListener("pointerup", up);
        body.el.removeEventListener("pointercancel", up);
      };
    });

    let last = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      for (const b of bodies) {
        if (b.held) continue;
        b.vy += gravity * dt;
        b.vx *= 0.995;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      for (let pass = 0; pass < 4; pass++) {
        for (const b of bodies) {
          // Walls and floor.
          if (b.x - b.w / 2 < 0) (b.x = b.w / 2), (b.vx = Math.abs(b.vx) * restitution);
          if (b.x + b.w / 2 > W) (b.x = W - b.w / 2), (b.vx = -Math.abs(b.vx) * restitution);
          if (b.y + b.h / 2 > H) {
            b.y = H - b.h / 2;
            b.vy = -Math.abs(b.vy) * restitution;
            b.vx *= 0.9;
          }
          if (b.y - b.h / 2 < 0) (b.y = b.h / 2), (b.vy = Math.abs(b.vy) * restitution);
        }
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i]!;
            const c = bodies[j]!;
            const ox = (a.w + c.w) / 2 - Math.abs(a.x - c.x);
            const oy = (a.h + c.h) / 2 - Math.abs(a.y - c.y);
            if (ox <= 0 || oy <= 0) continue;
            // Push apart along the shallower overlap; a held body doesn't move.
            const share = a.held ? [0, 1] : c.held ? [1, 0] : [0.5, 0.5];
            if (ox < oy) {
              const s = Math.sign(a.x - c.x) || 1;
              a.x += s * ox * share[0]!;
              c.x -= s * ox * share[1]!;
              const v = (a.vx + c.vx) / 2;
              a.vx = v + (v - a.vx) * restitution;
              c.vx = v + (v - c.vx) * restitution;
            } else {
              const s = Math.sign(a.y - c.y) || 1;
              a.y += s * oy * share[0]!;
              c.y -= s * oy * share[1]!;
              const v = (a.vy + c.vy) / 2;
              a.vy = v + (v - a.vy) * restitution;
              c.vy = v + (v - c.vy) * restitution;
              a.vx *= 0.92;
              c.vx *= 0.92;
            }
          }
        }
      }
      for (const b of bodies) b.el.style.transform = `translate(${b.x - b.ox}px, ${b.y - b.oy}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      handlers.forEach((off) => off());
      for (const b of bodies) b.el.style.transform = "";
    };
  }, [containerRef, active, gravity, restitution]);
}
