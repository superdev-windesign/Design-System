"use client";

import { useMemo, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type PanInfo } from "motion/react";
import { RiCloseLine, RiNotification3Line } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { LiquidGlass } from "./liquid-glass";

/**
 * Notification stack: notifications gathered by app. Several from one app pile
 * into a stack with the others peeking out behind; pressing it springs them
 * open into a list. Swipe a notification away, or tab to its close button or
 * press Delete on it, which do the same.
 */

export interface StackNotification {
  id: string;
  app: string;
  icon?: IconComponent;
  title: string;
  body: string;
  /** Already formatted, e.g. "9:41" or "2m ago". */
  time: string;
}

export interface NotificationStackProps {
  notifications: StackNotification[];
  onDismiss?: (id: string) => void;
  onOpen?: (notification: StackNotification) => void;
  emptyMessage?: string;
  className?: string;
}

/** Groups by app, keeping the order each app first appears. */
export function groupByApp(notifications: StackNotification[]) {
  const groups = new Map<string, StackNotification[]>();
  for (const notification of notifications) groups.set(notification.app, [...(groups.get(notification.app) ?? []), notification]);
  return [...groups.entries()].map(([app, items]) => ({ app, items }));
}

const SWIPE_DISTANCE = 120;

interface CardProps {
  notification: StackNotification;
  more: number;
  onPress: () => void;
  onDismiss: () => void;
}

function Card({ notification, more, onPress, onDismiss }: CardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const Icon = notification.icon ?? RiNotification3Line;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -800) onDismiss();
  };

  return (
    <motion.div
      drag={reduceMotion ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.9, right: 0.05 }}
      dragSnapToOrigin
      onDragEnd={onDragEnd}
      className="touch-pan-y"
    >
      <LiquidGlass className="group/card flex rounded-surface">
        <AriaButton
          onPress={onPress}
          onKeyDown={(event) => {
            if (event.key === "Delete" || event.key === "Backspace") onDismiss();
            else event.continuePropagation();
          }}
          className={cx("flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-surface p-3 text-start", focusRing)}
        >
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-item bg-accent-600 text-on-action">
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2 pe-6">
              <span className="truncate text-body-sm-strong text-fg">{notification.title}</span>
              <span className="shrink-0 text-caption tabular-nums text-fg-secondary">{notification.time}</span>
            </span>
            <span className="line-clamp-2 block text-body-sm text-fg">{notification.body}</span>
            {more > 0 && <span className="block pt-0.5 text-caption text-fg-secondary">{more} more</span>}
          </span>
        </AriaButton>
        <AriaButton
          aria-label={`Dismiss ${notification.title}`}
          onPress={onDismiss}
          className={cx(
            "absolute end-2 top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-glass-lens text-fg opacity-0 transition-opacity group-hover/card:opacity-100 data-[focus-visible]:opacity-100 motion-reduce:transition-none",
            focusRing,
          )}
        >
          <RiCloseLine aria-hidden className="size-4" />
        </AriaButton>
      </LiquidGlass>
    </motion.div>
  );
}

function AppGroup({ app, items, onDismiss, onOpen }: { app: string; items: StackNotification[]; onDismiss: (id: string) => void; onOpen?: (notification: StackNotification) => void }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const stacked = items.length > 1 && !open;
  const transition = reduceMotion ? { duration: 0 } : layoutSpring;

  return (
    <section aria-label={`${app}, ${items.length} notification${items.length === 1 ? "" : "s"}`} className="flex flex-col gap-2">
      {open && items.length > 1 && (
        <header className="flex items-center justify-between gap-3 px-1">
          <h3 className="rounded-full bg-glass-lens px-3 py-1 text-body-sm-strong text-fg">{app}</h3>
          <AriaButton onPress={() => setOpen(false)} className={cx("cursor-pointer rounded-full bg-glass-lens px-3 py-1 text-body-sm text-fg", focusRing)}>
            Show less
          </AriaButton>
        </header>
      )}
      <div className={cx("relative flex flex-col gap-2", stacked && items.length > 1 && "pb-3")}>
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((notification, index) => {
            if (stacked && index > 2) return null;
            const behind = stacked && index > 0;
            return (
              <motion.div
                key={notification.id}
                layout={!reduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: behind ? 1 - index * 0.05 : 1 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -60 }}
                transition={transition}
                style={{ zIndex: items.length - index }}
                className={behind ? "absolute inset-x-0 bottom-0 top-3" : "relative"}
                aria-hidden={behind || undefined}
                inert={behind || undefined}
              >
                {behind ? (
                  <LiquidGlass className="h-full rounded-surface" />
                ) : (
                  <Card
                    notification={notification}
                    more={stacked ? items.length - 1 : 0}
                    onPress={() => (stacked ? setOpen(true) : onOpen?.(notification))}
                    onDismiss={() => onDismiss(notification.id)}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function NotificationStack({ notifications, onDismiss, onOpen, emptyMessage = "No notifications", className }: NotificationStackProps) {
  const [gone, setGone] = useState<ReadonlySet<string>>(new Set());
  const visible = useMemo(() => notifications.filter((notification) => !gone.has(notification.id)), [notifications, gone]);
  const groups = useMemo(() => groupByApp(visible), [visible]);

  const dismiss = (id: string) => {
    setGone((set) => new Set(set).add(id));
    onDismiss?.(id);
  };

  return (
    <LayoutGroup>
      <div className={cx("flex w-full max-w-sm flex-col gap-3", className)}>
        {groups.length === 0 ? (
          <p className="py-8 text-center text-body-md text-fg-secondary">{emptyMessage}</p>
        ) : (
          groups.map(({ app, items }) => <AppGroup key={app} app={app} items={items} onDismiss={dismiss} onOpen={onOpen} />)
        )}
      </div>
    </LayoutGroup>
  );
}
