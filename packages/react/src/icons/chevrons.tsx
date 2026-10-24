// Adapted from BoardUI (MIT) — components/foundations/icons/chevrons.tsx and
// components/base/date-picker/shared.tsx. See THIRD_PARTY_NOTICES.md.
import type { SVGProps } from "react";
import { cx } from "../utils/cx";

type IconProps = SVGProps<SVGSVGElement>;

/** 16×16, 2px round-capped stroke. Select triggers and disclosure affordances. */
export function ChevronDownSmall(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path
        d="M4 7L7.29289 10.2929C7.68342 10.6834 8.31658 10.6834 8.70711 10.2929L12 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 16×16 month-navigation chevrons. They point the other way in RTL. */
export function ChevronLeft16({ className, ...props }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden {...props} className={cx("rtl:rotate-180", className)}>
      <path
        d="M9 4L5.70711 7.29289C5.31658 7.68342 5.31658 8.31658 5.70711 8.70711L9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronRight16({ className, ...props }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden {...props} className={cx("rtl:rotate-180", className)}>
      <path
        d="M7 4L10.2929 7.29289C10.6834 7.68342 10.6834 8.31658 10.2929 8.70711L7 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
