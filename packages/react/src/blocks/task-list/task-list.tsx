"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiCheckLine, RiCloseLine, RiSkipForwardLine } from "@remixicon/react";
import { easing, layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Task List: an agent's work as a log that grows while it runs. Steps appear
 * as the agent starts them (slide and unblur in), the running step shimmers,
 * and each step settles into done, failed or skipped with an optional detail
 * line. The header counts progress and is announced politely.
 */

export type TaskStatus = "pending" | "running" | "done" | "failed" | "skipped";

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  /** Secondary line, e.g. "Edited 3 files" or an error message. */
  detail?: string;
}

export interface TaskListProps {
  tasks: TaskItem[];
  title?: string;
  className?: string;
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "running") {
    return (
      <span aria-hidden className="relative flex size-5 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-chart-track border-t-accent-500 motion-reduce:animate-none" />
      </span>
    );
  }
  const map = {
    pending: { className: "border border-dashed border-line-control", icon: null },
    done: { className: "bg-status-success text-status-success-text", icon: RiCheckLine },
    failed: { className: "bg-status-danger text-status-danger-text", icon: RiCloseLine },
    skipped: { className: "bg-muted text-fg-secondary", icon: RiSkipForwardLine },
  } as const;
  const { className, icon: Icon } = map[status];
  return (
    <motion.span
      aria-hidden
      key={status}
      initial={status === "pending" ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: easing.overshoot }}
      className={cx("flex size-5 items-center justify-center rounded-full", className)}
    >
      {Icon && <Icon className="size-3.5" />}
    </motion.span>
  );
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Not started",
  running: "In progress",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

export function TaskList({ tasks, title = "Working on it", className }: TaskListProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const finished = tasks.filter((t) => t.status === "done" || t.status === "skipped").length;
  const failed = tasks.some((t) => t.status === "failed");
  const running = tasks.find((t) => t.status === "running");

  return (
    <section className={cx("flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-4", className)}>
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-body-md-strong text-fg">{title}</h3>
        <p aria-live="polite" className="text-body-sm text-fg-secondary tabular-nums">
          {failed ? "Stopped on an error" : `${finished} of ${tasks.length} done`}
          <span className="sr-only">{running ? `. Now: ${running.label}` : ""}</span>
        </p>
      </header>

      <ol className="flex flex-col">
        <AnimatePresence initial={false}>
          {tasks.map((task, i) => {
            const last = i === tasks.length - 1;
            return (
              <motion.li
                key={task.id}
                layout="position"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : { ...layoutSpring, opacity: { duration: 0.25 }, filter: { duration: 0.3 } }}
                className="relative flex gap-3 pb-3 last:pb-0"
              >
                {/* Rail between status icons */}
                {!last && <span aria-hidden className="absolute start-2.5 top-6 bottom-0 w-px -translate-x-1/2 bg-line rtl:translate-x-1/2" />}
                <StatusIcon status={task.status} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-px">
                  <span
                    className={cx(
                      "text-body-md",
                      task.status === "running" && "text-shimmer text-body-md-strong",
                      task.status === "pending" && "text-fg-secondary",
                      (task.status === "done" || task.status === "skipped") && "text-fg-secondary",
                      task.status === "failed" && "text-fg",
                    )}
                  >
                    {task.label}
                    <span className="sr-only">, {STATUS_LABEL[task.status]}</span>
                  </span>
                  {task.detail && (
                    <span className={cx("text-body-sm", task.status === "failed" ? "text-status-danger-text" : "text-fg-secondary")}>{task.detail}</span>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </section>
  );
}
