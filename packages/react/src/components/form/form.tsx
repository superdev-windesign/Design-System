"use client";

import type { ReactNode } from "react";
import { FieldError as AriaFieldError, Form as AriaForm, Label as AriaLabel, Text } from "react-aria-components";
import type { FieldErrorProps as AriaFieldErrorProps, FormProps as AriaFormProps } from "react-aria-components";
import { RiErrorWarningFill } from "@remixicon/react";
import { FIELD_DESCRIPTION, FIELD_ERROR, FIELD_LABEL } from "../../recipes/field";
import { cx } from "../../utils/cx";

/**
 * Form and the parts every field shares.
 *
 * `Form` wraps React Aria's Form: it collects native and custom validation
 * from every field inside, shows errors after the first submit (or as people
 * type, with `validationBehavior="aria"`), and focuses the first invalid
 * field on submit. Pass server errors as `validationErrors={{ email: "…" }}`.
 *
 * `FieldError` is the message under a field. It reads the field's
 * validation state, so it renders nothing while the field is valid; give it
 * children to replace the browser's message.
 */

export interface FormProps extends Omit<AriaFormProps, "className"> {
  className?: string;
}

export function Form({ className, ...props }: FormProps) {
  return <AriaForm {...props} className={cx("flex flex-col gap-5", className)} />;
}

export interface FormSectionProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled group of fields, ruled off from the next: a fieldset with a legend. */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <fieldset className={cx("flex min-w-0 flex-col gap-4 border-t border-line pt-5 first:border-t-0 first:pt-0", className)}>
      <legend className="float-left mb-1 w-full">
        <span className="block text-title-sm-strong text-fg">{title}</span>
        {description && <span className="mt-0.5 block text-body-sm text-fg-secondary">{description}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** The submit / cancel row at the end of a form. */
export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4", className)}>{children}</div>;
}

export interface FieldErrorProps extends Omit<AriaFieldErrorProps, "className"> {
  className?: string;
}

export function FieldError({ className, children, ...props }: FieldErrorProps) {
  return (
    <AriaFieldError {...props} className={cx("flex items-start gap-1", FIELD_ERROR, className)}>
      {(state) => (
        <>
          <RiErrorWarningFill aria-hidden className="mt-px size-3.5 shrink-0" />
          <span>{typeof children === "function" ? children(state) : (children ?? state.validationErrors.join(" "))}</span>
        </>
      )}
    </AriaFieldError>
  );
}

/** The label for a React Aria field, with the required asterisk. */
export function FieldLabel({ children, isRequired, className }: { children: ReactNode; isRequired?: boolean; className?: string }) {
  return (
    <AriaLabel className={cx(FIELD_LABEL, "cursor-default", className)}>
      {children}
      {isRequired && (
        <span aria-hidden className="text-fg-danger">
          *
        </span>
      )}
    </AriaLabel>
  );
}

/** Help text under a field, wired to it as its description. */
export function FieldDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Text slot="description" className={cx(FIELD_DESCRIPTION, className)}>
      {children}
    </Text>
  );
}
