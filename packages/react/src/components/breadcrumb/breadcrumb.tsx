// The item API was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.
import { Link } from "../../foundations/link";
import { Children, Fragment, isValidElement } from "react";
import type { ComponentType, ReactElement, ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import { RiMoreLine } from "@remixicon/react";
import { focusRing } from "../../recipes/focus-ring";
import { Menu, MenuItem, MenuTrigger } from "../menu/menu";
import { cx } from "../../utils/cx";

/**
 * Trail of ancestor pages, set like a path.
 *   item      text-caption-strong, fg-tertiary, gap 6 (icon/avatar and label)
 *   hover     interactive items darken to fg-secondary and a pen rule draws
 *             under them; no background pill
 *   current   aria-current="page", fg-secondary, not interactive
 *   separator a mono slash in fg-tertiary, gap 10 between items
 *
 * Compose <BreadcrumbItem>s inside <Breadcrumb>; separators are inserted
 * automatically. An item becomes a link when given `href`, a button when given
 * `onClick`, otherwise a plain label (use `current` for the active page).
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface BreadcrumbProps {
  children: ReactNode;
  "aria-label"?: string;
  /**
   * Most items to show. Past it, the trail keeps its first item and the last
   * `maxItems - 1`, and folds the levels between into a "…" menu.
   */
  maxItems?: number;
  className?: string;
  ref?: Ref<HTMLElement>;
}

/** The folded middle levels, as a menu of the same links and actions. */
function CollapsedItems({ items }: { items: ReactElement<BreadcrumbItemProps>[] }) {
  return (
    <li className="flex items-center">
      <MenuTrigger>
        <AriaButton
          aria-label={`Show ${items.length} more ${items.length === 1 ? "level" : "levels"}`}
          className={cx(
            "-mx-1 flex h-6 cursor-pointer items-center rounded-control-xs px-1 text-fg-tertiary transition-colors duration-(--ds-motion-duration-base)",
            "data-[hovered]:text-fg-secondary data-[pressed]:bg-surface-pressed",
            focusRing,
          )}
        >
          <RiMoreLine aria-hidden className="size-4" />
        </AriaButton>
        <Menu placement="bottom start" popoverClassName="min-w-44">
          {items.map((item, i) => (
            <MenuItem
              key={item.key ?? i}
              id={String(item.key ?? i)}
              href={item.props.href}
              onAction={item.props.onClick}
              icon={item.props.icon}
              textValue={typeof item.props.children === "string" ? item.props.children : undefined}
            >
              {item.props.children}
            </MenuItem>
          ))}
        </Menu>
      </MenuTrigger>
    </li>
  );
}

export function Breadcrumb({
  children,
  "aria-label": ariaLabel = "Breadcrumb",
  maxItems,
  className,
  ref,
}: BreadcrumbProps) {
  const all = Children.toArray(children).filter(isValidElement) as ReactElement<BreadcrumbItemProps>[];
  const collapse = maxItems !== undefined && maxItems >= 2 && all.length > maxItems;
  const hidden = collapse ? all.slice(1, all.length - (maxItems - 1)) : [];
  const items: ReactElement[] = collapse ? [all[0]!, <CollapsedItems key="__collapsed" items={hidden} />, ...all.slice(all.length - (maxItems - 1))] : all;

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cx(
        "flex w-full items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <ol className="flex items-center gap-2.5 px-1">
        {items.map((item, index) => (
          <Fragment key={item.key ?? index}>
            {index > 0 && (
              <span aria-hidden className="shrink-0 font-mono text-caption text-fg-tertiary">/</span>
            )}
            {item}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export interface BreadcrumbItemProps {
  children?: ReactNode;
  /** Optional leading icon (16px), inherits the item color. */
  icon?: IconComponent;
  href?: string;
  onClick?: () => void;
  /** Marks the active page: not interactive, darker text. */
  current?: boolean;
  className?: string;
}

export function BreadcrumbItem({
  children,
  icon: Icon,
  href,
  onClick,
  current = false,
  className,
}: BreadcrumbItemProps) {
  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      {children}
    </>
  );

  if (current) {
    return (
      <li
        aria-current="page"
        className={cx(
          "flex items-center gap-1.5 text-caption-strong whitespace-nowrap text-fg-secondary",
          className,
        )}
      >
        {content}
      </li>
    );
  }

  const interactiveClass = cx(
    "-mx-1 flex items-center gap-1.5 rounded-control-xs px-1 py-0.5 text-caption-strong whitespace-nowrap text-fg-tertiary",
    "transition-colors duration-(--ds-motion-duration-base) ease-out outline-none",
    "relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 after:transition-[scale] after:duration-(--ds-motion-duration-moderate) after:ease-out rtl:after:origin-right motion-reduce:after:transition-none after:inset-x-1 hover:after:scale-x-100 hover:text-fg-secondary",
    "focus-visible:outline-2 focus-visible:outline-focus",
    className,
  );

  return (
    <li className="flex items-center">
      {href ? (
        <Link href={href} className={interactiveClass}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cx("cursor-pointer", interactiveClass)}>
          {content}
        </button>
      )}
    </li>
  );
}
