"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Avatar, type AvatarProps } from "../avatar/avatar";
import { cx } from "../../utils/cx";

/**
 * AvatarGroup: overlapping avatars for the people on something (a document's
 * editors, a meeting's guests), with the rest counted as "+N". Each avatar
 * gets a ring in the surface colour so the overlaps stay crisp.
 *
 * Give every Avatar an `aria-label` (the person's name) and the group a
 * label ("Editors"); the count is read as "N more".
 */

type Size = NonNullable<AvatarProps["size"]>;

const OVERLAP: Record<Size, string> = {
  xs: "*:not-first:-ms-1.5",
  sm: "*:not-first:-ms-2",
  md: "*:not-first:-ms-2.5",
  lg: "*:not-first:-ms-3",
};

export interface AvatarGroupProps {
  "aria-label": string;
  /** Avatar elements. */
  children: ReactNode;
  size?: Size;
  /** Show at most this many; the rest become "+N". */
  max?: number;
  /** The real total, when only some avatars are passed (e.g. 3 of 48). */
  total?: number;
  className?: string;
}

export function AvatarGroup({ "aria-label": ariaLabel, children, size = "md", max, total, className }: AvatarGroupProps) {
  const avatars = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const shown = max !== undefined ? avatars.slice(0, max) : avatars;
  const rest = (total ?? avatars.length) - shown.length;

  return (
    <div role="group" aria-label={ariaLabel} className={cx("flex items-center", OVERLAP[size], className)}>
      {shown.map((avatar, i) =>
        cloneElement(avatar, {
          key: avatar.key ?? i,
          size,
          role: avatar.props["aria-label"] ? "img" : undefined,
          className: cx("ring-2 ring-surface", avatar.props.className),
        }),
      )}
      {rest > 0 && <Avatar size={size} role="img" aria-label={`${rest} more`} initials={`+${rest}`} className="ring-2 ring-surface tabular-nums" />}
    </div>
  );
}
