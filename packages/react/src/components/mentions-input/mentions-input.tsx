"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FIELD_DESCRIPTION, FIELD_LABEL } from "../../recipes/field";
import { MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * MentionsInput: a text area where typing @ suggests people (or anything you
 * pass as `options`). ↑ / ↓ move through the suggestions, Enter or Tab
 * inserts one, Escape dismisses them; the number of matches is announced.
 *
 * `onChange` receives the text and the options mentioned in it, so you can
 * notify them without parsing the text yourself.
 */

export interface MentionOption {
  id: string;
  label: string;
  description?: string;
  /** An avatar or icon before the label. */
  leading?: ReactNode;
}

export interface MentionsInputProps {
  label: ReactNode;
  options: MentionOption[];
  defaultValue?: string;
  onChange?: (text: string, mentions: MentionOption[]) => void;
  /** The character that starts a mention. Default "@". */
  trigger?: string;
  placeholder?: string;
  description?: ReactNode;
  rows?: number;
  /** Most suggestions shown at once. Default 6. */
  maxSuggestions?: number;
  isDisabled?: boolean;
  name?: string;
  className?: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The options mentioned as `@Label` in the text, each once, in order of first mention. */
export function findMentions(text: string, options: MentionOption[], trigger = "@") {
  return options
    .map((o) => ({ option: o, at: text.search(new RegExp(`${escape(trigger)}${escape(o.label)}(?![\\w-])`)) }))
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((m) => m.option);
}

export function MentionsInput({
  label,
  options,
  defaultValue = "",
  onChange,
  trigger = "@",
  placeholder,
  description,
  rows = 3,
  maxSuggestions = 6,
  isDisabled,
  name,
  className,
}: MentionsInputProps) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(defaultValue);
  const [query, setQuery] = useState<{ start: number; value: string } | null>(null);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    if (!query) return [];
    const q = query.value.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().split(/\s+/).some((word) => word.startsWith(q)) || o.label.toLowerCase().startsWith(q)).slice(0, maxSuggestions);
  }, [query, options, maxSuggestions]);
  const open = query !== null && matches.length > 0;

  const update = (next: string, caret: number) => {
    setText(next);
    onChange?.(next, findMentions(next, options, trigger));
    const before = next.slice(0, caret);
    const match = new RegExp(`(^|\\s)${escape(trigger)}([^\\s${escape(trigger)}]*)$`).exec(before);
    if (match) {
      setQuery({ start: caret - match[2]!.length - trigger.length, value: match[2]! });
      setActive(0);
    } else setQuery(null);
  };

  const insert = (option: MentionOption) => {
    if (!query || !ref.current) return;
    const caret = ref.current.selectionStart;
    const next = `${text.slice(0, query.start)}${trigger}${option.label} ${text.slice(caret)}`;
    const position = query.start + trigger.length + option.label.length + 1;
    setText(next);
    setQuery(null);
    onChange?.(next, findMentions(next, options, trigger));
    // After React has written the new text, put the caret after the mention.
    setTimeout(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(position, position);
    }, 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + matches.length) % matches.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insert(matches[active]!);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setQuery(null);
    }
  };

  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-option-${i}`;

  return (
    <div className={cx("relative flex w-full flex-col gap-1", className)}>
      <label htmlFor={`${id}-input`} className={cx(FIELD_LABEL, "self-start")}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={`${id}-input`}
        name={name}
        rows={rows}
        value={text}
        disabled={isDisabled}
        placeholder={placeholder}
        aria-describedby={description ? `${id}-description` : undefined}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        onChange={(event) => update(event.target.value, event.target.selectionStart)}
        onKeyDown={onKeyDown}
        onBlur={() => setQuery(null)}
        className={cx(
          "w-full resize-y rounded-2lg bg-surface px-3 py-2 text-body-md text-fg ring-1 ring-line-control ring-inset",
          "placeholder:text-fg-tertiary transition-[box-shadow] duration-(--ds-motion-duration-base) outline-none",
          "hover:not-focus:ring-line-control-hover focus:ring-2 focus:ring-focus",
          "disabled:cursor-not-allowed disabled:bg-field-disabled disabled:text-field-fg-disabled",
        )}
      />
      {description && (
        <p id={`${id}-description`} className={FIELD_DESCRIPTION}>
          {description}
        </p>
      )}
      <span role="status" className="sr-only">
        {query ? (matches.length ? `${matches.length} ${matches.length === 1 ? "suggestion" : "suggestions"}. Use the arrow keys, then Enter.` : "No matches") : ""}
      </span>
      {open && (
        <ul id={listId} role="listbox" aria-label="Suggestions" className={cx(MENU_POPOVER_SURFACE, "absolute inset-x-0 top-full z-30 mt-1 flex max-h-64 flex-col gap-0.5 p-1.5")}>
          {matches.map((option, i) => (
            <li
              key={option.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // Keep focus in the text area while picking with the mouse.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insert(option)}
              onMouseEnter={() => setActive(i)}
              className={cx("flex cursor-pointer items-center gap-2.5 rounded-control-md px-2 py-1.5", i === active && "bg-surface-hover")}
            >
              {option.leading}
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body-md-strong text-fg">{option.label}</span>
                {option.description && <span className="truncate text-body-sm text-fg-secondary">{option.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
