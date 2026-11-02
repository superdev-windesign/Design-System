"use client";

import { Children, createContext, useContext, type ReactNode } from "react";
import { Button, Disclosure as AriaDisclosure, DisclosureGroup, DisclosurePanel, Heading } from "react-aria-components";
import type { DisclosureGroupProps, DisclosureProps as AriaDisclosureProps } from "react-aria-components";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Accordion: ruled sections that open and close under their headings (an
 * FAQ, settings groups, a long specification). One section at a time by
 * default; `allowsMultipleExpanded` lets several stay open. `numbered` sets a
 * mono figure before each heading, like the sections of a printed document.
 *
 * `Disclosure` is a single section on its own ("Show details"). Both find
 * collapsed text with the browser's find-in-page and open to show it.
 */

const NumberedContext = createContext(false);
const IndexContext = createContext<number | null>(null);

export interface AccordionProps extends Omit<DisclosureGroupProps, "className" | "children"> {
  numbered?: boolean;
  className?: string;
  children: ReactNode;
}

export function Accordion({ numbered = false, className, children, ...props }: AccordionProps) {
  const items = Children.toArray(children);
  return (
    <NumberedContext.Provider value={numbered}>
      <DisclosureGroup {...props} className={cx("flex flex-col border-t border-line", className)}>
        {items.map((child, i) => (
          <IndexContext.Provider key={i} value={i}>
            {child}
          </IndexContext.Provider>
        ))}
      </DisclosureGroup>
    </NumberedContext.Provider>
  );
}

export interface DisclosureProps extends Omit<AriaDisclosureProps, "className" | "children"> {
  title: ReactNode;
  children: ReactNode;
  /** Heading level of the trigger. Default 3. */
  level?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Disclosure({ title, children, level = 3, className, ...props }: DisclosureProps) {
  const numbered = useContext(NumberedContext);
  const index = useContext(IndexContext);
  return (
    <AriaDisclosure {...props} className={cx("group border-b border-line", className)}>
      <Heading level={level} className="m-0">
        <Button
          slot="trigger"
          className={cx(
            "flex w-full cursor-pointer items-baseline gap-3 rounded-xs py-4 text-start text-body-md-strong text-fg",
            "decoration-line-control underline-offset-4 data-[hovered]:underline",
            focusRing,
            "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled",
          )}
        >
          {numbered && index !== null && <span className="font-mono text-caption tabular-nums text-fg-secondary">{String(index + 1).padStart(2, "0")}</span>}
          <span className="flex-1">{title}</span>
          {/* A plus that turns into a minus. */}
          <span aria-hidden className="relative size-3.5 shrink-0 self-center text-fg-secondary">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
            <span className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-(--ds-motion-duration-moderate) group-data-[expanded]:scale-y-0 rtl:translate-x-1/2" />
          </span>
        </Button>
      </Heading>
      <DisclosurePanel
        className={cx(
          "h-(--disclosure-panel-height) overflow-clip transition-[height] duration-(--ds-motion-duration-moderate) ease-out motion-reduce:transition-none",
        )}
      >
        <div className={cx("pb-5 text-body-md text-pretty text-fg-secondary", numbered && "ps-8")}>{children}</div>
      </DisclosurePanel>
    </AriaDisclosure>
  );
}

/** Alias that reads better inside an Accordion. */
export const AccordionItem = Disclosure;
