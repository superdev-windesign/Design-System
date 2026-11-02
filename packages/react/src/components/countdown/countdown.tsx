"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { RiPauseLine, RiPlayLine, RiRestartLine } from "@remixicon/react";
import { Button } from "../button/button";
import { cx } from "../../utils/cx";

/**
 * Countdown and Stopwatch.
 *
 * `Countdown` counts down to a moment (a launch, a sale ending, an auction)
 * in large mono figures with unit labels, and calls `onComplete` at zero.
 * It's a `timer` region, so screen readers don't announce every second;
 * the full remaining time is there as text when someone reads it.
 *
 * `Stopwatch` counts up from zero with start, pause and reset.
 */

type Unit = "days" | "hours" | "minutes" | "seconds";

const SECONDS: Record<Unit, number> = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };

/** Milliseconds left until `to`, ticking every second; 0 once it's passed. */
export function useCountdown(to: Date | number) {
  const target = typeof to === "number" ? to : to.getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (Date.now() >= target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return Math.max(0, target - now);
}

export interface CountdownProps {
  to: Date | number;
  /** Units shown, largest first. Default days, hours, minutes, seconds. */
  units?: Unit[];
  onComplete?: () => void;
  /** Names the timer, e.g. "Sale ends in". */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function Countdown({ to, units = ["days", "hours", "minutes", "seconds"], onComplete, label = "Time left", size = "md", className }: CountdownProps) {
  const remaining = useCountdown(to);
  const done = useRef(false);

  useEffect(() => {
    if (remaining === 0 && !done.current) {
      done.current = true;
      onComplete?.();
    }
  }, [remaining, onComplete]);

  let left = Math.floor(remaining / 1000);
  const parts = units.map((unit) => {
    const amount = Math.floor(left / SECONDS[unit]);
    left -= amount * SECONDS[unit];
    return { unit, amount };
  });
  const spoken = parts.map((p) => `${p.amount} ${p.amount === 1 ? p.unit.slice(0, -1) : p.unit}`).join(", ");

  return (
    <div role="timer" aria-label={label} className={cx("inline-flex items-start", size === "md" ? "gap-1.5 sm:gap-3" : "gap-1.5", className)}>
      <span className="sr-only">{remaining === 0 ? "Time's up" : spoken}</span>
      {parts.map((p, i) => (
        <Fragment key={p.unit}>
          {i > 0 && (
            <span aria-hidden className={cx("font-mono text-fg-tertiary", size === "md" ? "text-title-lg-strong sm:text-display-sm" : "text-body-md")}>
              :
            </span>
          )}
          <span aria-hidden className="flex flex-col items-center gap-1">
            <span
              className={cx(
                "rounded-control-md border border-line bg-surface font-mono tabular-nums text-fg",
                size === "md" ? "min-w-12 px-1.5 py-1 text-center text-title-lg-strong sm:min-w-16 sm:px-2 sm:text-display-sm" : "min-w-8 px-1 text-center text-body-md-strong",
              )}
            >
              {String(p.amount).padStart(2, "0")}
            </span>
            {size === "md" && <span className="font-mono text-caption tracking-wide text-fg-secondary uppercase">{p.unit}</span>}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "mm:ss.cc", or "h:mm:ss" past an hour. */
export function formatElapsed(ms: number) {
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

export interface StopwatchProps {
  label?: string;
  className?: string;
}

export function Stopwatch({ label = "Stopwatch", className }: StopwatchProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const started = useRef(0);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    started.current = Date.now();
    const id = setInterval(() => setElapsed(base.current + Date.now() - started.current), 50);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      // Bank the time run so far; the next start continues from here.
      base.current += Date.now() - started.current;
      setElapsed(base.current);
    }
    setRunning(!running);
  };

  return (
    <div role="group" aria-label={label} className={cx("inline-flex flex-col items-center gap-3", className)}>
      <span role="timer" aria-label="Elapsed" className="font-mono text-display-md tabular-nums text-fg">
        {formatElapsed(elapsed)}
      </span>
      <div className="flex gap-2">
        <Button variant={running ? "secondary" : "primary"} leadingIcon={running ? RiPauseLine : RiPlayLine} onPress={toggle}>
          {running ? "Pause" : elapsed ? "Resume" : "Start"}
        </Button>
        <Button
          variant="tertiary"
          leadingIcon={RiRestartLine}
          isDisabled={!elapsed && !running}
          onPress={() => {
            setRunning(false);
            base.current = 0;
            setElapsed(0);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
