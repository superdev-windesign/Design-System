"use client";

import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { TextArea, TextField } from "react-aria-components";
import { RiArrowUpLine, RiAttachment2, RiStopFill } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { IconButton } from "../../components/buttons/icon-button";
import { Select, SelectItem } from "../../components/select/select";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Composer Panel: a two-row chat input. The top row is the message, growing
 * with its content; the bottom row holds attach, the permission mode the
 * agent works under, the model, and send. Enter sends, Shift+Enter adds a
 * line; while a reply is streaming, send turns into stop.
 */

export interface ComposerMode {
  id: string;
  label: string;
  icon?: IconComponent;
}

export interface ComposerModel {
  id: string;
  label: string;
}

export const DEFAULT_COMPOSER_MODES: ComposerMode[] = [
  { id: "ask", label: "Ask before changes" },
  { id: "auto", label: "Make changes" },
  { id: "plan", label: "Plan only" },
];

export const DEFAULT_COMPOSER_MODELS: ComposerModel[] = [
  { id: "balanced", label: "Balanced" },
  { id: "fast", label: "Fast" },
  { id: "deep", label: "Deep reasoning" },
];

export interface ComposerSubmit {
  text: string;
  mode: string;
  model: string;
}

export interface ComposerPanelProps {
  onSubmit?: (message: ComposerSubmit) => void;
  /** A reply is streaming: send becomes stop. */
  isBusy?: boolean;
  onStop?: () => void;
  /** Files picked with the attach button. Omit to hide the button. */
  onAttach?: (files: File[]) => void;
  /** Rendered above the message, e.g. `<ComposerAttachments>`. */
  attachments?: ReactNode;
  modes?: ComposerMode[];
  defaultMode?: string;
  models?: ComposerModel[];
  defaultModel?: string;
  placeholder?: string;
  className?: string;
}

export function ComposerPanel({
  onSubmit,
  isBusy = false,
  onStop,
  onAttach,
  attachments,
  modes = DEFAULT_COMPOSER_MODES,
  defaultMode,
  models = DEFAULT_COMPOSER_MODELS,
  defaultModel,
  placeholder = "Ask anything, or describe a change…",
  className,
}: ComposerPanelProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState(defaultMode ?? modes[0]?.id ?? "");
  const [model, setModel] = useState(defaultModel ?? models[0]?.id ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const canSend = text.trim().length > 0 && !isBusy;

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    onSubmit?.({ text: text.trim(), mode, model });
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className={cx(
        "flex w-full flex-col gap-1 rounded-3xl border border-line bg-surface p-2 shadow-raised transition-[border-color]",
        // The message field draws no outline of its own; the panel carries the focus ring.
        "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-focus",
        className,
      )}
    >
      {attachments}
      <TextField aria-label="Message" value={text} onChange={setText} className="flex">
        <TextArea
          rows={1}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          className="field-sizing-content max-h-48 min-h-12 w-full resize-none bg-transparent px-2.5 py-2 text-body-md text-fg caret-accent-500 outline-none placeholder:text-fg-placeholder"
        />
      </TextField>

      <div className="flex items-center gap-1.5">
        {onAttach && (
          <>
            <IconButton icon={RiAttachment2} size="small" aria-label="Attach files" onClick={() => fileInput.current?.click()} />
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                if (files.length) onAttach(files);
                event.currentTarget.value = "";
              }}
            />
          </>
        )}
        <Select aria-label="Permission mode" size="sm" selectedKey={mode} onSelectionChange={(key) => key !== null && setMode(String(key))}>
          {modes.map((m) => (
            <SelectItem key={m.id} id={m.id} textValue={m.label}>
              {m.label}
            </SelectItem>
          ))}
        </Select>
        <div className="ms-auto flex items-center gap-1.5">
          <Select aria-label="Model" size="sm" selectedKey={model} onSelectionChange={(key) => key !== null && setModel(String(key))}>
            {models.map((m) => (
              <SelectItem key={m.id} id={m.id} textValue={m.label}>
                {m.label}
              </SelectItem>
            ))}
          </Select>
          {isBusy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop"
              className={cx("flex size-8 items-center justify-center rounded-full bg-strong text-fg transition-colors hover:bg-strong-hover", focusRingNative)}
            >
              <RiStopFill aria-hidden className="size-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!canSend}
              className={cx("bg-action-primary flex size-8 items-center justify-center rounded-full text-on-action transition-opacity disabled:opacity-40", focusRingNative)}
            >
              <RiArrowUpLine aria-hidden className="size-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
