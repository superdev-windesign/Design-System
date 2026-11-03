"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Label, Radio, RadioGroup } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { RiPlayFill, RiSparkling2Line, RiStopFill } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { CloseButton } from "../../components/buttons/close-button";
import { Input } from "../../components/input/input";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { Select, SelectItem } from "../../components/select/select";
import { Slider } from "../../components/slider/slider";
import { Switch } from "../../components/switch/switch";
import { Textarea } from "../../components/textarea/textarea";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Agent Creator: give an agent an identity: a name and a role, a job, a look
 * (colour, shape and expression), a tone, a language and a voice, with a live
 * preview.
 *
 * The avatar is a paper cutout: a flat shape in the chosen colour with a
 * darker paper layer offset behind it and a face cut in the paper colour. It
 * breathes and blinks, and talks while the voice preview plays. "Preview
 * voice" speaks through the browser (speechSynthesis) at the chosen speed,
 * with the voice style setting the pitch; where the browser can't speak, the
 * avatar mimes it.
 *
 * Use it uncontrolled (`defaultValue` + `onCreate`) or controlled (`agent` +
 * `onChange`, saving wherever you keep agents; the block writes nowhere
 * itself). `layout="sidebar"` stacks the preview above the fields for a
 * fixed-height side panel, drawer or dialog; pass `onClose` to show a close
 * button.
 */

export type AgentTone = "friendly" | "neutral" | "concise";
export type AgentShape = "circle" | "tile" | "arch" | "shield" | "drop" | "hexagon";
export type AgentExpression = "calm" | "happy" | "focused" | "curious" | "surprised";

export interface AgentConfig {
  name: string;
  /** A short role, e.g. "Cloud engineer". */
  label?: string;
  description: string;
  /** Chart palette index, 1–9. */
  color: number;
  shape?: AgentShape;
  expression?: AgentExpression;
  tone: AgentTone;
  /** A BCP 47 tag such as "en", or "auto" to follow the conversation. */
  language?: string;
  /** Show a notice when a reply is ready. */
  notifications?: boolean;
  /** Voice style: "bright", "calm", "warm", or "none" for no voice. */
  voice: string;
  speed: number;
}

const COLORS = [6, 5, 3, 1, 7, 8] as const;
// Named for what the chart tokens actually are, so the swatches announce their real colour.
const COLOR_NAMES: Record<number, string> = { 1: "Teal", 3: "Yellow", 5: "Purple", 6: "Emerald", 7: "Rose", 8: "Lime" };
const VOICES = [
  { id: "bright", label: "Bright", pitch: 1.3 },
  { id: "calm", label: "Calm", pitch: 0.9 },
  { id: "warm", label: "Warm", pitch: 1 },
  { id: "none", label: "No voice", pitch: 1 },
];
const LANGUAGES = [
  { id: "auto", label: "Auto-detect" },
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "pt", label: "Portuguese" },
  { id: "hi", label: "Hindi" },
  { id: "ja", label: "Japanese" },
  { id: "ar", label: "Arabic" },
];
const TONE_LABEL: Record<AgentTone, string> = { friendly: "Friendly", neutral: "Neutral", concise: "Concise" };
const SHAPE_LABEL: Record<AgentShape, string> = { circle: "Circle", tile: "Tile", arch: "Arch", shield: "Shield", drop: "Drop", hexagon: "Hexagon" };
const EXPRESSION_LABEL: Record<AgentExpression, string> = { calm: "Calm", happy: "Happy", focused: "Focused", curious: "Curious", surprised: "Surprised" };

/* ----------------------------------------------------------------- avatar */

/** Each shape in a 100-unit box, leaving room for the paper layer behind it. */
const SHAPE_PATHS: Record<AgentShape, string> = {
  circle: "M48 2a46 46 0 1 1 0 92a46 46 0 1 1 0-92Z",
  tile: "M24 2h48a22 22 0 0 1 22 22v48a22 22 0 0 1-22 22H24A22 22 0 0 1 2 72V24A22 22 0 0 1 24 2Z",
  arch: "M2 94V48a46 46 0 0 1 92 0v46Z",
  shield: "M48 2l42 14v32c0 26-19 41-42 46C25 89 6 74 6 48V16Z",
  drop: "M48 2c18 22 44 40 44 60a44 44 0 0 1-88 0C4 42 30 24 48 2Z",
  hexagon: "M48 2l42 24v44L48 94 6 70V26Z",
};

/** The mouth at rest, per expression (eyes are shared, bar `focused`). */
const MOUTHS: Record<AgentExpression, string> = {
  calm: "M38 64h20",
  happy: "M36 60q12 12 24 0",
  focused: "M40 64h16",
  curious: "M38 64q10-6 20 0",
  surprised: "",
};

export interface AgentAvatarProps {
  color: number;
  shape?: AgentShape;
  expression?: AgentExpression;
  /** Opens and closes the mouth, as if talking. */
  speaking?: boolean;
  size?: number;
}

/** The paper-cutout avatar. Decorative: name the agent in text beside it. */
export function AgentAvatar({ color, shape = "circle", expression = "calm", speaking = false, size = 96 }: AgentAvatarProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const fill = `var(--ds-color-chart-${color})`;
  const layer = `var(--ds-color-chart-${color}-active)`;
  const paper = "var(--ds-color-bg-surface)";
  const path = SHAPE_PATHS[shape];
  const eyeR = expression === "surprised" ? 5 : 4.5;

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="shrink-0 overflow-visible"
      animate={reduceMotion ? undefined : { scale: speaking ? [1, 1.03, 1] : [1, 1.015, 1] }}
      transition={{ duration: speaking ? 0.5 : 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* The paper layer behind, offset like a cutout lifted off the page. */}
      <path d={path} fill={layer} transform="translate(4 4)" />
      <path d={path} fill={fill} />

      {/* Eyes, blinking every few seconds. */}
      <motion.g
        style={{ transformOrigin: "48px 44px" }}
        animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.1, 1] }}
        transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
        fill={paper}
        stroke={paper}
        strokeWidth={4}
        strokeLinecap="round"
      >
        {expression === "focused" ? (
          <>
            <path d="M31 44h10" fill="none" />
            <path d="M55 44h10" fill="none" />
          </>
        ) : (
          <>
            <circle cx={36} cy={44} r={eyeR} stroke="none" />
            <circle cx={60} cy={44} r={expression === "curious" ? eyeR + 1.5 : eyeR} stroke="none" />
          </>
        )}
      </motion.g>

      {/* Mouth: the expression at rest, an opening oval while speaking. */}
      {speaking && !reduceMotion ? (
        <motion.ellipse
          cx={48}
          cy={64}
          rx={8}
          fill={paper}
          animate={{ ry: [2, 6, 3, 5] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror" }}
        />
      ) : expression === "surprised" ? (
        <circle cx={48} cy={64} r={5.5} fill={paper} />
      ) : (
        <path d={MOUTHS[expression]} fill="none" stroke={paper} strokeWidth={4} strokeLinecap="round" />
      )}
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ voice */

/** Speaks a line in the agent's voice; resolves when it ends (or at once without speech support). */
function useVoicePreview() {
  const [speaking, setSpeaking] = useState(false);
  const fallback = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(fallback.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  const speak = (text: string, config: AgentConfig) => {
    const voice = VOICES.find((v) => v.id === config.voice);
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    setSpeaking(true);
    if (synth && typeof SpeechSynthesisUtterance !== "undefined") {
      synth.cancel();
      const line = new SpeechSynthesisUtterance(text);
      line.rate = config.speed;
      line.pitch = voice?.pitch ?? 1;
      if (config.language && config.language !== "auto") line.lang = config.language;
      line.onend = () => setSpeaking(false);
      line.onerror = () => setSpeaking(false);
      synth.speak(line);
      return;
    }
    // No speech here: mime it for about as long as the line would take.
    clearTimeout(fallback.current);
    fallback.current = setTimeout(() => setSpeaking(false), 2400 / config.speed);
  };

  const stop = () => {
    clearTimeout(fallback.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return { speaking, speak, stop };
}

/* ---------------------------------------------------------------- creator */

export interface AgentCreatorProps {
  /** Controlled: the agent being edited. */
  agent?: AgentConfig;
  /** Every edit, for a controlled creator. */
  onChange?: (config: AgentConfig) => void;
  defaultValue?: Partial<AgentConfig>;
  title?: string;
  submitLabel?: string;
  onCreate?: (config: AgentConfig) => void;
  /** Shows a close button in the header. */
  onClose?: () => void;
  /** `card` (default): form beside the preview. `sidebar`: preview above, for a tall, narrow panel. */
  layout?: "card" | "sidebar";
  className?: string;
}

const DEFAULTS: AgentConfig = {
  name: "",
  label: "",
  description: "",
  color: 6,
  shape: "circle",
  expression: "calm",
  tone: "friendly",
  language: "auto",
  notifications: true,
  voice: "calm",
  speed: 1,
};

function ChoiceRadio({ value, label, children }: { value: string; label: string; children: (selected: boolean) => ReactNode }) {
  return (
    <Radio
      value={value}
      aria-label={label}
      className={cx("flex cursor-pointer items-center justify-center rounded-control-sm transition-transform data-[pressed]:scale-95", focusRing)}
    >
      {({ isSelected }) => children(isSelected)}
    </Radio>
  );
}

export function AgentCreator({
  agent,
  onChange,
  defaultValue,
  onCreate,
  onClose,
  title = "Create an agent",
  submitLabel = "Create agent",
  layout = "card",
  className,
}: AgentCreatorProps) {
  const [own, setOwn] = useState<AgentConfig>({ ...DEFAULTS, ...defaultValue });
  const config: AgentConfig = { ...DEFAULTS, ...(agent ?? own) };
  const voice = useVoicePreview();
  const id = useId();
  const set = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
    const next = { ...config, [key]: value };
    if (!agent) setOwn(next);
    onChange?.(next);
  };

  const name = config.name.trim() || "Untitled agent";
  const sidebar = layout === "sidebar";
  const voiceLabel = VOICES.find((v) => v.id === config.voice)?.label;

  const preview = (
    <aside
      aria-label="Preview"
      className={cx(
        "flex flex-col items-center gap-3 rounded-surface bg-sunken text-center",
        sidebar ? "p-4" : "gap-4 p-5",
      )}
    >
      {!sidebar && <span className="self-start font-mono text-caption uppercase text-fg-secondary">Preview</span>}
      <AgentAvatar color={config.color} shape={config.shape} expression={config.expression} speaking={voice.speaking} size={sidebar ? 80 : 96} />
      <div className="flex flex-col gap-1">
        <p className="font-display text-headline-emphasis text-fg">{name}</p>
        {config.label?.trim() && <p className="font-mono text-caption uppercase text-fg-secondary">{config.label.trim()}</p>}
        {!sidebar && <p className="text-body-sm text-fg-secondary">{config.description.trim() || "Describe what this agent does."}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        <span className="rounded-chip border border-line bg-surface px-2 py-0.5 font-mono text-caption text-fg-secondary">{TONE_LABEL[config.tone]}</span>
        <span className="rounded-chip border border-line bg-surface px-2 py-0.5 font-mono text-caption text-fg-secondary">
          {voiceLabel}
          {config.voice !== "none" ? ` · ${config.speed}×` : ""}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={voice.speaking ? RiStopFill : RiPlayFill}
        isDisabled={config.voice === "none"}
        onPress={() =>
          voice.speaking
            ? voice.stop()
            : voice.speak(`Hi, I'm ${name}. ${config.description.trim() || "How can I help?"}`, config)
        }
      >
        {voice.speaking ? "Stop" : "Preview voice"}
      </Button>
    </aside>
  );

  return (
    <section
      className={cx(
        "w-full rounded-panel border border-line bg-surface",
        sidebar ? "flex h-full max-w-sm flex-col overflow-hidden" : "grid gap-6 p-5 md:grid-cols-[1fr_17rem]",
        className,
      )}
    >
      <form
        className={cx("flex min-h-0 flex-col gap-4", sidebar && "flex-1 overflow-y-auto p-4")}
        onSubmit={(event) => {
          event.preventDefault();
          voice.stop();
          onCreate?.({ ...config, name });
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-title-sm-emphasis text-fg">{title}</h3>
          {onClose && <CloseButton size="sm" aria-label="Close" onClick={onClose} />}
        </div>

        {sidebar && preview}

        <div className={cx("grid gap-4", !sidebar && "sm:grid-cols-2")}>
          <Input label="Name" placeholder="e.g. Release helper" value={config.name} onChange={(v) => set("name", v)} />
          <Input label="Label" placeholder="e.g. Cloud engineer" value={config.label ?? ""} onChange={(v) => set("label", v)} />
        </div>
        <Textarea label="What does it do?" placeholder="Drafts release notes from merged pull requests." value={config.description} onChange={(v) => set("description", v)} maxLength={140} />

        <RadioGroup value={String(config.color)} onChange={(v) => set("color", Number(v))} className="flex flex-col gap-2" orientation="horizontal">
          <Label className="text-body-sm-strong text-fg">Colour</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <ChoiceRadio key={c} value={String(c)} label={COLOR_NAMES[c]!}>
                {(selected) => (
                  <span
                    className={cx("size-7 rounded-control-sm ring-offset-2 ring-offset-surface", selected && "ring-2 ring-fg")}
                    style={{ background: `var(--ds-color-chart-${c})` }}
                  />
                )}
              </ChoiceRadio>
            ))}
          </div>
        </RadioGroup>

        <RadioGroup value={config.shape} onChange={(v) => set("shape", v as AgentShape)} className="flex flex-col gap-2" orientation="horizontal">
          <Label className="text-body-sm-strong text-fg">Shape</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SHAPE_LABEL) as AgentShape[]).map((shape) => (
              <ChoiceRadio key={shape} value={shape} label={SHAPE_LABEL[shape]}>
                {(selected) => (
                  <span className={cx("flex size-10 items-center justify-center rounded-control-md border", selected ? "border-fg bg-sunken" : "border-line")}>
                    <svg viewBox="0 0 100 100" className="size-6 overflow-visible" aria-hidden>
                      <path d={SHAPE_PATHS[shape]} fill={`var(--ds-color-chart-${config.color})`} />
                    </svg>
                  </span>
                )}
              </ChoiceRadio>
            ))}
          </div>
        </RadioGroup>

        <RadioGroup value={config.expression} onChange={(v) => set("expression", v as AgentExpression)} className="flex flex-col gap-2" orientation="horizontal">
          <Label className="text-body-sm-strong text-fg">Expression</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(EXPRESSION_LABEL) as AgentExpression[]).map((expression) => (
              <ChoiceRadio key={expression} value={expression} label={EXPRESSION_LABEL[expression]}>
                {(selected) => (
                  <span className={cx("flex size-10 items-center justify-center rounded-control-md border", selected ? "border-fg bg-sunken" : "border-line")}>
                    <AgentAvatar color={config.color} shape={config.shape} expression={expression} size={28} />
                  </span>
                )}
              </ChoiceRadio>
            ))}
          </div>
        </RadioGroup>

        <div className="flex flex-col gap-2">
          <span id={`${id}-tone`} className="text-body-sm-strong text-fg">
            Tone
          </span>
          <SegmentedControl
            aria-labelledby={`${id}-tone`}
            selectedKeys={[config.tone]}
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (next) set("tone", next as AgentTone);
            }}
          >
            {(Object.keys(TONE_LABEL) as AgentTone[]).map((t) => (
              <SegmentedControlItem key={t} id={t}>
                {TONE_LABEL[t]}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        <div className="flex flex-col gap-1.5">
          <span id={`${id}-language`} className="text-body-sm-strong text-fg">
            Language
          </span>
          <Select aria-labelledby={`${id}-language`} selectedKey={config.language} onSelectionChange={(k) => k !== null && set("language", String(k))}>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.id} id={l.id} textValue={l.label}>
                {l.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Switch isSelected={config.notifications} onChange={(on) => set("notifications", on)}>
          Show a notice when a reply is ready
        </Switch>

        <div className={cx("grid gap-4", !sidebar && "sm:grid-cols-2")}>
          <div className="flex flex-col gap-1.5">
            <span id={`${id}-voice`} className="text-body-sm-strong text-fg">
              Voice
            </span>
            <Select aria-labelledby={`${id}-voice`} selectedKey={config.voice} onSelectionChange={(k) => k !== null && set("voice", String(k))}>
              {VOICES.map((v) => (
                <SelectItem key={v.id} id={v.id} textValue={v.label}>
                  {v.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Slider
            label="Speaking speed"
            thumbLabel="Speaking speed"
            minValue={0.75}
            maxValue={1.5}
            step={0.25}
            value={config.speed}
            onChange={(v) => set("speed", v)}
            isDisabled={config.voice === "none"}
            formatValue={(v) => `${v}×`}
          />
        </div>

        <div className={cx("flex justify-end pt-1", sidebar && "sticky bottom-0 -mx-4 -mb-4 border-t border-line bg-surface p-4")}>
          <Button type="submit" leadingIcon={RiSparkling2Line}>
            {submitLabel}
          </Button>
        </div>
      </form>

      {!sidebar && preview}
    </section>
  );
}
