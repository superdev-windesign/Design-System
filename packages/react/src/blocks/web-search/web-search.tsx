"use client";

import { useId, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiArrowRightSLine, RiGlobalLine, RiSearchLine } from "@remixicon/react";
import { easing } from "../../motion/tokens";
import { focusRing, focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Web Search: the research trail behind an agent's answer. A collapsible
 * header says what it did ("Searched the web · 3 searches · 9 sources");
 * inside, each search is listed with the pages it opened, which arrive one
 * after another. While searching, the header shimmers.
 *
 * Sources show a letter mark rather than a fetched favicon, so rendering the
 * trail never calls out to the sites themselves.
 */

export interface ResearchSource {
  title: string;
  url: string;
}

export interface ResearchStep {
  query: string;
  sources: ResearchSource[];
}

export interface WebSearchProps {
  steps: ResearchStep[];
  /** `searching` shimmers the header and shows a reading row under the last search. */
  status?: "searching" | "done";
  defaultExpanded?: boolean;
  className?: string;
}

const MARKS = ["bg-tag-blue text-tag-blue-fg", "bg-tag-lime text-tag-lime-fg", "bg-tag-purple text-tag-purple-fg", "bg-tag-orange text-tag-orange-fg", "bg-tag-cyan text-tag-cyan-fg", "bg-tag-rose text-tag-rose-fg"];

const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const markClass = (domain: string) => MARKS[[...domain].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % MARKS.length];

export function WebSearch({ steps, status = "done", defaultExpanded = true, className }: WebSearchProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const searching = status === "searching";
  const sourceCount = steps.reduce((s, step) => s + step.sources.length, 0);

  return (
    <section className={cx("flex w-full flex-col rounded-2xl border border-line bg-surface", className)}>
      <AriaButton
        aria-expanded={expanded}
        aria-controls={panelId}
        onPress={() => setExpanded((e) => !e)}
        className={cx("flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3.5 py-3 text-start", focusRing)}
      >
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-icon-secondary">
          <RiGlobalLine className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={cx("text-body-md-strong", searching ? "text-shimmer" : "text-fg")}>{searching ? "Searching the web…" : "Searched the web"}</span>
          <span className="text-body-sm text-fg-secondary tabular-nums">
            {steps.length} {steps.length === 1 ? "search" : "searches"} · {sourceCount} {sourceCount === 1 ? "source" : "sources"}
          </span>
        </span>
        <RiArrowRightSLine aria-hidden className={cx("size-5 shrink-0 text-icon-secondary transition-transform duration-(--ds-motion-duration-moderate) rtl:-scale-x-100", expanded && "rotate-90 rtl:-rotate-90")} />
      </AriaButton>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easing.standard }}
            className="overflow-hidden"
          >
            <ol className="flex flex-col gap-4 border-t border-line px-3.5 pt-3 pb-3.5">
              {steps.map((step, s) => (
                <li key={`${s}-${step.query}`} className="flex flex-col gap-2">
                  <p className="flex items-center gap-2 text-body-sm-strong text-fg">
                    <RiSearchLine aria-hidden className="size-4 shrink-0 text-icon-secondary" />
                    <span className="truncate">“{step.query}”</span>
                  </p>
                  <ul className="flex flex-wrap gap-1.5 ps-6">
                    <AnimatePresence initial={false}>
                      {step.sources.map((source, i) => {
                        const domain = domainOf(source.url);
                        return (
                          <motion.li
                            key={source.url}
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, filter: "blur(2px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.3, delay: reduceMotion ? 0 : i * 0.06, ease: easing.enter }}
                          >
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={source.title}
                              aria-label={`${source.title} (${domain})`}
                              className={cx(
                                "flex max-w-64 items-center gap-1.5 rounded-full border border-line bg-sunken py-1 ps-1 pe-2.5 transition-colors hover:bg-sunken-hover",
                                focusRingNative,
                              )}
                            >
                              <span aria-hidden className={cx("flex size-4.5 shrink-0 items-center justify-center rounded-full text-micro-emphasis uppercase", markClass(domain))}>
                                {domain[0]}
                              </span>
                              <span className="truncate text-caption-strong text-fg">{domain}</span>
                            </a>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                    {searching && s === steps.length - 1 && (
                      <li className="flex items-center gap-1.5 rounded-full border border-dashed border-line px-2.5 py-1 text-caption text-fg-secondary">
                        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent-500 motion-reduce:animate-none" />
                        Reading…
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
