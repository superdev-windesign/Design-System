"use client";

import type { ReactNode } from "react";
import type { IconComponent } from "../button/button";
import { cx } from "../../utils/cx";

/**
 * Timeline: events in order along a ruled spine (an activity feed, a
 * changelog, an order's history). Each event has a marker (a dot, an icon or
 * an avatar), a title, a time and optional detail. Markers take a tone, and
 * the time is a real `<time>` when you pass `dateTime`.
 *
 * Newest-first or oldest-first is up to you; the list is an `<ol>` in the
 * order given.
 */

export type TimelineTone = "neutral" | "accent" | "success" | "warning" | "danger";

const DOT: Record<TimelineTone, string> = {
  neutral: "bg-surface ring-2 ring-line-control",
  accent: "bg-accent-600 ring-4 ring-surface",
  success: "bg-status-success-solid ring-4 ring-surface",
  warning: "bg-status-warning-solid ring-4 ring-surface",
  danger: "bg-status-danger-solid ring-4 ring-surface",
};

const ICON: Record<TimelineTone, string> = {
  neutral: "text-icon-secondary",
  accent: "text-accent-600",
  success: "text-status-success-text",
  warning: "text-status-warning-text",
  danger: "text-status-danger-text",
};

export interface TimelineProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Timeline({ children, className, "aria-label": ariaLabel }: TimelineProps) {
  return (
    <ol aria-label={ariaLabel} className={cx("flex flex-col", className)}>
      {children}
    </ol>
  );
}

export interface TimelineItemProps {
  title: ReactNode;
  /** Shown as written, e.g. "2h ago" or "12 Mar, 09:40". */
  time?: ReactNode;
  /** Machine-readable time for `<time dateTime>`. */
  dateTime?: string;
  children?: ReactNode;
  tone?: TimelineTone;
  icon?: IconComponent;
  /** An avatar in place of the dot. */
  avatar?: ReactNode;
  className?: string;
}

export function TimelineItem({ title, time, dateTime, children, tone = "neutral", icon: Icon, avatar, className }: TimelineItemProps) {
  return (
    <li className={cx("group/item relative flex gap-3 pb-6 last:pb-0", className)}>
      {/* The spine, from this marker down to the next. */}
      <span aria-hidden className="absolute start-3.5 top-8 bottom-0 w-px -translate-x-1/2 bg-line group-last/item:hidden rtl:translate-x-1/2" />
      <span aria-hidden className="relative flex size-7 shrink-0 items-center justify-center">
        {avatar ??
          (Icon ? (
            <span className={cx("flex size-7 items-center justify-center rounded-full border border-line bg-surface", ICON[tone])}>
              <Icon className="size-3.5" />
            </span>
          ) : (
            <span className={cx("size-2.5 rounded-full", DOT[tone])} />
          ))}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-body-md-strong text-fg">{title}</p>
          {time && (dateTime ? <time dateTime={dateTime} className="font-mono text-caption text-fg-secondary">{time}</time> : <span className="font-mono text-caption text-fg-secondary">{time}</span>)}
        </div>
        {children && <div className="text-body-md text-pretty text-fg-secondary">{children}</div>}
      </div>
    </li>
  );
}
