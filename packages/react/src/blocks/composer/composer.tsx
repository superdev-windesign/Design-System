"use client";

import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button as AriaButton } from "react-aria-components";
import {
  RiAddLine,
  RiArrowUpLine,
  RiAttachment2,
  RiCloseLine,
  RiFolder3Line,
  RiGitBranchLine,
  RiImageLine,
  RiMicLine,
  RiStopFill,
} from "@remixicon/react";
import { Button } from "../../components/button/button";
import { Menu, MenuItem, MenuSection, MenuTrigger } from "../../components/menu/menu";
import { ProgressCircle } from "../../components/progress-circle/progress-circle";
import { ToggleButton } from "../../components/toggle-button/toggle-button";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { ComposerLoader } from "../composer-loader/composer-loader";
import { DEFAULT_COMPOSER_MODELS, type ComposerModel } from "./composer-panel";

/**
 * Composer: the one-line chat input, as used under a conversation. Attach
 * files from the + menu, pick a model, dictate, send. The text area grows
 * with the message; Enter sends and Shift+Enter starts a new line.
 *
 * While the agent works (`isWorking`), a light band travels round the rim,
 * send becomes stop, and the status line under the input (branch, project,
 * mode, context used) says so. Attached files sit as removable chips above
 * the text.
 */

export interface ComposerStatus {
  branch?: string;
  project?: string;
  /** e.g. "Ask before edits". */
  mode?: string;
  /** Share of the context window used, 0–1. */
  context?: number;
}

export interface ComposerMessage {
  text: string;
  model: string;
  files: File[];
}

export interface ComposerProps {
  onSubmit?: (message: ComposerMessage) => void;
  isWorking?: boolean;
  onStop?: () => void;
  models?: ComposerModel[];
  defaultModel?: string;
  placeholder?: string;
  /** The line under the input. Omit to hide it. */
  status?: ComposerStatus;
  /** Show the dictation toggle; called with the new listening state. */
  onVoiceChange?: (listening: boolean) => void;
  /** Names the text area. Default "Message". */
  label?: string;
  className?: string;
}

const ICON_BUTTON = cx(
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-secondary",
  "transition-colors duration-(--ds-motion-duration-base) data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-pressed",
  focusRing,
);

export function Composer({
  onSubmit,
  isWorking = false,
  onStop,
  models = DEFAULT_COMPOSER_MODELS,
  defaultModel,
  placeholder = "Ask anything, or @ a file",
  status,
  onVoiceChange,
  label = "Message",
  className,
}: ComposerProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [model, setModel] = useState(defaultModel ?? models[0]?.id ?? "");
  const [listening, setListening] = useState(false);
  const modelLabel = models.find((m) => m.id === model)?.label ?? model;
  const canSend = text.trim().length > 0 || files.length > 0;

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    if (isWorking || !canSend) return;
    onSubmit?.({ text: text.trim(), model, files });
    setText("");
    setFiles([]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form onSubmit={send} className={cx("flex w-full flex-col gap-2", className)}>
      <ComposerLoader active={isWorking} radius={10} className="w-full">
        <div className="flex flex-col gap-1.5 rounded-panel border border-line-control p-1.5 shadow-raised">
          {files.length > 0 && (
            <ul aria-label="Attached files" className="flex flex-wrap gap-1.5 px-1.5 pt-1">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="inline-flex h-7 max-w-56 items-center gap-1.5 rounded-chip border border-line bg-sunken ps-2 pe-0.5 text-caption-strong text-fg">
                  <RiAttachment2 aria-hidden className="size-3.5 shrink-0 text-icon-secondary" />
                  <span className="truncate">{file.name}</span>
                  <AriaButton
                    aria-label={`Remove ${file.name}`}
                    onPress={() => setFiles((list) => list.filter((_, j) => j !== i))}
                    className={cx("flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-secondary data-[hovered]:bg-muted data-[hovered]:text-fg", focusRing)}
                  >
                    <RiCloseLine aria-hidden className="size-3.5" />
                  </AriaButton>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-1">
            <MenuTrigger>
              <AriaButton aria-label="Add" className={ICON_BUTTON}>
                <RiAddLine aria-hidden className="size-5" />
              </AriaButton>
              <Menu
                placement="top start"
                onAction={(key) => {
                  if (key === "files" || key === "image") fileRef.current?.click();
                }}
              >
                <MenuItem id="files" icon={RiAttachment2} description="PDF, code, text">
                  Upload files
                </MenuItem>
                <MenuItem id="image" icon={RiImageLine}>
                  Add an image
                </MenuItem>
                <MenuItem id="project" icon={RiFolder3Line}>
                  From this project
                </MenuItem>
              </Menu>
            </MenuTrigger>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                const picked = [...(event.target.files ?? [])];
                setFiles((list) => [...list, ...picked]);
                event.target.value = "";
              }}
            />
            <label htmlFor={`${id}-text`} className="sr-only">
              {label}
            </label>
            <textarea
              id={`${id}-text`}
              rows={1}
              value={text}
              placeholder={placeholder}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onKeyDown}
              className="field-sizing-content max-h-40 min-h-9 min-w-0 flex-1 resize-none self-center bg-transparent px-1.5 py-2 text-body-md text-fg outline-none placeholder:text-fg-tertiary"
            />
            <MenuTrigger>
              <AriaButton
                aria-label={`Model: ${modelLabel}`}
                className={cx(
                  "flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 text-body-sm-strong text-fg-secondary",
                  "transition-colors duration-(--ds-motion-duration-base) data-[hovered]:bg-surface-hover data-[hovered]:text-fg",
                  focusRing,
                )}
              >
                <span className="max-w-28 truncate">{modelLabel}</span>
                <ChevronDownSmall aria-hidden className="size-4" />
              </AriaButton>
              <Menu placement="top end">
                <MenuSection title="Model" selectionMode="single" selectedKeys={[model]} onSelectionChange={(keys) => setModel(String([...keys][0] ?? model))}>
                  {models.map((m) => (
                    <MenuItem key={m.id} id={m.id}>
                      {m.label}
                    </MenuItem>
                  ))}
                </MenuSection>
              </Menu>
            </MenuTrigger>
            {onVoiceChange && (
              <ToggleButton
                aria-label={listening ? "Stop dictation" : "Dictate"}
                icon={RiMicLine}
                isSelected={listening}
                onChange={(next) => {
                  setListening(next);
                  onVoiceChange(next);
                }}
                className="size-9 rounded-full px-0 data-[selected]:bg-accent-600 data-[selected]:text-on-action data-[selected]:ring-0"
              />
            )}
            {isWorking ? (
              <Button type="button" iconOnly leadingIcon={RiStopFill} aria-label="Stop" variant="secondary" onPress={onStop} className="size-9 rounded-full p-0" />
            ) : (
              <Button type="submit" iconOnly leadingIcon={RiArrowUpLine} aria-label="Send" isDisabled={!canSend} className="size-9 rounded-full p-0" />
            )}
          </div>
        </div>
      </ComposerLoader>
      {status && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 font-mono text-caption text-fg-secondary">
          {status.branch && (
            <span className="inline-flex items-center gap-1">
              <RiGitBranchLine aria-hidden className="size-3.5" />
              <span className="sr-only">Branch</span>
              {status.branch}
            </span>
          )}
          {status.project && (
            <span className="inline-flex items-center gap-1">
              <RiFolder3Line aria-hidden className="size-3.5" />
              <span className="sr-only">Project</span>
              {status.project}
            </span>
          )}
          {status.mode && <span className="rounded-chip border border-line px-1.5">{status.mode}</span>}
          <span aria-live="polite" className={cx(isWorking ? "text-accent-600" : "sr-only")}>
            {isWorking ? "Working…" : ""}
          </span>
          {status.context !== undefined && (
            <span className="ms-auto inline-flex items-center gap-1.5">
              <ProgressCircle aria-label="Context used" size="sm" value={Math.round(status.context * 100)} tone={status.context > 0.85 ? "accent" : "neutral"} />
              {Math.round(status.context * 100)}% context
            </span>
          )}
        </div>
      )}
    </form>
  );
}
