"use client";

import { useEffect, useState } from "react";
import { useLocale } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Formatting for times and numbers, in the reader's locale.
 *
 * - `formatRelativeTime` / `RelativeTime`: "3 minutes ago", "in 2 days",
 *   "yesterday". The component renders a `<time>` with the exact date in its
 *   tooltip and keeps itself current.
 * - `formatCompactNumber` / `FormattedNumber`: "1.2K", "3.4M", or any
 *   Intl.NumberFormat style (currency, percent, units).
 */

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

type DateInput = Date | number | string;

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

export function formatRelativeTime(value: DateInput, { now = Date.now(), locale, numeric = "auto" }: { now?: number; locale?: string; numeric?: "auto" | "always" } = {}) {
  const seconds = Math.round((toDate(value).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric });
  if (Math.abs(seconds) < 45) return format.format(0, "second");
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "second") return format.format(Math.round(seconds / size), unit);
  }
  return format.format(seconds, "second");
}

export function formatCompactNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1, ...options }).format(value);
}

export interface RelativeTimeProps {
  date: DateInput;
  /** Re-render this often, in milliseconds. Default 60 000. */
  updateInterval?: number;
  className?: string;
}

export function RelativeTime({ date, updateInterval = 60_000, className }: RelativeTimeProps) {
  const { locale } = useLocale();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), updateInterval);
    return () => clearInterval(id);
  }, [updateInterval]);
  const d = toDate(date);
  const exact = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(d);
  return (
    <time dateTime={d.toISOString()} title={exact} className={className}>
      {formatRelativeTime(d, { now, locale })}
    </time>
  );
}

export interface FormattedNumberProps extends Intl.NumberFormatOptions {
  value: number;
  /** Shorthand for `notation: "compact"`. */
  compact?: boolean;
  className?: string;
}

export function FormattedNumber({ value, compact = false, className, ...options }: FormattedNumberProps) {
  const { locale } = useLocale();
  const text = new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1, ...options } : options).format(value);
  const full = compact ? new Intl.NumberFormat(locale, { ...options, notation: "standard" }).format(value) : undefined;
  return (
    <data value={String(value)} title={full} className={cx("tabular-nums", className)}>
      {text}
    </data>
  );
}
