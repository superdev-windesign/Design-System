"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { RiCloseLine } from "@remixicon/react";
import { IconButton } from "../../components/buttons/icon-button";
import { layoutSpring } from "../../motion/tokens";
import { focusRingNative } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { useCalmMotion } from "../shared";

/**
 * ExpandableCards: a grid of cards where opening one grows it, in place, into a
 * dialog with the full story, the way the App Store opens a feature. The media
 * and title glide from the card to the dialog and back. The dialog is a real
 * modal: focus moves into it, Escape and the backdrop close it, and focus
 * returns to the card. With reduced motion it simply appears.
 */

export interface ExpandableCardItem {
  id: string;
  title: string;
  description?: string;
  /** Art for the top of the card: an image, an illustration, a gradient. */
  media: ReactNode;
  /** What the dialog adds. */
  content: ReactNode;
}

export interface ExpandableCardsProps {
  items: ExpandableCardItem[];
  className?: string;
}

export function ExpandableCards({ items, className }: ExpandableCardsProps) {
  const [active, setActive] = useState<ExpandableCardItem | null>(null);
  const uid = useId();
  const calm = useCalmMotion();
  const layout = (part: string, id: string) => (calm ? undefined : `${uid}-${part}-${id}`);

  return (
    <LayoutGroup id={uid}>
      <ul className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
        {items.map((item) => (
          <li key={item.id}>
            <motion.button
              type="button"
              layoutId={layout("card", item.id)}
              transition={layoutSpring}
              onClick={() => setActive(item)}
              aria-haspopup="dialog"
              className={cx("flex w-full cursor-pointer flex-col overflow-hidden rounded-surface border border-line bg-surface text-start", focusRingNative)}
            >
              <motion.div layoutId={layout("media", item.id)} transition={layoutSpring} className="h-32 overflow-hidden">
                {item.media}
              </motion.div>
              <div className="flex flex-col gap-0.5 p-4">
                <motion.span layoutId={layout("title", item.id)} transition={layoutSpring} className="text-body-md-strong text-fg">
                  {item.title}
                </motion.span>
                {item.description && <span className="text-body-sm text-fg-secondary">{item.description}</span>}
              </div>
            </motion.button>
          </li>
        ))}
      </ul>

      {/* No exit animation: closing hands the layout back to the card, which glides home. */}
      {active && (
        <ModalOverlay
          isOpen
          isDismissable
          onOpenChange={(open) => !open && setActive(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div aria-hidden className="absolute inset-0 bg-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <Modal className="relative w-full max-w-lg outline-none">
            <Dialog className="outline-none">
              <motion.div layoutId={layout("card", active.id)} transition={layoutSpring} className="overflow-hidden rounded-overlay bg-surface shadow-overlay">
                <motion.div layoutId={layout("media", active.id)} transition={layoutSpring} className="h-56 overflow-hidden">
                  {active.media}
                </motion.div>
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <Heading slot="title" className="text-title-md-strong text-fg">
                      <motion.span layoutId={layout("title", active.id)} transition={layoutSpring} className="inline-block">
                        {active.title}
                      </motion.span>
                    </Heading>
                    <IconButton icon={RiCloseLine} size="small" aria-label="Close" onClick={() => setActive(null)} />
                  </div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-body-md text-fg-secondary">
                    {active.content}
                  </motion.div>
                </div>
              </motion.div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      )}
    </LayoutGroup>
  );
}
