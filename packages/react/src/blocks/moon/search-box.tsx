"use client";

import { useContext, useEffect, useRef, useState, type ContextType, type ReactNode, type RefObject } from "react";
import {
  Button as AriaButton,
  Collection,
  ComboBox,
  ComboBoxStateContext,
  Group,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import { RiCloseLine, RiHistoryLine, RiSearchLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { Spinner } from "../../components/spinner/spinner";
import { FIELD_BUTTON, FIELD_INPUT, fieldShell } from "../../recipes/field";
import { MENU_GROUP_LABEL, MENU_ITEM, MENU_ITEM_ACTIVE, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * Search box: a field that finds as you type. Empty, it offers recent
 * searches; with text, it calls `onSearch` (debounced, and ignoring answers
 * that arrive out of order) and shows the results in groups, with the matched
 * text picked out in each one.
 *
 * It's a React Aria ComboBox, so ↑ ↓ move through results, Enter opens one,
 * Escape closes the list, and screen readers announce the options. Pressing
 * Enter with nothing highlighted searches for the text as typed.
 */

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon?: IconComponent;
}

export interface SearchResultGroup {
  id: string;
  label: string;
  results: SearchResult[];
}

export interface SearchBoxProps {
  /** Finds results for the text. May be async. */
  onSearch: (query: string) => SearchResultGroup[] | Promise<SearchResultGroup[]>;
  /** A result was opened. */
  onSelect?: (result: SearchResult) => void;
  /** Enter pressed on free text, with no result highlighted. */
  onSubmit?: (query: string) => void;
  /** Shown when the field is empty, newest first. */
  recent?: string[];
  onClearRecent?: () => void;
  placeholder?: string;
  "aria-label"?: string;
  /** Milliseconds to wait after typing before searching. Default 200. */
  debounce?: number;
  /** Fewest characters to search on. Default 1. */
  minLength?: number;
  emptyMessage?: ReactNode;
  className?: string;
}

/** Splits text around the first match of the query, ignoring case. */
export function highlightParts(text: string, query: string): { before: string; match: string; after: string } | null {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return null;
  const start = text.toLocaleLowerCase().indexOf(needle);
  if (start < 0) return null;
  return { before: text.slice(0, start), match: text.slice(start, start + needle.length), after: text.slice(start + needle.length) };
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = highlightParts(text, query);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.before}
      <mark className="rounded-control-xs bg-action-tertiary px-px text-action-tertiary-fg">{parts.match}</mark>
      {parts.after}
    </>
  );
}

const RECENT_PREFIX = "recent:";

type ComboBoxState = NonNullable<ContextType<typeof ComboBoxStateContext>>;

/** ComboBox has no `isOpen` prop, so this reaches its state from the inside. */
function CaptureState({ into }: { into: RefObject<ComboBoxState | null> }) {
  into.current = useContext(ComboBoxStateContext);
  return null;
}

export function SearchBox({
  onSearch,
  onSelect,
  onSubmit,
  recent = [],
  onClearRecent,
  placeholder = "Search",
  "aria-label": ariaLabel = "Search",
  debounce = 200,
  minLength = 1,
  emptyMessage = "No results",
  className,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchResultGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const combo = useRef<ComboBoxState | null>(null);
  const search = useRef(onSearch);
  search.current = onSearch;

  const text = query.trim();
  const searching = text.length >= minLength;

  useEffect(() => {
    if (!searching) {
      setGroups([]);
      setLoading(false);
      return;
    }
    let stale = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await search.current(text);
        if (!stale) setGroups(found);
      } catch {
        if (!stale) setGroups([]);
      } finally {
        if (!stale) setLoading(false);
      }
    }, debounce);
    // A newer query supersedes this one, however late its answer arrives.
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [text, searching, debounce]);

  const results = groups.flatMap((group) => group.results);
  const hasResults = results.length > 0;
  const showRecent = !searching && recent.length > 0;

  const choose = (key: Key | null) => {
    if (key === null) return;
    // With nothing ever "selected" for it to commit, the list wouldn't close itself.
    combo.current?.close();
    const id = String(key);
    if (id.startsWith(RECENT_PREFIX)) {
      // Choosing a recent search is the same as typing it and pressing Enter.
      const entry = id.slice(RECENT_PREFIX.length);
      setQuery(entry);
      onSubmit?.(entry);
      return;
    }
    const result = results.find((entry) => entry.id === id);
    if (result) onSelect?.(result);
  };

  return (
    <ComboBox
      aria-label={ariaLabel}
      allowsCustomValue
      allowsEmptyCollection
      menuTrigger="focus"
      // Finding is onSearch's job: results may match on things the title doesn't show.
      defaultFilter={() => true}
      inputValue={query}
      onInputChange={setQuery}
      selectedKey={null}
      onSelectionChange={choose}
      className={cx("w-full max-w-lg", className)}
    >
      <CaptureState into={combo} />
      <Group ref={shell} className={(state) => fieldShell(state)}>
        <RiSearchLine aria-hidden className="size-5 shrink-0" />
        <Input
          placeholder={placeholder}
          onKeyDown={(event) => {
            // The list handles Enter on a highlighted option; this is the free-text case.
            if (event.key === "Enter" && text && !event.currentTarget.getAttribute("aria-activedescendant")) onSubmit?.(text);
          }}
          className={FIELD_INPUT}
        />
        {loading && <Spinner size="sm" aria-label="Searching" />}
        {query && (
          <AriaButton slot={null} aria-label="Clear search" onPress={() => setQuery("")} className={FIELD_BUTTON}>
            <RiCloseLine aria-hidden className="size-4" />
          </AriaButton>
        )}
      </Group>

      <AriaPopover triggerRef={shell} offset={4} className={cx(MENU_POPOVER_SURFACE, "flex w-(--trigger-width) flex-col gap-1 p-2")}>
        {showRecent && onClearRecent && (
          <div className="flex items-center justify-between">
            <span className={MENU_GROUP_LABEL}>Recent</span>
            <AriaButton slot={null} onPress={onClearRecent} className="cursor-pointer rounded-control-xs px-1 text-caption text-fg-secondary data-[hovered]:text-fg">
              Clear
            </AriaButton>
          </div>
        )}
        <ListBox
          renderEmptyState={() =>
            loading ? (
              <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">Searching…</p>
            ) : searching ? (
              <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">{emptyMessage}</p>
            ) : (
              <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">Type to search</p>
            )
          }
          className={cx(MENU_ITEMS_CONTAINER, "max-h-80 overflow-auto outline-none")}
        >
          {showRecent ? (
            recent.map((entry) => (
              <ListBoxItem key={entry} id={`${RECENT_PREFIX}${entry}`} textValue={entry} className={({ isFocused }) => cx(MENU_ITEM, "px-2 py-1.5 text-body-md", isFocused && MENU_ITEM_ACTIVE)}>
                <RiHistoryLine aria-hidden className="size-4 shrink-0 text-icon-secondary" />
                <span className="truncate">{entry}</span>
              </ListBoxItem>
            ))
          ) : hasResults ? (
            // `dependencies`: Collection caches rows by item, and the highlight changes with the text.
            <Collection items={groups.filter((group) => group.results.length > 0)} dependencies={[text]}>
              {(group) => (
                <ListBoxSection id={group.id} className="flex flex-col gap-0.5 pb-1">
                  <Header className={cx(MENU_GROUP_LABEL, "py-1")}>{group.label}</Header>
                  <Collection items={group.results} dependencies={[text]}>
                    {(result) => {
                      const Icon = result.icon;
                      return (
                        <ListBoxItem
                          id={result.id}
                          textValue={result.title}
                          // The <mark> splits the words up; give assistive tech the whole text.
                          aria-label={result.description ? `${result.title}, ${result.description}` : result.title}
                          className={({ isFocused }) => cx(MENU_ITEM, "px-2 py-1.5", isFocused && MENU_ITEM_ACTIVE)}
                        >
                          {Icon && <Icon aria-hidden className="size-5 shrink-0 text-icon-secondary" />}
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-body-md text-fg">
                              <Highlight text={result.title} query={text} />
                            </span>
                            {result.description && (
                              <span className="truncate text-body-sm text-fg-secondary">
                                <Highlight text={result.description} query={text} />
                              </span>
                            )}
                          </span>
                        </ListBoxItem>
                      );
                    }}
                  </Collection>
                </ListBoxSection>
              )}
            </Collection>
          ) : null}
        </ListBox>
      </AriaPopover>
    </ComboBox>
  );
}
