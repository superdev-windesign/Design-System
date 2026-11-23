import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { cx, promptArt } from "@ds/react";
import type { CatalogEntry } from "./catalog";

/**
 * Shared pieces for the effects demos: the entry factory that files them under
 * Pro, token-only art to stand in for photos, a stage for backgrounds, and a
 * scroll box for the scroll-driven effects.
 */

export const effect = (config: Omit<CatalogEntry, "group" | "isNew">): CatalogEntry => ({ ...config, group: "Pro", isNew: true });

/** A picture made only from tokens (the chart palette), seeded so it's stable. */
export function Art({ seed, className, children }: { seed: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cx("relative size-full", className)} style={{ background: promptArt(seed) }}>
      {children}
    </div>
  );
}

/** A panel for an effect that fills its parent, with optional content on top. */
export function Stage({ children, effect: layer, className }: { children?: ReactNode; effect: ReactNode; className?: string }) {
  return (
    <div className={cx("relative isolate flex h-44 w-full items-center justify-center overflow-hidden rounded-surface border border-line bg-canvas", className)}>
      {layer}
      {children && <div className="relative z-10 flex flex-col items-center gap-1 text-center">{children}</div>}
    </div>
  );
}

/** Big centred copy for a stage. */
export function StageTitle({ title, note }: { title: string; note?: string }) {
  return (
    <>
      <span className="text-title-lg-strong text-fg">{title}</span>
      {note && <span className="text-body-sm text-fg-secondary">{note}</span>}
    </>
  );
}

/** A scrolling panel for scroll-driven demos; children get its ref. */
export function ScrollBox({ children, className }: { children: (ref: RefObject<HTMLDivElement | null>) => ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} tabIndex={0} aria-label="Scrolling demo" className={cx("scrollbar-thin relative h-96 w-full overflow-y-auto rounded-surface border border-line bg-canvas focus-visible:outline-2 focus-visible:outline-focus", className)}>
      {children(ref)}
    </div>
  );
}

/** Filler paragraphs for scroll demos. */
export function Filler({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <p key={i} className="text-body-md text-fg-secondary">
          Every component in the system takes its colour, type, space and motion from tokens, so a theme or a brand can change the whole look without
          touching component code. Behaviour comes from React Aria, which brings keyboard support, focus management and screen reader semantics.
        </p>
      ))}
    </>
  );
}
