"use client";

import { useEffect, useRef, useState } from "react";
import { Button as AriaButton, Input, TextField } from "react-aria-components";
import { RiPencilLine } from "@remixicon/react";
import { focusRing } from "../../recipes/focus-ring";
import { FIELD_ERROR } from "../../recipes/field";
import { cx } from "../../utils/cx";

/**
 * EditableText: text that turns into a field when you click it (a board's
 * title, a file name, a column header). Enter or leaving the field saves,
 * Escape puts the old text back, and focus returns to the text afterwards.
 *
 * Pass `textClassName` to match the surrounding style (a heading, a table
 * cell); the field takes the same size so nothing jumps. `validate` can keep
 * the field open with a message until the text is acceptable.
 */

export interface EditableTextProps {
  /** Names the value: "Board title". Announced as "Edit Board title". */
  label: string;
  value?: string;
  defaultValue?: string;
  /** Fires with the new text when an edit is saved. */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Return a message to reject the text, or null to accept it. */
  validate?: (value: string) => string | null;
  isDisabled?: boolean;
  maxLength?: number;
  /** Text style for both modes, e.g. "text-title-md-strong". Default body. */
  textClassName?: string;
  className?: string;
}

export function EditableText({
  label,
  value: controlled,
  defaultValue = "",
  onChange,
  placeholder = "Untitled",
  validate,
  isDisabled = false,
  maxLength,
  textClassName = "text-body-md",
  className,
}: EditableTextProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const displayRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (editing || !returnFocus.current) return;
    returnFocus.current = false;
    // Wait until the Enter that saved has finished, so it can't press the text and reopen the field.
    const id = setTimeout(() => displayRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [editing]);

  const start = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const finish = (save: boolean, refocus: boolean) => {
    if (save) {
      const next = draft.trim();
      const problem = validate?.(next) ?? null;
      if (problem) {
        setError(problem);
        return;
      }
      if (next !== value) {
        setUncontrolled(next);
        onChange?.(next);
      }
    }
    returnFocus.current = refocus;
    setError(null);
    setEditing(false);
  };

  if (editing) {
    return (
      <TextField
        aria-label={label}
        autoFocus
        value={draft}
        onChange={setDraft}
        maxLength={maxLength}
        isInvalid={error !== null}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            finish(true, true);
          }
          if (event.key === "Escape") {
            event.continuePropagation();
            finish(false, true);
          }
        }}
        onBlur={() => finish(true, false)}
        className={cx("inline-flex max-w-full flex-col gap-1", className)}
      >
        <Input
          onFocus={(event) => event.currentTarget.select()}
          className={cx(
            "-mx-1.5 -my-0.5 min-w-40 rounded-control-sm bg-surface px-1.5 py-0.5 text-fg ring-2 ring-focus outline-none",
            error && "bg-danger-subtle ring-line-danger",
            textClassName,
          )}
        />
        {error && (
          <span role="alert" className={FIELD_ERROR}>
            {error}
          </span>
        )}
      </TextField>
    );
  }

  return (
    <AriaButton
      ref={displayRef}
      isDisabled={isDisabled}
      onPress={start}
      aria-label={`Edit ${label}: ${value || "empty"}`}
      className={cx(
        "group -mx-1.5 -my-0.5 inline-flex max-w-full cursor-text items-center gap-1.5 rounded-control-sm px-1.5 py-0.5 text-start",
        "transition-colors duration-(--ds-motion-duration-fast) data-[hovered]:bg-surface-hover",
        "data-[disabled]:cursor-default data-[disabled]:data-[hovered]:bg-transparent",
        focusRing,
        className,
      )}
    >
      <span className={cx("truncate", value ? "text-fg" : "text-fg-tertiary", textClassName)}>{value || placeholder}</span>
      {!isDisabled && <RiPencilLine aria-hidden className="size-3.5 shrink-0 text-icon-tertiary opacity-0 transition-opacity group-data-[hovered]:opacity-100 group-data-[focus-visible]:opacity-100" />}
    </AriaButton>
  );
}
