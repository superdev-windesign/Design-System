// The size scale was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
/* eslint-disable @next/next/no-img-element */
import type { HTMLAttributes, Ref } from "react";
import { cx, sortCx } from "../../utils/cx";

/**
 * Avatar. Initials are set as a serif monogram (the display face); photos sit
 * in a hairline frame so light pictures keep their edge on the paper.
 *
 * Sizes (px):
 *   xs = 20   breadcrumb workspace marks     (initials 10/15 semibold)
 *   sm = 24   table rows                     (initials 12/16 semibold)
 *   md = 32   sidebar workspace / team card  (initials 16/22 semibold)
 *   lg = 36   people cards                   (initials 18/24 semibold)
 *
 * Renders a photo when `src` is given, otherwise centred initials on a
 * tinted disc (neutral, blue, lime or pink, from the avatar tokens).
 */

type AvatarSize = "xs" | "sm" | "md" | "lg";
type AvatarColor = "neutral" | "blue" | "lime" | "pink";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  color?: AvatarColor;
  /** Photo URL. Wins over `initials`. */
  src?: string;
  alt?: string;
  /** Fallback initials, e.g. "M". */
  initials?: string;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full text-center align-middle font-display outline-1 -outline-offset-1 outline-line",
  size: {
    xs: "size-5 text-micro-emphasis leading-3.75 font-semibold",
    sm: "size-6 text-caption-emphasis tracking-normal",
    md: "size-8 text-headline-emphasis",
    lg: "size-9 text-title-sm-emphasis leading-6 font-semibold",
  },
  color: {
    neutral: "bg-avatar text-fg-secondary",
    blue: "bg-avatar-blue text-avatar-blue-fg",
    lime: "bg-avatar-lime text-avatar-lime-fg",
    pink: "bg-avatar-pink text-avatar-pink-fg",
  },
});

export function Avatar({
  size = "md",
  color = "neutral",
  src,
  alt,
  initials,
  className,
  ref,
  ...props
}: AvatarProps) {
  return (
    <span
      ref={ref}
      className={cx(styles.base, styles.size[size], styles.color[color], className)}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
