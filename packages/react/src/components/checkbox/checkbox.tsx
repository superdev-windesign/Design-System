"use client";
// Adapted from BoardUI (MIT) — components/base/checkbox/checkbox.tsx. See THIRD_PARTY_NOTICES.md.

import type { ReactNode, Ref } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import type { CheckboxProps as AriaCheckboxProps } from "react-aria-components";
import { cx } from "../../utils/cx";
import { CheckboxGlyph, checkboxSizes } from "./checkbox-glyph";
import type { CheckboxSize } from "./checkbox-glyph";

/**
 * Checkbox. Two sizes:
 *   md  16×16, label text-body-md-strong
 *   sm  14×14, label text-body-sm-strong
 *
 * States (drawn by CheckboxGlyph):
 *   default        a flat ledger box: surface fill, 1px control border, 2px radius
 *   hover          border darkens
 *   checked        accent ink spreads from the centre, then a pen-nib tick
 *                  (thick short stroke, long stroke thinning to a point) inks in
 *   indeterminate  the same nib as a dash, thick to thin
 *   pressed        the box presses in slightly
 *
 * Built on react-aria Checkbox: keyboard toggling, aria-checked="mixed" for
 * indeterminate, label association when `children` is passed.
 */

export interface CheckboxProps extends Omit<AriaCheckboxProps, "children"> {
  children?: ReactNode;
  size?: CheckboxSize;
  ref?: Ref<HTMLLabelElement>;
}

export function Checkbox({ className, children, size = "md", ref, ...props }: CheckboxProps) {
  const s = checkboxSizes[size];

  return (
    <AriaCheckbox
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group inline-flex items-center select-none",
          s.gap,
          state.isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(state) => (
        <>
          <CheckboxGlyph state={state} size={size} />
          {children !== undefined && children !== null && (
            <span className={cx(s.label, "text-fg")}>{children}</span>
          )}
        </>
      )}
    </AriaCheckbox>
  );
}
