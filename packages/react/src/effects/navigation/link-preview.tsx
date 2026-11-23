"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { HoverCard } from "../../components/hover-card/hover-card";
import { Link } from "../../components/link/link";

/**
 * LinkPreview: an inline link that, on hover or keyboard focus, springs open a
 * small card showing where it goes: a picture, the page's title and its
 * address. Built on HoverCard, so it stays open while the pointer moves onto
 * it and closes on Escape. The link itself is the real way there; the preview
 * is a courtesy that touch and screen readers can do without.
 */

export interface LinkPreviewProps {
  href: string;
  children: ReactNode;
  title: string;
  description?: string;
  /** The picture: an image, or any art. */
  media?: ReactNode;
  isExternal?: boolean;
}

export function LinkPreview({ href, children, title, description, media, isExternal }: LinkPreviewProps) {
  const host = (() => {
    try {
      return new URL(href, "https://example.invalid").host.replace(/^www\./, "");
    } catch {
      return href;
    }
  })();
  return (
    <HoverCard
      delay={250}
      showArrow={false}
      placement="top"
      trigger={
        <Link href={href} isExternal={isExternal} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
          {children}
        </Link>
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="flex w-64 flex-col gap-2"
      >
        {media && <div className="h-32 overflow-hidden rounded-control-md">{media}</div>}
        <div className="flex flex-col gap-0.5">
          <span className="text-body-md-strong text-fg">{title}</span>
          {description && <span className="line-clamp-2 text-body-sm text-fg-secondary">{description}</span>}
          {host !== "example.invalid" && <span className="font-mono text-caption text-fg-secondary">{host}</span>}
        </div>
      </motion.div>
    </HoverCard>
  );
}
