"use client";

import { useEffect, useRef, useState } from "react";
import { VisuallyHidden } from "../../components/visually-hidden/visually-hidden";
import { cx } from "../../utils/cx";
import { useCalmMotion, useOnScreen } from "../shared";

/**
 * Terminal: a terminal window that plays a session: commands type themselves
 * out at a human pace with a blinking caret, and their output appears after a
 * beat. Good for install steps and CLI demos on a landing page.
 *
 * The whole transcript is available to screen readers at once; the playback is
 * hidden from them. It starts when scrolled into view, and with reduced motion
 * it shows the finished session.
 */

export interface TerminalLine {
  kind: "command" | "output";
  text: string;
}

export interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  /** Milliseconds per typed character. */
  typingSpeed?: number;
  /** Play again after a pause once finished. */
  loop?: boolean;
  className?: string;
}

export function Terminal({ lines, title = "Terminal", typingSpeed = 38, loop = false, className }: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, "0px");
  const calm = useCalmMotion();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const started = useRef(false);
  if (onScreen) started.current = true;
  const finished = calm || line >= lines.length;

  useEffect(() => {
    if (!started.current || calm) return;
    if (line >= lines.length) {
      if (!loop) return;
      const t = setTimeout(() => {
        setLine(0);
        setChars(0);
      }, 2400);
      return () => clearTimeout(t);
    }
    const current = lines[line]!;
    if (current.kind === "output") {
      const t = setTimeout(() => setLine((l) => l + 1), 260);
      return () => clearTimeout(t);
    }
    if (chars < current.text.length) {
      const t = setTimeout(() => setChars((c) => c + 1), typingSpeed * (0.6 + Math.random() * 0.8));
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLine((l) => l + 1);
      setChars(0);
    }, 420);
    return () => clearTimeout(t);
  }, [line, chars, lines, typingSpeed, loop, calm, onScreen]);

  const shown = finished ? lines : lines.slice(0, line + 1);

  return (
    <div ref={ref} className={cx("flex w-full max-w-lg flex-col overflow-hidden rounded-surface border border-line bg-sunken shadow-raised", className)}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-3 rounded-full bg-status-danger-solid" />
          <span className="size-3 rounded-full bg-status-warning-solid" />
          <span className="size-3 rounded-full bg-status-success-solid" />
        </span>
        <span className="mx-auto pe-12 text-caption text-fg-secondary">{title}</span>
      </div>
      <VisuallyHidden>
        <pre>{lines.map((l) => (l.kind === "command" ? `$ ${l.text}` : l.text)).join("\n")}</pre>
      </VisuallyHidden>
      <pre aria-hidden className="min-h-48 overflow-x-auto p-4 font-code text-body-sm whitespace-pre-wrap text-fg">
        {shown.map((l, i) => {
          const typing = !finished && i === line && l.kind === "command";
          const text = typing ? l.text.slice(0, chars) : l.text;
          return (
            <div key={i} className={l.kind === "output" ? "text-fg-secondary" : undefined}>
              {l.kind === "command" && <span className="text-accent-600">$ </span>}
              {text}
              {typing && <span className="animate-caret ms-px inline-block h-4 w-2 translate-y-0.5 bg-fg" />}
            </div>
          );
        })}
        {finished && <span className="animate-caret inline-block h-4 w-2 translate-y-0.5 bg-fg" />}
      </pre>
    </div>
  );
}
