"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { CloseButton } from "../../components/buttons/close-button";
import { focusRing, focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Code Panel: files side by side in tabs, with line numbers, light syntax
 * tinting, copy, and an optional close button. Tinting is a few regular
 * expressions (comments, strings, keywords, numbers), enough to scan code,
 * not a parser.
 */

export interface CodeFile {
  name: string;
  language?: string;
  code: string;
}

const KEYWORDS =
  /^(import|from|export|default|const|let|var|function|return|if|else|for|while|await|async|new|class|extends|type|interface|true|false|null|undefined|def|self|in|of)$/;
const TOKEN = /(\/\/.*$|#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;

function tint(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    const token = m[0];
    if (m.index! > last) out.push(line.slice(last, m.index));
    const cls = /^(\/\/|#)/.test(token)
      ? "text-fg-secondary italic"
      : /^["'`]/.test(token)
        ? "text-tag-lime-fg"
        : /^\d/.test(token)
          ? "text-tag-orange-fg"
          : KEYWORDS.test(token)
            ? "text-tag-purple-fg"
            : /^[A-Z]/.test(token)
              ? "text-tag-blue-fg"
              : null;
    out.push(cls ? <span key={m.index} className={cls}>{token}</span> : token);
    last = m.index! + token.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function Copy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy file"}
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className={cx("flex size-7 items-center justify-center rounded-lg text-icon-secondary transition-colors hover:bg-surface-hover hover:text-fg", focusRingNative)}
    >
      {copied ? <RiCheckLine aria-hidden className="size-4" /> : <RiFileCopyLine aria-hidden className="size-4" />}
    </button>
  );
}

export interface CodePanelProps {
  files: CodeFile[];
  selectedFile?: string;
  onSelectedFileChange?: (name: string) => void;
  onClose?: () => void;
  className?: string;
}

export function CodePanel({ files, selectedFile, onSelectedFileChange, onClose, className }: CodePanelProps) {
  const [internal, setInternal] = useState(files[0]?.name ?? "");
  const selected = selectedFile ?? internal;
  const current = files.find((f) => f.name === selected) ?? files[0];

  return (
    <Tabs
      selectedKey={current?.name}
      onSelectionChange={(key) => {
        setInternal(String(key));
        onSelectedFileChange?.(String(key));
      }}
      className={cx("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface", className)}
    >
      <div className="flex items-center gap-1 border-b border-line py-1 ps-1 pe-2">
        <TabList aria-label="Files" className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
          {files.map((file) => (
            <Tab
              key={file.name}
              id={file.name}
              className={cx(
                "cursor-pointer rounded-lg px-2.5 py-1.5 font-mono text-caption whitespace-nowrap text-fg-secondary transition-colors",
                "data-[hovered]:bg-surface-hover data-[selected]:bg-muted data-[selected]:text-fg",
                focusRing,
              )}
            >
              {file.name}
            </Tab>
          ))}
        </TabList>
        {current && <Copy text={current.code} />}
        {onClose && <CloseButton size="xs" aria-label="Close panel" onClick={onClose} />}
      </div>
      {files.map((file) => (
        <TabPanel key={file.name} id={file.name} className={cx("min-h-0 flex-1 overflow-auto", focusRing)}>
          <pre className="py-3 font-mono text-body-sm leading-6 text-fg">
            <code className="grid grid-cols-[auto_1fr]">
              {file.code.split("\n").map((line, i) => (
                <span key={i} className="contents">
                  <span aria-hidden className="ps-3 pe-4 text-end text-fg-secondary tabular-nums select-none">
                    {i + 1}
                  </span>
                  <span className="pe-4 whitespace-pre">{tint(line)}</span>
                </span>
              ))}
            </code>
          </pre>
        </TabPanel>
      ))}
    </Tabs>
  );
}
