"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  Collection,
  ComboBox,
  Group,
  Header,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
  Text,
} from "react-aria-components";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { ChevronDownSmall } from "../../icons/chevrons";
import { FIELD_BUTTON, FIELD_DESCRIPTION, FIELD_INPUT, FIELD_LABEL, fieldShell } from "../../recipes/field";
import { focusRingNative } from "../../recipes/focus-ring";
import { MENU_GROUP_LABEL, MENU_ITEM, MENU_ITEM_ACTIVE, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * Tag combobox, after Moon's multi-select combobox: you type straight into the
 * field to filter a long grouped list, and pick as many as you like while it
 * stays open. Choices fold into one solid counter at the start of the field,
 * which clears them all, so the field stays a single line however many are
 * picked. Each row marks its state with a box at the end.
 *
 * It's a React Aria ComboBox in multiple-selection mode.
 */

export interface TagComboboxOption {
  id: string;
  label: string;
  /** Extra search terms, e.g. a country code. */
  keywords?: string;
  /** Shown before the label, e.g. an avatar. */
  leading?: ReactNode;
}

export interface TagComboboxGroup {
  id: string;
  label: string;
  options: TagComboboxOption[];
}

export interface TagComboboxProps {
  label: ReactNode;
  groups: TagComboboxGroup[];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  placeholder?: string;
  description?: ReactNode;
  isDisabled?: boolean;
  className?: string;
}

export function TagCombobox({ label, groups, selectedKeys, defaultSelectedKeys = [], onSelectionChange, placeholder = "Select one", description, isDisabled = false, className }: TagComboboxProps) {
  const [own, setOwn] = useState(defaultSelectedKeys);
  const chosen = selectedKeys ?? own;
  const shell = useRef<HTMLDivElement>(null);

  const change = (next: string[]) => {
    setOwn(next);
    onSelectionChange?.(next);
  };

  return (
    <ComboBox
      selectionMode="multiple"
      value={chosen}
      onChange={(keys) => change(keys.map(String))}
      defaultItems={groups}
      menuTrigger="focus"
      allowsEmptyCollection
      isDisabled={isDisabled}
      className={cx("flex w-full max-w-md flex-col gap-1", className)}
    >
      <Label className={FIELD_LABEL}>{label}</Label>
      <Group
        ref={shell}
        className={(state) => cx(fieldShell(state), !state.isFocusWithin && !state.isHovered && !state.isInvalid && !state.isDisabled && "ring-line", "ps-1.5 pe-1.5")}
      >
        {chosen.length > 0 && (
          <AriaButton
            slot={null}
            aria-label={`Clear ${chosen.length} selected`}
            isDisabled={isDisabled}
            onPress={() => change([])}
            className={cx("flex h-6 shrink-0 cursor-pointer items-center gap-0.5 rounded-control-xs bg-fg ps-1.5 pe-1 text-caption-strong tabular-nums text-canvas", focusRingNative)}
          >
            {chosen.length}
            <RiCloseLine aria-hidden className="size-3.5" />
          </AriaButton>
        )}
        <Input placeholder={placeholder} className={FIELD_INPUT} />
        <AriaButton className={FIELD_BUTTON}>
          <ChevronDownSmall aria-hidden className="size-4" />
        </AriaButton>
      </Group>
      {description && (
        <Text slot="description" className={FIELD_DESCRIPTION}>
          {description}
        </Text>
      )}

      <AriaPopover triggerRef={shell} offset={4} className={cx(MENU_POPOVER_SURFACE, "flex w-(--trigger-width) flex-col p-1.5")}>
        <ListBox<TagComboboxGroup>
          renderEmptyState={() => <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">No matches</p>}
          className={cx(MENU_ITEMS_CONTAINER, "max-h-64 overflow-auto outline-none")}
        >
          {(group) => (
            <ListBoxSection id={group.id} className="flex flex-col gap-0.5 pb-1">
              <Header className={cx(MENU_GROUP_LABEL, "py-1")}>{group.label}</Header>
              <Collection items={group.options}>
                {(option) => (
                  <ListBoxItem
                    id={option.id}
                    textValue={`${option.label} ${option.keywords ?? ""}`.trim()}
                    className={({ isFocused }) => cx(MENU_ITEM, "gap-2 px-2 py-1.5 text-body-md", isFocused && MENU_ITEM_ACTIVE)}
                  >
                    {({ isSelected }) => (
                      <>
                        {option.leading}
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        <span
                          aria-hidden
                          className={cx(
                            "flex size-5 shrink-0 items-center justify-center rounded-control-xs border",
                            isSelected ? "border-accent-600 bg-accent-600 text-on-action" : "border-line-control",
                          )}
                        >
                          {isSelected && <RiCheckLine className="size-4" />}
                        </span>
                      </>
                    )}
                  </ListBoxItem>
                )}
              </Collection>
            </ListBoxSection>
          )}
        </ListBox>
      </AriaPopover>
    </ComboBox>
  );
}
