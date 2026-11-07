"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Button as AriaButton, Toolbar } from "react-aria-components";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { LiquidGlass } from "./liquid-glass";

/**
 * Dock: a shelf of apps on glass. Icons swell as the pointer nears and settle
 * as it leaves; pressing one bounces it. Each shows its name in a small glass
 * label on hover or focus, and a dot underneath while it's running.
 *
 * It's a React Aria Toolbar: Tab reaches it once and the arrow keys move along
 * it. With reduced motion, or on touch, the icons simply stay their size.
 */

export interface DockItem {
  id: string;
  label: string;
  icon: IconComponent;
  /** CSS background for the icon's tile. */
  tile?: string;
  isRunning?: boolean;
  badge?: ReactNode;
}

export interface GlassDockProps {
  items: DockItem[];
  /** Shown after a divider, such as documents or the bin. */
  trailing?: DockItem[];
  onSelect?: (id: string) => void;
  /** Resting icon size, in px. Default 52. */
  size?: number;
  /** How much the icon under the pointer grows. Default 1.6. */
  magnification?: number;
  /** How far the swell reaches, in px. Default 130. */
  reach?: number;
  "aria-label"?: string;
  className?: string;
}

const SHELF_PADDING = 16;
const GAP = 6;
const DIVIDER = 22;

/** The largest resting size at which every icon fits the width available. */
export function fittedDockSize(available: number, count: number, hasDivider: boolean, size: number) {
  if (!available || !count) return size;
  const room = available - SHELF_PADDING - GAP * (count - 1) - (hasDivider ? DIVIDER : 0);
  return Math.max(24, Math.min(size, Math.floor(room / count)));
}

/** An icon's size given the pointer's distance from its centre: a smooth bump, flat beyond `reach`. */
export function dockIconSize(distance: number, size: number, magnification: number, reach: number) {
  const nearness = Math.max(0, 1 - Math.abs(distance) / reach);
  return size * (1 + (magnification - 1) * Math.sin((nearness * Math.PI) / 2) ** 2);
}

interface IconProps {
  item: DockItem;
  pointer: MotionValue<number>;
  size: number;
  magnification: number;
  reach: number;
  onSelect?: (id: string) => void;
}

function DockIcon({ item, pointer, size, magnification, reach, onSelect }: IconProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const host = useRef<HTMLButtonElement>(null);
  const lift = useMotionValue(0);
  // A motion value, so a resized shelf reaches the transform as well as a moving pointer.
  const resting = useMotionValue(size);
  useEffect(() => resting.set(size), [resting, size]);
  const target = useTransform([pointer, resting], ([x, base]) => {
    const box = host.current?.getBoundingClientRect();
    if (!box || reduceMotion || x === Number.POSITIVE_INFINITY) return base as number;
    return dockIconSize((x as number) - (box.left + box.width / 2), base as number, magnification, reach);
  });
  const smooth = useSpring(target, { stiffness: 420, damping: 34, mass: 0.35 });
  const Icon = item.icon;

  return (
    <motion.div style={{ width: smooth, height: smooth }} className="relative flex shrink-0 items-end">
      <AriaButton
        ref={host}
        aria-label={item.isRunning ? `${item.label}, running` : item.label}
        onPress={() => {
          onSelect?.(item.id);
          if (!reduceMotion) animate(lift, [0, -18, 0, -8, 0], { duration: 0.6, ease: "easeOut" });
        }}
        className={cx("group relative flex size-full cursor-pointer items-center justify-center rounded-tile", focusRing)}
      >
        <motion.span
          style={{ y: lift, background: item.tile }}
          className={cx("flex size-full items-center justify-center rounded-tile shadow-raised", item.tile ? "text-on-action" : "bg-surface text-fg")}
        >
          <Icon aria-hidden className="size-1/2" />
        </motion.span>
        {item.badge !== undefined && (
          <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-action-danger px-1 text-caption tabular-nums text-on-action">{item.badge}</span>
        )}
        <span
          aria-hidden
          className="glass pointer-events-none absolute bottom-full start-1/2 mb-3 -translate-x-1/2 rounded-full px-3 py-1 text-body-sm whitespace-nowrap text-fg opacity-0 transition-opacity group-data-[focus-visible]:opacity-100 group-data-[hovered]:opacity-100 motion-reduce:transition-none"
        >
          {item.label}
        </span>
        {item.isRunning && <span aria-hidden className="absolute -bottom-1.5 start-1/2 size-1 -translate-x-1/2 rounded-full bg-fg" />}
      </AriaButton>
    </motion.div>
  );
}

export function GlassDock({ items, trailing = [], onSelect, size = 52, magnification = 1.6, reach = 130, "aria-label": ariaLabel = "Dock", className }: GlassDockProps) {
  const pointer = useMotionValue(Number.POSITIVE_INFINITY);
  const host = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const fitted = fittedDockSize(available, items.length + trailing.length, trailing.length > 0, size);
  const shared = { pointer, size: fitted, magnification, reach, onSelect };

  useEffect(() => {
    const element = host.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => setAvailable(element.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className={cx("flex w-full justify-center", className)}>
      <LiquidGlass
        refract
        bezel={16}
        depth={14}
        onPointerMove={(event: PointerEvent) => {
          if (event.pointerType === "mouse") pointer.set(event.clientX);
        }}
        onPointerLeave={() => pointer.set(Number.POSITIVE_INFINITY)}
        className="max-w-full rounded-panel px-2 pt-2 pb-3"
      >
        <Toolbar aria-label={ariaLabel} className="flex items-end gap-1.5">
          {items.map((item) => (
            <DockIcon key={item.id} item={item} {...shared} />
          ))}
          {trailing.length > 0 && <span aria-hidden className="mx-1 h-10 self-center border-s border-line" />}
          {trailing.map((item) => (
            <DockIcon key={item.id} item={item} {...shared} />
          ))}
        </Toolbar>
      </LiquidGlass>
    </div>
  );
}
