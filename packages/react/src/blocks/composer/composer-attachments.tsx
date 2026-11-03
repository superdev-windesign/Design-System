"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  RiAttachment2,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiFilmLine,
  RiImageLine,
  RiSlideshowLine,
  RiTableLine,
} from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { CloseButton } from "../../components/buttons/close-button";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";
import { ComposerPanel, type ComposerPanelProps } from "./composer-panel";

/**
 * Composer Attachments: the files waiting to go out with a prompt, as a row
 * of file chips above the input. Each chip is a crisp paper tile: a kind
 * swatch (or the picture itself, for an image with a `src`), the name, and a
 * status line in mono figures. While a file uploads, the system's pen rule
 * fills along the chip's bottom edge; a queued file says "Waiting". New chips
 * slide in from the start edge and the row closes the gap when one is
 * removed.
 *
 * - `ComposerAttachments`      the row, for any surface
 * - `ComposerAttachmentTile`   one chip on its own
 * - `ComposerWithAttachments`  a ComposerPanel that owns an upload queue:
 *                              files added with progress 0 wait their turn and
 *                              land one after another (simulated, so it stays
 *                              backend-agnostic; tune it with `uploadDuration`
 *                              and `uploadGap`, listen with `onUploadComplete`
 *                              and `onAllUploaded`). For real uploads, feed
 *                              `progress` from your own transfer events into
 *                              `ComposerAttachments` on a plain ComposerPanel.
 */

export type AttachmentKind = "image" | "document" | "code" | "sheet" | "presentation" | "video" | "other";

export interface ComposerAttachment {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  kind?: AttachmentKind;
  /** A thumbnail URL; an image attachment shows it in its tile. */
  src?: string;
  /** 0 while queued, between 0 and 1 while uploading; leave undefined once uploaded. */
  progress?: number;
  /** Shown instead of the size when the upload failed. */
  error?: string;
}

const KIND: Record<AttachmentKind, { icon: IconComponent; tile: string }> = {
  image: { icon: RiImageLine, tile: "bg-tag-purple text-tag-purple-fg" },
  document: { icon: RiFileTextLine, tile: "bg-tag-blue text-tag-blue-fg" },
  code: { icon: RiCodeSSlashLine, tile: "bg-tag-cyan text-tag-cyan-fg" },
  sheet: { icon: RiTableLine, tile: "bg-tag-lime text-tag-lime-fg" },
  presentation: { icon: RiSlideshowLine, tile: "bg-tag-orange text-tag-orange-fg" },
  video: { icon: RiFilmLine, tile: "bg-tag-rose text-tag-rose-fg" },
  other: { icon: RiAttachment2, tile: "bg-muted text-fg-secondary" },
};

/** Guesses the tile kind from a file name. */
export function attachmentKind(name: string): AttachmentKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "heic", "avif"].includes(ext)) return "image";
  if (["csv", "xlsx", "xls", "numbers", "tsv", "ods"].includes(ext)) return "sheet";
  if (["key", "ppt", "pptx", "odp"].includes(ext)) return "presentation";
  if (["mp4", "mov", "webm", "mkv", "avi", "m4v"].includes(ext)) return "video";
  if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "json", "css", "html", "md"].includes(ext)) return "code";
  if (["pdf", "doc", "docx", "txt", "rtf", "pages", "odt"].includes(ext)) return "document";
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

/* ------------------------------------------------------------------- tile */

export interface ComposerAttachmentTileProps {
  attachment: ComposerAttachment;
  onRemove?: () => void;
  className?: string;
}

function statusText(item: ComposerAttachment) {
  if (item.error) return item.error;
  if (item.progress === undefined) return formatBytes(item.size);
  if (item.progress === 0) return "Waiting";
  return `Uploading ${Math.round(item.progress * 100)}%`;
}

/** One file chip. */
export function ComposerAttachmentTile({ attachment: item, onRemove, className }: ComposerAttachmentTileProps) {
  const kind = item.kind ?? attachmentKind(item.name);
  const { icon: Icon, tile } = KIND[kind];
  const uploading = item.progress !== undefined && item.progress > 0 && !item.error;
  return (
    <div className={cx("group relative flex w-52 shrink-0 items-center gap-2.5 overflow-hidden rounded-control-md border border-line bg-surface p-2 pe-8", className)}>
      {kind === "image" && item.src ? (
        <img src={item.src} alt="" className="size-9 shrink-0 rounded-control-sm object-cover" />
      ) : (
        <span aria-hidden className={cx("flex size-9 shrink-0 items-center justify-center rounded-control-sm", tile)}>
          <Icon className="size-4.5" />
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-sm-strong text-fg">{item.name}</span>
        <span className={cx("truncate font-mono text-caption tabular-nums", item.error ? "text-status-danger-text" : "text-fg-secondary")}>
          {statusText(item)}
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
          {/* The pen rule, filling from the start edge. */}
          <span
            className="block h-full origin-left bg-accent-600 transition-[scale] duration-(--ds-motion-duration-moderate) ease-linear motion-reduce:transition-none rtl:origin-right"
            style={{ scale: `${item.progress ?? 0} 1` }}
          />
        </span>
      )}
      {onRemove && (
        <CloseButton
          size="2xs"
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
          className="absolute end-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- row */

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
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : layoutSpring}
            className="shrink-0"
          >
            <ComposerAttachmentTile attachment={item} onRemove={onRemove ? () => onRemove(item.id) : undefined} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/* ------------------------------------------------------------ upload queue */

export interface UploadQueueOptions {
  attachments: ComposerAttachment[];
  onAttachmentsChange: (next: ComposerAttachment[]) => void;
  /** One simulated upload, ms. Default 1100. */
  uploadDuration?: number;
  /** Pause before the next file starts, ms. Default 240. */
  uploadGap?: number;
  onUploadComplete?: (file: ComposerAttachment) => void;
  onAllUploaded?: () => void;
}

/**
 * Lands queued attachments (progress 0) one after another. The list stays
 * yours: every step goes back through `onAttachmentsChange`.
 */
export function useUploadQueue({
  attachments,
  onAttachmentsChange,
  uploadDuration = 1100,
  uploadGap = 240,
  onUploadComplete,
  onAllUploaded,
}: UploadQueueOptions) {
  const latest = useRef({ attachments, onAttachmentsChange, onUploadComplete, onAllUploaded });
  latest.current = { attachments, onAttachmentsChange, onUploadComplete, onAllUploaded };
  const [activeId, setActiveId] = useState<string | null>(null);
  const landedThisRun = useRef(false);

  const nextQueued = attachments.find((item) => item.progress === 0 && !item.error)?.id;
  const activeGone = activeId !== null && !attachments.some((item) => item.id === activeId);

  // The active file was removed mid-upload: free the queue.
  useEffect(() => {
    if (activeGone) setActiveId(null);
  }, [activeGone]);

  // Start the next queued file after a short gap; say when the run is over.
  useEffect(() => {
    if (activeId !== null) return;
    if (!nextQueued) {
      if (landedThisRun.current) {
        landedThisRun.current = false;
        latest.current.onAllUploaded?.();
      }
      return;
    }
    const timer = setTimeout(() => setActiveId(nextQueued), uploadGap);
    return () => clearTimeout(timer);
  }, [activeId, nextQueued, uploadGap]);

  // Advance the active file to done.
  useEffect(() => {
    if (activeId === null) return;
    const started = performance.now();
    const timer = setInterval(() => {
      const { attachments: list, onAttachmentsChange: change, onUploadComplete: done } = latest.current;
      const item = list.find((a) => a.id === activeId);
      if (!item) return;
      const progress = Math.min(1, (performance.now() - started) / uploadDuration);
      if (progress < 1) {
        change(list.map((a) => (a.id === activeId ? { ...a, progress: Math.max(0.01, progress) } : a)));
        return;
      }
      clearInterval(timer);
      const landed = { ...item, progress: undefined };
      change(list.map((a) => (a.id === activeId ? landed : a)));
      landedThisRun.current = true;
      done?.(landed);
      setActiveId(null);
    }, 50);
    return () => clearInterval(timer);
  }, [activeId, uploadDuration]);
}

let attachmentSeq = 0;

/** A queued attachment for a picked file: kind from its name, a thumbnail for images. */
export function attachmentFromFile(file: File): ComposerAttachment {
  attachmentSeq += 1;
  const kind = attachmentKind(file.name);
  return {
    id: `${Date.now()}-${attachmentSeq}-${file.name}`,
    name: file.name,
    size: file.size,
    kind,
    src: kind === "image" && typeof URL !== "undefined" ? URL.createObjectURL(file) : undefined,
    progress: 0,
  };
}

export interface ComposerWithAttachmentsProps
  extends Omit<ComposerPanelProps, "attachments" | "onAttach">,
    Omit<UploadQueueOptions, "attachments" | "onAttachmentsChange"> {
  attachments: ComposerAttachment[];
  /** Every change to the list comes back here: new files, progress, landings and removals. */
  onAttachmentsChange: (next: ComposerAttachment[]) => void;
  /** Called with picked files as well as queueing them. */
  onAttach?: (files: File[]) => void;
}

/** A ComposerPanel that owns an upload queue for its attachments. */
export function ComposerWithAttachments({
  attachments,
  onAttachmentsChange,
  uploadDuration,
  uploadGap,
  onUploadComplete,
  onAllUploaded,
  onAttach,
  ...panelProps
}: ComposerWithAttachmentsProps) {
  useUploadQueue({ attachments, onAttachmentsChange, uploadDuration, uploadGap, onUploadComplete, onAllUploaded });
  return (
    <ComposerPanel
      {...panelProps}
      onAttach={(files) => {
        onAttachmentsChange([...attachments, ...files.map(attachmentFromFile)]);
        onAttach?.(files);
      }}
      attachments={
        attachments.length > 0 ? (
          <ComposerAttachments items={attachments} onRemove={(id) => onAttachmentsChange(attachments.filter((a) => a.id !== id))} />
        ) : undefined
      }
    />
  );
}
