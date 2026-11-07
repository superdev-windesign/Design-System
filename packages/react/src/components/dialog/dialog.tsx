"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
} from "react-aria-components";
import type { DialogProps as AriaDialogProps, ModalOverlayProps } from "react-aria-components";
import { RiCloseLine } from "@remixicon/react";
import { focusRing, focusRingNative } from "../../recipes/focus-ring";
import { OVERLAY_SCRIM } from "../../recipes/overlay";
import { cx } from "../../utils/cx";

/**
 * Modal and Dialog: a page laid over the page. `Modal` is the scrim and the
 * centred frame (a sheet rising from the bottom on narrow screens); `Dialog`
 * is the ruled page inside it, with a header, a scrolling body and a footer
 * on sunken paper. The same Dialog sits in a Drawer or a Popover and adapts
 * its frame to fit.
 *
 * ```tsx
 * <DialogTrigger>
 *   <Button>Edit profile</Button>
 *   <Modal size="md">
 *     <Dialog title="Edit profile" footer={({ close }) => <Button onPress={close}>Save</Button>}>
 *       …
 *     </Dialog>
 *   </Modal>
 * </DialogTrigger>
 * ```
 *
 * React Aria traps focus inside, restores it to the trigger on close, closes
 * on Escape and locks page scroll without shifting the layout.
 */

export { DialogTrigger };

/** Where the Dialog is framed, so it can square off the edges that touch the screen. */
export type DialogFrame = "modal" | "drawer-start" | "drawer-end" | "drawer-bottom";

export const DialogFrameContext = createContext<DialogFrame>("modal");

const FRAME: Record<DialogFrame, string> = {
  modal: "max-h-full rounded-overlay border shadow-overlay",
  "drawer-start": "h-full border-e",
  "drawer-end": "h-full border-s",
  "drawer-bottom": "max-h-full rounded-t-overlay border-t",
};

export type ModalSize = "sm" | "md" | "lg" | "xl";

const MODAL_WIDTH: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export interface ModalProps extends Omit<ModalOverlayProps, "children" | "className"> {
  /** Maximum width: sm 384, md 512 (default), lg 672, xl 896. */
  size?: ModalSize;
  className?: string;
  children: ReactNode;
}

export function Modal({ size = "md", className, isDismissable = true, children, ...props }: ModalProps) {
  return (
    <ModalOverlay
      {...props}
      isDismissable={isDismissable}
      className={cx(OVERLAY_SCRIM, "flex items-end justify-center p-3 sm:items-center sm:p-6")}
    >
      <AriaModal
        className={cx(
          "bui-modal flex max-h-[calc(100dvh-24px)] w-full",
          MODAL_WIDTH[size],
          "transition duration-(--ds-motion-duration-moderate) ease-enter motion-reduce:transition-none",
          "data-[entering]:translate-y-4 data-[entering]:opacity-0 sm:data-[entering]:translate-y-2",
          "data-[exiting]:translate-y-2 data-[exiting]:opacity-0 data-[exiting]:ease-out",
          className,
        )}
      >
        <DialogFrameContext.Provider value="modal">{children}</DialogFrameContext.Provider>
      </AriaModal>
    </ModalOverlay>
  );
}

type CloseRender = ReactNode | ((opts: { close: () => void }) => ReactNode);

export interface DialogProps extends Omit<AriaDialogProps, "children" | "className"> {
  /** The heading; also names the dialog. Without it, pass `aria-label`. */
  title?: ReactNode;
  /** One or two sentences under the title, read as the dialog's description. */
  description?: ReactNode;
  /** A small mono label above the title, e.g. "Settings · 02". */
  kicker?: ReactNode;
  children?: CloseRender;
  /** Actions, right-aligned on a sunken strip. A function receives `close`. */
  footer?: CloseRender;
  /** Show the close button in the header. Default true. */
  showClose?: boolean;
  className?: string;
  /** Classes for the scrolling body. */
  bodyClassName?: string;
}

const render = (node: CloseRender | undefined, close: () => void) => (typeof node === "function" ? node({ close }) : node);

export function Dialog({
  title,
  description,
  kicker,
  children,
  footer,
  showClose = true,
  className,
  bodyClassName,
  ...props
}: DialogProps) {
  const frame = useContext(DialogFrameContext);
  const descriptionId = useId();

  return (
    <AriaDialog
      aria-describedby={description ? descriptionId : undefined}
      {...props}
      data-frame={frame}
      className={cx("bui-dialog relative flex w-full flex-col overflow-hidden glass-panel", FRAME[frame], focusRingNative, className)}
    >
      {({ close }) => (
        <>
          {(title || kicker || showClose) && (
            <header className={cx("flex items-start gap-4 px-6 pt-5", title || description ? "border-b border-line pb-4" : "pb-1")}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {kicker && <p className="font-mono text-caption tracking-wide text-fg-secondary uppercase">{kicker}</p>}
                {title && (
                  <Heading slot="title" className="text-title-md-strong text-balance text-fg">
                    {title}
                  </Heading>
                )}
                {description && (
                  <p id={descriptionId} className="text-body-md text-pretty text-fg-secondary">
                    {description}
                  </p>
                )}
              </div>
              {showClose && <DialogCloseButton onPress={close} className="-me-2 -mt-1" />}
            </header>
          )}
          {children != null && (
            <div className={cx("min-h-0 flex-1 overflow-y-auto px-6 py-5 text-body-md text-fg", bodyClassName)}>{render(children, close)}</div>
          )}
          {footer != null && (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-sunken px-6 py-3.5">
              {render(footer, close)}
            </footer>
          )}
        </>
      )}
    </AriaDialog>
  );
}

/** The header's close control: a quiet square button with an × glyph. */
export function DialogCloseButton({ onPress, className, "aria-label": label = "Close" }: { onPress: () => void; className?: string; "aria-label"?: string }) {
  return (
    <AriaButton
      aria-label={label}
      onPress={onPress}
      className={cx(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control-md text-icon-secondary",
        "transition-colors duration-(--ds-motion-duration-base) data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-pressed",
        focusRing,
        className,
      )}
    >
      <RiCloseLine aria-hidden className="size-5" />
    </AriaButton>
  );
}
