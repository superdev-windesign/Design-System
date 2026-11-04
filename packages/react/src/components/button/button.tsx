// The props API and icon-only typing were first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look and motion are Windesign's own.
import type { ComponentType, ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Button, set flat on the paper.
 *
 *                  md (default)        sm                  xs
 *   height         control-md (36)     control-sm (32)     control-xs (24)
 *   padding        px 12               px 10               px 8
 *   gap            6                   6                   4
 *   icon           20                  18                  14
 *   text           body-md-strong      body-md-strong      caption-emphasis
 *   icon-only      square at the control height
 *
 *   primary    flat ink (the accent in dark); the hover shade wicks up from
 *              the bottom edge (see bg-action-primary)
 *   danger     flat red, deepening the same way
 *   secondary  a paper outline that inks in to full ink on hover
 *   tertiary   quiet: accent text, no fill until hover tints it
 *   ink        always the text colour, in any brand or theme, for an action
 *              that belongs with black-and-white selection rather than the accent
 *
 * No drop shadows. A trailing icon (usually an arrow) steps forward on hover.
 *
 * Built on React Aria's Button, so state styling uses its data attributes
 * (`data-hovered`, `data-pressed`, `data-disabled`, `data-focus-visible`)
 * instead of `:hover`/`:active`, which behave inconsistently across touch,
 * keyboard and pointer input. `size` is md/sm/xs and handlers are React
 * Aria's `onPress` / `isDisabled`.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "ink";
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
    "group/button inline-flex items-center justify-center overflow-hidden whitespace-nowrap",
    "cursor-pointer select-none font-sans press-motion",
    focusRing,
    "data-[disabled]:cursor-not-allowed",
  ].join(" "),

  size: {
    md: "h-control-md gap-1.5 rounded-control-md px-3 text-body-md-strong",
    sm: "h-control-sm gap-1.5 rounded-control-sm px-2.5 text-body-md-strong",
    xs: "h-control-xs gap-1 rounded-control-xs px-2 text-caption-emphasis",
  },

  iconOnlySize: {
    md: "size-control-md p-0",
    sm: "size-control-sm p-0",
    xs: "size-control-xs p-0",
  },

  icon: {
    md: "size-icon-md shrink-0",
    sm: "size-icon-sm shrink-0",
    xs: "size-icon-xs shrink-0",
  },

  label: {
    md: "inline-flex shrink-0 items-center justify-center",
    sm: "inline-flex shrink-0 items-center justify-center",
    xs: "inline-flex shrink-0 items-center justify-center",
  },

  // A trailing arrow steps forward on hover.
  trailing:
    "transition-[translate] duration-(--ds-motion-duration-base) ease-out motion-reduce:transition-none group-data-[hovered]/button:translate-x-0.5 rtl:group-data-[hovered]/button:-translate-x-0.5",

  variant: {
    primary: "bg-action-primary text-on-action data-[disabled]:text-action-primary-fg-disabled",
    danger: "bg-action-danger text-on-action data-[disabled]:text-action-danger-fg-disabled",
    ink: "bg-fg text-canvas transition-colors data-[hovered]:bg-fg-secondary data-[pressed]:bg-fg-secondary data-[disabled]:bg-muted data-[disabled]:text-fg-disabled",
    secondary: [
      "border border-line-control bg-surface text-fg",
      "data-[hovered]:border-fg data-[pressed]:border-fg data-[pressed]:bg-surface-pressed",
      "data-[disabled]:border-line data-[disabled]:bg-surface-disabled data-[disabled]:text-fg-tertiary",
    ].join(" "),
    tertiary: [
      "bg-transparent text-action-tertiary-fg",
      "data-[hovered]:not-data-[pressed]:bg-action-tertiary data-[pressed]:bg-action-tertiary-hover",
      "data-[disabled]:bg-transparent data-[disabled]:text-action-tertiary-fg-disabled",
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
      {!iconOnly && Trailing ? <Trailing className={cx(styles.icon[size], styles.trailing)} aria-hidden /> : null}
    </AriaButton>
  );
}

/** Style maps, exported for advanced composition. Semi-public: may change in minor versions. */
export const buttonStyles = styles;
