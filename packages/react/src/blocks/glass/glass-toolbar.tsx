"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button as AriaButton, ToggleButton, Toolbar } from "react-aria-components";
import { RiMoreLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { LiquidGlass } from "./liquid-glass";
import { MorphMenu, type MorphMenuItem } from "./morph-menu";

/**
 * Glass toolbar: actions floating over content, gathered into capsules by what
 * they do. Each group shares one piece of glass, and space between groups keeps
 * them separate. When the bar runs out of room, the trailing actions fold into
 * a single "more" button that morphs into a menu.
 *
 * A soft scroll edge sits underneath, so content passing below never fights the
 * controls. Colour is kept to one prominent action at most.
 */

export interface GlassToolbarAction {
  id: string;
  /** Required: icons alone need a name. */
  label: string;
  icon: IconComponent;
  onPress?: () => void;
  /** Makes this an on/off action. */
  isSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** The one action that matters most. Sits apart, in the accent colour. */
  isProminent?: boolean;
  isDisabled?: boolean;
}

export interface GlassToolbarGroup {
  id: string;
  actions: GlassToolbarAction[];
}

export interface GlassToolbarProps {
  "aria-label": string;
  /** Groups at the start. */
  leading?: GlassToolbarGroup[];
  title?: ReactNode;
  /** Groups at the end. These fold into a menu when there's no room. */
  trailing?: GlassToolbarGroup[];
  /** Soften content scrolling beneath the bar. Default true. */
  scrollEdge?: boolean;
  /** Below this width, in px, the trailing actions fold. Default 520. */
  foldWidth?: number;
  className?: string;
}

const BUTTON = cx(
  "flex size-11 cursor-pointer items-center justify-center rounded-full text-fg transition-[background-color,scale] duration-(--ds-motion-duration-base)",
  "data-[hovered]:bg-glass-lens data-[pressed]:scale-95 data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled motion-reduce:transition-none",
  focusRing,
);

function Action({ action }: { action: GlassToolbarAction }) {
  const Icon = action.icon;
  if (action.isSelected !== undefined) {
    return (
      <ToggleButton
        aria-label={action.label}
        isSelected={action.isSelected}
        onChange={action.onSelectedChange}
        isDisabled={action.isDisabled}
        className={({ isSelected }) => cx(BUTTON, isSelected && "bg-glass-lens text-action-tertiary-fg")}
      >
        <Icon aria-hidden className="size-5" />
      </ToggleButton>
    );
  }
  return (
    <AriaButton aria-label={action.label} onPress={action.onPress} isDisabled={action.isDisabled} className={BUTTON}>
      <Icon aria-hidden className="size-5" />
    </AriaButton>
  );
}

function ActionGroup({ group }: { group: GlassToolbarGroup }) {
  const prominent = group.actions.filter((action) => action.isProminent);
  const quiet = group.actions.filter((action) => !action.isProminent);
  return (
    <>
      {quiet.length > 0 && (
        <LiquidGlass refract role="group" className="flex shrink-0 rounded-full p-0.5">
          {quiet.map((action) => (
            <Action key={action.id} action={action} />
          ))}
        </LiquidGlass>
      )}
      {prominent.map((action) => {
        const Icon = action.icon;
        return (
          <AriaButton
            key={action.id}
            aria-label={action.label}
            onPress={action.onPress}
            isDisabled={action.isDisabled}
            className={cx(BUTTON, "size-12 shrink-0 bg-accent-600 text-on-action shadow-glass data-[hovered]:bg-accent-700")}
          >
            <Icon aria-hidden className="size-5" />
          </AriaButton>
        );
      })}
    </>
  );
}

export function GlassToolbar({ "aria-label": ariaLabel, leading = [], title, trailing = [], scrollEdge = true, foldWidth = 520, className }: GlassToolbarProps) {
  const bar = useRef<HTMLDivElement>(null);
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    const element = bar.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => setFolded(element.offsetWidth < foldWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [foldWidth]);

  // The prominent action stays out; everything else can fold.
  const foldable = trailing.flatMap((group) => group.actions).filter((action) => !action.isProminent);
  const prominent = trailing.flatMap((group) => group.actions).filter((action) => action.isProminent);
  const items: MorphMenuItem[] = foldable.map(({ id, label, icon, isDisabled }) => ({ id, label, icon, isDisabled }));

  return (
    <div ref={bar} className={cx("relative w-full", className)}>
      {scrollEdge && <div aria-hidden className="glass-scroll-edge pointer-events-none absolute inset-x-0 -top-2 -bottom-6" />}
      <Toolbar aria-label={ariaLabel} className="relative flex items-center gap-2 px-2 py-1">
        {leading.map((group) => (
          <ActionGroup key={group.id} group={group} />
        ))}
        <div className="min-w-0 flex-1 truncate text-center text-body-md-strong text-fg">{title}</div>
        {folded ? (
          <>
            {foldable.length > 0 && (
              <MorphMenu
                aria-label="More actions"
                align="end"
                sections={[{ id: "more", items }]}
                onAction={(id) => {
                  const action = foldable.find((entry) => entry.id === id);
                  if (action?.isSelected !== undefined) action.onSelectedChange?.(!action.isSelected);
                  else action?.onPress?.();
                }}
                className="px-0"
              >
                <RiMoreLine aria-hidden className="size-5" />
              </MorphMenu>
            )}
            {prominent.length > 0 && <ActionGroup group={{ id: "prominent", actions: prominent }} />}
          </>
        ) : (
          trailing.map((group) => <ActionGroup key={group.id} group={group} />)
        )}
      </Toolbar>
    </div>
  );
}
