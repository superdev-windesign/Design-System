// The anchor/button API was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  Ref,
} from "react";
import { cx, sortCx } from "../../utils/cx";
import { directionalIconClass } from "../../utils/directional-icon";

/**
 * Link button — an inline text action styled like a link, sized on the same
 * scale as `Button` but without the container: no fill, no border, just the
 * label (plus optional icons). On hover a pen rule draws itself under it
 * from the start, the same rule a focused field draws.
 *
 * Variant / size matrix (mirrors Button's structure):
 *   Variant = primary (blue/600 text) | secondary (text/secondary)
 *   Size    = medium (Body 1/Medium, 20px icons)
 *           | small  (Body 1/Medium, 18px icons)
 *           | xs     (Caption 1/Semibold, 14px icons)
 *
 * Renders an `<a>` when `href` is passed, otherwise a `<button>` — the same
 * action can live in copy ("Learn more →") or trigger a handler. Icons are
 * rendered by the component itself via `leadingIcon` / `trailingIcon` (pass
 * the Remix Icon reference, e.g. `RiArrowRightLine`, not an element).
 */

type LinkButtonVariant = "primary" | "secondary";
type LinkButtonSize = "medium" | "small" | "xs";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

interface LinkButtonBaseProps {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface LinkButtonAnchorProps
  extends LinkButtonBaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
}

export interface LinkButtonButtonProps
  extends LinkButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
  ref?: Ref<HTMLButtonElement>;
}

export type LinkButtonProps = LinkButtonAnchorProps | LinkButtonButtonProps;

const styles = sortCx({
  base: [
    "inline-flex items-center justify-center gap-1 whitespace-nowrap",
    "font-sans select-none cursor-pointer rounded-sm",
    "relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 after:transition-[scale] after:duration-(--ds-motion-duration-moderate) after:ease-out rtl:after:origin-right motion-reduce:after:transition-none hover:after:scale-x-100",
    "transition-colors duration-(--ds-motion-duration-base) ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:cursor-not-allowed disabled:after:hidden aria-disabled:cursor-not-allowed aria-disabled:after:hidden",
  ].join(" "),

  size: {
    medium: "text-body-md-strong",
    small: "text-body-md-strong",
    xs: "text-caption-emphasis",
  },

  icon: {
    medium: "size-5 shrink-0",
    small: "size-4.5 shrink-0",
    xs: "size-3.5 shrink-0",
  },

  variant: {
    // Hover keeps the resting color — the pen rule is the hover cue; only
    // the press darkens.
    primary: [
      "text-accent-600 active:text-accent-800",
      "disabled:text-fg-tertiary aria-disabled:text-fg-tertiary",
    ].join(" "),
    secondary: [
      "text-fg-secondary active:text-fg",
      "disabled:text-fg-tertiary aria-disabled:text-fg-tertiary",
    ].join(" "),
  },
});

export function LinkButton({
  variant = "primary",
  size = "medium",
  leadingIcon: Leading,
  trailingIcon: Trailing,
  children,
  className,
  disabled = false,
  ...props
}: LinkButtonProps) {
  const classes = cx(styles.base, styles.size[size], styles.variant[variant], className);
  const content = (
    <>
      {Leading ? <Leading className={cx(styles.icon[size], directionalIconClass(Leading))} aria-hidden /> : null}
      {children !== undefined && children !== null && <span>{children}</span>}
      {Trailing ? <Trailing className={cx(styles.icon[size], directionalIconClass(Trailing))} aria-hidden /> : null}
    </>
  );

  if (props.href !== undefined) {
    const { ref, href, ...anchorProps } = props as LinkButtonAnchorProps;
    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        className={classes}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const { ref, type = "button", ...buttonProps } = props as LinkButtonButtonProps;
  return (
    <button ref={ref} type={type} disabled={disabled} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}

/** Style maps, exported for advanced composition and the dev Design Tuner. */
export const linkButtonStyles = styles;
