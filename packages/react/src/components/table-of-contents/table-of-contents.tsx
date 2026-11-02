"use client";

import { useEffect, useState, type MouseEvent, type RefObject } from "react";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * TableOfContents: the "On this page" outline beside a long page. It marks
 * the section being read as you scroll (`aria-current="location"`), and a
 * click scrolls to the heading and moves focus there, so keyboard and screen
 * reader users land in the right place too.
 *
 * Pass `items`, or point it at a container and it collects the headings
 * (they need ids).
 */

export interface TocItem {
  id: string;
  label: string;
  /** 2 for sections, 3 for subsections. Default 2. */
  level?: 2 | 3;
}

export interface TableOfContentsProps {
  items?: TocItem[];
  /** Collect headings from here when `items` isn't given. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Headings to collect. Default "h2[id], h3[id]". */
  selector?: string;
  /** Default "On this page". */
  title?: string;
  /** Write the heading's id into the URL on click. Default true. */
  updateHash?: boolean;
  className?: string;
}

export function TableOfContents({ items: given, containerRef, selector = "h2[id], h3[id]", title = "On this page", updateHash = true, className }: TableOfContentsProps) {
  const [collected, setCollected] = useState<TocItem[]>([]);
  const items = given ?? collected;
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (given || !containerRef?.current) return;
    const headings = [...containerRef.current.querySelectorAll<HTMLElement>(selector)];
    setCollected(headings.map((h) => ({ id: h.id, label: h.textContent ?? "", level: h.tagName === "H3" ? 3 : 2 })));
  }, [given, containerRef, selector]);

  // The active section is the last heading that has scrolled past the top third.
  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter((h): h is HTMLElement => h !== null);
    if (!headings.length) return;
    const update = () => {
      const line = window.innerHeight * 0.3;
      const passed = headings.filter((h) => h.getBoundingClientRect().top <= line);
      setActive((passed.at(-1) ?? headings[0])!.id);
    };
    update();
    // Capture, so scrolling inside a panel counts as well as the page.
    window.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [items]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (updateHash) history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  if (!items.length) return null;

  return (
    <nav aria-label={title} className={cx("flex flex-col gap-3", className)}>
      <p className="font-mono text-caption tracking-wide text-fg-secondary uppercase">{title}</p>
      <ol className="flex flex-col border-s border-line">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                onClick={(event) => go(event, item.id)}
                className={cx(
                  "-ms-px block rounded-e-xs border-s py-1 text-body-sm transition-colors duration-(--ds-motion-duration-fast)",
                  item.level === 3 ? "ps-6" : "ps-3",
                  current ? "border-accent-600 text-fg" : "border-transparent text-fg-secondary hover:border-line-control hover:text-fg",
                  focusRingNative,
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
