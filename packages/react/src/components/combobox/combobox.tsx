"use client";

import { useRef, type ReactNode } from "react";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Group,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Header,
  Popover,
  Text,
} from "react-aria-components";
import type { ComboBoxProps as AriaComboBoxProps, ListBoxItemProps, ListBoxSectionProps, ValidationResult } from "react-aria-components";
import { RiCheckLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { ChevronDownSmall } from "../../icons/chevrons";
import { FIELD_BUTTON, FIELD_INPUT, fieldShell, type FieldSize } from "../../recipes/field";
import { MENU_ITEM, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldError, FieldLabel } from "../form/form";

/**
 * ComboBox: a text field with a list of suggestions that filters as you
 * type (assign a person, pick a country, choose a label). Unlike Select, the
 * value can be searched, and with `allowsCustomValue` it needn't come from
 * the list at all.
 *
 * ```tsx
 * <ComboBox label="Assignee" defaultItems={people}>
 *   {(person) => <ComboBoxItem id={person.id}>{person.name}</ComboBoxItem>}
 * </ComboBox>
 * ```
 *
 * Filtering is a case-insensitive "contains" by default; pass `items` and
 * `onInputChange` to filter (or fetch) yourself.
 */

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, "children" | "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  leadingIcon?: IconComponent;
  size?: FieldSize;
  /** Shown in the list when nothing matches. Default "No matches". */
  emptyState?: ReactNode;
  className?: string;
  children: ReactNode | ((item: T) => ReactNode);
}

export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  placeholder,
  leadingIcon: Leading,
  size = "md",
  emptyState = "No matches",
  className,
  children,
  ...props
}: ComboBoxProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  return (
    <AriaComboBox {...props} className={cx("group flex w-full flex-col gap-1", className)}>
      {label && <FieldLabel isRequired={props.isRequired}>{label}</FieldLabel>}
      <Group ref={groupRef} className={(state) => fieldShell(state, size)}>
        {Leading && <Leading aria-hidden className="size-4 shrink-0" />}
        <Input placeholder={placeholder} className={FIELD_INPUT} />
        <AriaButton className={cx(FIELD_BUTTON, "-me-1")}>
          <ChevronDownSmall aria-hidden className="size-4 transition-transform duration-(--ds-motion-duration-moderate) group-data-[open]:rotate-180" />
        </AriaButton>
      </Group>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
      {/* Anchored to the whole field (not just the input) and as wide as it. */}
      <Popover triggerRef={groupRef} style={{}} offset={4} className={cx(MENU_POPOVER_SURFACE, "w-(--trigger-width) p-1.5")}>
        <ListBox
          className={cx(MENU_ITEMS_CONTAINER, "max-h-72 overflow-auto")}
          renderEmptyState={() => <p className="px-2 py-3 text-center text-body-sm text-fg-secondary">{emptyState}</p>}
        >
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export interface ComboBoxItemProps extends Omit<ListBoxItemProps, "children"> {
  children: ReactNode;
  description?: ReactNode;
  icon?: IconComponent;
}

/** One suggestion. The checked row is the current value. */
export function ComboBoxItem({ children, description, icon: Icon, className, textValue, ...props }: ComboBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      className={(state) =>
        cx(
          MENU_ITEM,
          "items-start py-1.75 text-body-md-strong",
          state.isFocused && "bg-surface-hover",
          state.isDisabled && "cursor-not-allowed text-fg-disabled",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isSelected }) => (
        <>
          {Icon && <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-icon-secondary" />}
          <span className="flex min-w-0 flex-1 flex-col">
            <Text slot="label" className="truncate">
              {children}
            </Text>
            {description && (
              <Text slot="description" className="text-body-sm text-fg-secondary">
                {description}
              </Text>
            )}
          </span>
          <RiCheckLine aria-hidden className={cx("mt-0.5 size-4 shrink-0 text-accent-600", !isSelected && "invisible")} />
        </>
      )}
    </ListBoxItem>
  );
}

export interface ComboBoxSectionProps<T extends object> extends Omit<ListBoxSectionProps<T>, "children"> {
  children: ReactNode;
  title?: ReactNode;
}

export function ComboBoxSection<T extends object>({ title, children, className, ...props }: ComboBoxSectionProps<T>) {
  return (
    <ListBoxSection {...props} className={cx("flex flex-col gap-0.5", className)}>
      {title && <Header className="px-2 pt-2 pb-1 font-mono text-caption tracking-wide text-fg-secondary uppercase">{title}</Header>}
      {children}
    </ListBoxSection>
  );
}
