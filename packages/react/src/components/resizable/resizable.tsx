"use client";

import { Children, Fragment, isValidElement, useId, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode, type RefObject } from "react";
import { useLocale, useMove } from "react-aria";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * ResizablePanels: two or more panes with handles between them that can be
 * dragged (an editor beside its preview, a list beside a detail view).
 * Sizes are percentages of the group.
 *
 * ```tsx
 * <ResizablePanels orientation="horizontal" className="h-96">
 *   <ResizablePanel label="Files" defaultSize={30} minSize={20}>…</ResizablePanel>
 *   <ResizablePanel label="Editor">…</ResizablePanel>
 * </ResizablePanels>
 * ```
 *
 * Each handle is a focusable separator: ← / → (↑ / ↓ when vertical) resize
 * by 5%, Home and End jump to the limits, Enter collapses the pane before it
 * to its minimum and back. Screen readers hear the pane's size as a value.
 */

export interface ResizablePanelProps {
  /** Names the pane for the handle after it ("Resize Files"). */
  label: string;
  /** Starting size in percent. Panes without one share what's left. */
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: ReactNode;
  className?: string;
}

/** A pane. Its props are read by ResizablePanels; it renders nothing by itself. */
export function ResizablePanel(props: ResizablePanelProps): ReactElement | null {
  void props;
  return null;
}

export interface ResizablePanelsProps {
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
  className?: string;
  /** Fires with every pane's size after a resize. */
  onResize?: (sizes: number[]) => void;
}

const STEP = 5;

export function ResizablePanels({ orientation = "horizontal", children, className, onResize }: ResizablePanelsProps) {
  const panels = Children.toArray(children).filter((child): child is ReactElement<ResizablePanelProps> => isValidElement(child) && child.type === ResizablePanel);
  const groupRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const { direction } = useLocale();
  const horizontal = orientation === "horizontal";

  const [sizes, setSizesState] = useState<number[]>(() => {
    const given = panels.map((p) => p.props.defaultSize);
    const fixed = given.reduce<number>((sum, s) => sum + (s ?? 0), 0);
    const open = given.filter((s) => s === undefined).length;
    return given.map((s) => s ?? (open ? (100 - fixed) / open : 0));
  });
  const collapsed = useRef<Record<number, number>>({});

  const limits = (i: number) => ({ min: panels[i]?.props.minSize ?? 10, max: panels[i]?.props.maxSize ?? 90 });

  /** Moves the boundary after pane `i` by `delta` percent, keeping both neighbours in bounds. */
  const resize = (i: number, delta: number) => {
    setSizesState((current) => {
      const a = current[i]!;
      const b = current[i + 1]!;
      const la = limits(i);
      const lb = limits(i + 1);
      const lo = Math.max(la.min - a, b - lb.max);
      const hi = Math.min(la.max - a, b - lb.min);
      const d = Math.max(lo, Math.min(hi, delta));
      if (d === 0) return current;
      const next = [...current];
      next[i] = a + d;
      next[i + 1] = b - d;
      onResize?.(next);
      return next;
    });
  };

  return (
    <div ref={groupRef} className={cx("flex min-h-0 min-w-0 overflow-hidden", horizontal ? "flex-row" : "flex-col", className)}>
      {panels.map((panel, i) => (
        <Fragment key={panel.key ?? i}>
          <div
            id={`${id}-${i}`}
            className={cx("min-h-0 min-w-0 overflow-auto", panel.props.className)}
            style={{ flexBasis: `${sizes[i]}%`, flexGrow: 0, flexShrink: 0 }}
          >
            {panel.props.children}
          </div>
          {i < panels.length - 1 && (
            <ResizeHandle
              horizontal={horizontal}
              rtl={direction === "rtl"}
              label={`Resize ${panel.props.label}`}
              controls={`${id}-${i}`}
              value={Math.round(sizes[i]!)}
              min={limits(i).min}
              max={limits(i).max}
              groupRef={groupRef}
              onResize={(delta) => resize(i, delta)}
              onToggle={() => {
                const saved = collapsed.current[i];
                if (saved !== undefined) {
                  delete collapsed.current[i];
                  resize(i, saved - sizes[i]!);
                } else {
                  collapsed.current[i] = sizes[i]!;
                  resize(i, limits(i).min - sizes[i]!);
                }
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

interface ResizeHandleProps {
  horizontal: boolean;
  rtl: boolean;
  label: string;
  controls: string;
  value: number;
  min: number;
  max: number;
  groupRef: RefObject<HTMLDivElement | null>;
  onResize: (deltaPercent: number) => void;
  onToggle: () => void;
}

function ResizeHandle({ horizontal, rtl, label, controls, value, min, max, groupRef, onResize, onToggle }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const { moveProps } = useMove({
    onMoveStart: () => setDragging(true),
    onMoveEnd: () => setDragging(false),
    onMove: (event) => {
      if (event.pointerType === "keyboard") return;
      const rect = groupRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = horizontal ? (rtl ? -event.deltaX : event.deltaX) : event.deltaY;
      onResize((px / (horizontal ? rect.width : rect.height)) * 100);
    },
  });

  const onKeyDown = (event: KeyboardEvent) => {
    const back = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    const forward = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const actions: Record<string, () => void> = {
      [back]: () => onResize(-STEP),
      [forward]: () => onResize(STEP),
      Home: () => onResize(min - value),
      End: () => onResize(max - value),
      Enter: onToggle,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-controls={controls}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      {...moveProps}
      onKeyDown={onKeyDown}
      data-dragging={dragging || undefined}
      className={cx(
        "group relative flex shrink-0 touch-none items-center justify-center bg-line",
        "transition-colors duration-(--ds-motion-duration-fast) hover:bg-line-control data-[dragging]:bg-accent-600",
        horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
        // A wider invisible hit area around the 1px rule.
        horizontal ? "before:absolute before:inset-y-0 before:-inset-x-1.5" : "before:absolute before:inset-x-0 before:-inset-y-1.5",
        focusRingNative,
      )}
    >
      <span
        aria-hidden
        className={cx(
          "z-10 rounded-full border border-line-control bg-surface shadow-raised transition-colors group-hover:border-line-control-hover",
          horizontal ? "h-6 w-1.5" : "h-1.5 w-6",
        )}
      />
    </div>
  );
}
