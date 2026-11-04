"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * Typography components: the named text styles as elements, so headings and
 * body copy stay on the scale without remembering class names.
 *
 * - `Heading`: levels 1–6 map to display and title sizes (set in Fraunces);
 *   pass `size` to decouple the look from the outline level.
 * - `Text`: body and caption sizes, an optional strong weight and a tone.
 * - `Code`: inline code. Use CodeBlock for blocks.
 * - `Blockquote`: a pull quote with a terracotta rule and a citation.
 * - `Prose`: styles plain HTML (rendered Markdown, CMS content) on the same
 *   scale, with an optional drop cap.
 */

export type HeadingSize = "display-lg" | "display-md" | "display-sm" | "title-lg" | "title-md" | "title-sm";

const HEADING_SIZE: Record<HeadingSize, string> = {
  "display-lg": "text-display-lg",
  "display-md": "text-display-md",
  "display-sm": "text-display-sm",
  "title-lg": "text-title-lg-strong",
  "title-md": "text-title-md-strong",
  "title-sm": "text-title-sm-strong",
};

const LEVEL_SIZE: Record<1 | 2 | 3 | 4 | 5 | 6, HeadingSize> = {
  1: "display-md",
  2: "display-sm",
  3: "title-lg",
  4: "title-md",
  5: "title-sm",
  6: "title-sm",
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The look, when it should differ from the level's default. */
  size?: HeadingSize;
}

export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag {...props} className={cx("text-balance text-fg", HEADING_SIZE[size ?? LEVEL_SIZE[level]], className)} />;
}

export type TextSize = "md" | "sm" | "caption";
export type TextTone = "default" | "secondary" | "danger" | "success" | "warning";

const TEXT_SIZE: Record<TextSize, [string, string]> = {
  md: ["text-body-md", "text-body-md-strong"],
  sm: ["text-body-sm", "text-body-sm-strong"],
  caption: ["text-caption", "text-caption-strong"],
};

const TONE: Record<TextTone, string> = {
  default: "text-fg",
  secondary: "text-fg-secondary",
  danger: "text-fg-danger",
  success: "text-status-success-text",
  warning: "text-status-warning-text",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  size?: TextSize;
  tone?: TextTone;
  strong?: boolean;
  /** Set in JetBrains Mono, for figures and identifiers. */
  mono?: boolean;
  as?: "p" | "span" | "div" | "small" | "strong" | "em" | "label";
}

export function Text({ size = "md", tone = "default", strong = false, mono = false, as: Tag = "p", className, ...props }: TextProps) {
  return <Tag {...props} className={cx(TEXT_SIZE[size][strong ? 1 : 0], TONE[tone], mono && "font-mono", Tag === "p" && "text-pretty", className)} />;
}

export function Code({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <code {...props} className={cx("rounded-xs border border-line bg-sunken px-1 py-px font-code text-body-sm text-fg", className)} />;
}

export interface BlockquoteProps {
  children: ReactNode;
  /** Who said it. */
  cite?: ReactNode;
  /** Where it was said: a URL for the `cite` attribute. */
  source?: string;
  className?: string;
}

export function Blockquote({ children, cite, source, className }: BlockquoteProps) {
  return (
    <figure className={cx("flex flex-col gap-3 border-s-2 border-accent-600 ps-5", className)}>
      <blockquote cite={source} className="text-title-md-strong text-pretty text-fg italic">
        {children}
      </blockquote>
      {cite && <figcaption className="font-mono text-caption tracking-wide text-fg-secondary uppercase">— {cite}</figcaption>}
    </figure>
  );
}

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  /** Sets the first letter of the first paragraph as a terracotta drop cap. */
  dropCap?: boolean;
}

export function Prose({ dropCap = false, className, ...props }: ProseProps) {
  return (
    <div
      {...props}
      className={cx(
        "max-w-prose text-body-md text-pretty text-fg",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-display-sm [&_h2]:text-balance",
        "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-title-md-strong",
        "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-body-md-strong",
        "[&_p]:my-4",
        "[&_a]:underline [&_a]:decoration-accent-600 [&_a]:underline-offset-4 [&_a:hover]:decoration-2",
        "[&_strong]:text-body-md-strong",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6",
        "[&_li]:my-1.5 [&_li]:ps-1 [&_li]:marker:text-fg-tertiary",
        "[&_code]:rounded-xs [&_code]:border [&_code]:border-line [&_code]:bg-sunken [&_code]:px-1 [&_code]:font-code [&_code]:text-body-sm",
        "[&_pre]:my-5 [&_pre]:overflow-auto [&_pre]:rounded-surface [&_pre]:border [&_pre]:border-line [&_pre]:bg-sunken [&_pre]:p-4",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_blockquote]:my-6 [&_blockquote]:border-s-2 [&_blockquote]:border-accent-600 [&_blockquote]:ps-5 [&_blockquote]:text-title-sm-emphasis [&_blockquote]:italic",
        "[&_hr]:my-10 [&_hr]:border-line",
        "[&_figure]:my-6 [&_figcaption]:mt-2 [&_figcaption]:font-mono [&_figcaption]:text-caption [&_figcaption]:text-fg-secondary",
        "[&_a]:rounded-xs [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-focus",
        dropCap &&
          "[&>p:first-of-type]:first-letter:float-start [&>p:first-of-type]:first-letter:me-2 [&>p:first-of-type]:first-letter:text-display-lg [&>p:first-of-type]:first-letter:text-accent-600",
        className,
      )}
    />
  );
}
