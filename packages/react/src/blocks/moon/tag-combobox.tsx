"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Autocomplete,
  Button as AriaButton,
  Collection,
  Dialog,
  Group,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
  SearchField,
  Tag,
  TagGroup,
  TagList,
} from "react-aria-components";
import type { Key, Selection } from "react-aria-components";
import { useFilter } from "react-aria";
import { RiCheckLine, RiCloseLine, RiSearchLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { ChevronDownSmall } from "../../icons/chevrons";
import { FIELD_BUTTON, FIELD_DESCRIPTION, FIELD_INPUT, FIELD_LABEL, fieldShell } from "../../recipes/field";
import { focusRingNative } from "../../recipes/focus-ring";
import { MENU_GROUP_LABEL, MENU_ITEM, MENU_ITEM_ACTIVE, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * Tag combobox: choose many options from a long, grouped list. Choices sit in
 * the field as tags; past `maxVisibleTags` the rest fold into a "+3" count, so
 * the field never grows taller than a line or two. The panel has its own
 * search, stays open across picks, and can select or clear everything shown.
 *
 * Where MultiSelect types straight into the field, this keeps a search box in
 * the panel, which suits filters over grouped options. The tags are a real
 * TagGroup, so ← / → and Delete work among them, and the list is a real
 * multi-select ListBox.
 */

export interface TagComboboxOption {
  id: string;
  label: string;
  /** Extra search terms, e.g. a country code. */
  keywords?: string;
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
  searchPlaceholder?: string;
  description?: ReactNode;
  /** Tags shown before the rest fold into a count. Default 4. */
  maxVisibleTags?: number;
  isDisabled?: boolean;
  className?: string;
}

export function TagCombobox({
  label,
  groups,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  placeholder = "Choose…",
  searchPlaceholder = "Search",
  description,
  maxVisibleTags = 4,
  isDisabled = false,
  className,
}: TagComboboxProps) {
  const [own, setOwn] = useState(defaultSelectedKeys);
  const chosen = selectedKeys ?? own;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const labelId = useId();
  const shell = useRef<HTMLDivElement>(null);
  const { contains } = useFilter({ sensitivity: "base" });

  const options = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const byId = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);
  const matches = (option: TagComboboxOption) => contains(`${option.label} ${option.keywords ?? ""}`, query);
  const shown = options.filter(matches);

  const change = (next: string[]) => {
    setOwn(next);
    onSelectionChange?.(next);
  };
  const remove = (keys: Set<Key>) => change(chosen.filter((key) => !keys.has(key)));

  const tags = chosen.flatMap((key) => {
    const option = byId.get(key);
    return option ? [option] : [];
  });
  const visible = tags.slice(0, maxVisibleTags);
  const hidden = tags.length - visible.length;

  return (
    <div className={cx("flex w-full max-w-md flex-col gap-1", className)}>
      <span id={labelId} className={FIELD_LABEL}>
        {label}
      </span>

      {/* No DialogTrigger: it wires every button inside it as a trigger, so removing a tag would open the panel. */}
      <Group ref={shell} isDisabled={isDisabled} aria-labelledby={labelId} className={(state) => cx(fieldShell(state), "flex-wrap py-1 pe-1.5")}>
          {tags.length === 0 ? (
            <span className="min-w-0 flex-1 truncate py-0.5 text-body-md text-fg-tertiary">{placeholder}</span>
          ) : (
            <TagGroup aria-labelledby={labelId} onRemove={isDisabled ? undefined : remove} className="min-w-0 flex-1">
              <TagList items={visible} className="flex flex-wrap items-center gap-1">
                {(option) => (
                  <Tag
                    id={option.id}
                    textValue={option.label}
                    className={cx(
                      "flex items-center gap-1 rounded-chip bg-muted py-0.5 ps-2 pe-1 text-body-sm text-fg outline-none",
                      "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-1 data-[focus-visible]:outline-focus",
                    )}
                  >
                    {option.label}
                    <AriaButton slot="remove" className={cx("flex size-4 cursor-pointer items-center justify-center rounded-control-xs text-icon-secondary data-[hovered]:bg-muted-hover data-[hovered]:text-fg", focusRingNative)}>
                      <RiCloseLine aria-hidden className="size-3.5" />
                    </AriaButton>
                  </Tag>
                )}
              </TagList>
            </TagGroup>
          )}
          {hidden > 0 && (
            <span aria-label={`and ${hidden} more`} className="shrink-0 rounded-chip bg-muted px-1.5 py-0.5 text-body-sm tabular-nums text-fg-secondary">
              +{hidden}
            </span>
          )}
          <AriaButton
            aria-label={typeof label === "string" ? `Choose ${label}` : "Show options"}
            aria-haspopup="dialog"
            aria-expanded={open}
            onPress={() => setOpen((value) => !value)}
            className={FIELD_BUTTON}
          >
            <ChevronDownSmall aria-hidden className={cx("size-4 transition-transform duration-(--ds-motion-duration-base) motion-reduce:transition-none", open && "rotate-180")} />
          </AriaButton>
      </Group>

      <AriaPopover triggerRef={shell} isOpen={open} onOpenChange={setOpen} offset={4} className={cx(MENU_POPOVER_SURFACE, "flex w-(--trigger-width) flex-col gap-1.5 p-2")}>
          <Dialog aria-labelledby={labelId} className="flex min-h-0 flex-col gap-1.5 outline-none">
            <Autocomplete filter={contains} inputValue={query} onInputChange={setQuery}>
              <SearchField aria-label={searchPlaceholder} autoFocus>
                <Group className={(state) => fieldShell(state, "sm")}>
                  <RiSearchLine aria-hidden className="size-4 shrink-0" />
                  <Input placeholder={searchPlaceholder} className={cx(FIELD_INPUT, "text-body-sm [&::-webkit-search-cancel-button]:hidden")} />
                </Group>
              </SearchField>
              <ListBox
                aria-labelledby={labelId}
                selectionMode="multiple"
                selectedKeys={chosen}
                onSelectionChange={(keys: Selection) => {
                  if (keys === "all") change(options.map((option) => option.id));
                  else change([...keys].map(String));
                }}
                renderEmptyState={() => <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">No matches</p>}
                className={cx(MENU_ITEMS_CONTAINER, "max-h-60 overflow-auto outline-none")}
                items={groups}
              >
                {(group) => (
                  <ListBoxSection id={group.id} className="flex flex-col gap-0.5 pb-1">
                    <Header className={cx(MENU_GROUP_LABEL, "py-1")}>{group.label}</Header>
                    <Collection items={group.options}>
                      {(option) => (
                        <ListBoxItem
                          id={option.id}
                          textValue={`${option.label} ${option.keywords ?? ""}`.trim()}
                          className={({ isFocused }) => cx(MENU_ITEM, "justify-between px-2 py-1.5 text-body-md", isFocused && MENU_ITEM_ACTIVE)}
                        >
                          {({ isSelected }) => (
                            <>
                              <span className={cx("truncate", isSelected && "text-body-md-strong")}>{option.label}</span>
                              {isSelected && <RiCheckLine aria-hidden className="size-4 shrink-0 text-accent-600" />}
                            </>
                          )}
                        </ListBoxItem>
                      )}
                    </Collection>
                  </ListBoxSection>
                )}
              </ListBox>
            </Autocomplete>
            <footer className="flex items-center justify-between gap-2 border-t border-line pt-1.5">
              <span className="text-caption tabular-nums text-fg-secondary">{chosen.length} selected</span>
              <div className="flex gap-1">
                <Button variant="tertiary" size="xs" isDisabled={chosen.length === 0} onPress={() => change([])}>
                  Clear
                </Button>
                <Button
                  variant="tertiary"
                  size="xs"
                  isDisabled={shown.length === 0}
                  onPress={() => change([...new Set([...chosen, ...shown.map((option) => option.id)])])}
                >
                  {query ? "Select shown" : "Select all"}
                </Button>
              </div>
            </footer>
          </Dialog>
      </AriaPopover>

      {description && <span className={FIELD_DESCRIPTION}>{description}</span>}
    </div>
  );
}
