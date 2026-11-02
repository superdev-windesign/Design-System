"use client";

import { useState, type ReactNode } from "react";
import { Group, Input, TextField, ToggleButton } from "react-aria-components";
import type { TextFieldProps, ValidationResult } from "react-aria-components";
import { RiEyeLine, RiEyeOffLine, RiLockLine } from "@remixicon/react";
import { FIELD_BUTTON, FIELD_INPUT, fieldShell, type FieldSize } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * PasswordField: a password input with a show / hide toggle and, for new
 * passwords, an optional strength gauge. The gauge is a hint, not a rule:
 * enforce real requirements with `validate` or `minLength`.
 *
 * Use `autoComplete="new-password"` on sign-up and change forms and
 * `"current-password"` on sign-in, so password managers do the right thing.
 */

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/** A rough score from length and character variety: 0 (empty) to 4 (strong). */
export function scorePassword(value: string): PasswordStrength {
  if (!value) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  let score = value.length >= 14 ? 3 : value.length >= 10 ? 2 : value.length >= 8 ? 1 : 0;
  score += variety >= 3 ? 1 : 0;
  return Math.max(1, Math.min(4, score)) as PasswordStrength;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_FILL = ["", "bg-status-danger-solid", "bg-status-warning-solid", "bg-accent-600", "bg-status-success-solid"] as const;

export interface PasswordFieldProps extends Omit<TextFieldProps, "className" | "type"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  /** Show the four-step strength gauge under the field. */
  showStrength?: boolean;
  size?: FieldSize;
  className?: string;
}

export function PasswordField({ label, description, errorMessage, placeholder, showStrength = false, size = "md", className, ...props }: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState(props.defaultValue ?? "");
  const value = props.value ?? draft;
  const strength = scorePassword(value);

  return (
    <TextField
      {...props}
      type={revealed ? "text" : "password"}
      onChange={(next) => {
        setDraft(next);
        props.onChange?.(next);
      }}
      className={cx("group flex w-full flex-col gap-1", className)}
    >
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <Group className={(state) => fieldShell(state, size)}>
        <RiLockLine aria-hidden className="size-4 shrink-0" />
        <Input placeholder={placeholder} spellCheck={false} className={cx(FIELD_INPUT, !revealed && value && "tracking-widest")} />
        <ToggleButton
          aria-label="Show password"
          isSelected={revealed}
          onChange={setRevealed}
          isDisabled={props.isDisabled}
          className={cx(FIELD_BUTTON, "-me-1")}
        >
          {revealed ? <RiEyeOffLine aria-hidden className="size-4" /> : <RiEyeLine aria-hidden className="size-4" />}
        </ToggleButton>
      </Group>
      {showStrength && (
        <div className="flex items-center gap-2 pt-0.5">
          <div aria-hidden className="grid flex-1 grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cx("h-1 rounded-full transition-colors duration-(--ds-motion-duration-moderate)", step <= strength ? STRENGTH_FILL[strength] : "bg-progress-track")}
              />
            ))}
          </div>
          <span aria-live="polite" className="w-12 text-end text-caption-strong text-fg-secondary">
            {strength > 0 && (
              <>
                <span className="sr-only">Password strength: </span>
                {STRENGTH_LABEL[strength]}
              </>
            )}
          </span>
        </div>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
