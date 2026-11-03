"use client";
// The upload flow and validation were first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.

import { useTemplateCopy } from "../../foundations/template-copy";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  RiFileExcel2Line,
  RiFileImageLine,
  RiFileTextLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { cx } from "../../utils/cx";

/**
 * Interactive drag-and-drop file upload with validation, animated content
 * transitions, and a completion callback. The upload is simulated so the
 * component is backend-agnostic; connect `onUploadComplete` to the
 * application's upload/storage layer.
 *
 * Look: a crisp dashed drop zone on the sunken fill whose border inks in on
 * hover and takes the focus colour while a file is dragged over it. While a
 * file uploads the border turns solid and the system's pen rule fills along
 * the bottom edge, with the percentage in mono figures beside the size. The
 * icon sits in a square tile, and "select" is ink with an accent underline.
 */

const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const DEFAULT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "xlsx"] as const;

type UploadPhase = "idle" | "uploading" | "complete";
type StaggerState = "shown" | "hiding" | "hidden";

export interface FileUploadProps {
  /** Called after the progress and success states finish. */
  onUploadComplete?: (file: File) => void;
  /** Accepted filename extensions without dots. */
  allowedExtensions?: readonly string[];
  /** Maximum accepted file size in bytes. */
  maxBytes?: number;
  /** Overrides the icon shown while a file uploads. */
  renderFileIcon?: (file: File) => ReactNode;
  className?: string;
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function extensionFor(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function DefaultFileIcon({ file }: { file: File }) {
  const extension = extensionFor(file.name);
  const Icon = extension === "xlsx"
    ? RiFileExcel2Line
    : ["jpg", "jpeg", "png"].includes(extension)
      ? RiFileImageLine
      : RiFileTextLine;

  return <Icon className="size-6 shrink-0 text-icon-secondary" aria-hidden />;
}

/** Drives the staggered reveal states (.t-stagger in packages/styles/src/utilities.css). */
function useStaggerState(active: boolean): StaggerState {
  const [prevActive, setPrevActive] = useState(active);
  const [hiding, setHiding] = useState(false);

  if (prevActive !== active) {
    setPrevActive(active);
    setHiding(!active);
  }

  useEffect(() => {
    if (!hiding) return;
    const timer = setTimeout(() => setHiding(false), 200);
    return () => clearTimeout(timer);
  }, [hiding]);

  return active ? "shown" : hiding ? "hiding" : "hidden";
}

const staggerContainer = (state: StaggerState) =>
  cx("t-stagger", state === "shown" && "is-shown", state === "hiding" && "is-hiding");

const staggerLine = (state: StaggerState) =>
  cx(
    state === "shown" &&
      "translate-y-0 opacity-100 blur-0 [transition:opacity_var(--stagger-dur)_var(--stagger-ease),translate_var(--stagger-dur)_var(--stagger-ease),filter_var(--stagger-dur)_var(--stagger-ease)]",
    state === "hiding" && "translate-y-0 opacity-0 blur-0 [transition:opacity_200ms_ease]",
    state === "hidden" && "translate-y-3 opacity-0 blur-[3px] transition-none",
  );

export function FileUpload({
  onUploadComplete,
  allowedExtensions = DEFAULT_EXTENSIONS,
  maxBytes = DEFAULT_MAX_BYTES,
  renderFileIcon,
  className,
}: FileUploadProps) {
  const localize = useTemplateCopy();
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const startUpload = (nextFile: File) => {
    const extension = extensionFor(nextFile.name);
    if (!allowedExtensions.map((value) => value.toLowerCase()).includes(extension)) {
      setRejection(`Only ${allowedExtensions.map((value) => value.toUpperCase()).join(", ")} files are supported`);
      timers.current.push(setTimeout(() => setRejection(null), 2600));
      return;
    }
    if (nextFile.size > maxBytes) {
      setRejection(`That file is larger than ${formatFileSize(maxBytes)}`);
      timers.current.push(setTimeout(() => setRejection(null), 2600));
      return;
    }

    setFile(nextFile);
    setProgress(0);
    setPhase("uploading");

    let value = 0;
    const tick = () => {
      value = Math.min(100, value + 2 + Math.random() * 5);
      setProgress(Math.round(value));
      if (value < 100) {
        timers.current.push(setTimeout(tick, 90));
        return;
      }

      setPhase("complete");
      timers.current.push(
        setTimeout(() => {
          onUploadComplete?.(nextFile);
          setPhase("idle");
          setFile(null);
        }, 1600),
      );
    };
    timers.current.push(setTimeout(tick, 250));
  };

  const busy = phase !== "idle";
  const idleReveal = useStaggerState(!busy);
  const busyReveal = useStaggerState(busy);
  const uploadingLine = useStaggerState(phase === "uploading");
  const completeLine = useStaggerState(phase === "complete");
  const allowedLabel = allowedExtensions
    .filter((extension) => extension.toLowerCase() !== "jpeg")
    .map((extension) => extension.toUpperCase())
    .join(", ");

  return localize(
    <div
      role="button"
      tabIndex={busy ? -1 : 0}
      aria-label="Upload a file"
      onClick={() => !busy && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!busy && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile && !busy) startUpload(droppedFile);
      }}
      className={cx(
        "group relative h-41 w-full shrink-0 rounded-surface outline-none",
        "transition-colors duration-300 ease-out",
        busy ? "bg-surface" : "cursor-pointer bg-sunken",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label="Choose a file to upload"
        accept={allowedExtensions.map((extension) => `.${extension}`).join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          event.target.value = "";
          if (selectedFile) startUpload(selectedFile);
        }}
      />

      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-0 rounded-surface border",
          busy
            ? "border-solid border-line"
            : dragOver
              ? "border-dashed border-focus"
              : "border-dashed border-line-control group-hover:border-fg",
          "transition-[border-color] duration-(--ds-motion-duration-moderate) ease-out",
        )}
      />

      {/* Progress: the system's pen rule, filling along the bottom edge. */}
      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-surface",
          "transition-opacity duration-(--ds-motion-duration-moderate) ease-out",
          busy ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full origin-left bg-accent-600 transition-[scale] duration-200 ease-linear motion-reduce:transition-none rtl:origin-right"
          style={{ scale: `${busy ? progress / 100 : 0} 1` }}
        />
      </div>

      <div
        className={cx(
          "absolute inset-0 flex flex-col items-center justify-center gap-3.5",
          staggerContainer(idleReveal),
          busy && "pointer-events-none",
        )}
      >
        <span className="t-stagger-line t-stagger-line--1 flex size-10 items-center justify-center rounded-control-md bg-file-upload-icon p-2.5">
          <RiUploadCloud2Line
            className="size-6 shrink-0 text-file-upload-icon-fg transition-colors duration-150 ease group-hover:text-file-upload-icon-fg-hover"
            aria-hidden
          />
        </span>
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className={cx(
              "t-stagger-line t-stagger-line--2 text-body-md-strong",
              rejection ? "text-fg-danger" : "text-fg-secondary",
            )}
          >
            {rejection ?? (
              <>
                Drag and drop to upload or <span className="text-fg underline decoration-accent-600 underline-offset-2">select</span>
              </>
            )}
          </p>
          <p className="t-stagger-line t-stagger-line--3 text-body-sm text-fg-tertiary">
            {allowedLabel} (max {formatFileSize(maxBytes)})
          </p>
        </div>
      </div>

      <div
        className={cx(
          "absolute inset-0 flex flex-col items-center justify-center",
          staggerContainer(busyReveal),
          !busy && "pointer-events-none",
        )}
      >
        <span className="t-stagger-line t-stagger-line--1 flex size-10 items-center justify-center rounded-control-md border border-line bg-surface p-2">
          {file && (renderFileIcon ? renderFileIcon(file) : <DefaultFileIcon file={file} />)}
        </span>
        <p className="t-stagger-line t-stagger-line--2 mt-3.5 max-w-[90%] truncate text-body-md-strong text-fg">
          {file?.name}
        </p>
        <div className="t-stagger-line t-stagger-line--3 relative mt-1 h-4.5 w-full">
          <p
            className={cx(
              "absolute inset-x-0 text-center text-body-sm text-fg-secondary",
              staggerLine(uploadingLine),
            )}
          >
            Uploading {file ? formatFileSize(file.size) : ""}…{" "}
            <span className="font-mono tabular-nums text-fg">{progress}%</span>
          </p>
          <p
            className={cx(
              "absolute inset-x-0 text-center text-body-sm text-fg-secondary",
              staggerLine(completeLine),
            )}
          >
            Uploaded successfully!
          </p>
        </div>
      </div>
    </div>
  );
}
