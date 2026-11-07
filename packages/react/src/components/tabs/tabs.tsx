"use client";
// The sliding-underline measurement was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.

import { useDirection } from "../../foundations/direction";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode, Ref } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import type {
  TabListProps as AriaTabListProps,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
} from "react-aria-components";
import { cx } from "../../utils/cx";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Tabs, set like chapter heads on a page. The strip sits on a 1px separator
 * rule; under the active tab the accent is drawn as a pen stroke that is
 * thin at both ends and full in the middle, and slides between tabs.
 *   tab       px 10, py 8, gap 8 (label and count), text-body-md
 *     active     fg, strong weight
 *     inactive   fg-secondary, darkening to fg on hover
 *   count     mono numerals, no badge: fg-tertiary, fg when active
 *   icon      optional 16px leading glyph, inherits the label colour
 *
 * Built on react-aria Tabs: roving-tabindex arrow-key navigation, automatic
 * activation, and TabList/TabPanel association.
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface TabsProps extends AriaTabsProps {
  ref?: Ref<HTMLDivElement>;
}

export function Tabs({ className, ref, ...props }: TabsProps) {
  return (
    <AriaTabs
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "flex w-full flex-col gap-4",
          state.orientation === "vertical" && "flex-row",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

export interface TabListProps<T extends object> extends AriaTabListProps<T> {
  ref?: Ref<HTMLDivElement>;
}

type Underline = { left: number; width: number };

export function TabList<T extends object>({ className, ref, ...props }: TabListProps<T>) {
  const direction = useDirection();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState<Underline | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => {
      const selected = el.querySelector<HTMLElement>("[role='tab'][data-selected]");
      if (selected) {
        setUnderline({ left: selected.offsetLeft, width: selected.offsetWidth });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Labels and fonts can change width without resizing the full tab strip.
    const observeTabs = () => el.querySelectorAll("[role='tab']").forEach(tab => ro.observe(tab));
    observeTabs();
    const mo = new MutationObserver(() => { observeTabs(); measure(); });
    mo.observe(el, { attributes: true, childList: true, characterData: true, subtree: true, attributeFilter: ["data-selected"] });
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [direction]);

  return (
    <div ref={wrapperRef} className="bui-tabs-strip relative w-full">
      <AriaTabList
        ref={ref}
        {...props}
        className={(state) =>
          cx(
            "bui-tabs-list flex w-full items-center gap-1 border-b border-separator",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
      {underline && (
        <span
          aria-hidden
          className="bui-tabs-indicator pointer-events-none absolute -bottom-px left-0 h-1 bg-accent-600 ink-lens transition-[transform,width] duration-(--ds-motion-duration-moderate) ease-standard motion-reduce:transition-none"
          style={{
            transform: `translateX(${underline.left}px)`,
            width: underline.width,
          }}
        />
      )}
    </div>
  );
}

export interface TabProps extends Omit<AriaTabProps, "children"> {
  children?: ReactNode;
  /** Optional leading icon (16px). Inherits the label color. */
  icon?: IconComponent;
  /** Optional trailing count badge. */
  count?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function Tab({ className, children, icon: Icon, count, ref, ...props }: TabProps) {
  return (
    <AriaTab
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "bui-tab group/tab relative inline-flex cursor-pointer items-center gap-2 px-2.5 py-2 whitespace-nowrap",
          "outline-none transition-colors duration-(--ds-motion-duration-base) ease-standard",
          "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-focus",
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isSelected }) => (
        <>
          <span
            className={cx(
              "inline-flex items-center gap-1.5",
              isSelected
                ? "text-body-md-strong text-fg"
                : "text-body-md text-fg-secondary group-data-[hovered]/tab:text-fg",
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {children}
          </span>
          {count != null && (
            <span
              className={cx(
                "inline-flex items-center font-mono text-caption tabular-nums whitespace-nowrap",
                isSelected ? "text-fg" : "text-fg-tertiary",
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </AriaTab>
  );
}

export interface TabPanelProps extends AriaTabPanelProps {
  ref?: Ref<HTMLDivElement>;
}

export function TabPanel({ className, ref, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-focus",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
