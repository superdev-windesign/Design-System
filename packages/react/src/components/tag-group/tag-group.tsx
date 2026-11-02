"use client";

import type { ReactNode } from "react";
import { Button as AriaButton, Tag as AriaTag, TagGroup as AriaTagGroup, TagList, Text } from "react-aria-components";
import type { TagGroupProps as AriaTagGroupProps, TagListProps, TagProps as AriaTagProps } from "react-aria-components";
import { RiCloseLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { focusRing } from "../../recipes/focus-ring";
import { FIELD_ERROR } from "../../recipes/field";
import { cx } from "../../utils/cx";
import { FieldDescription, FieldLabel } from "../form/form";

/**
 * TagGroup: a set of tags that can be removed, selected, or both (applied
 * filters, recipients, skills). Arrow keys move between tags, Delete or
 * Backspace removes the focused one when `onRemove` is set, and with a
 * `selectionMode` Space and Enter toggle them.
 *
 * ```tsx
 * <TagGroup label="Filters" onRemove={(keys) => remove(keys)}>
 *   <Tag id="design">Design</Tag>
 * </TagGroup>
 * ```
 */

export interface TagGroupProps<T extends object> extends Omit<AriaTagGroupProps, "className" | "children">, Pick<TagListProps<T>, "items" | "children" | "renderEmptyState"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: "md" | "sm";
  className?: string;
}

export function TagGroup<T extends object>({ label, description, errorMessage, size = "md", className, items, children, renderEmptyState, ...props }: TagGroupProps<T>) {
  return (
    <AriaTagGroup {...props} data-size={size} className={cx("group/tags flex flex-col gap-1.5", className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <TagList
        items={items}
        renderEmptyState={renderEmptyState ?? (() => <span className="text-body-sm text-fg-tertiary">None</span>)}
        className="flex flex-wrap items-center gap-1.5"
      >
        {children}
      </TagList>
      {description && <FieldDescription>{description}</FieldDescription>}
      {errorMessage && (
        <Text slot="errorMessage" className={FIELD_ERROR}>
          {errorMessage}
        </Text>
      )}
    </AriaTagGroup>
  );
}

export interface TagProps extends Omit<AriaTagProps, "children" | "className"> {
  children: ReactNode;
  icon?: IconComponent;
  className?: string;
}

export function Tag({ children, icon: Icon, className, textValue, ...props }: TagProps) {
  return (
    <AriaTag
      {...props}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      className={(state) => cx(
        "group inline-flex max-w-full cursor-default items-center gap-1 rounded-chip border border-line-control bg-surface text-fg",
        "transition-[background-color,border-color,color] duration-(--ds-motion-duration-base)",
        "group-data-[size=md]/tags:h-7 group-data-[size=md]/tags:px-2 group-data-[size=md]/tags:text-body-sm-strong",
        "group-data-[size=sm]/tags:h-6 group-data-[size=sm]/tags:px-1.5 group-data-[size=sm]/tags:text-caption-strong",
        state.selectionMode !== "none" && "cursor-pointer",
        "data-[hovered]:border-line-control-hover data-[hovered]:bg-surface-hover",
        "data-[selected]:border-accent-600 data-[selected]:bg-accent-600 data-[selected]:text-on-action",
        "data-[disabled]:cursor-not-allowed data-[disabled]:border-line data-[disabled]:text-fg-disabled",
        "data-[allows-removing]:pe-0.5",
        focusRing,
        className,
      )}
    >
      {({ allowsRemoving }) => (
        <>
          {Icon && <Icon aria-hidden className="size-3.5 shrink-0" />}
          <span className="truncate">{children}</span>
          {allowsRemoving && (
            <AriaButton
              slot="remove"
              className={cx(
                "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-xs text-icon-secondary",
                "transition-colors duration-(--ds-motion-duration-fast) data-[hovered]:bg-muted data-[hovered]:text-fg",
                "group-data-[selected]:text-on-action",
              )}
            >
              <RiCloseLine aria-hidden className="size-3.5" />
            </AriaButton>
          )}
        </>
      )}
    </AriaTag>
  );
}
