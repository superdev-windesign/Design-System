"use client";
// The dismissal behaviour was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The look is Windesign's own.

import type { ComponentType, HTMLAttributes, ReactNode, Ref } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RiShieldStarFill } from "@remixicon/react";
import { Button } from "../button/button";
import { CloseButton } from "../buttons/close-button";
import { cx, sortCx } from "../../utils/cx";

/**
 * A compact announcement / onboarding card sized for the sidebar (fills its
 * container — 236px inside the 260px sidebar), set like a printed notice: a
 * 2px accent rule across the top, an accent icon and a serif title.
 *
 *   card            flex-col, gap 12, p 12, rounded-surface, hairline border, no shadow
 *   ├─ content      flex-col, gap 4
 *   │  ├─ icon      20×20, accent (RiShieldStarFill by default)
 *   │  ├─ close     CloseButton size="xs" (absolute, top-right)
 *   │  └─ text      flex-col, gap 2
 *   │     ├─ title  display face, text-body-md-strong, fg
 *   │     └─ desc   text-body-sm-strong, fg-secondary
 *   └─ action       Button secondary / small, full width
 *
 * Everything after the title is optional:
 *   - `description` omitted → text block is title-only.
 *   - `actionLabel` omitted → no CTA button.
 *   - `dismissible` false → no close button.
 *
 * Dismissal is self-managed: clicking the close button fades the card out
 * with a small lift via `motion/react`, then unmounts and fires the
 * optional `onClose` callback. The leading `icon` defaults to the shield used
 * in the frame; pass any Remix Icon component reference (`RiSparklingFill`,
 * not `<RiSparklingFill />`).
 *
 * `introDelay` opts into a matching entrance: a fade, rising 8px into
 * place, after the given delay (seconds).
 * Off by default (card just appears) — set it for placements where the
 * banner should call attention after the surrounding UI has settled, e.g. the
 * sidebar slot in `DashboardSidebar`.
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface AnnouncementProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
  > {
  title: ReactNode;
  description?: ReactNode;
  /** Leading icon. Defaults to the shield-star from the Figma frame. */
  icon?: IconComponent;
  /** CTA label. When set, a full-width secondary button is rendered. */
  actionLabel?: ReactNode;
  onAction?: () => void;
  /** Show a dismiss button in the top-right corner. */
  dismissible?: boolean;
  /** Called once the dismiss exit animation finishes. */
  onClose?: () => void;
  /** Accessible name for the dismiss button. */
  closeLabel?: string;
  /**
   * Seconds to wait before playing the blur/fade/scale-up entrance. Omit to
   * skip the entrance entirely (card just appears).
   */
  introDelay?: number;
  ref?: Ref<HTMLDivElement>;
}

const styles = sortCx({
  card: [
    "relative flex w-full flex-col items-start gap-3 p-3",
    "overflow-hidden rounded-surface border border-line bg-surface",
    // The notice's rule across the top.
    "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-accent-600",
  ].join(" "),
  content: "flex w-full flex-col items-start gap-1",
  icon: "size-5 shrink-0 text-accent-600",
  close: "absolute end-3 top-3",
  text: "flex w-full flex-col items-start gap-0.5",
  title: "w-full font-display text-body-md-strong text-fg",
  description: "w-full text-body-sm-strong text-fg-secondary",
});

export function Announcement({
  title,
  description,
  icon: Icon = RiShieldStarFill,
  actionLabel,
  onAction,
  dismissible = false,
  onClose,
  closeLabel = "Dismiss",
  introDelay,
  className,
  ref,
  ...props
}: AnnouncementProps) {
  const [dismissed, setDismissed] = useState(false);
  const hasIntro = introDelay !== undefined;

  return (
    <AnimatePresence onExitComplete={onClose}>
      {!dismissed && (
        <motion.div
          ref={ref}
          initial={hasIntro ? { opacity: 0, y: 8 } : false}
          animate={
            hasIntro
              ? {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.25, ease: "easeOut", delay: introDelay },
                }
              : undefined
          }
          exit={{
            opacity: 0,
            y: -4,
            transition: { duration: 0.2, ease: "easeInOut" },
          }}
          className={cx(styles.card, className)}
          {...props}
        >
          <div className={styles.content}>
            <Icon className={styles.icon} aria-hidden />

            {dismissible ? (
              <CloseButton
                size="xs"
                aria-label={closeLabel}
                onClick={() => setDismissed(true)}
                className={styles.close}
              />
            ) : null}

            <div className={styles.text}>
              <p className={styles.title}>{title}</p>
              {description ? <p className={styles.description}>{description}</p> : null}
            </div>
          </div>

          {actionLabel ? (
            <Button
              variant="secondary"
              size="sm"
              onPress={onAction}
              className="w-full"
            >
              {actionLabel}
            </Button>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
