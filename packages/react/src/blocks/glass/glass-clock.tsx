"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { LiquidButton } from "./liquid-button";

/**
 * Glass clock: the time in lit segments on a pane of glass, the way a bedside
 * clock shows it, with the unlit segments just visible behind. Give it `onSnooze`
 * and `onStop` and it becomes an alarm.
 *
 * The segments are drawn, so they're hidden from assistive tech; a `<time>`
 * element carries the same reading as text.
 */

/** Which of the seven segments each digit lights: a–g, clockwise from the top, g in the middle. */
const DIGITS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

const SEGMENTS: Record<string, string> = {
  a: "10,2 50,2 44,10 16,10",
  b: "52,4 52,46 46,42 46,12",
  c: "52,54 52,96 46,88 46,58",
  d: "10,98 50,98 44,90 16,90",
  e: "8,54 8,96 14,88 14,58",
  f: "8,4 8,46 14,42 14,12",
  g: "10,50 16,45 44,45 50,50 44,55 16,55",
};

/** "09:41" from a date. Twelve-hour time keeps its leading zero, so the digits don't shift. */
export function clockDigits(time: Date, hour12 = false) {
  const hours = time.getHours();
  const shown = hour12 ? hours % 12 || 12 : hours;
  return `${String(shown).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
}

/** The segments a digit lights. */
export const litSegments = (digit: string) => DIGITS[digit] ?? "";

function Digit({ value }: { value: string }) {
  const lit = litSegments(value);
  return (
    <svg viewBox="0 0 60 100" className="h-full w-auto">
      {Object.entries(SEGMENTS).map(([name, points]) => (
        <polygon key={name} points={points} className={lit.includes(name) ? "fill-fg" : "fill-fg/6"} />
      ))}
    </svg>
  );
}

export interface GlassClockProps {
  /** Show this time. Without it, the clock keeps its own. */
  time?: Date;
  hour12?: boolean;
  /** A line above the time. */
  greeting?: ReactNode;
  onSnooze?: () => void;
  onStop?: () => void;
  className?: string;
}

export function GlassClock({ time, hour12 = false, greeting, onSnooze, onStop, className }: GlassClockProps) {
  const [now, setNow] = useState<Date | null>(time ?? null);

  useEffect(() => {
    if (time) return;
    const tick = () => setNow(new Date());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [time]);

  const shown = time ?? now;
  const digits = shown ? clockDigits(shown, hour12) : "--:--";

  return (
    <section className={cx("glass-panel glass-slab flex w-full max-w-md flex-col gap-4 rounded-panel border p-5", className)}>
      {greeting && <p className="text-title-sm-strong text-fg">{greeting}</p>}
      <div aria-hidden className="flex h-24 items-center justify-center gap-1.5 sm:h-28">
        {[...digits].map((character, index) =>
          character === ":" ? (
            <span key={index} className="flex flex-col gap-3">
              <span className="size-2 rounded-full bg-fg" />
              <span className="size-2 rounded-full bg-fg" />
            </span>
          ) : (
            <Digit key={index} value={character} />
          ),
        )}
      </div>
      <time dateTime={digits} className="sr-only">
        {digits}
      </time>
      {(onSnooze || onStop) && (
        <div className="flex justify-between gap-2">
          {onSnooze && (
            <LiquidButton size="sm" variant="glow" onPress={onSnooze}>
              Snooze
            </LiquidButton>
          )}
          {onStop && (
            <LiquidButton size="sm" variant="frost" onPress={onStop} className="ms-auto">
              Stop
            </LiquidButton>
          )}
        </div>
      )}
    </section>
  );
}
