"use client";

import { useState, type ReactNode } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { RiStarFill, RiStarLine } from "@remixicon/react";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldLabel } from "../form/form";

/**
 * Rating: choose a score out of five (or `max`) stars. It's a radio group,
 * so ← / → change the score and each star is announced as "3 stars, 3 of 5".
 * Hovering previews a score before it's chosen.
 *
 * `RatingValue` shows a score that can't be changed, including halves
 * ("4.5 out of 5 stars").
 */

type Size = "sm" | "md" | "lg";
const STAR: Record<Size, string> = { sm: "size-4", md: "size-5", lg: "size-7" };

export interface RatingProps {
  label?: ReactNode;
  /** Without a visible label, name it ("Rate this recipe"). */
  "aria-label"?: string;
  description?: ReactNode;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: Size;
  isDisabled?: boolean;
  isRequired?: boolean;
  /** Words for each score, read after the number ("Good"). */
  labels?: string[];
  className?: string;
}

export function Rating({
  label,
  "aria-label": ariaLabel,
  description,
  value: controlled,
  defaultValue = 0,
  onChange,
  max = 5,
  size = "md",
  isDisabled,
  isRequired,
  labels,
  className,
}: RatingProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;
  const word = labels?.[shown - 1];

  return (
    <RadioGroup
      aria-label={ariaLabel}
      orientation="horizontal"
      isDisabled={isDisabled}
      isRequired={isRequired}
      value={value ? String(value) : null}
      onChange={(next) => {
        const score = Number(next);
        setUncontrolled(score);
        onChange?.(score);
      }}
      className={cx("flex flex-col gap-1.5", className)}
    >
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <div className="flex items-center gap-3">
        <div className="flex items-center" onPointerLeave={() => setHovered(null)}>
          {Array.from({ length: max }, (_, i) => i + 1).map((score) => (
            <Radio
              key={score}
              value={String(score)}
              aria-label={`${score} ${score === 1 ? "star" : "stars"}${labels?.[score - 1] ? `, ${labels[score - 1]}` : ""}`}
              onHoverStart={() => setHovered(score)}
              className={cx(
                "group cursor-pointer rounded-xs p-0.5 transition-transform duration-(--ds-motion-duration-fast) data-[pressed]:scale-90",
                focusRing,
                "data-[disabled]:cursor-not-allowed",
              )}
            >
              {score <= shown ? (
                <RiStarFill aria-hidden className={cx(STAR[size], "text-accent-600 group-data-[disabled]:text-fg-disabled", hovered !== null && "text-accent-500")} />
              ) : (
                <RiStarLine aria-hidden className={cx(STAR[size], "text-line-control group-data-[disabled]:text-fg-disabled")} />
              )}
            </Radio>
          ))}
        </div>
        {(shown > 0 || word) && (
          <span aria-hidden className="font-mono text-caption tabular-nums text-fg-secondary">
            {shown}/{max}
            {word && <span className="ms-1.5 font-sans text-body-sm-strong text-fg">{word}</span>}
          </span>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </RadioGroup>
  );
}

export interface RatingValueProps {
  value: number;
  max?: number;
  size?: Size;
  /** Show "4.5" after the stars. Default true. */
  showValue?: boolean;
  /** A count after the value, e.g. "(1,204)". */
  count?: number;
  className?: string;
}

/** A read-only score with half stars. */
export function RatingValue({ value, max = 5, size = "sm", showValue = true, count, className }: RatingValueProps) {
  const clamped = Math.max(0, Math.min(max, value));
  return (
    <span role="img" aria-label={`${clamped} out of ${max} stars${count != null ? `, ${count.toLocaleString()} ratings` : ""}`} className={cx("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden className="relative inline-flex">
        <span className="flex text-line-control">
          {Array.from({ length: max }, (_, i) => (
            <RiStarFill key={i} className={STAR[size]} />
          ))}
        </span>
        {/* The filled stars, clipped to the score. */}
        <span className="absolute inset-y-0 start-0 flex overflow-hidden text-accent-600" style={{ width: `${(clamped / max) * 100}%` }}>
          {Array.from({ length: max }, (_, i) => (
            <RiStarFill key={i} className={cx(STAR[size], "shrink-0")} />
          ))}
        </span>
      </span>
      {showValue && (
        <span aria-hidden className="text-body-sm-strong tabular-nums text-fg">
          {clamped.toFixed(1)}
          {count != null && <span className="ms-1 text-body-sm text-fg-secondary">({count.toLocaleString()})</span>}
        </span>
      )}
    </span>
  );
}
