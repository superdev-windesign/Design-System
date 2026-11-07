"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { Button as AriaButton, Tab, TabList, Tabs } from "react-aria-components";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { RiSearchLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { GlassMaterial, LiquidGlass } from "./liquid-glass";

/**
 * Floating tab bar: navigation on a capsule of glass above the content. A lens
 * glides to the selected tab. A search tab can sit apart at the trailing end.
 * While someone scrolls down it can minimize to just the current tab, handing
 * the width to an accessory such as a mini player; tapping it, or scrolling
 * back up, brings the tabs back.
 *
 * It's for moving between sections, not for actions, and it works best with
 * five tabs or fewer. Pair it with `useMinimizeOnScroll`.
 */

export interface GlassTab {
  id: string;
  /** One word where possible. */
  label: string;
  icon: IconComponent;
  /** Keep these for things that need attention. */
  badge?: ReactNode;
}

export interface GlassTabBarProps {
  tabs: GlassTab[];
  selected?: string;
  defaultSelected?: string;
  onSelectionChange?: (id: string) => void;
  /** Adds a search tab at the trailing end. */
  onSearch?: () => void;
  searchLabel?: string;
  /** Collapse to the current tab. */
  minimized?: boolean;
  /** The minimized tab was pressed. */
  onExpand?: () => void;
  /** Sits above the tabs, and moves inline when they minimize. */
  accessory?: ReactNode;
  "aria-label"?: string;
  className?: string;
}

/** True while scrolled down past the start of a scroller, false on the way back up. */
export function useMinimizeOnScroll(scroller: RefObject<HTMLElement | null>, threshold = 12) {
  const [minimized, setMinimized] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const onScroll = () => {
      const top = element.scrollTop;
      if (top < threshold) setMinimized(false);
      else if (top > last.current + threshold) setMinimized(true);
      else if (top < last.current - threshold) setMinimized(false);
      else return;
      last.current = top;
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [scroller, threshold]);

  return minimized;
}

function TabContent({ tab, active }: { tab: GlassTab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <>
      <span className="relative">
        <Icon aria-hidden className="size-6" />
        {tab.badge !== undefined && (
          <span className="absolute -end-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-action-danger px-1 text-caption tabular-nums text-on-action">
            {tab.badge}
          </span>
        )}
      </span>
      <span className={cx("text-caption", active && "text-caption-strong")}>{tab.label}</span>
    </>
  );
}

export function GlassTabBar({
  tabs,
  selected,
  defaultSelected,
  onSelectionChange,
  onSearch,
  searchLabel = "Search",
  minimized = false,
  onExpand,
  accessory,
  "aria-label": ariaLabel = "Sections",
  className,
}: GlassTabBarProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const group = useId();
  const [own, setOwn] = useState(defaultSelected ?? tabs[0]?.id ?? "");
  const current = selected ?? own;
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  const transition = reduceMotion ? { duration: 0 } : layoutSpring;

  return (
    <LayoutGroup id={group}>
      <div className={cx("flex w-full max-w-md flex-col gap-2", className)}>
        {accessory && !minimized && (
          <motion.div layout="position" transition={transition}>
            {accessory}
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <motion.div layout transition={transition} className={minimized ? "shrink-0" : "min-w-0 flex-1"}>
            <LiquidGlass refract className="rounded-full p-1">
              {minimized && active ? (
                <AriaButton
                  aria-label={`${active.label}, show all tabs`}
                  onPress={onExpand}
                  className={cx("relative flex h-14 w-16 cursor-pointer flex-col items-center justify-center rounded-full text-action-tertiary-fg", focusRing)}
                >
                  <motion.span layoutId="lens" transition={transition} className="absolute inset-0 -z-10 rounded-full bg-glass-lens" />
                  <TabContent tab={active} active />
                </AriaButton>
              ) : (
                <Tabs
                  selectedKey={current}
                  onSelectionChange={(key) => {
                    setOwn(String(key));
                    onSelectionChange?.(String(key));
                  }}
                >
                  <TabList aria-label={ariaLabel} className="flex">
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.id}
                        id={tab.id}
                        className={({ isSelected }) =>
                          cx(
                            "relative flex h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-full outline-none transition-colors",
                            isSelected ? "text-action-tertiary-fg" : "text-fg data-[hovered]:text-fg-secondary",
                            focusRing,
                          )
                        }
                      >
                        {({ isSelected }) => (
                          <>
                            {isSelected && <motion.span layoutId="lens" transition={transition} className="absolute inset-0 -z-10 rounded-full bg-glass-lens" />}
                            <TabContent tab={tab} active={isSelected} />
                          </>
                        )}
                      </Tab>
                    ))}
                  </TabList>
                </Tabs>
              )}
            </LiquidGlass>
          </motion.div>

          {minimized && accessory && <div className="min-w-0 flex-1">{accessory}</div>}

          {onSearch && (
            <AriaButton
              aria-label={searchLabel}
              onPress={onSearch}
              className={cx("glass-rim relative isolate flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg transition-transform data-[pressed]:scale-95 motion-reduce:transition-none", focusRing)}
            >
              <GlassMaterial refract />
              <RiSearchLine aria-hidden className="size-6" />
            </AriaButton>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}
