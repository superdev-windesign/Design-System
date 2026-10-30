// Adapted from BoardUI (MIT) — components/base/kbd/kbd.tsx. See THIRD_PARTY_NOTICES.md.
import type { HTMLAttributes, Ref } from "react";
import { cx } from "../../utils/cx";

/**
 * Figma source: Board UI → dashboard 1 quick-search shortcut (node 3731:2955).
 *
 * Keyboard shortcut hint: 12/16 semibold on a fully-rounded neutral pill.
 *   - semantic neutral background and foreground for theme-safe contrast
 *   - px 4, py 2, radius full
 */

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}

export function Kbd({ className, ref, ...props }: KbdProps) {
  return (
    <kbd
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-xs bg-kbd px-1 py-0.5 font-sans text-caption-emphasis tracking-normal whitespace-nowrap text-kbd-fg",
        className,
      )}
      {...props}
    />
  );
}
