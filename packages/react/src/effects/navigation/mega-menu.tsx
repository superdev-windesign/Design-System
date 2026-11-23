"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { ChevronDownSmall } from "../../icons/chevrons";
import { easing, layoutSpring } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * MegaMenu: top-level navigation with one shared dropdown that morphs. Moving
 * from one item to the next doesn't close one panel and open another: the
 * panel glides under the new item and reshapes to fit its content, which slides
 * in from the side you came from.
 *
 * Each item is a disclosure button (Enter or click toggles it; Down Arrow moves
 * into the panel); Escape closes and returns focus to the item.
 */

export interface MegaMenuItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface MegaMenuProps {
  items: MegaMenuItem[];
  "aria-label": string;
  className?: string;
}

export function MegaMenu({ items, "aria-label": label, className }: MegaMenuProps) {
  const [active, setActive] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const panelId = useId();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const calm = useCalmMotion();

  const open = (i: number) => {
    clearTimeout(closeTimer.current);
    if (active !== null && i !== active) setDirection(i > active ? 1 : -1);
    setActive(i);
  };
  const close = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 120);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (active === null) return;
    const left = triggers.current[active]?.offsetLeft ?? 0;
    if (calm) x.jump(left);
    else animate(x, left, layoutSpring);
  }, [active, calm, x]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && active !== null) {
      triggers.current[active]?.focus();
      setActive(null);
    }
    if (event.key === "ArrowDown" && active !== null && (event.target as HTMLElement).dataset.megaTrigger !== undefined) {
      event.preventDefault();
      panel.current?.querySelector<HTMLElement>("a, button, [tabindex]")?.focus();
    }
  };

  const current = active === null ? null : items[active];

  return (
    <nav aria-label={label} className={cx("relative", className)} onPointerLeave={close} onKeyDown={onKeyDown}>
      <ul className="flex items-center gap-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              ref={(el) => {
                triggers.current[i] = el;
              }}
              type="button"
              data-mega-trigger
              aria-expanded={active === i}
              aria-controls={panelId}
              onPointerEnter={() => open(i)}
              // A mouse click lands just after the hover has opened it, so only the keyboard toggles.
              onClick={(event) => (event.detail === 0 && active === i ? setActive(null) : open(i))}
              className={cx(
                "flex cursor-pointer items-center gap-1 rounded-control-sm px-3 py-1.5 text-body-md transition-colors",
                active === i ? "bg-muted text-fg" : "text-fg-secondary hover:text-fg",
                focusRingNative,
              )}
            >
              {item.label}
              <ChevronDownSmall
                aria-hidden
                className={cx("size-4 transition-transform duration-(--ds-motion-duration-moderate)", active === i && "rotate-180")}
              />
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {current && (
          <motion.div
            ref={panel}
            id={panelId}
            onPointerEnter={() => clearTimeout(closeTimer.current)}
            style={{ x }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: easing.enter }}
            className="absolute top-full left-0 z-30 origin-top-left pt-2"
          >
            <motion.div layout={!calm} transition={layoutSpring} className="overflow-hidden rounded-overlay border border-line bg-surface shadow-overlay">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={current.id}
                  layout={!calm}
                  initial={{ opacity: 0, x: direction * 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -48 }}
                  transition={{ duration: 0.25, ease: easing.enter }}
                  className="p-4"
                >
                  {current.content}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
