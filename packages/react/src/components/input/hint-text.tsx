"use client";
// Adapted from BoardUI (MIT) — components/base/input/hint-text.tsx. See THIRD_PARTY_NOTICES.md.

import type { ReactNode, Ref } from "react";
import type { TextProps as AriaTextProps } from "react-aria-components";
import { Text as AriaText } from "react-aria-components";
import { cx } from "../../utils/cx";

/**
 * Caption text rendered below a field. Wraps `react-aria-components`' Text
 * so the parent `TextField` automatically wires `aria-describedby` (when
 * `slot="description"`) or `aria-errormessage` (when `slot="errorMessage"`).
 *
 * Look: text-caption-strong in fg-secondary, or fg-danger when invalid,
 * with 1px of top padding to sit just under the field's pen rule.
 */

export interface HintTextProps extends AriaTextProps {
  children: ReactNode;
  isInvalid?: boolean;
  ref?: Ref<HTMLElement>;
}

export function HintText({
  isInvalid = false,
  className,
  ...props
}: HintTextProps) {
  return (
    <AriaText
      slot={isInvalid ? "errorMessage" : "description"}
      {...props}
      className={cx(
        "pt-px text-caption-strong text-fg-secondary",
        isInvalid && "text-fg-danger",
        className,
      )}
    />
  );
}
