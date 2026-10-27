// Adapted from BoardUI (MIT) — components/base/buttons/button.tsx. See THIRD_PARTY_NOTICES.md.
import type { ComponentType, ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Visual parity with BoardUI's Button (Figma node 3656:13819).
 *
 *                  md (default)            sm                      xs
 *   container      h 36, p 8, r 10         h 32, px 8 py 6, r 8    h 24, px 8, r 4
 *   gap            2px                     2px                     2px
 *   icon           20                      18                      14
 *   label padding  px 4                    px 2                    px 2
 *   text           body-md-strong          body-md-strong          caption-emphasis
 *   icon-only      36×36 (from content)    32×32 (forced)          24×24 (forced)
 *
 * Built on React Aria's Button, so state styling uses its data attributes
 * (`data-hovered`, `data-pressed`, `data-disabled`, `data-focus-visible`)
 * instead of `:hover`/`:active`, which behave inconsistently across touch,
 * keyboard and pointer input. API follows the system conventions: `size`
 * is md/sm/xs, `variant="tertiary"` is BoardUI's "ghost", and handlers are
 * React Aria's `onPress` / `isDisabled`.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "md" | "sm" | "xs";

export type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

interface CommonProps extends Omit<AriaButtonProps, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pass the icon component itself (`RiAddLine`), not an element, so the button controls its size. */
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * An icon-only button without an accessible name is a type error. When
 * `iconOnly` is decided at runtime (e.g. a responsive layout), `aria-label`
 * must always be provided so the compact state is still named.
 */
export type ButtonProps =
  | (CommonProps & { iconOnly?: false; children?: ReactNode })
  | (CommonProps & { iconOnly: true; leadingIcon: IconComponent; "aria-label": string; children?: never })
  | (CommonProps & { iconOnly: boolean; "aria-label": string; children?: ReactNode });

const styles = {
  base: [
    "inline-flex items-center justify-center gap-0.5 overflow-hidden whitespace-nowrap",
    "cursor-pointer select-none font-sans press-motion",
    focusRing,
    "data-[disabled]:cursor-not-allowed",
  ].join(" "),

  size: {
    md: "h-control-md rounded-control-md p-2 text-body-md-strong",
    sm: "h-control-sm rounded-control-sm px-2 py-1.5 text-body-md-strong",
    xs: "h-control-xs rounded-control-xs px-2 text-caption-emphasis",
  },

  // md stays square from its content (8 + 20 + 8 = 36); sm and xs force the square.
  iconOnlySize: {
    md: "",
    sm: "size-control-sm p-0",
    xs: "size-control-xs p-0",
  },

  icon: {
    md: "size-icon-md shrink-0",
    sm: "size-icon-sm shrink-0",
    xs: "size-icon-xs shrink-0",
  },

  label: {
    md: "inline-flex shrink-0 items-center justify-center px-1",
    sm: "inline-flex shrink-0 items-center justify-center px-0.5",
    xs: "inline-flex shrink-0 items-center justify-center px-0.5",
  },

  variant: {
    primary: [
      "bg-action-primary text-on-action shadow-raised",
      "data-[disabled]:text-action-primary-fg-disabled data-[disabled]:shadow-none",
    ].join(" "),
    danger: [
      "bg-action-danger text-on-action shadow-raised",
      "data-[disabled]:text-action-danger-fg-disabled data-[disabled]:shadow-none",
    ].join(" "),
    secondary: [
      "border border-line bg-surface text-fg shadow-raised",
      "data-[hovered]:not-data-[pressed]:border-line-hover data-[hovered]:not-data-[pressed]:bg-surface-hover",
      "data-[pressed]:border-line-pressed data-[pressed]:bg-surface-pressed",
      "data-[disabled]:border-line data-[disabled]:bg-surface-disabled data-[disabled]:text-fg-tertiary data-[disabled]:shadow-none",
    ].join(" "),
    tertiary: [
      "bg-action-tertiary text-action-tertiary-fg",
      "data-[hovered]:not-data-[pressed]:bg-action-tertiary-hover data-[pressed]:bg-action-tertiary-pressed",
      "data-[disabled]:bg-action-tertiary-disabled data-[disabled]:text-action-tertiary-fg-disabled data-[disabled]:shadow-none",
    ].join(" "),
  },
} as const;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    iconOnly = false,
    leadingIcon: Leading,
    trailingIcon: Trailing,
    children,
    className,
    ...rest
  } = props;

  return (
    <AriaButton
      {...rest}
      className={composeRenderProps(className, (className) =>
        cx(styles.base, styles.size[size], styles.variant[variant], iconOnly && styles.iconOnlySize[size], className),
      )}
    >
      {Leading ? <Leading className={styles.icon[size]} aria-hidden /> : null}
      {!iconOnly && children != null ? <span className={styles.label[size]}>{children}</span> : null}
      {!iconOnly && Trailing ? <Trailing className={styles.icon[size]} aria-hidden /> : null}
    </AriaButton>
  );
}

/** Style maps, exported for advanced composition. Semi-public: may change in minor versions. */
export const buttonStyles = styles;
