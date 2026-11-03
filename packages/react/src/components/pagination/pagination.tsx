"use client";
// The page-window logic was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.

import { useTemplateCopy } from "../../foundations/template-copy";

import { useEffect, useRef, useState } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { Button } from "../button/button";
import { cx } from "../../utils/cx";

/**
 * Pagination, set like folios:
 *   - Previous / Next are the secondary small `Button` with arrow icons.
 *   - Page numbers are mono figures in 32×32 cells (rounded-control-sm). The
 *     current page is a block of ink, like the chosen Segmented Control
 *     option; the others are quiet and take the sunken fill on hover.
 *   - Overflow collapses to leading/trailing dots around a sibling window.
 *
 * Below `COMPACT_WIDTH`, a `ResizeObserver` on the nav switches to a compact
 * layout — icon-only Previous/Next and `siblingCount` clamped to 0 — so the
 * row never overflows a narrow container instead of clipping mid-label.
 *
 * Controlled: pass `page`, `totalPages`, and `onChange`.
 */

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Page numbers shown on each side of the current page. Default 1. */
  siblingCount?: number;
  className?: string;
  /** Visible and accessible navigation labels for the application's locale. */
  previousLabel?: string;
  nextLabel?: string;
  "aria-label"?: string;
}

const DOTS = "dots";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function paginationRange(
  current: number,
  total: number,
  sibling: number,
): (number | typeof DOTS)[] {
  // first + last + current + 2*sibling + 2 dots
  const totalPageNumbers = sibling * 2 + 5;
  if (totalPageNumbers >= total) return range(1, total);

  const leftSibling = Math.max(current - sibling, 1);
  const rightSibling = Math.min(current + sibling, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 2;

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + 2 * sibling), DOTS, total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, DOTS, ...range(total - (2 + 2 * sibling), total)];
  }
  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, total];
}

// No transition on the cells: animating background/shadow/color makes the
// previously-active number visibly fade out ("flicker") on every page change.
const cell = "flex size-8 shrink-0 items-center justify-center rounded-control-sm font-mono text-body-sm tabular-nums";

/** Below this nav width, Previous/Next drop their labels and siblingCount
 *  clamps to 0 — the full-label, full-sibling layout starts clipping
 *  somewhere around 380–420px depending on totalPages' digit count. */
const COMPACT_WIDTH = 420;

function useIsCompact() {
  const ref = useRef<HTMLElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setIsCompact(entry.contentRect.width < COMPACT_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isCompact] as const;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  siblingCount = 1,
  className,
  previousLabel = "Previous",
  nextLabel = "Next",
  "aria-label": ariaLabel = "Pagination",
}: PaginationProps) {
  const localize = useTemplateCopy();
  const [navRef, isCompact] = useIsCompact();
  if (totalPages <= 1) return null;
  const pages = paginationRange(page, totalPages, isCompact ? 0 : siblingCount);

  return localize((
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cx("flex w-full items-center justify-between gap-2", className)}
    >
      <Button
        variant="secondary"
        size="sm"
        iconOnly={isCompact}
        leadingIcon={RiArrowLeftLine}
        aria-label={previousLabel}
        isDisabled={page <= 1}
        onPress={() => onChange(page - 1)}
      >
        {isCompact ? undefined : previousLabel}
      </Button>

      <ul className="flex min-w-0 items-center gap-0.5">
        {pages.map((item, i) =>
          item === DOTS ? (
            <li
              key={`dots-${i}`}
              aria-hidden
              className={cx(cell, "text-fg-tertiary")}
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onChange(item)}
                className={cx(
                  cell,
                  "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  item === page
                    ? "bg-fg text-canvas"
                    : "text-fg-secondary hover:bg-sunken-hover hover:text-fg",
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <Button
        variant="secondary"
        size="sm"
        iconOnly={isCompact}
        leadingIcon={isCompact ? RiArrowRightLine : undefined}
        trailingIcon={isCompact ? undefined : RiArrowRightLine}
        aria-label={nextLabel}
        isDisabled={page >= totalPages}
        onPress={() => onChange(page + 1)}
      >
        {isCompact ? undefined : nextLabel}
      </Button>
    </nav>
  ));
}
