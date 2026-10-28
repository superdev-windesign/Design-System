"use client";
// Adapted from BoardUI (MIT) — components/application/notification-center/notification-center.tsx. See THIRD_PARTY_NOTICES.md.

import { useTemplateCopy } from "../../foundations/template-copy";

import type { ComponentType, HTMLAttributes, Ref } from "react";
import { useMemo, useState } from "react";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiNotification3Fill,
  RiNotificationOffLine,
} from "@remixicon/react";
import { Avatar, type AvatarProps } from "../../components/avatar/avatar";
import { Button, type ButtonProps } from "../../components/button/button";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../../components/segmented-control/segmented-control";
import { cx, sortCx } from "../../utils/cx";

export type NotificationCenterTab = "all" | "mentions" | "system";
export type NotificationCenterCategory = Exclude<NotificationCenterTab, "all"> | "activity";
export type NotificationCenterStatus = "neutral" | "information" | "success" | "error";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type NotificationCenterAction = {
  id: string;
  label: string;
  variant?: ButtonProps["variant"];
};

export type NotificationCenterItem = {
  id: string;
  category: NotificationCenterCategory;
  group: string;
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
  status?: NotificationCenterStatus;
  icon?: IconComponent;
  avatar?: Pick<AvatarProps, "src" | "alt" | "initials" | "color">;
  actions?: NotificationCenterAction[];
};

export interface NotificationCenterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  notifications: NotificationCenterItem[];
  defaultTab?: NotificationCenterTab;
  tab?: NotificationCenterTab;
  onTabChange?: (tab: NotificationCenterTab) => void;
  onAction?: (notificationId: string, actionId: string) => void;
  title?: string;
  emptyMessage?: string;
  ref?: Ref<HTMLDivElement>;
}

const STATUS_ICON: Record<NotificationCenterStatus, IconComponent> = {
  neutral: RiNotification3Fill,
  information: RiInformationFill,
  success: RiCheckboxCircleFill,
  error: RiErrorWarningFill,
};

const styles = sortCx({
  status: {
    neutral: "bg-muted text-fg-secondary",
    information:
      "bg-status-info text-status-info-fg",
    success: "bg-status-success text-status-success-fg",
    error: "bg-status-danger text-status-danger-fg",
  },
});

const TABS: { id: NotificationCenterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "system", label: "System" },
];

function NotificationVisual({ item }: { item: NotificationCenterItem }) {
  const localize = useTemplateCopy();
  if (item.avatar) {
    return localize(<Avatar {...item.avatar} size="lg" className="size-10" />);
  }

  const status = item.status ?? "neutral";
  const Icon = item.icon ?? STATUS_ICON[status];

  return localize((
    <span
      className={cx(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        styles.status[status],
      )}
    >
      <Icon className="size-5" aria-hidden />
    </span>
  ));
}

function TabLabel({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  const localize = useTemplateCopy();
  return localize((
    <span className="inline-flex items-center gap-1.5">
      {label}
      <span className="inline-flex min-w-5 items-center justify-center rounded-sm bg-badge-neutral px-1 py-px text-caption-strong text-fg-secondary">
        {count}
      </span>
    </span>
  ));
}

export function NotificationCenter({
  notifications,
  defaultTab = "all",
  tab,
  onTabChange,
  onAction,
  title = "Notifications",
  emptyMessage = "You’re all caught up.",
  className,
  ref,
  ...props
}: NotificationCenterProps) {
  const localize = useTemplateCopy();
  const [internalTab, setInternalTab] = useState<NotificationCenterTab>(defaultTab);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const activeTab = tab ?? internalTab;

  const setTab = (nextTab: NotificationCenterTab) => {
    if (tab === undefined) setInternalTab(nextTab);
    onTabChange?.(nextTab);
  };

  const isUnread = (item: NotificationCenterItem) => item.unread === true && !readIds.has(item.id);
  const unreadCount = notifications.filter(isUnread).length;

  const tabCounts = useMemo(
    () => ({
      all: notifications.length,
      mentions: notifications.filter((item) => item.category === "mentions").length,
      system: notifications.filter((item) => item.category === "system").length,
    }),
    [notifications],
  );

  const visibleNotifications = useMemo(
    () =>
      activeTab === "all"
        ? notifications
        : notifications.filter((item) => item.category === activeTab),
    [activeTab, notifications],
  );

  const markAllRead = () => {
    setReadIds(new Set(notifications.filter((item) => item.unread).map((item) => item.id)));
  };

  return localize((
    <section
      ref={ref}
      aria-label={title}
      className={cx(
        "flex w-full max-w-107.5 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-overlay",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 p-4 pb-1.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-title-sm-strong text-fg">{title}</h2>
            <p className="text-body-md text-fg-secondary">
              {unreadCount === 0 ? "No unread notifications" : `${unreadCount} unread`}
            </p>
          </div>
          <Button
            variant="tertiary"
            size="sm"
            onPress={markAllRead}
            isDisabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>

        <SegmentedControl
          aria-label="Notification category"
          selectedKeys={[activeTab]}
          onSelectionChange={(keys) => {
            const next = [...(keys as Set<string>)][0] as NotificationCenterTab | undefined;
            if (next) setTab(next);
          }}
          className="flex w-full"
        >
          {TABS.map(({ id, label }) => (
            <SegmentedControlItem
              key={id}
              id={id}
              className="flex-1"
            >
              <TabLabel label={label} count={tabCounts[id]} />
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <div className="bg-surface p-1.5">
        <div className="overflow-hidden rounded-2xl bg-sunken">
          <div className="max-h-129 overflow-y-auto overscroll-contain bg-sunken p-2">
            {visibleNotifications.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl bg-surface px-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-sunken text-icon-secondary">
                  <RiNotificationOffLine className="size-5" aria-hidden />
                </span>
                <p className="text-body-md-strong text-fg">{emptyMessage}</p>
                <p className="max-w-64 text-body-md text-fg-secondary">
                  New activity will appear here when it arrives.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleNotifications.map((item) => {
                  const unread = isUnread(item);
                  return (
                    <article
                      key={item.id}
                      className="group/item relative flex gap-3 rounded-2lg bg-surface px-3 py-3"
                    >
                      <NotificationVisual item={item} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <p className="min-w-0 text-body-md-strong text-fg">{item.title}</p>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-caption-strong whitespace-nowrap text-fg-tertiary">
                              {item.timestamp}
                            </span>
                            {unread ? (
                              <span
                                className="size-2 rounded-full bg-accent-500"
                                aria-label="Unread"
                              />
                            ) : null}
                          </div>
                        </div>
                        <p className="text-body-md text-fg-secondary">{item.description}</p>
                        {item.actions?.length ? (
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            {item.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant={action.variant ?? "secondary"}
                                onPress={() => {
                                  setReadIds((current) => new Set(current).add(item.id));
                                  onAction?.(item.id, action.id);
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  ));
}
