"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { RiArrowRightUpLine } from "@remixicon/react";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * FlowingMenu: a big editorial list of links where a band of ink glides from
 * row to row under the pointer (or keyboard focus), turning the row it settles
 * on inside out. Good for a site's main menu sheet or a project index.
 */

export interface FlowingMenuItem {
  label: string;
  href: string;
  /** A short note on the right, like a year or a count. */
  meta?: string;
}

export interface FlowingMenuProps {
  items: FlowingMenuItem[];
  "aria-label": string;
  className?: string;
}

export function FlowingMenu({ items, "aria-label": label, className }: FlowingMenuProps) {
  const [active, setActive] = useState<number | null>(null);
  const band = useId();
  const calm = useCalmMotion();
  return (
    <nav aria-label={label} className={className}>
      <ul className="border-t border-line" onPointerLeave={() => setActive(null)}>
        {items.map((item, i) => (
          <li key={item.label} className="border-b border-line">
            <a
              href={item.href}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="relative flex items-center justify-between gap-4 px-4 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            >
              {active === i && <motion.span layoutId={calm ? undefined : band} transition={layoutSpring} aria-hidden className="absolute inset-0 bg-fg" />}
              <span className={cx("relative text-title-lg-strong transition-colors duration-(--ds-motion-duration-moderate)", active === i ? "text-canvas" : "text-fg")}>
                {item.label}
              </span>
              <span
                className={cx(
                  "relative flex items-center gap-2 text-body-sm transition-colors duration-(--ds-motion-duration-moderate)",
                  active === i ? "text-canvas" : "text-fg-secondary",
                )}
              >
                {item.meta}
                <RiArrowRightUpLine
                  aria-hidden
                  className={cx("size-5 transition-[opacity,translate] duration-(--ds-motion-duration-moderate)", active === i ? "opacity-100" : "-translate-x-2 opacity-0")}
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
