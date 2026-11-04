"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { FieldError, Input, Label, TextField } from "react-aria-components";
import { focusRingInset } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Moon's text input group: fields joined into one rounded box, each 56px tall
 * with its label inside, resting mid-field and floating up once there's a
 * value or the field has focus. Neighbours share a hairline. Focus and errors
 * lift a field above them so its whole outline shows.
 */

interface JoinedFieldsProps {
  /** The last row holds two fields side by side rather than one across. */
  split?: boolean;
  className?: string;
  children: ReactNode;
}

export function JoinedFields({ split = false, className, children }: JoinedFieldsProps) {
  return (
    <div
      className={cx(
        // -ms-px/-mt-px on the fields collapse shared borders; the outer corners round off here.
        "grid grid-cols-2 ps-px pt-px [&>*:first-child_input]:rounded-t-overlay",
        split ? "[&>*:last-child_input]:rounded-ee-overlay [&>*:nth-last-child(2)_input]:rounded-es-overlay" : "[&>*:last-child_input]:rounded-b-overlay",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface JoinedFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** A message marks the field invalid. Shown to assistive tech; the group shows its own text. */
  error?: string | null;
  /** Takes half the row instead of all of it. */
  half?: boolean;
  isRequired?: boolean;
  type?: "text" | "email" | "password";
  name?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
  /** Keeps the label up permanently, so the two never overlap. */
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  /** A status icon at the end of the field. */
  trailing?: ReactNode;
  /** Something to press at the end of the field, such as Show. */
  action?: ReactNode;
}

export function JoinedField({ label, value, onChange, onBlur, error = null, half = false, isRequired, type, trailing, action, placeholder, ...input }: JoinedFieldProps) {
  const field = useRef<HTMLInputElement>(null);
  const digitsBeforeCaret = useRef<number | null>(null);

  // Reformatting a controlled value throws the caret to the end, which would
  // make fixing a digit mid-number maddening. Put it back after the same digit.
  useLayoutEffect(() => {
    const element = field.current;
    const count = digitsBeforeCaret.current;
    digitsBeforeCaret.current = null;
    if (!element || count === null || document.activeElement !== element) return;
    let position = 0;
    for (let seen = 0; position < value.length && seen < count; position += 1) {
      if (/\d/.test(value[position]!)) seen += 1;
    }
    element.setSelectionRange(position, position);
  }, [value]);

  return (
    <TextField
      isInvalid={error !== null ? true : undefined}
      isRequired={isRequired}
      type={type}
      value={value}
      onChange={(next) => {
        const element = field.current;
        if (element && input.inputMode === "numeric") digitsBeforeCaret.current = element.value.slice(0, element.selectionStart ?? 0).replace(/\D/g, "").length;
        onChange(next);
      }}
      onBlur={onBlur}
      className={cx("relative -ms-px -mt-px flex min-w-0 flex-col", !half && "col-span-2")}
    >
      <Input
        {...input}
        ref={field}
        dir={input.inputMode === "numeric" ? "ltr" : undefined}
        placeholder={placeholder ?? " "}
        className={({ isFocused, isInvalid }) =>
          cx(
            "peer h-14 w-full border border-line bg-surface ps-3 pe-9 pt-5 text-body-md tabular-nums text-fg transition-[border-color]",
            "placeholder:text-fg-tertiary data-[hovered]:border-line-control-hover",
            isInvalid && "relative z-10 border-line-danger",
            isFocused ? cx("relative z-10", focusRingInset) : "outline-none",
          )
        }
      />
      <Label
        className={cx(
          "pointer-events-none absolute start-3 top-2 z-20 text-caption text-fg-secondary transition-[top,translate,font-size] duration-(--ds-motion-duration-base) motion-reduce:transition-none",
          !placeholder && "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-caption",
        )}
      >
        {label}
      </Label>
      {trailing && <span className="pointer-events-none absolute end-3 top-1/2 z-20 -translate-y-1/2 text-icon-secondary">{trailing}</span>}
      {action && <span className="absolute end-3 top-1/2 z-20 -translate-y-1/2">{action}</span>}
      <FieldError className="sr-only">{error}</FieldError>
    </TextField>
  );
}
