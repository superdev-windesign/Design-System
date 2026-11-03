// The icon-button API was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  Ref,
} from "react";
import { cx, sortCx } from "../../utils/cx";
import { directionalIconClass } from "../../utils/directional-icon";

/**
 * Square icon-only button, the icon twin of Button's secondary variant: a
 * flat paper square with a control outline that inks in on hover. No shadow.
 *
 *            container   icon
 *   medium   36×36       20×20
 *   small    32×32       16×16
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
    "relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-control-md",
    "bg-surface text-icon",
    "border border-line-control",
    "select-none cursor-pointer",
    "transition-[background-color,border-color,color] duration-(--ds-motion-duration-base) ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "hover:border-fg hover:text-fg",
    "active:bg-surface-pressed active:border-fg",
    "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:border-line disabled:text-icon-disabled disabled:opacity-60",
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
