"use client";
// Adapted from BoardUI (MIT) — components/base/input/label.tsx. See THIRD_PARTY_NOTICES.md.

import type { ReactNode, Ref } from "react";
import { RiInformationFill } from "@remixicon/react";
import type { LabelProps as AriaLabelProps } from "react-aria-components";
import { Label as AriaLabel } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Field label. Wraps `react-aria-components`' Label so the parent `TextField`
 * automatically wires `htmlFor` / `aria-labelledby`.
 *
 * Look: text-body-md-strong in fg; a 2px gap between the label, the
 * required asterisk (fg-danger) and the 16px info icon (icon-quaternary).
 *
 * Pass `isRequired` to show the asterisk. Pass `tooltip` to show the info
 * icon (currently a static glyph — when the Tooltip component lands it'll
 * wire up here).
 */

export interface LabelProps extends AriaLabelProps {
  children: ReactNode;
  isRequired?: boolean;
  /** Reserved for invalid-aware styling (asterisk color, etc.) once we need it. */
  isInvalid?: boolean;
  /** Show the info icon next to the label. */
  tooltip?: boolean | string;
  ref?: Ref<HTMLLabelElement>;
}

export function Label({
  isRequired = false,
  isInvalid: _isInvalid,
  tooltip,
  className,
  children,
  ...props
}: LabelProps) {
  void _isInvalid;
  return (
    <AriaLabel
      data-label="true"
      {...props}
      className={cx(
        "flex cursor-default items-center gap-0.5",
        "text-body-md-strong text-fg",
        className,
      )}
    >
      {children}
      {isRequired && (
        <span
          aria-hidden="true"
          className="text-body-md-strong text-fg-danger"
        >
          *
        </span>
      )}
      {tooltip && (
        <RiInformationFill
          className="size-4 shrink-0 text-icon-quaternary"
          aria-hidden
        />
      )}
    </AriaLabel>
  );
}
