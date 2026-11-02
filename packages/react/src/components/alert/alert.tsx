"use client";

import type { ReactNode } from "react";
import { RiCheckboxCircleLine, RiCloseLine, RiErrorWarningLine, RiInformationLine, RiAlertLine } from "@remixicon/react";
import type { IconComponent } from "../button/button";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";

/**
 * Alert: a message inside the page about the content around it (a callout
 * in documentation, "Your trial ends in 3 days", a failed save). Tones are
 * neutral, info, success, warning and danger; each has its own icon too, so
 * the meaning doesn't rest on colour.
 *
 * Static callouts need no role. One that appears in response to something
 * should be announced: `announce="polite"` for news, `"assertive"` for
 * errors that need attention now. For a transient confirmation, use Toast.
 */

export type AlertTone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE: Record<AlertTone, { box: string; accent: string; icon: IconComponent }> = {
  neutral: { box: "bg-sunken border-line", accent: "text-fg", icon: RiInformationLine },
  info: { box: "bg-status-info border-transparent", accent: "text-status-info-text", icon: RiInformationLine },
  success: { box: "bg-status-success border-transparent", accent: "text-status-success-text", icon: RiCheckboxCircleLine },
  warning: { box: "bg-status-warning border-transparent", accent: "text-status-warning-text", icon: RiAlertLine },
  danger: { box: "bg-status-danger border-transparent", accent: "text-status-danger-text", icon: RiErrorWarningLine },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** Replace the tone's icon, or `null` for none. */
  icon?: IconComponent | null;
  /** Buttons or links under the message. */
  actions?: ReactNode;
  /** Shows a close button. */
  onDismiss?: () => void;
  announce?: "polite" | "assertive";
  className?: string;
}

export function Alert({ tone = "neutral", title, children, icon, actions, onDismiss, announce, className }: AlertProps) {
  const t = TONE[tone];
  const Icon = icon === null ? null : (icon ?? t.icon);
  return (
    <div
      role={announce === "assertive" ? "alert" : announce === "polite" ? "status" : undefined}
      className={cx("relative flex gap-3 rounded-surface border p-4", t.box, className)}
    >
      {Icon && <Icon aria-hidden className={cx("mt-px size-5 shrink-0", t.accent)} />}
      <div className={cx("flex min-w-0 flex-1 flex-col gap-1", onDismiss && "pe-6")}>
        {title && <p className={cx("text-body-md-strong", t.accent)}>{title}</p>}
        {children && <div className="text-body-md text-pretty text-fg">{children}</div>}
        {actions && <div className="mt-2 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className={cx(
            "absolute end-2.5 top-2.5 flex size-7 cursor-pointer items-center justify-center rounded-control-sm text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg",
            focusRingNative,
          )}
        >
          <RiCloseLine aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
