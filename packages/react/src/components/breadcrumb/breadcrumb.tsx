// Adapted from BoardUI (MIT) — components/base/breadcrumb/breadcrumb.tsx. See THIRD_PARTY_NOTICES.md.
import { Link } from "../../foundations/link";
import { Children, Fragment, isValidElement } from "react";
import type { ComponentType, ReactElement, ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import { RiMoreLine } from "@remixicon/react";
import { ChevronRightSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import { Menu, MenuItem, MenuTrigger } from "../menu/menu";
import { cx } from "../../utils/cx";

/**
 * Figma source: Board UI → dashboard 1 breadcrumb (node 3731:3011).
 *
 * Trail of ancestor pages separated by chevrons.
 *   item      Caption 1/Medium, text/tertiary, gap 6 (icon/avatar ↔ label)
 *   hover     interactive items darken to text/secondary with a soft
 *             background/primary/hover pill
 *   current   aria-current="page", neutral/700, not interactive
 *   separator ChevronRightSmall, text/tertiary, gap 10 between items
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
            "-mx-1 flex h-6 cursor-pointer items-center rounded-md px-1 text-fg-tertiary transition-colors duration-150",
            "data-[hovered]:bg-surface-hover data-[hovered]:text-fg-secondary data-[pressed]:bg-surface-pressed",
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
              <ChevronRightSmall className="size-3 shrink-0 text-fg-tertiary" aria-hidden />
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
    "-mx-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-caption-strong whitespace-nowrap text-fg-tertiary",
    "transition-colors duration-150 ease outline-none",
    "hover:bg-surface-hover hover:text-fg-secondary",
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
