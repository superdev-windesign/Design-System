"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { LiquidGlass } from "./liquid-glass";

/**
 * Wheel picker: columns of values on a rotating drum, with the chosen row under
 * a lens in the middle. Spin a column by scrolling or dragging it, press a value
 * to bring it to the centre, or focus a column and use the arrow keys.
 *
 * Each column is a spinbutton. It's for picking from an ordered set, such as a
 * time or a date. Scrolling snaps natively, so it feels right on touch.
 */

export interface WheelOption {
  value: string;
  label: string;
}

export interface WheelColumn {
  id: string;
  /** Names the column for assistive tech. */
  label: string;
  options: WheelOption[];
  align?: "start" | "center" | "end";
}

export interface WheelPickerProps {
  columns: WheelColumn[];
  value?: Record<string, string>;
  defaultValue?: Record<string, string>;
  onChange?: (value: Record<string, string>) => void;
  /** Rows showing, odd so one sits in the middle. Default 5. */
  rows?: number;
  "aria-label"?: string;
  className?: string;
}

const ROW = 36;
const ROTATION = 20;

/** The option nearest a scroll position. */
export function wheelIndexAt(scrollTop: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.round(scrollTop / ROW)));
}

interface ColumnProps {
  column: WheelColumn;
  value?: string;
  rows: number;
  onSelect: (value: string) => void;
}

function Wheel({ column, value, rows, onSelect }: ColumnProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const list = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef(0);
  const { options } = column;
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const latest = useRef(index);
  latest.current = index;

  // Tilts each row by how far it sits from the middle, so the column reads as a drum.
  const paint = useCallback(() => {
    const element = list.current;
    if (!element) return;
    const children = element.children;
    for (let i = 0; i < children.length; i += 1) {
      const row = children[i] as HTMLElement;
      const offset = (i * ROW - element.scrollTop) / ROW;
      const distance = Math.min(Math.abs(offset), 3);
      row.style.opacity = String(Math.max(0.2, 1 - distance * 0.3));
      row.style.transform = reduceMotion ? "" : `rotateX(${Math.max(-60, Math.min(60, -offset * ROTATION))}deg)`;
    }
  }, [reduceMotion]);

  // A value set from outside moves the wheel, unless the wheel is what set it.
  useEffect(() => {
    const element = list.current;
    if (!element) return;
    if (wheelIndexAt(element.scrollTop, options.length) !== index) element.scrollTop = index * ROW;
    paint();
  }, [index, options.length, paint]);

  useEffect(
    () => () => {
      clearTimeout(settle.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  const go = (next: number) => {
    const target = Math.max(0, Math.min(options.length - 1, next));
    const option = options[target];
    if (!option) return;
    onSelect(option.value);
    const element = list.current;
    if (element?.scrollTo) element.scrollTo({ top: target * ROW, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(paint);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const element = list.current;
      if (!element) return;
      const landed = wheelIndexAt(element.scrollTop, options.length);
      const option = options[landed];
      if (option && landed !== latest.current) onSelect(option.value);
    }, 120);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const page = Math.max(1, rows - 1);
    const next = { ArrowUp: index - 1, ArrowDown: index + 1, PageUp: index - page, PageDown: index + page, Home: 0, End: options.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    go(next);
  };

  const pad = ((rows - 1) / 2) * ROW;

  return (
    <div
      ref={list}
      role="spinbutton"
      tabIndex={0}
      aria-label={column.label}
      aria-valuemin={0}
      aria-valuemax={options.length - 1}
      aria-valuenow={index}
      aria-valuetext={options[index]?.label}
      onKeyDown={onKeyDown}
      onScroll={onScroll}
      style={{ height: rows * ROW, paddingBlock: pad, perspective: 400 }}
      className={cx("scrollbar-none wheel-fade min-w-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-item", focusRingNative)}
    >
      {options.map((option, position) => (
        <div
          key={option.value}
          aria-hidden
          onClick={() => go(position)}
          className={cx(
            "flex h-9 cursor-pointer snap-center items-center px-3 text-title-sm-strong font-normal tabular-nums text-fg select-none",
            column.align === "start" ? "justify-start" : column.align === "end" ? "justify-end" : "justify-center",
          )}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

export function WheelPicker({ columns, value, defaultValue = {}, onChange, rows = 5, "aria-label": ariaLabel = "Picker", className }: WheelPickerProps) {
  const [own, setOwn] = useState(defaultValue);
  const current = value ?? own;

  return (
    <LiquidGlass role="group" aria-label={ariaLabel} className={cx("flex w-full max-w-sm rounded-surface p-2", className)}>
      <span aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2 h-9 -translate-y-1/2 rounded-item bg-glass-lens" />
      {columns.map((column) => (
        <Wheel
          key={column.id}
          column={column}
          value={current[column.id] ?? column.options[0]?.value}
          rows={rows}
          onSelect={(next) => {
            const updated = { ...current, [column.id]: next };
            setOwn(updated);
            onChange?.(updated);
          }}
        />
      ))}
    </LiquidGlass>
  );
}
