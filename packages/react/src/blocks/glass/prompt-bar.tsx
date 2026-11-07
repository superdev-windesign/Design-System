"use client";

import { useState, type FormEvent } from "react";
import { Button as AriaButton, Input, TextField } from "react-aria-components";
import { RiAddLine, RiArrowUpLine, RiMicLine, RiStopFill } from "@remixicon/react";
import { FIELD_INPUT } from "../../recipes/field";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Prompt bar: one floating capsule for asking something, by typing or by voice.
 * While it listens, the mic becomes a stop button and live level bars take the
 * field's place. Once there's text, the end of the bar becomes a send button.
 *
 * It's a form, so Enter submits. Listening is announced through the button's
 * label, since the bars are only a picture.
 */

export interface PromptBarProps {
  placeholder?: string;
  "aria-label"?: string;
  onSubmit?: (text: string) => void;
  onAttach?: () => void;
  /** Called as listening starts and stops. Leave it out to hide the mic. */
  onVoice?: (listening: boolean) => void;
  defaultListening?: boolean;
  className?: string;
}

const ROUND = cx("flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg transition-[background-color,scale] data-[hovered]:bg-glass-lens data-[pressed]:scale-90 motion-reduce:transition-none", focusRing);
const LEVELS = [0.5, 0.9, 0.65, 1, 0.75, 0.45, 0.85];

export function PromptBar({ placeholder = "Ask anything", "aria-label": ariaLabel = "Ask", onSubmit, onAttach, onVoice, defaultListening = false, className }: PromptBarProps) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(defaultListening);
  const message = text.trim();

  const listen = (next: boolean) => {
    setListening(next);
    onVoice?.(next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!message) return;
    onSubmit?.(message);
    setText("");
  };

  return (
    <form onSubmit={submit} className={cx("glass-thick flex h-14 w-full max-w-lg items-center gap-1 rounded-full px-2 text-fg", className)}>
      {onAttach && (
        <AriaButton aria-label="Attach" onPress={onAttach} className={ROUND}>
          <RiAddLine aria-hidden className="size-5" />
        </AriaButton>
      )}
      {listening ? (
        <div aria-hidden className="flex h-6 min-w-0 flex-1 items-center justify-center gap-1">
          {Array.from({ length: 21 }, (_, index) => (
            <span
              key={index}
              className="animate-level h-full w-0.5 rounded-full bg-accent-600"
              style={{ animationDelay: `${-index * 90}ms`, opacity: LEVELS[index % LEVELS.length] }}
            />
          ))}
        </div>
      ) : (
        <TextField aria-label={ariaLabel} value={text} onChange={setText} className="flex min-w-0 flex-1 px-2">
          <Input placeholder={placeholder} className={cx(FIELD_INPUT, "h-10 placeholder:text-fg-secondary")} />
        </TextField>
      )}
      {onVoice && !message && (
        <AriaButton aria-label={listening ? "Stop listening" : "Speak"} aria-pressed={listening} onPress={() => listen(!listening)} className={ROUND}>
          {listening ? <RiStopFill aria-hidden className="size-5" /> : <RiMicLine aria-hidden className="size-5" />}
        </AriaButton>
      )}
      {message && (
        <AriaButton type="submit" aria-label="Send" className={cx(ROUND, "bg-accent-600 text-on-action data-[hovered]:bg-accent-700")}>
          <RiArrowUpLine aria-hidden className="size-5" />
        </AriaButton>
      )}
    </form>
  );
}
