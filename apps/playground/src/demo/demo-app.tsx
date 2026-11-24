import { useEffect, useState } from "react";
import { RiArrowLeftLine, RiPhoneFill, RiTimerLine, RiUploadCloud2Line } from "@remixicon/react";
import { Avatar, Button, CodeBlock, DynamicIsland, focusRingNative, cx } from "@windesign-ds/react";
import type { DynamicIslandSize } from "@windesign-ds/react";

/**
 * /demo: a small app built the way someone using the packages would build it.
 * The island's state is ordinary React state; each mode picks a size and the
 * content to show, and DynamicIsland morphs between them.
 */

type Mode = "idle" | "timer" | "upload" | "call" | "on-call";

const SIZE: Record<Mode, DynamicIslandSize> = {
  idle: "idle",
  timer: "compact",
  upload: "wide",
  call: "expanded",
  "on-call": "compact",
};

const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function DemoApp() {
  const [mode, setMode] = useState<Mode>("idle");
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);

  // One ticker drives whichever mode is live.
  useEffect(() => {
    if (mode === "idle" || mode === "call") return;
    const id = setInterval(() => {
      if (mode === "timer") setSeconds((s) => Math.max(0, s - 1));
      if (mode === "on-call") setSeconds((s) => s + 1);
      if (mode === "upload") setProgress((p) => Math.min(100, p + 4));
    }, mode === "upload" ? 120 : 1000);
    return () => clearInterval(id);
  }, [mode]);

  // Finished timers and uploads hand the island back.
  useEffect(() => {
    if ((mode === "timer" && seconds === 0) || (mode === "upload" && progress === 100)) {
      const id = setTimeout(() => setMode("idle"), 900);
      return () => clearTimeout(id);
    }
  }, [mode, seconds, progress]);

  const start = (next: Mode) => {
    if (next === "timer") setSeconds(10);
    if (next === "upload") setProgress(0);
    if (next === "on-call") setSeconds(0);
    setMode(next);
  };

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3">
          <a href="/#/components/dynamic-island" className={cx("inline-flex w-fit items-center gap-1 rounded-control-sm text-body-sm text-fg-secondary hover:text-fg", focusRingNative)}>
            <RiArrowLeftLine aria-hidden className="size-4" /> Dynamic Island docs
          </a>
          <h1 className="text-display-sm text-fg">Dynamic Island</h1>
          <p className="max-w-xl text-body-lg text-fg-secondary">
            A small app on <code className="font-code text-body-md text-fg">@windesign-ds/react</code>. Start something and the island reshapes to fit it.
          </p>
        </header>

        {/* A phone-like stage, with the island where a status bar would be. */}
        <section aria-label="Demo" className="flex flex-col items-center gap-6 rounded-surface border border-line bg-surface px-4 pt-4 pb-8">
          <div className="flex min-h-40 w-full justify-center">
            <DynamicIsland mode={mode} size={SIZE[mode]}>
              <IslandContent
                mode={mode}
                seconds={seconds}
                progress={progress}
                onAnswer={() => start("on-call")}
                onDecline={() => setMode("idle")}
              />
            </DynamicIsland>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onPress={() => start("timer")}>
              Start a 10s timer
            </Button>
            <Button variant="secondary" onPress={() => start("upload")}>
              Upload a file
            </Button>
            <Button variant="secondary" onPress={() => start("call")}>
              Receive a call
            </Button>
            <Button variant="tertiary" onPress={() => setMode("idle")} isDisabled={mode === "idle"}>
              Reset
            </Button>
          </div>
        </section>

        <section aria-labelledby="how" className="flex flex-col gap-4">
          <h2 id="how" className="text-title-md-strong text-fg">
            How it's built
          </h2>
          <p className="text-body-md text-fg-secondary">
            Give the island a <code className="font-code text-fg">mode</code> (any string naming what it shows), a <code className="font-code text-fg">size</code>{" "}
            and the content. Change the mode and it springs to the new size while the content cross-fades. It's a status region, so screen readers hear each
            change, and with reduced motion it switches without animating.
          </p>
          <CodeBlock title="upload-status.tsx" language="tsx" code={SNIPPET} />
        </section>
      </div>
    </div>
  );
}

function IslandContent({
  mode,
  seconds,
  progress,
  onAnswer,
  onDecline,
}: {
  mode: Mode;
  seconds: number;
  progress: number;
  onAnswer: () => void;
  onDecline: () => void;
}) {
  if (mode === "idle") return <span className="mx-auto text-caption-strong text-canvas">9:41</span>;

  if (mode === "timer")
    return (
      <span className="flex w-full items-center justify-between text-body-sm-strong">
        <RiTimerLine aria-hidden className="size-4 text-accent-400" />
        <span className="tabular-nums">{seconds === 0 ? "Done" : clock(seconds)}</span>
      </span>
    );

  if (mode === "upload")
    return (
      <span className="flex w-full items-center gap-2 text-body-sm-strong">
        <RiUploadCloud2Line aria-hidden className="size-4 text-accent-400" />
        <span className="flex-1 truncate">{progress === 100 ? "brand-kit.zip uploaded" : "Uploading brand-kit.zip"}</span>
        <span className="tabular-nums opacity-70">{progress}%</span>
      </span>
    );

  if (mode === "on-call")
    return (
      <span className="flex w-full items-center justify-between text-body-sm-strong">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-status-success-solid" /> Ada Morgan
        </span>
        <span className="tabular-nums opacity-70">{clock(seconds)}</span>
      </span>
    );

  return (
    <div className="flex w-full flex-col gap-3 py-3">
      <div className="flex items-center gap-3">
        <Avatar initials="AM" color="pink" size="lg" />
        <div className="flex flex-col">
          <span className="text-body-md-strong">Ada Morgan</span>
          <span className="text-caption opacity-70">Incoming call</span>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDecline}
          aria-label="Decline"
          className={cx("flex size-9 cursor-pointer items-center justify-center rounded-full bg-status-danger-solid text-on-action", focusRingNative)}
        >
          <RiPhoneFill aria-hidden className="size-4 rotate-135" />
        </button>
        <button
          type="button"
          onClick={onAnswer}
          aria-label="Answer"
          className={cx("flex size-9 cursor-pointer items-center justify-center rounded-full bg-status-success-solid text-on-action", focusRingNative)}
        >
          <RiPhoneFill aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}

const SNIPPET = `import { useState } from "react";
import { Button, DynamicIsland } from "@windesign-ds/react";

export function UploadStatus() {
  const [uploading, setUploading] = useState(false);

  return (
    <>
      <DynamicIsland mode={uploading ? "upload" : "idle"} size={uploading ? "wide" : "idle"}>
        {uploading ? <span>Uploading brand-kit.zip…</span> : <span className="mx-auto">9:41</span>}
      </DynamicIsland>
      <Button onPress={() => setUploading((u) => !u)}>
        {uploading ? "Cancel" : "Upload"}
      </Button>
    </>
  );
}`;
