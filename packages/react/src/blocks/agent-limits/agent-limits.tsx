"use client";

import type { ReactNode } from "react";
import { Label, Meter } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { RiErrorWarningLine } from "@remixicon/react";
import { easing } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Agent Limits: how much room an agent has left. The context window is one
 * bar split by what's filling it (instructions, conversation, files), with
 * the free space after; below it, plan quotas each get a meter and a reset
 * time. Anything past the warning threshold turns orange, past full red, and
 * the card says what to do about it.
 */

export interface ContextPart {
  label: string;
  /** Tokens. */
  value: number;
}

export interface UsageQuota {
  label: string;
  used: number;
  limit: number;
  /** e.g. "Resets at midnight". */
  resets?: string;
  /** Formats used/limit; defaults to compact numbers. */
  format?: (value: number) => string;
}

export interface AgentLimitsProps {
  context: { parts: ContextPart[]; limit: number };
  quotas?: UsageQuota[];
  /** Badge in the header, e.g. "Team plan". */
  plan?: ReactNode;
  /** Share (0–1) at which bars turn to the warning colour. */
  warnAt?: number;
  /** Shown under the context bar once it passes `warnAt`, e.g. a "Compact" button. */
  contextAction?: ReactNode;
  className?: string;
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const PART_FILLS = ["bg-chart-6", "bg-chart-5", "bg-chart-1", "bg-chart-3"] as const;

const levelOf = (share: number, warnAt: number) => (share >= 1 ? "full" : share >= warnAt ? "warn" : "ok");
const LEVEL_FILL = { ok: "bg-accent-500", warn: "bg-chart-8", full: "bg-status-danger-solid" } as const;

export function AgentLimits({ context, quotas = [], plan, warnAt = 0.8, contextAction, className }: AgentLimitsProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const used = context.parts.reduce((s, p) => s + p.value, 0);
  const share = used / Math.max(1, context.limit);
  const contextLevel = levelOf(share, warnAt);
  const grow = (i: number) => ({
    initial: reduceMotion ? false : ({ scaleX: 0 } as const),
    animate: { scaleX: 1 },
    transition: { duration: 0.7, delay: 0.1 + i * 0.08, ease: easing.enter },
  });

  return (
    <section className={cx("flex w-full flex-col gap-5 rounded-2xl border border-line bg-surface p-4", className)}>
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-body-md-strong text-fg">Usage</h3>
        {plan && <span className="rounded-full bg-muted px-2 py-0.5 text-caption-strong text-fg-secondary">{plan}</span>}
      </header>

      {/* Context window */}
      <Meter value={used} maxValue={context.limit} className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label className="text-body-sm-strong text-fg-secondary">Context window</Label>
          <span className="text-body-sm text-fg-secondary tabular-nums">
            <span className="text-body-md-strong text-fg">{percent.format(share)}</span> · {compact.format(used)} / {compact.format(context.limit)}
          </span>
        </div>
        <div aria-hidden className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-chart-track">
          {context.parts.map((part, i) => (
            <motion.span
              key={part.label}
              className={cx("h-full origin-left rtl:origin-right", contextLevel === "ok" ? PART_FILLS[i % PART_FILLS.length] : LEVEL_FILL[contextLevel])}
              style={{ width: `${(part.value / context.limit) * 100}%` }}
              {...grow(i)}
            />
          ))}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-fg-secondary">
          {context.parts.map((part, i) => (
            <li key={part.label} className="flex items-center gap-1.5 tabular-nums">
              <span aria-hidden className={cx("size-2 rounded-full", PART_FILLS[i % PART_FILLS.length])} />
              {part.label} {compact.format(part.value)}
            </li>
          ))}
          <li className="flex items-center gap-1.5 tabular-nums">
            <span aria-hidden className="size-2 rounded-full bg-chart-track" />
            Free {compact.format(Math.max(0, context.limit - used))}
          </li>
        </ul>
        {contextLevel !== "ok" && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sunken px-3 py-2">
            <RiErrorWarningLine aria-hidden className="size-4 shrink-0 text-icon-secondary" />
            <p className="flex-1 text-body-sm text-fg">
              {contextLevel === "full" ? "The context is full; older messages are being dropped." : "The context is nearly full. Compact it to keep going without losing the thread."}
            </p>
            {contextAction}
          </div>
        )}
      </Meter>

      {quotas.length > 0 && (
        <ul className="flex flex-col gap-4 border-t border-line pt-4">
          {quotas.map((quota, i) => {
            const fmt = quota.format ?? ((v: number) => compact.format(v));
            const q = quota.used / Math.max(1, quota.limit);
            const level = levelOf(q, warnAt);
            return (
              <li key={quota.label}>
                <Meter value={quota.used} maxValue={quota.limit} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <Label className="text-body-sm-strong text-fg">{quota.label}</Label>
                    <span className="text-body-sm text-fg-secondary tabular-nums">
                      {fmt(quota.used)} / {fmt(quota.limit)}
                    </span>
                  </div>
                  <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-chart-track">
                    <motion.span
                      className={cx("block h-full origin-left rounded-full rtl:origin-right", LEVEL_FILL[level])}
                      style={{ width: `${Math.min(1, q) * 100}%` }}
                      {...grow(i + context.parts.length)}
                    />
                  </div>
                  {quota.resets && <span className="text-caption text-fg-secondary">{quota.resets}</span>}
                </Meter>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
