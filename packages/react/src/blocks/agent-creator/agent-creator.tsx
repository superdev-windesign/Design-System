"use client";

import { useEffect, useId, useState } from "react";
import { Radio, RadioGroup, Label } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { RiPlayFill, RiSparkling2Line } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { Input } from "../../components/input/input";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { Select, SelectItem } from "../../components/select/select";
import { Slider } from "../../components/slider/slider";
import { Textarea } from "../../components/textarea/textarea";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Agent Creator: give an agent a name, a job, a look and a voice, with a live
 * preview beside the form. The avatar is an orb in the chosen colour that
 * breathes and blinks; "Preview voice" makes it talk for a moment.
 */

export type AgentTone = "friendly" | "neutral" | "concise";

export interface AgentConfig {
  name: string;
  description: string;
  /** Chart palette index, 1–9. */
  color: number;
  tone: AgentTone;
  voice: string;
  speed: number;
}

const COLORS = [6, 5, 3, 1, 7, 8] as const;
const COLOR_NAMES: Record<number, string> = { 1: "Teal", 3: "Pink", 5: "Purple", 6: "Blue", 7: "Emerald", 8: "Yellow" };
const VOICES = [
  { id: "bright", label: "Bright" },
  { id: "calm", label: "Calm" },
  { id: "warm", label: "Warm" },
  { id: "none", label: "No voice" },
];
const TONE_LABEL: Record<AgentTone, string> = { friendly: "Friendly", neutral: "Neutral", concise: "Concise" };

/** The orb avatar. `speaking` pulses rings outward and opens the mouth. */
export function AgentAvatar({ color, speaking = false, size = 96 }: { color: number; speaking?: boolean; size?: number }) {
  const reduceMotion = useReducedMotion() ?? false;
  const fill = `var(--ds-color-chart-${color})`;
  const deep = `var(--ds-color-chart-${color}-active)`;
  return (
    <div aria-hidden className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {speaking &&
        !reduceMotion &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: fill }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          />
        ))}
      <motion.div
        className="relative size-full rounded-full shadow-raised"
        style={{ background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${fill} 55%, white) 0%, ${fill} 45%, ${deep} 100%)` }}
        animate={reduceMotion ? undefined : { scale: speaking ? [1, 1.04, 1] : [1, 1.025, 1] }}
        transition={{ duration: speaking ? 0.5 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Eyes blink every few seconds */}
        {[-1, 1].map((side) => (
          <motion.span
            key={side}
            className="absolute rounded-full bg-surface"
            style={{ top: "38%", width: size * 0.09, height: size * 0.13, left: `calc(50% + ${side * size * 0.13}px - ${size * 0.045}px)` }}
            animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
          />
        ))}
        <motion.span
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-surface"
          style={{ top: "62%", width: size * 0.22 }}
          animate={{ height: speaking && !reduceMotion ? [size * 0.04, size * 0.11, size * 0.05, size * 0.09] : size * 0.04 }}
          transition={speaking ? { duration: 0.6, repeat: Infinity, repeatType: "mirror" } : { duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
}

export interface AgentCreatorProps {
  defaultValue?: Partial<AgentConfig>;
  title?: string;
  submitLabel?: string;
  onCreate?: (config: AgentConfig) => void;
  className?: string;
}

export function AgentCreator({ defaultValue, onCreate, title = "Create an agent", submitLabel = "Create agent", className }: AgentCreatorProps) {
  const [config, setConfig] = useState<AgentConfig>({
    name: "",
    description: "",
    color: 6,
    tone: "friendly",
    voice: "calm",
    speed: 1,
    ...defaultValue,
  });
  const [speaking, setSpeaking] = useState(false);
  const id = useId();
  const set = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    if (!speaking) return;
    const timer = setTimeout(() => setSpeaking(false), 2400 / config.speed);
    return () => clearTimeout(timer);
  }, [speaking, config.speed]);

  const name = config.name.trim() || "Untitled agent";

  return (
    <section className={cx("grid w-full gap-6 rounded-2xl border border-line bg-surface p-5 md:grid-cols-[1fr_17rem]", className)}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate?.({ ...config, name });
        }}
      >
        <h3 className="text-title-sm-emphasis text-fg">{title}</h3>
        <Input label="Name" placeholder="e.g. Release helper" value={config.name} onChange={(v) => set("name", v)} />
        <Textarea label="What does it do?" placeholder="Drafts release notes from merged pull requests." value={config.description} onChange={(v) => set("description", v)} maxLength={140} />

        <RadioGroup value={String(config.color)} onChange={(v) => set("color", Number(v))} className="flex flex-col gap-2" orientation="horizontal">
          <Label className="text-body-sm-strong text-fg">Colour</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <Radio
                key={c}
                value={String(c)}
                aria-label={COLOR_NAMES[c]}
                className={cx(
                  "flex size-8 cursor-pointer items-center justify-center rounded-full outline-offset-2 transition-transform data-[pressed]:scale-95",
                  focusRing,
                )}
              >
                {({ isSelected }) => (
                  <span
                    className={cx("size-full rounded-full ring-offset-2 ring-offset-surface", isSelected && "ring-2 ring-fg")}
                    style={{ background: `var(--ds-color-chart-${c})` }}
                  />
                )}
              </Radio>
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

        <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="flex justify-end pt-1">
          <Button type="submit" leadingIcon={RiSparkling2Line}>
            {submitLabel}
          </Button>
        </div>
      </form>

      {/* Live preview */}
      <aside aria-label="Preview" className="flex flex-col items-center gap-4 rounded-2xl bg-sunken p-5 text-center">
        <span className="self-start text-caption-strong text-fg-secondary">Preview</span>
        <AgentAvatar color={config.color} speaking={speaking} />
        <div className="flex flex-col gap-1">
          <p className="text-headline-emphasis text-fg">{name}</p>
          <p className="text-body-sm text-fg-secondary">{config.description.trim() || "Describe what this agent does."}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="rounded-full bg-surface px-2 py-0.5 text-caption-strong text-fg-secondary">{TONE_LABEL[config.tone]}</span>
          <span className="rounded-full bg-surface px-2 py-0.5 text-caption-strong text-fg-secondary">
            {VOICES.find((v) => v.id === config.voice)?.label}
            {config.voice !== "none" ? ` · ${config.speed}×` : ""}
          </span>
        </div>
        <Button size="sm" variant="secondary" leadingIcon={RiPlayFill} isDisabled={config.voice === "none" || speaking} onPress={() => setSpeaking(true)}>
          {speaking ? "Speaking…" : "Preview voice"}
        </Button>
      </aside>
    </section>
  );
}
