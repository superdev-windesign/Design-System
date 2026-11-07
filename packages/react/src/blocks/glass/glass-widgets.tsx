"use client";

import type { ReactNode } from "react";
import { RiArrowRightLine, RiFlightTakeoffLine, RiPlaneFill } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { cx } from "../../utils/cx";
import { glowStyle, type GlowTone } from "./liquid-light";

/**
 * Glanceable widgets on panes of glass. Each is one fact, readable at arm's
 * length, with the detail kept small underneath.
 */

export interface WeatherStat {
  id: string;
  label: string;
  value: ReactNode;
  icon: IconComponent;
}

export interface WeatherWidgetProps {
  place: string;
  /** e.g. "Today" or "Tuesday". */
  day?: string;
  temperature: number;
  condition: string;
  icon: IconComponent;
  /** The light behind the icon. Default sun. */
  tone?: GlowTone;
  high?: number;
  low?: number;
  stats?: WeatherStat[];
  className?: string;
}

export function WeatherWidget({ place, day, temperature, condition, icon: Icon, tone = "sun", high, low, stats = [], className }: WeatherWidgetProps) {
  return (
    <section aria-label={`Weather in ${place}`} className={cx("glass-panel glass-slab flex w-full max-w-72 flex-col items-center gap-3 rounded-panel border p-5 text-center", className)}>
      <header>
        <h3 className="text-title-sm-strong text-fg">{place}</h3>
        {day && <p className="text-body-sm text-fg-secondary">{day}</p>}
      </header>
      <span aria-hidden style={glowStyle(tone)} className="glass-glow flex size-20 items-center justify-center rounded-full">
        <Icon className="size-10 text-fg" />
      </span>
      <div>
        <p className="text-display-md font-normal tabular-nums text-fg">{temperature}°</p>
        <p className="text-body-md text-fg-secondary">
          {condition}
          {high !== undefined && low !== undefined && (
            <span className="tabular-nums">
              {" "}
              · {high}° / {low}°
            </span>
          )}
        </p>
      </div>
      {stats.length > 0 && (
        <dl className="flex w-full justify-around border-t border-line pt-3">
          {stats.map(({ id, label, value, icon: StatIcon }) => (
            <div key={id} className="flex flex-col items-center gap-0.5">
              <StatIcon aria-hidden className="size-4 text-icon-secondary" />
              <dt className="sr-only">{label}</dt>
              <dd className="text-body-sm-strong tabular-nums text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export interface FlightStop {
  /** Airport code. */
  code: string;
  city?: string;
  /** Already formatted, e.g. "9:40 AM". */
  time: string;
}

export interface FlightWidgetProps {
  flight: string;
  /** e.g. "Landing in 3h 24m". */
  status: string;
  from: FlightStop;
  to: FlightStop;
  /** How far along the flight is, 0–1. */
  progress: number;
  className?: string;
}

export function FlightWidget({ flight, status, from, to, progress, className }: FlightWidgetProps) {
  const done = Math.min(1, Math.max(0, progress));
  const percent = Math.round(done * 100);
  return (
    <section aria-label={`Flight ${flight} from ${from.code} to ${to.code}`} className={cx("glass-panel glass-slab flex w-full max-w-sm flex-col gap-4 rounded-panel border p-5", className)}>
      <header className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-body-sm-strong text-fg">
          <RiFlightTakeoffLine aria-hidden className="size-4" />
          {flight}
        </h3>
        <p className="text-body-sm text-fg-secondary">{status}</p>
      </header>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-title-lg-strong text-fg">{from.code}</p>
          <p className="text-caption tabular-nums text-fg-secondary">{from.time}</p>
        </div>
        <div role="progressbar" aria-label="Flight progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="relative h-6 min-w-0 flex-1">
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-fg/20" />
          <span aria-hidden className="absolute start-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-accent-600" style={{ width: `${percent}%` }} />
          <RiPlaneFill aria-hidden className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rotate-90 text-fg rtl:translate-x-1/2 rtl:-rotate-90" style={{ insetInlineStart: `${percent}%` }} />
        </div>
        <div className="text-end">
          <p className="text-title-lg-strong text-fg">{to.code}</p>
          <p className="text-caption tabular-nums text-fg-secondary">{to.time}</p>
        </div>
      </div>
      {(from.city || to.city) && (
        <p className="flex items-center gap-1.5 text-body-sm text-fg-secondary">
          {from.city}
          <RiArrowRightLine aria-label="to" className="size-3.5 rtl:rotate-180" />
          {to.city}
        </p>
      )}
    </section>
  );
}
