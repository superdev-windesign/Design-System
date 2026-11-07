"use client";

import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { layoutSpring } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { promptArt } from "../image-generation/generated-image";

/**
 * Profile deck: people as overlapping cards, with one drawn forward. Press a
 * card behind to bring it up, or arrow along them and press Space. The name sits
 * on a strip of glass across the card's foot, so it holds up on any portrait.
 */

export interface DeckProfile {
  id: string;
  name: string;
  role?: string;
  /** A portrait. Without one, the card gets art made from the name. */
  image?: string;
}

export interface ProfileDeckProps {
  "aria-label": string;
  profiles: DeckProfile[];
  defaultSelectedId?: string;
  onSelectionChange?: (id: string) => void;
  className?: string;
}

/** How a card sits for its distance from the chosen one: nearer is larger and further forward. */
export function deckPose(offset: number) {
  const distance = Math.abs(offset);
  return { x: `${offset * 44}%`, scale: 1 - distance * 0.16, zIndex: 10 - distance, opacity: distance > 2 ? 0 : 1 };
}

export function ProfileDeck({ "aria-label": ariaLabel, profiles, defaultSelectedId, onSelectionChange, className }: ProfileDeckProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(defaultSelectedId ?? profiles[Math.floor(profiles.length / 2)]?.id ?? "");
  const chosen = profiles.findIndex((profile) => profile.id === selected);

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[selected]}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next === undefined) return;
        setSelected(String(next));
        onSelectionChange?.(String(next));
      }}
      className={cx("relative mx-auto flex h-72 w-full max-w-sm items-center justify-center", className)}
    >
      {profiles.map(({ id, name, role, image }, index) => {
        const pose = deckPose(index - chosen);
        return (
          <motion.div
            key={id}
            initial={false}
            animate={{ x: pose.x, scale: pose.scale, opacity: pose.opacity }}
            transition={reduceMotion ? { duration: 0 } : layoutSpring}
            style={{ zIndex: pose.zIndex }}
            className="absolute aspect-3/4 h-full"
          >
            <ToggleButton
              id={id}
              aria-label={role ? `${name}, ${role}` : name}
              className={cx("relative isolate block size-full cursor-pointer overflow-hidden rounded-panel shadow-glass-lens", focusRing)}
              style={{ background: image ? `center / cover url(${image})` : promptArt(name) }}
            >
              <span className="glass-panel absolute inset-x-2 bottom-2 flex flex-col rounded-overlay border px-3 py-2 text-center">
                <span className="truncate text-body-md-strong text-fg">{name}</span>
                {role && <span className="truncate text-caption text-fg-secondary">{role}</span>}
              </span>
            </ToggleButton>
          </motion.div>
        );
      })}
    </ToggleButtonGroup>
  );
}
