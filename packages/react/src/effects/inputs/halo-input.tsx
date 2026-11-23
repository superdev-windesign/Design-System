"use client";

import type { ReactNode } from "react";
import { Input as AriaInput, Label, Text, TextField } from "react-aria-components";
import type { TextFieldProps } from "react-aria-components";
import type { IconComponent } from "../../components/button/button";
import { cx } from "../../utils/cx";

/**
 * HaloInput: a text field ringed by a slowly turning halo of the brand's glow
 * colours, which wakes when the field has focus. Use it for the one field on a
 * page that matters most, like a prompt or a search. It's a React Aria text
 * field, with its label and description wired up. With reduced motion the halo
 * still lights on focus but doesn't turn.
 */

export interface HaloInputProps extends Omit<TextFieldProps, "children" | "className"> {
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  icon?: IconComponent;
  className?: string;
}

export function HaloInput({ label, description, placeholder, icon: Icon, className, ...props }: HaloInputProps) {
  return (
    <TextField {...props} className={cx("flex w-full max-w-md flex-col gap-1.5", className)}>
      {label && <Label className="text-body-md-strong text-fg">{label}</Label>}
      <div className="halo flex h-12 items-center gap-2 rounded-full border border-line-control bg-surface px-4 transition-colors has-[input:focus]:border-transparent has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus">
        {Icon && <Icon aria-hidden className="size-5 shrink-0 text-icon-secondary" />}
        <AriaInput placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-body-md text-fg outline-hidden placeholder:text-fg-placeholder" />
      </div>
      {description && (
        <Text slot="description" className="text-body-sm text-fg-secondary">
          {description}
        </Text>
      )}
    </TextField>
  );
}
