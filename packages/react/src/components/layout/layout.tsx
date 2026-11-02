"use client";

import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

/**
 * Layout primitives: space and align things on the spacing scale without
 * hand-written flex and grid classes.
 *
 * - `Stack`: a column (or row) with a gap. `direction="responsive"` stacks on
 *   phones and lines up in a row from the `sm` breakpoint.
 * - `Grid`: equal columns that collapse on narrow screens, or as many columns
 *   as fit when you give `minItemWidth`.
 * - `Container`: the page column: centred, a max width, side padding.
 */

export type Space = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

// Literal class names so Tailwind generates them.
const GAP: Record<Space, string> = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  1.5: "gap-1.5",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

const ALIGN = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch", baseline: "items-baseline" } as const;
const JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;
const DIRECTION = { column: "flex-col", row: "flex-row", responsive: "flex-col sm:flex-row" } as const;

type Tag = "div" | "section" | "header" | "footer" | "ul" | "ol" | "nav" | "article" | "aside" | "main";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  direction?: keyof typeof DIRECTION;
  gap?: Space;
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
  as?: Tag;
}

export function Stack({ direction = "column", gap = 3, align, justify, wrap = false, as: Component = "div", className, ...props }: StackProps) {
  return (
    <Component
      {...props}
      className={cx("flex", DIRECTION[direction], GAP[gap], align && ALIGN[align], justify && JUSTIFY[justify], wrap && "flex-wrap", className)}
    />
  );
}

/** A wrapping row, centred on the cross axis: chips, buttons, meta. */
export function Inline({ gap = 2, align = "center", ...props }: Omit<StackProps, "direction" | "wrap">) {
  return <Stack direction="row" wrap gap={gap} align={align} {...props} />;
}

const COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
} as const;

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Columns at the widest size; fewer below `lg` and `sm`. */
  columns?: keyof typeof COLUMNS;
  /** As many columns as fit, none narrower than this many pixels. Overrides `columns`. */
  minItemWidth?: number;
  gap?: Space;
  as?: Tag;
}

export function Grid({ columns = 3, minItemWidth, gap = 4, as: Component = "div", className, style, ...props }: GridProps) {
  const auto: CSSProperties | undefined = minItemWidth ? { gridTemplateColumns: `repeat(auto-fill, minmax(min(${minItemWidth}px, 100%), 1fr))` } : undefined;
  return <Component {...props} style={{ ...auto, ...style }} className={cx("grid", !minItemWidth && COLUMNS[columns], GAP[gap], className)} />;
}

const WIDTH = { sm: "max-w-3xl", md: "max-w-5xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-none" } as const;

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  size?: keyof typeof WIDTH;
  /** Side padding: 20px on phones, 32px from `sm`. Default true. */
  padded?: boolean;
  as?: Tag;
}

export function Container({ size = "lg", padded = true, as: Component = "div", className, ...props }: ContainerProps) {
  return <Component {...props} className={cx("mx-auto w-full", WIDTH[size], padded && "px-5 sm:px-8", className)} />;
}
