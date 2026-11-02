"use client";

import type { ReactNode } from "react";
import { CopyButton } from "../copy-button/copy-button";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * CodeBlock: a block of code on sunken paper with a header for its file name
 * or language and a copy button. Long lines scroll sideways (or `wrap`),
 * line numbers are optional and never copied, and `highlightLines` picks
 * lines out with a shaded band and a terracotta rule.
 *
 * It sets code in mono without colouring syntax; pass already-highlighted
 * markup as `children` if you use a highlighter.
 */

export interface CodeBlockProps {
  code: string;
  /** Shown in the header when there's no title, e.g. "tsx". */
  language?: string;
  /** A file name or caption, e.g. "button.tsx". */
  title?: ReactNode;
  showLineNumbers?: boolean;
  /** 1-based line numbers to emphasise. */
  highlightLines?: number[];
  /** Wrap long lines instead of scrolling. */
  wrap?: boolean;
  /** Hide the copy button. */
  isCopyable?: boolean;
  /** Pre-rendered (highlighted) content to show instead of plain `code`; `code` is still what gets copied. */
  children?: ReactNode;
  className?: string;
}

export function CodeBlock({ code, language, title, showLineNumbers = false, highlightLines = [], wrap = false, isCopyable = true, children, className }: CodeBlockProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  const heading = title ?? language;
  const highlighted = new Set(highlightLines);

  return (
    <figure className={cx("flex min-w-0 flex-col overflow-hidden rounded-surface border border-line bg-sunken", className)}>
      {(heading || isCopyable) && (
        <figcaption className="flex min-h-10 items-center justify-between gap-3 border-b border-line ps-4 pe-1.5">
          <span className={cx("truncate", title ? "text-body-sm-strong text-fg" : "font-mono text-caption tracking-wide text-fg-secondary uppercase")}>{heading}</span>
          {title && language && <span className="ms-auto font-mono text-caption tracking-wide text-fg-secondary uppercase">{language}</span>}
          {isCopyable && <CopyButton value={code} iconOnly size="xs" label="Copy code" />}
        </figcaption>
      )}
      <pre
        tabIndex={0}
        aria-label={typeof heading === "string" ? `${heading} code` : "Code"}
        className={cx("scrollbar-thin overflow-auto py-3 font-mono text-body-sm text-fg", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre", focusRingNative, "focus-visible:-outline-offset-2")}
      >
        {children ?? (
          <code className="block min-w-max">
            {lines.map((line, i) => (
              <span
                key={i}
                className={cx(
                  "block border-s-2 pe-4",
                  highlighted.has(i + 1) ? "border-accent-600 bg-muted" : "border-transparent",
                  showLineNumbers ? "ps-2" : "ps-4",
                  wrap && "min-w-0",
                )}
              >
                {showLineNumbers && (
                  <span aria-hidden className="inline-block w-8 pe-4 text-end text-fg-tertiary select-none">
                    {i + 1}
                  </span>
                )}
                {line || " "}
              </span>
            ))}
          </code>
        )}
      </pre>
    </figure>
  );
}
