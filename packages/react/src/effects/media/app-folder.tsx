"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { layoutSpring } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * AppFolder: a folder of apps that opens like a phone's. Closed, it's a tile
 * of tiny icons; opened, the tile swells into a panel and every icon grows into
 * place as a full button. It's a dialog: focus moves in, Escape or a tap
 * outside closes it, and focus returns to the folder.
 */

export interface AppFolderApp {
  id: string;
  label: string;
  /** The app's icon art, drawn to fill a square. */
  icon: ReactNode;
  onOpen?: () => void;
}

export interface AppFolderProps {
  name: string;
  apps: AppFolderApp[];
  className?: string;
}

export function AppFolder({ name, apps, className }: AppFolderProps) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const calm = useCalmMotion();
  const id = (part: string) => (calm ? undefined : `${uid}-${part}`);

  return (
    <LayoutGroup id={uid}>
      <div className={cx("inline-flex flex-col items-center gap-2", className)}>
        <motion.button
          type="button"
          layoutId={id("folder")}
          transition={layoutSpring}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${name}, folder with ${apps.length} apps`}
          className={cx("grid size-20 cursor-pointer grid-cols-3 gap-1 rounded-2xl bg-muted p-2.5 shadow-raised", focusRingNative)}
        >
          {apps.slice(0, 9).map((app) => (
            <motion.span key={app.id} layoutId={id(app.id)} transition={layoutSpring} className="aspect-square overflow-hidden rounded-xs">
              {app.icon}
            </motion.span>
          ))}
        </motion.button>
        <span className="text-caption-strong text-fg">{name}</span>
      </div>

      {/* No exit animation: closing hands the icons back to the folder, which they glide into. */}
      {open && (
        <ModalOverlay isOpen isDismissable onOpenChange={setOpen} className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div aria-hidden className="absolute inset-0 bg-scrim backdrop-blur-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <Modal className="relative outline-none">
            <Dialog className="flex flex-col items-center gap-4 outline-none">
              <Heading slot="title" className="text-title-md-strong text-on-action">
                {name}
              </Heading>
              <motion.div layoutId={id("folder")} transition={layoutSpring} className="grid grid-cols-3 gap-5 rounded-3xl bg-surface p-6 shadow-overlay">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      app.onOpen?.();
                      setOpen(false);
                    }}
                    className={cx("flex w-18 cursor-pointer flex-col items-center gap-1.5 rounded-control-md", focusRingNative)}
                  >
                    <motion.span layoutId={id(app.id)} transition={layoutSpring} className="block size-14 overflow-hidden rounded-xl shadow-raised">
                      {app.icon}
                    </motion.span>
                    <span className="w-full truncate text-center text-caption text-fg">{app.label}</span>
                  </button>
                ))}
              </motion.div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      )}
    </LayoutGroup>
  );
}
