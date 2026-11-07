"use client";

import { useContext, useEffect, useRef, useState, type ContextType, type RefObject } from "react";
import {
  Button as AriaButton,
  Collection,
  ComboBox,
  ComboBoxStateContext,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import { RiCloseLine, RiCornerDownLeftLine, RiSearchLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { Spinner } from "../../components/spinner/spinner";
import { FIELD_INPUT } from "../../recipes/field";
import { focusRing, focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { LiquidGlass } from "./liquid-glass";

/**
 * Spotlight search: a floating capsule that finds anything. At rest it's a
 * field with a row of category shortcuts at its end. Pick a category to narrow
 * the search; it moves into the field as a chip. Typing opens grouped results
 * in a glass panel underneath, with the highlighted row filled in the accent.
 *
 * It's a React Aria ComboBox, so ↑ ↓ and Enter work and results are announced.
 * Backspace in an empty field removes the category.
 */

export interface SpotlightResult {
  id: string;
  title: string;
  subtitle?: string;
  icon?: IconComponent;
}

export interface SpotlightGroup {
  id: string;
  label: string;
  results: SpotlightResult[];
}

export interface SpotlightCategory {
  id: string;
  label: string;
  icon: IconComponent;
}

export interface SpotlightSearchProps {
  /** Finds results. May be async; answers that arrive out of order are ignored. */
  onSearch: (query: string, category?: string) => SpotlightGroup[] | Promise<SpotlightGroup[]>;
  onSelect?: (result: SpotlightResult) => void;
  categories?: SpotlightCategory[];
  placeholder?: string;
  "aria-label"?: string;
  /** Milliseconds to wait after typing. Default 150. */
  debounce?: number;
  emptyMessage?: string;
  className?: string;
}

type ComboBoxState = NonNullable<ContextType<typeof ComboBoxStateContext>>;

function CaptureState({ into }: { into: RefObject<ComboBoxState | null> }) {
  into.current = useContext(ComboBoxStateContext);
  return null;
}

export function SpotlightSearch({
  onSearch,
  onSelect,
  categories = [],
  placeholder = "Search",
  "aria-label": ariaLabel = "Search",
  debounce = 150,
  emptyMessage = "No results",
  className,
}: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [groups, setGroups] = useState<SpotlightGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const combo = useRef<ComboBoxState | null>(null);
  const search = useRef(onSearch);
  search.current = onSearch;

  const text = query.trim();
  const chosen = categories.find((entry) => entry.id === category);
  const ChosenIcon = chosen?.icon;

  useEffect(() => {
    if (!text) {
      setGroups([]);
      setLoading(false);
      return;
    }
    let stale = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await search.current(text, category);
        if (!stale) setGroups(found);
      } catch {
        if (!stale) setGroups([]);
      } finally {
        if (!stale) setLoading(false);
      }
    }, debounce);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [text, category, debounce]);

  const results = groups.flatMap((group) => group.results);

  const choose = (key: Key | null) => {
    if (key === null) return;
    combo.current?.close();
    const result = results.find((entry) => entry.id === String(key));
    if (result) onSelect?.(result);
  };

  return (
    <ComboBox
      aria-label={ariaLabel}
      allowsCustomValue
      allowsEmptyCollection
      defaultFilter={() => true}
      inputValue={query}
      onInputChange={setQuery}
      selectedKey={null}
      onSelectionChange={choose}
      className={cx("w-full max-w-xl", className)}
    >
      <CaptureState into={combo} />
      <div ref={shell}>
        <LiquidGlass refract className="flex h-14 items-center gap-2 rounded-full ps-4 pe-2 text-fg">
          <RiSearchLine aria-hidden className="size-5 shrink-0 text-icon-secondary" />
          {chosen && ChosenIcon && (
            <span className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-glass-lens ps-2.5 pe-1 text-body-sm text-fg">
              <ChosenIcon aria-hidden className="size-4" />
              {chosen.label}
              <AriaButton slot={null} aria-label={`Remove ${chosen.label} filter`} onPress={() => setCategory(undefined)} className={cx("flex size-6 cursor-pointer items-center justify-center rounded-full", focusRing)}>
                <RiCloseLine aria-hidden className="size-3.5" />
              </AriaButton>
            </span>
          )}
          <Input
            ref={input}
            placeholder={placeholder}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !query && category) setCategory(undefined);
            }}
            className={cx(FIELD_INPUT, "text-title-sm-strong font-normal placeholder:text-fg-secondary")}
          />
          {loading && <Spinner size="sm" aria-label="Searching" />}
          {!text && !chosen && categories.length > 0 && (
            <ToggleButtonGroup
              aria-label="Search in"
              selectionMode="single"
              selectedKeys={category ? [category] : []}
              onSelectionChange={(keys) => {
                const next = [...keys][0];
                setCategory(next === undefined ? undefined : String(next));
                input.current?.focus();
              }}
              className="flex shrink-0 gap-1"
            >
              {categories.map(({ id, label, icon: Icon }) => (
                <ToggleButton key={id} id={id} aria-label={label} className={cx("hidden size-10 cursor-pointer items-center justify-center rounded-full bg-glass-lens text-fg transition-transform data-[pressed]:scale-95 sm:flex motion-reduce:transition-none", focusRing)}>
                  <Icon aria-hidden className="size-5" />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </LiquidGlass>
      </div>

      {/* As wide as the capsule: ComboBox would measure only its input. */}
      <Popover triggerRef={shell} offset={8} style={{ width: shell.current?.offsetWidth }} className="glass flex flex-col overflow-hidden rounded-overlay outline-none">
        <ListBox
          renderEmptyState={() => <p className="px-3 py-5 text-center text-body-md text-fg-secondary">{loading ? "Searching…" : emptyMessage}</p>}
          className="flex max-h-96 flex-col gap-2 overflow-auto p-2 outline-none"
        >
          {results.length > 0 && (
            <Collection items={groups.filter((group) => group.results.length > 0)}>
              {(group) => (
                <ListBoxSection id={group.id} className="flex flex-col">
                  <Header className="px-2 py-1 text-caption-strong text-fg-secondary">{group.label}</Header>
                  <Collection items={group.results}>
                    {(result) => {
                      const Icon = result.icon;
                      return (
                        <ListBoxItem
                          id={result.id}
                          textValue={result.title}
                          aria-label={result.subtitle ? `${result.title}, ${result.subtitle}` : result.title}
                          className={({ isFocused }) =>
                            cx("flex min-h-11 cursor-pointer items-center gap-3 rounded-item px-2 py-1 outline-none", isFocused ? "bg-accent-600 text-on-action" : "text-fg", focusRingNative)
                          }
                        >
                          {({ isFocused }) => (
                            <>
                              {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-body-md">{result.title}</span>
                                {result.subtitle && <span className={cx("block truncate text-caption", !isFocused && "text-fg-secondary")}>{result.subtitle}</span>}
                              </span>
                              {isFocused && <RiCornerDownLeftLine aria-hidden className="size-4 shrink-0" />}
                            </>
                          )}
                        </ListBoxItem>
                      );
                    }}
                  </Collection>
                </ListBoxSection>
              )}
            </Collection>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}
