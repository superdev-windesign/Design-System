"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiCodeSSlashLine, RiFileTextLine, RiImageLine, RiTableLine, RiAttachment2 } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { CloseButton } from "../../components/buttons/close-button";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Composer Attachments: the files waiting to go out with a prompt, as a row
 * of tiles above the input. New tiles slide in from the start edge, show
 * upload progress along their bottom, and the row closes the gap when one is
 * removed.
 */

export type AttachmentKind = "image" | "document" | "code" | "sheet" | "other";

export interface ComposerAttachment {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  kind?: AttachmentKind;
  /** 0–1 while uploading; leave undefined once uploaded. */
  progress?: number;
  /** Shown instead of the size when the upload failed. */
  error?: string;
}

const KIND: Record<AttachmentKind, { icon: IconComponent; tile: string }> = {
  image: { icon: RiImageLine, tile: "bg-tag-purple text-tag-purple-fg" },
  document: { icon: RiFileTextLine, tile: "bg-tag-blue text-tag-blue-fg" },
  code: { icon: RiCodeSSlashLine, tile: "bg-tag-cyan text-tag-cyan-fg" },
  sheet: { icon: RiTableLine, tile: "bg-tag-lime text-tag-lime-fg" },
  other: { icon: RiAttachment2, tile: "bg-muted text-fg-secondary" },
};

/** Guesses the tile kind from a file name. */
export function attachmentKind(name: string): AttachmentKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"].includes(ext)) return "image";
  if (["csv", "xlsx", "xls", "numbers", "tsv"].includes(ext)) return "sheet";
  if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "json", "css", "html", "md"].includes(ext)) return "code";
  if (["pdf", "doc", "docx", "txt", "rtf", "pages"].includes(ext)) return "document";
  return "other";
}

const units = ["B", "KB", "MB", "GB"];
export function formatBytes(bytes: number) {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

export interface ComposerAttachmentsProps {
  items: ComposerAttachment[];
  onRemove?: (id: string) => void;
  className?: string;
}

export function ComposerAttachments({ items, onRemove, className }: ComposerAttachmentsProps) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <ul aria-label="Attachments" className={cx("flex gap-2 overflow-x-auto p-1", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => {
          const { icon: Icon, tile } = KIND[item.kind ?? attachmentKind(item.name)];
          const uploading = item.progress !== undefined && !item.error;
          return (
            <motion.li
              key={item.id}
              layout
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={reduceMotion ? { duration: 0 } : layoutSpring}
              className="group relative flex w-52 shrink-0 items-center gap-2.5 overflow-hidden rounded-xl border border-line bg-surface p-2 pe-8 shadow-hairline"
            >
              <span aria-hidden className={cx("flex size-9 shrink-0 items-center justify-center rounded-lg", tile)}>
                <Icon className="size-4.5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body-sm-strong text-fg">{item.name}</span>
                <span className={cx("truncate text-caption tabular-nums", item.error ? "text-status-danger-text" : "text-fg-secondary")}>
                  {item.error ?? (uploading ? `Uploading ${Math.round((item.progress ?? 0) * 100)}%` : formatBytes(item.size))}
                </span>
              </span>
              {uploading && (
                <span
                  role="progressbar"
                  aria-label={`Uploading ${item.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((item.progress ?? 0) * 100)}
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-chart-track"
                >
                  <span
                    className="block h-full bg-accent-500 transition-[width] duration-(--ds-motion-duration-moderate)"
                    style={{ width: `${(item.progress ?? 0) * 100}%` }}
                  />
                </span>
              )}
              {onRemove && (
                <CloseButton
                  size="2xs"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove(item.id)}
                  className="absolute end-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                />
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
