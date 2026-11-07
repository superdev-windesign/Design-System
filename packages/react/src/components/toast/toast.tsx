"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { UNSTABLE_ToastQueue as ToastQueue } from "react-aria-components";
import type { QueuedToast, ToastState } from "react-aria-components";
import { mergeProps, useFocusRing, useFocusWithin, useHover, useToast, useToastRegion } from "react-aria";
import { useToastQueue } from "react-stately";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import type { PanInfo, Transition } from "motion/react";
import { RiCheckboxCircleFill, RiErrorWarningFill, RiInformationFill, RiLoader4Line } from "@remixicon/react";
import { Button } from "../button/button";
import { CloseButton } from "../buttons/close-button";
import type { IconComponent } from "../button/button";
import { easing, layoutSpring } from "../../motion/tokens";
import { focusRingInset, focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Toast stack: brief notifications queued from anywhere with `toast.success(…)`
 * and shown by one `<Toaster />`.
 *
 * Behavior comes from React Aria's toast queue and hooks: a landmark region
 * (F6 to reach it), timers that pause while the region is hovered or focused,
 * and focus that moves to a neighbour when a focused toast closes. Motion adds
 * the presentation: toasts rest as a compact stack, fan out on hover or focus,
 * and can be swiped sideways to dismiss.
 */

export type ToastVariant = "neutral" | "success" | "error" | "info" | "loading";

export interface ToastContent {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** One follow-up action, e.g. Undo. Pressing it also closes the toast. */
  action?: { label: string; onAction: () => void };
}

export interface ToastOptions {
  /**
   * Milliseconds before the toast closes on its own. Defaults to 6000; toasts
   * with an action, and loading toasts, stay until closed. Pass 0 to keep any
   * toast until it is closed.
   */
  timeout?: number;
  onClose?: () => void;
}

export type ToastInput = Omit<ToastContent, "title" | "variant"> & ToastOptions;

const DEFAULT_TIMEOUT = 6000;

function createToastApi(queue: ToastQueue<ToastContent>) {
  const show =
    (variant: ToastVariant) =>
    (title: ReactNode, { timeout, onClose, ...content }: ToastInput = {}) =>
      queue.add(
        { title, variant, ...content },
        {
          // Toasts that ask for action, or report work in progress, shouldn't vanish on their own.
          timeout: timeout ?? (content.action || variant === "loading" ? undefined : DEFAULT_TIMEOUT),
          onClose,
        },
      );

  const resolve = <A,>(message: ReactNode | ((arg: A) => ReactNode), arg: A) =>
    typeof message === "function" ? message(arg) : message;

  return {
    show: show("neutral"),
    success: show("success"),
    error: show("error"),
    info: show("info"),
    loading: show("loading"),
    dismiss: (key: string) => queue.close(key),
    clear: () => queue.clear(),
    /** Shows a loading toast while `promise` runs, then swaps it for the outcome. */
    async promise<T>(
      promise: Promise<T>,
      messages: {
        loading: ReactNode;
        success: ReactNode | ((value: T) => ReactNode);
        error: ReactNode | ((error: unknown) => ReactNode);
      },
    ): Promise<T> {
      const key = show("loading")(messages.loading);
      try {
        const value = await promise;
        queue.close(key);
        show("success")(resolve(messages.success, value));
        return value;
      } catch (error) {
        queue.close(key);
        show("error")(resolve(messages.error, error));
        throw error;
      }
    },
  };
}

export type ToastApi = ReturnType<typeof createToastApi>;

/** A separate queue and API, for a second `<Toaster queue={…} />` (e.g. inside a panel). */
export function createToastQueue(maxVisibleToasts = 5) {
  const queue = new ToastQueue<ToastContent>({ maxVisibleToasts });
  return { queue, toast: createToastApi(queue) };
}

const defaultToaster = createToastQueue();
/** The app-wide queue that `<Toaster />` shows by default. */
export const toastQueue = defaultToaster.queue;
export const toast = defaultToaster.toast;

export type ToasterPosition = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

const POSITION: Record<ToasterPosition, string> = {
  "top-start": "top-4 start-4",
  "top-center": "inset-x-0 top-4 mx-auto",
  "top-end": "top-4 end-4",
  "bottom-start": "bottom-4 start-4",
  "bottom-center": "inset-x-0 bottom-4 mx-auto",
  "bottom-end": "bottom-4 end-4",
};

const VARIANT_ICON: Record<Exclude<ToastVariant, "neutral">, { icon: IconComponent; className: string }> = {
  success: { icon: RiCheckboxCircleFill, className: "text-status-success-text" },
  error: { icon: RiErrorWarningFill, className: "text-status-danger-solid" },
  info: { icon: RiInformationFill, className: "text-status-info-fg" },
  loading: { icon: RiLoader4Line, className: "animate-spin text-icon-secondary motion-reduce:animate-none" },
};

/** Gap between toasts when fanned out, and how far each one peeks out of the resting stack (px). */
const GAP = 12;
const PEEK = 10;
/** Toasts beyond this many fade out of the resting stack (they reappear when it fans out). */
const STACK_DEPTH = 3;
/** Horizontal drag distance (px) or speed (px/s) that dismisses a toast. */
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

export interface ToasterProps {
  /** Defaults to the app-wide `toastQueue`. */
  queue?: ToastQueue<ToastContent>;
  position?: ToasterPosition;
  /** Always show toasts fanned out rather than stacked. */
  expand?: boolean;
  /**
   * Render in place, pinned inside the nearest positioned ancestor, instead of
   * fixed to the window. For toasts that belong to one panel.
   */
  inline?: boolean;
  "aria-label"?: string;
  className?: string;
}

const subscribeToNothing = () => () => {};

export function Toaster({ queue = toastQueue, ...props }: ToasterProps) {
  const state = useToastQueue(queue);
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  // The region stays mounted until the last toast has finished animating out,
  // but isn't rendered at all while there's nothing to announce.
  const [isMounted, setIsMounted] = useState(false);
  if (state.visibleToasts.length > 0 && !isMounted) setIsMounted(true);

  if (!isClient || !isMounted) return null;
  const region = (
    <ToastRegion
      {...props}
      state={state}
      onExitComplete={() => {
        if (queue.visibleToasts.length === 0) setIsMounted(false);
      }}
    />
  );
  return props.inline ? region : createPortal(region, document.body);
}

interface ToastRegionProps extends Omit<ToasterProps, "queue"> {
  state: ToastState<ToastContent>;
  onExitComplete: () => void;
}

function ToastRegion({
  state,
  position = "bottom-end",
  expand = false,
  inline = false,
  "aria-label": ariaLabel,
  className,
  onExitComplete,
}: ToastRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { regionProps } = useToastRegion({ "aria-label": ariaLabel }, state, ref);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const { hoverProps } = useHover({ onHoverChange: setIsHovered });
  const { focusWithinProps } = useFocusWithin({ onFocusWithinChange: setHasFocusWithin });
  const reduceMotion = useReducedMotion() ?? false;

  const [heights, setHeights] = useState<Record<string, number>>({});
  const toasts = state.visibleToasts;
  const isExpanded = expand || isHovered || hasFocusWithin;
  const isTop = position.startsWith("top");

  // Forget heights of toasts that have gone.
  useEffect(() => {
    setHeights((prev) => {
      const next = Object.fromEntries(toasts.filter((t) => prev[t.key] !== undefined).map((t) => [t.key, prev[t.key]!]));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [toasts]);

  const offsets: number[] = [];
  let total = 0;
  for (const t of toasts) {
    offsets.push(total);
    total += (heights[t.key] ?? 0) + GAP;
  }
  const frontHeight = toasts[0] ? heights[toasts[0].key] ?? 0 : 0;
  const listHeight = isExpanded
    ? Math.max(0, total - GAP)
    : frontHeight + Math.max(0, Math.min(toasts.length, STACK_DEPTH) - 1) * PEEK;

  return (
    <div
      {...mergeProps(regionProps, hoverProps, focusWithinProps)}
      ref={ref}
      className={cx(
        "w-90 rounded-surface",
        inline ? "absolute z-10 max-w-[calc(100%-32px)]" : "fixed z-60 max-w-[calc(100vw-32px)]",
        focusRingNative,
        POSITION[position],
        className,
      )}
    >
      <motion.ol
        className="relative"
        initial={false}
        animate={{ height: listHeight }}
        transition={reduceMotion ? { duration: 0 } : layoutSpring}
      >
        <AnimatePresence initial={false} onExitComplete={onExitComplete}>
          {toasts.map((t, index) => (
            <ToastItem
              key={t.key}
              toast={t}
              state={state}
              index={index}
              count={toasts.length}
              isExpanded={isExpanded}
              isTop={isTop}
              offset={offsets[index] ?? 0}
              frontHeight={frontHeight}
              height={heights[t.key]}
              reduceMotion={reduceMotion}
              onMeasure={(height) =>
                setHeights((prev) => (prev[t.key] === height ? prev : { ...prev, [t.key]: height }))
              }
            />
          ))}
        </AnimatePresence>
      </motion.ol>
    </div>
  );
}

interface ToastItemProps {
  toast: QueuedToast<ToastContent>;
  state: ToastState<ToastContent>;
  index: number;
  count: number;
  isExpanded: boolean;
  isTop: boolean;
  offset: number;
  frontHeight: number;
  height: number | undefined;
  reduceMotion: boolean;
  onMeasure: (height: number) => void;
}

function ToastItem({
  toast: queued,
  state,
  index,
  count,
  isExpanded,
  isTop,
  offset,
  frontHeight,
  height,
  reduceMotion,
  onMeasure,
}: ToastItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { toastProps, contentProps, titleProps, descriptionProps, closeButtonProps } = useToast({ toast: queued }, state, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  const isPresent = useIsPresent();
  const [swipe, setSwipe] = useState(0);
  const { title, description, variant = "neutral", action } = queued.content;

  // Report the natural height so the stack can lay toasts out.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    onMeasure(el.offsetHeight);
    const observer = new ResizeObserver(() => onMeasure(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bottom stacks grow upwards, top stacks downwards.
  const direction = isTop ? 1 : -1;
  const isStacked = !isExpanded && index > 0;
  const isBuried = !isExpanded && index >= STACK_DEPTH;
  const spring: Transition = reduceMotion ? { duration: 0 } : layoutSpring;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    state.resumeAll();
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      setSwipe(Math.sign(info.offset.x || info.velocity.x));
      state.close(queued.key);
    }
  };

  const status = variant === "neutral" ? null : VARIANT_ICON[variant];
  const Icon = status?.icon;

  return (
    <motion.li
      // Exiting toasts leave the tab order and the region's focus bookkeeping.
      inert={!isPresent}
      className={cx("absolute inset-x-0 touch-pan-y", isTop ? "top-0 origin-bottom" : "bottom-0 origin-top")}
      style={{ zIndex: count - index }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -direction * 24, scale: 0.96 }}
      animate={{
        opacity: isBuried ? 0 : 1,
        y: direction * (isExpanded ? offset : index * PEEK),
        scale: isExpanded ? 1 : 1 - index * 0.05,
        transition: spring,
      }}
      exit={
        swipe
          ? { opacity: 0, x: swipe * 360, transition: { duration: 0.2, ease: easing.standard } }
          : { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: easing.standard } }
      }
      drag={isPresent && (isExpanded || index === 0) ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.5}
      onDragStart={() => state.pauseAll()}
      onDragEnd={onDragEnd}
    >
      {/* Resting behind the front toast, a toast takes the front one's height so the stack stays tidy. */}
      <motion.div
        className="overflow-hidden rounded-surface border glass-panel shadow-overlay"
        initial={false}
        animate={{ height: isStacked && frontHeight ? frontHeight : height ?? "auto" }}
        transition={spring}
      >
        <div
          {...(isPresent ? mergeProps(toastProps, focusProps) : {})}
          ref={ref}
          className={cx(
            "relative flex items-start gap-3 rounded-surface p-3.5 pe-11 transition-opacity duration-(--ds-motion-duration-moderate)",
            isStacked && "opacity-0",
            isFocusVisible && focusRingInset,
          )}
        >
          {Icon && <Icon aria-hidden className={cx("mt-px size-5 shrink-0", status.className)} />}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* The alert holds only the message; controls stay outside it so they aren't re-announced. */}
            <div {...contentProps} className="flex flex-col gap-0.5">
              <div {...titleProps} className="text-body-md-strong text-fg">
                {title}
              </div>
              {description && (
                <div {...descriptionProps} className="text-body-sm text-fg-secondary">
                  {description}
                </div>
              )}
            </div>
            {action && (
              <Button
                size="xs"
                variant="secondary"
                className="mt-2 self-start"
                onPress={() => {
                  action.onAction();
                  state.close(queued.key);
                }}
              >
                {action.label}
              </Button>
            )}
          </div>
          <CloseButton
            size="sm"
            aria-label={closeButtonProps["aria-label"] ?? "Close"}
            className="absolute end-3 top-3"
            onClick={() => state.close(queued.key)}
          />
        </div>
      </motion.div>
    </motion.li>
  );
}
