"use client";

import { useEffect, useRef, useState } from "react";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { Button, type ButtonSize, type ButtonVariant } from "../button/button";

/**
 * CopyButton: copies a value to the clipboard and confirms with a tick for
 * two seconds. The outcome ("Copied to clipboard", or the failure) is
 * announced through a polite live region, so it isn't only visual.
 *
 * `value` can be a function, for text that is only known at the moment of
 * copying (the current URL, a generated token).
 */

/** Writes text to the clipboard, falling back to a hidden textarea where the API is unavailable. */
export async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("Copy failed");
}

export interface CopyButtonProps {
  value: string | (() => string);
  /** Default "Copy". Also the accessible name when `iconOnly`. */
  label?: string;
  copiedLabel?: string;
  iconOnly?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  onCopy?: (value: string) => void;
  className?: string;
}

export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", iconOnly = false, size = "sm", variant = "tertiary", onCopy, className }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const text = typeof value === "function" ? value() : value;
    try {
      await copyToClipboard(text);
      setStatus("copied");
      onCopy?.(text);
    } catch {
      setStatus("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const copied = status === "copied";
  const name = copied ? copiedLabel : label;

  return (
    <>
      {iconOnly ? (
        <Button variant={variant} size={size} iconOnly leadingIcon={copied ? RiCheckLine : RiFileCopyLine} aria-label={name} onPress={copy} className={className} />
      ) : (
        <Button variant={variant} size={size} leadingIcon={copied ? RiCheckLine : RiFileCopyLine} onPress={copy} className={className}>
          {name}
        </Button>
      )}
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : status === "failed" ? "Couldn't copy. Select the text and copy it instead." : ""}
      </span>
    </>
  );
}
