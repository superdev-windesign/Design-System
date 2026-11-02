"use client";

import { useState, type ReactNode } from "react";
import { Dialog as AriaDialog, Heading } from "react-aria-components";
import type { ModalOverlayProps } from "react-aria-components";
import { RiErrorWarningLine, RiQuestionLine } from "@remixicon/react";
import { Button } from "../button/button";
import { Spinner } from "../spinner/spinner";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { Modal } from "./dialog";

/**
 * AlertDialog: an interruption that asks for a decision before going on. It
 * renders its own Modal, so put it straight inside a DialogTrigger, or
 * control it with `isOpen` / `onOpenChange`.
 *
 * It isn't dismissed by clicking the backdrop (Escape still cancels). A
 * `danger` dialog focuses Cancel first, so a stray Enter can't destroy
 * anything. If `onPrimaryAction` returns a promise, both buttons wait for it
 * and the dialog closes once it settles successfully.
 */

export interface AlertDialogProps extends Omit<ModalOverlayProps, "children" | "className" | "isDismissable"> {
  title: ReactNode;
  children: ReactNode;
  variant?: "default" | "danger";
  primaryActionLabel: string;
  /** Default "Cancel". */
  cancelLabel?: string;
  /** An optional third choice, e.g. "Save as draft". */
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void | Promise<unknown>;
  onSecondaryAction?: () => void;
  onCancel?: () => void;
  isPrimaryActionDisabled?: boolean;
}

export function AlertDialog({
  title,
  children,
  variant = "default",
  primaryActionLabel,
  cancelLabel = "Cancel",
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  onCancel,
  isPrimaryActionDisabled,
  ...overlayProps
}: AlertDialogProps) {
  const [pending, setPending] = useState(false);
  const Icon = variant === "danger" ? RiErrorWarningLine : RiQuestionLine;

  return (
    <Modal size="sm" isDismissable={false} isKeyboardDismissDisabled={pending} {...overlayProps}>
      <AriaDialog role="alertdialog" className={cx("flex w-full flex-col overflow-hidden rounded-overlay border border-line bg-surface shadow-overlay", focusRingNative)}>
        {({ close }) => {
          const run = async () => {
            const result = onPrimaryAction?.();
            if (result instanceof Promise) {
              setPending(true);
              try {
                await result;
                close();
              } catch {
                // The caller reports the failure; the dialog stays open to retry.
              } finally {
                setPending(false);
              }
            } else close();
          };
          return (
            <>
              <div className="flex gap-4 px-6 pt-6 pb-5">
                <span
                  aria-hidden
                  className={cx(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    variant === "danger" ? "bg-status-danger text-status-danger-text" : "bg-muted text-icon-secondary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex min-w-0 flex-col gap-1.5 pt-1.5">
                  <Heading slot="title" className="text-title-sm-strong text-balance text-fg">
                    {title}
                  </Heading>
                  <div className="text-body-md text-pretty text-fg-secondary">{children}</div>
                </div>
              </div>
              <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-sunken px-6 py-3.5">
                {secondaryActionLabel && (
                  <Button
                    variant="tertiary"
                    isDisabled={pending}
                    className="me-auto"
                    onPress={() => {
                      onSecondaryAction?.();
                      close();
                    }}
                  >
                    {secondaryActionLabel}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  autoFocus={variant === "danger"}
                  isDisabled={pending}
                  onPress={() => {
                    onCancel?.();
                    close();
                  }}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={variant === "danger" ? "danger" : "primary"}
                  autoFocus={variant !== "danger"}
                  isDisabled={isPrimaryActionDisabled}
                  isPending={pending}
                  leadingIcon={pending ? Spinner : undefined}
                  onPress={run}
                >
                  {primaryActionLabel}
                </Button>
              </footer>
            </>
          );
        }}
      </AriaDialog>
    </Modal>
  );
}
