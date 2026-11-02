"use client";

import { useState, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";
import { RiImageLine } from "@remixicon/react";
import { cx } from "../../utils/cx";

/**
 * AspectRatio and Image.
 *
 * `AspectRatio` holds a box to a ratio (16 / 9, 4 / 3, 1) whatever its
 * width, so media doesn't shift the layout while it loads.
 *
 * `Image` is an `<img>` that shows skeleton paper while loading and a quiet
 * fallback (an icon and the alt text) if it fails. Give it `ratio` to wrap it
 * in an AspectRatio, and `caption` to set it as a figure with a numbered,
 * mono caption in the house style ("Fig. 2 — …").
 */

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width divided by height. Default 16 / 9. */
  ratio?: number;
}

export function AspectRatio({ ratio = 16 / 9, className, style, children, ...props }: AspectRatioProps) {
  return (
    <div {...props} className={cx("relative w-full overflow-hidden [&>*]:absolute [&>*]:inset-0 [&>*]:size-full", className)} style={{ ...style, aspectRatio: String(ratio) }}>
      {children}
    </div>
  );
}

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  /** Required. Describe the image, or pass "" when it's purely decorative. */
  alt: string;
  ratio?: number;
  fit?: "cover" | "contain";
  /** Turns the image into a captioned figure. */
  caption?: ReactNode;
  /** Shown before the caption, e.g. "Fig. 2". */
  figureLabel?: string;
  /** Classes for the frame around the image. */
  frameClassName?: string;
  rounded?: boolean;
}

export function Image({ alt, ratio, fit = "cover", caption, figureLabel, frameClassName, rounded = true, className, onLoad, onError, ...props }: ImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  const img = (
    <img
      {...props}
      alt={alt}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("error");
        onError?.(event);
      }}
      className={cx(
        "block size-full transition-opacity duration-(--ds-motion-duration-slow)",
        fit === "cover" ? "object-cover" : "object-contain",
        status === "loaded" ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );

  const frameClass = cx("relative overflow-hidden bg-sunken", rounded && "rounded-surface", frameClassName);
  const overlay =
    status === "loading" ? (
      <span aria-hidden className="absolute inset-0 animate-skeleton" />
    ) : status === "error" ? (
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center text-body-sm text-fg-secondary">
        <RiImageLine aria-hidden className="size-6 text-icon-tertiary" />
        {alt && <span className="line-clamp-2">{alt}</span>}
      </span>
    ) : null;

  const frame =
    ratio !== undefined ? (
      <AspectRatio ratio={ratio} className={frameClass}>
        {img}
        {overlay}
      </AspectRatio>
    ) : (
      <span className={cx("block", frameClass)}>
        {img}
        {overlay}
      </span>
    );

  if (!caption) return frame;
  return (
    <figure className="flex flex-col gap-2">
      {frame}
      <figcaption className="flex gap-2 text-body-sm text-fg-secondary">
        {figureLabel && <span className="shrink-0 font-mono text-caption tracking-wide text-fg uppercase">{figureLabel}</span>}
        <span className="text-pretty">{caption}</span>
      </figcaption>
    </figure>
  );
}
