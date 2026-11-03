// The element was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
import type { HTMLAttributes, Ref } from "react";
import { cx } from "../../utils/cx";

/**
 * Keyboard shortcut, drawn as a letterpress keycap: a paper key with a
 * hairline outline and a heavier bottom edge, the legend in mono.
 */

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}

export function Kbd({ className, ref, ...props }: KbdProps) {
  return (
    <kbd
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-control-xs border border-b-2 border-line-control bg-surface px-1 font-mono text-caption whitespace-nowrap text-fg-secondary",
        className,
      )}
      {...props}
    />
  );
}
