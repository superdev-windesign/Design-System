"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import type { Key } from "react-aria-components";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * GooeyTabs: tabs whose selection pill moves like a drop of liquid. Its leading
 * edge darts to the new tab and its trailing edge follows a beat later, so the
 * pill stretches across the gap and then gathers itself. They're React Aria
 * tabs, so arrow keys, Home/End and the tab panel wiring all come with it. With
 * reduced motion the pill moves in one piece.
 */

export interface GooeyTabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface GooeyTabsProps {
  items: GooeyTabItem[];
  "aria-label": string;
  defaultSelectedKey?: string;
  className?: string;
}

const lead = { type: "spring", stiffness: 620, damping: 42 } as const;
const trail = { type: "spring", stiffness: 210, damping: 24 } as const;

export function GooeyTabs({ items, "aria-label": label, defaultSelectedKey, className }: GooeyTabsProps) {
  const [selected, setSelected] = useState<Key>(defaultSelectedKey ?? items[0]?.id ?? "");
  const tabs = useRef(new Map<Key, HTMLElement>());
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const width = useTransform(() => right.get() - left.get());
  const placed = useRef(false);
  const calm = useCalmMotion();

  const bar = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // React Aria renders the tabs after its first pass, and fonts can load late, so the
  // pill snaps into place whenever the bar's size changes, as well as on selection.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const snap = () => {
      const tab = tabs.current.get(selectedRef.current);
      if (!tab) return;
      left.jump(tab.offsetLeft);
      right.jump(tab.offsetLeft + tab.offsetWidth);
      placed.current = true;
    };
    snap();
    const observer = new ResizeObserver(snap);
    observer.observe(el);
    return () => observer.disconnect();
  }, [left, right]);

  useLayoutEffect(() => {
    const el = tabs.current.get(selected);
    if (!el || !placed.current) return;
    const l = el.offsetLeft;
    const r = l + el.offsetWidth;
    if (calm) {
      left.jump(l);
      right.jump(r);
      return;
    }
    const goingRight = l > left.get();
    animate(left, l, goingRight ? trail : lead);
    animate(right, r, goingRight ? lead : trail);
  }, [selected, calm, left, right]);

  return (
    <Tabs selectedKey={selected} onSelectionChange={setSelected} className={cx("flex flex-col gap-4", className)}>
      {/* The pill sits beside the TabList, not in it: a TabList's children are its tabs. */}
      <div ref={bar} className="relative w-fit rounded-full bg-muted p-1">
        <motion.span aria-hidden className="absolute inset-y-1 rounded-full bg-fg" style={{ left, width }} />
        <TabList aria-label={label} className="flex gap-1">
        {items.map((item) => (
          <Tab
            key={item.id}
            id={item.id}
            ref={(el) => {
              if (el) tabs.current.set(item.id, el);
            }}
            className={({ isSelected }) =>
              cx(
                "relative z-10 cursor-pointer rounded-full px-4 py-1.5 text-body-md-strong transition-colors duration-(--ds-motion-duration-moderate)",
                isSelected ? "text-canvas" : "text-fg-secondary hover:text-fg",
                focusRing,
              )
            }
          >
            {item.label}
          </Tab>
        ))}
        </TabList>
      </div>
      {items.map((item) => (
        <TabPanel key={item.id} id={item.id} className={cx("rounded-surface", focusRing)}>
          {item.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}
