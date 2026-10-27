// Adapted from BoardUI (MIT) — components/base/buttons/icon-button.tsx. See THIRD_PARTY_NOTICES.md.
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  Ref,
} from "react";
import { cx, sortCx } from "../../utils/cx";
import { directionalIconClass } from "../../utils/directional-icon";

/**
 * Figma source: Board UI → dashboard 1 icon-only buttons (notification button
 * node 3731:3035, table row actions nodes 3731:3284/3287/3290).
 *
 * Square icon-only button. Unlike `Button` (whose small size is radius/lg with
 * an 18px icon), the icon button keeps radius/2lg (10px) at both sizes:
 *
 *            container   padding   icon
 *   medium   36×36       8         20×20
 *   small    32×32       8         16×16
 *
 * One variant in the designs: secondary (white fill, border/button/default,
 * shadow/xs). Hover/active/disabled states reuse the secondary Button tokens.
 */

type IconButtonSize = "medium" | "small";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconComponent;
  size?: IconButtonSize;
  /** Accessible name — required since there is no visible label. */
  "aria-label": string;
  ref?: Ref<HTMLButtonElement>;
}

export interface IconLinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  icon: IconComponent;
  size?: IconButtonSize;
  /** Accessible name — required since there is no visible label. */
  "aria-label": string;
  ref?: Ref<HTMLAnchorElement>;
}

const styles = sortCx({
  base: [
    "relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-2lg",
    "bg-surface text-icon",
    "border border-line shadow-raised",
    "select-none cursor-pointer",
    "transition-[background-color,border-color,box-shadow,color] duration-150 ease",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "hover:bg-surface-hover hover:border-line-hover",
    "active:bg-surface-pressed active:border-line-pressed",
    "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:border-line disabled:text-icon-disabled disabled:opacity-60 disabled:shadow-none",
  ].join(" "),
  size: {
    medium: "size-9",
    small: "size-8",
  },
  icon: {
    medium: "size-5 shrink-0",
    small: "size-4 shrink-0",
  },
});

export function IconButton({
  icon: Icon,
  size = "medium",
  className,
  type = "button",
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.base, styles.size[size], className)}
      {...props}
    >
      <Icon className={cx(styles.icon[size], directionalIconClass(Icon))} aria-hidden />
    </button>
  );
}

/** Anchor counterpart to IconButton for external and navigational actions. */
export function IconLinkButton({
  icon: Icon,
  size = "medium",
  className,
  ref,
  ...props
}: IconLinkButtonProps) {
  return (
    <a
      ref={ref}
      className={cx(styles.base, styles.size[size], className)}
      {...props}
    >
      <Icon className={cx(styles.icon[size], directionalIconClass(Icon))} aria-hidden />
    </a>
  );
}
