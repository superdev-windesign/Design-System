"use client";

import { useEffect, useRef, useState } from "react";
import { RiDownloadLine, RiImageAddLine } from "@remixicon/react";
import { Button } from "../components/button/button";
import { ComposerPanel } from "../blocks/composer/composer-panel";
import { GeneratedImage } from "../blocks/image-generation/generated-image";
import type { AspectRatio } from "../blocks/image-generation/generated-image";
import { focusRingNative } from "../recipes/focus-ring";
import { cx } from "../utils/cx";
import { TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * AI Image Generation: prompts down the middle, each resolving into four
 * variations, and a gallery of everything made so far on the end side with a
 * large preview of the selected image. The composer's mode picks the aspect
 * ratio and its model picks the style. Images are prompt-seeded stand-ins
 * (see GeneratedImage); swap in real URLs from your image API.
 */

interface Generation {
  id: string;
  prompt: string;
  aspect: AspectRatio;
  style: string;
  progress?: number;
}

const ASPECTS = [
  { id: "1:1", label: "Square" },
  { id: "3:2", label: "Landscape" },
  { id: "2:3", label: "Portrait" },
];

const STYLES = [
  { id: "photo", label: "Photographic" },
  { id: "illustration", label: "Illustration" },
  { id: "render", label: "3D render" },
];

const SEED: Generation[] = [
  { id: "g1", prompt: "A lighthouse on basalt cliffs at dusk, long exposure sea", aspect: "3:2", style: "photo" },
  { id: "g2", prompt: "Paper-cut forest with foxes, layered depth, warm light", aspect: "1:1", style: "illustration" },
];

const variant = (g: Generation, i: number) => `${g.prompt} · ${g.style} · ${i}`;

export function AiImageGeneration({ className }: TemplateProps) {
  const [generations, setGenerations] = useState<Generation[]>(SEED);
  const [selected, setSelected] = useState<{ id: string; index: number }>({ id: "g1", index: 0 });
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);
  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const busy = generations.some((g) => g.progress !== undefined);
  const current = generations.find((g) => g.id === selected.id);

  const generate = (prompt: string, aspect: string, style: string) => {
    const id = `g-${Date.now()}`;
    setGenerations((list) => [...list, { id, prompt, aspect: aspect as AspectRatio, style, progress: 0 }]);
    let progress = 0;
    const timer = setInterval(() => {
      progress += 0.08;
      const done = progress >= 1;
      setGenerations((list) => list.map((g) => (g.id === id ? { ...g, progress: done ? undefined : progress } : g)));
      if (done) {
        clearInterval(timer);
        setSelected({ id, index: 0 });
      }
    }, 180);
    timers.current.push(timer);
  };

  return (
    <TemplateRoot className={className}>
      <div className="flex min-w-0 flex-1 flex-col">
        <ol aria-label="Generations" className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-4 @3xl:p-6">
          {generations.map((g) => (
            <li key={g.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="max-w-xl rounded-2xl rounded-es-md bg-muted px-3.5 py-2 text-body-md text-fg">{g.prompt}</p>
                <span className="text-caption text-fg-secondary">
                  {ASPECTS.find((a) => a.id === g.aspect)?.label} · {STYLES.find((s) => s.id === g.style)?.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 @3xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => {
                  const isSelected = selected.id === g.id && selected.index === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={g.progress !== undefined}
                      aria-pressed={isSelected}
                      aria-label={`Variation ${i + 1} of “${g.prompt}”`}
                      onClick={() => setSelected({ id: g.id, index: i })}
                      className={cx("rounded-xl transition-shadow", isSelected && "ring-2 ring-accent-500 ring-offset-2 ring-offset-canvas", focusRingNative)}
                    >
                      <GeneratedImage prompt={variant(g, i)} aspect={g.aspect} progress={g.progress} />
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <ComposerPanel
            placeholder="Describe an image…"
            modes={ASPECTS}
            models={STYLES}
            defaultMode="1:1"
            isBusy={busy}
            onSubmit={({ text, mode, model }) => generate(text, mode, model)}
          />
        </div>
      </div>

      <aside aria-label="Gallery" className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-s border-line bg-sunken p-4 @3xl:flex @6xl:w-80">
        {current && current.progress === undefined && (
          <section aria-label="Preview" className="flex flex-col gap-3">
            <GeneratedImage prompt={variant(current, selected.index)} aspect={current.aspect} />
            <p className="text-body-sm text-fg">{current.prompt}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" leadingIcon={RiDownloadLine}>
                Download
              </Button>
              <Button size="sm" variant="tertiary" leadingIcon={RiImageAddLine}>
                Use as reference
              </Button>
            </div>
          </section>
        )}
        <section aria-labelledby="gallery-all" className="flex flex-col gap-2">
          <h3 id="gallery-all" className="text-body-sm-strong text-fg-secondary">
            All images
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {generations
              .filter((g) => g.progress === undefined)
              .flatMap((g) => [0, 1, 2, 3].map((i) => ({ g, i })))
              .reverse()
              .map(({ g, i }) => (
                <button
                  key={`${g.id}-${i}`}
                  type="button"
                  aria-label={`Show variation ${i + 1} of “${g.prompt}”`}
                  onClick={() => setSelected({ id: g.id, index: i })}
                  className={cx("rounded-lg", focusRingNative)}
                >
                  <GeneratedImage prompt={variant(g, i)} aspect="1:1" className="rounded-lg" />
                </button>
              ))}
          </div>
        </section>
      </aside>
    </TemplateRoot>
  );
}
