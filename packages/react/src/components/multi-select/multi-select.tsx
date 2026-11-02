"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Group,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList,
  Text,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import { useFilter } from "react-aria";
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing, focusRingNative } from "../../recipes/focus-ring";
import { FIELD_BUTTON, FIELD_DESCRIPTION, FIELD_ERROR, FIELD_INPUT, FIELD_LABEL, fieldShell } from "../../recipes/field";
import { MENU_ITEM, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * MultiSelect: pick several options by typing to filter them. Chosen options
 * sit as removable tags above the input; the list shows what's left. It's a
 * ComboBox and a TagGroup working together, so each keeps its own keyboard
 * model: type and ↓ in the input, ← / → / Delete among the tags, and
 * Backspace in an empty input removes the last tag. The list stays open after
 * a pick, so several can be chosen in a row; Escape closes it.
 *
 * ```tsx
 * <MultiSelect label="Reviewers" items={people} defaultSelectedKeys={["ada"]} />
 * ```
 *
 * With `allowsCreate`, Enter on text that matches nothing calls `onCreate`
 * and the new option is selected.
 */

export interface MultiSelectOption {
  id: Key;
  label: string;
  description?: string;
}

export interface MultiSelectProps<T extends MultiSelectOption> {
  label: ReactNode;
  items: T[];
  selectedKeys?: Key[];
  defaultSelectedKeys?: Key[];
  onSelectionChange?: (keys: Key[]) => void;
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  isDisabled?: boolean;
  /** Offer "Create “…”" when the text matches nothing. */
  allowsCreate?: boolean;
  onCreate?: (label: string) => T | void;
  /** Most tags shown before the rest collapse into "+N". Default: all. */
  maxVisibleTags?: number;
  className?: string;
}

const CREATE_KEY = "__ds-create__";

export function MultiSelect<T extends MultiSelectOption>({
  label,
  items,
  selectedKeys: controlled,
  defaultSelectedKeys = [],
  onSelectionChange,
  placeholder = "Add…",
  description,
  errorMessage,
  isInvalid,
  isDisabled,
  allowsCreate = false,
  onCreate,
  maxVisibleTags,
  className,
}: MultiSelectProps<T>) {
  const [uncontrolled, setUncontrolled] = useState<Key[]>(defaultSelectedKeys);
  const selected = controlled ?? uncontrolled;
  const [input, setInput] = useState("");
  const [showAll, setShowAll] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { contains } = useFilter({ sensitivity: "base" });

  const setSelected = (next: Key[]) => {
    setUncontrolled(next);
    onSelectionChange?.(next);
  };

  const byKey = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const chosen = selected.map((key) => byKey.get(key)).filter((item): item is T => item !== undefined);
  const remaining = items.filter((item) => !selected.includes(item.id) && contains(item.label, input));
  const query = input.trim();
  const canCreate = allowsCreate && query !== "" && !items.some((item) => item.label.toLowerCase() === query.toLowerCase());
  const listItems = canCreate ? [...remaining, { id: CREATE_KEY, label: query } as T] : remaining;

  const visible = maxVisibleTags !== undefined && !showAll ? chosen.slice(0, maxVisibleTags) : chosen;
  const hidden = chosen.length - visible.length;
  const labelId = useId();

  return (
    <div className={cx("flex w-full flex-col gap-1", className)}>
      {/* Not a <label>: it names both the tag list and the input. */}
      <span id={labelId} onClick={() => inputRef.current?.focus()} className={cx(FIELD_LABEL, "cursor-default self-start")}>
        {label}
      </span>
      <div
        ref={groupRef}
        className={cx(
          fieldShell({ isDisabled, isInvalid }, "md"),
          // The shell lights up whenever the input or a tag inside it has focus.
          !isDisabled && "hover:not-focus-within:ring-line-control-hover",
          !isDisabled && !isInvalid && "focus-within:ring-2 focus-within:ring-focus",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-1.25">
          {chosen.length > 0 && (
            <AriaTagGroup
              aria-labelledby={labelId}
              onRemove={(keys) => setSelected(selected.filter((key) => !keys.has(key)))}
              className="contents"
            >
              <TagList items={visible} className="contents">
                {(item) => (
                  <AriaTag
                    id={item.id}
                    textValue={item.label}
                    className={cx(
                      "inline-flex h-6 max-w-full items-center gap-0.5 rounded-chip border border-line-control bg-sunken ps-1.5 pe-0.5 text-caption-strong text-fg",
                      focusRing,
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    <AriaButton slot="remove" isDisabled={isDisabled} className="flex size-4.5 cursor-pointer items-center justify-center rounded-xs text-icon-secondary data-[hovered]:bg-muted data-[hovered]:text-fg">
                      <RiCloseLine aria-hidden className="size-3" />
                    </AriaButton>
                  </AriaTag>
                )}
              </TagList>
            </AriaTagGroup>
          )}
          {hidden > 0 && (
            <button type="button" onClick={() => setShowAll(true)} className={cx("h-6 cursor-pointer rounded-chip px-1.5 text-caption-strong text-fg-secondary hover:bg-surface-hover", focusRingNative)}>
              +{hidden} more
            </button>
          )}
          <AriaComboBox
            aria-labelledby={labelId}
            inputValue={input}
            onInputChange={setInput}
            selectedKey={null}
            isDisabled={isDisabled}
            items={listItems}
            allowsEmptyCollection
            onSelectionChange={(key) => {
              if (key == null) return;
              if (key === CREATE_KEY) {
                const created = onCreate?.(query);
                if (created) setSelected([...selected, created.id]);
              } else setSelected([...selected, key]);
              setInput("");
            }}
            className="flex min-w-24 flex-1 items-center"
          >
            <Group className="flex flex-1 items-center">
              <Input
                ref={inputRef}
                placeholder={chosen.length ? "" : placeholder}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && input === "" && selected.length > 0) setSelected(selected.slice(0, -1));
                }}
                className={cx(FIELD_INPUT, "h-6 ps-0.5")}
              />
              <AriaButton className={cx(FIELD_BUTTON, "-me-1")}>
                <ChevronDownSmall aria-hidden className="size-4" />
              </AriaButton>
            </Group>
            <Popover triggerRef={groupRef} style={{}} offset={4} className={cx(MENU_POPOVER_SURFACE, "w-(--trigger-width) p-1.5")}>
              <ListBox
                className={cx(MENU_ITEMS_CONTAINER, "max-h-64 overflow-auto")}
                renderEmptyState={() => <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">{input ? "No matches" : "Everything is selected"}</p>}
              >
                {(item: T) => (
                  <ListBoxItem
                    id={item.id}
                    textValue={item.label}
                    className={({ isFocused }) => cx(MENU_ITEM, "py-1.75 text-body-md-strong", isFocused && "bg-surface-hover")}
                  >
                    {item.id === CREATE_KEY ? (
                      <>
                        <RiAddLine aria-hidden className="size-4 shrink-0 text-accent-600" />
                        <span className="truncate">Create “{item.label}”</span>
                      </>
                    ) : (
                      <span className="flex min-w-0 flex-col">
                        <Text slot="label" className="truncate">
                          {item.label}
                        </Text>
                        {item.description && (
                          <Text slot="description" className="text-body-sm text-fg-secondary">
                            {item.description}
                          </Text>
                        )}
                      </span>
                    )}
                  </ListBoxItem>
                )}
              </ListBox>
            </Popover>
          </AriaComboBox>
        </div>
      </div>
      {description && !isInvalid && <p className={FIELD_DESCRIPTION}>{description}</p>}
      {isInvalid && errorMessage && <p className={FIELD_ERROR}>{errorMessage}</p>}
    </div>
  );
}
