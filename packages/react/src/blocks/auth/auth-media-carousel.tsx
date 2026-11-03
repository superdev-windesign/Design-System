"use client";
// The slot this fills was first adapted from BoardUI (MIT); see THIRD_PARTY_NOTICES.md.
// The transition is Windesign's own.

import { useEffect, useState } from "react";
import { cx } from "../../utils/cx";

/**
 * Auto-advancing artwork for the auth card's `media` slot.
 *
 * Each change reads like turning to the next plate in a book: the incoming
 * image is drawn across the outgoing one by a crisp wipe from the inline-end
 * edge (mirrored in right-to-left layouts), and the outgoing image stays put
 * beneath it until it is covered. Nothing shrinks, tilts or slides; one
 * image simply replaces another. The wipe is `animate-plate-in` in
 * packages/styles.
 *
 * A row of short rules at the foot shows where the set has got to, the same
 * ruler as Carousel, in white so it reads over the artwork.
 *
 * Plain `<img>` rather than `next/image`: this file installs into other
 * people's projects, and it should not decide their image pipeline for them.
 * The first slide is eager and the rest lazy, so the card paints immediately
 * without pulling four files at once.
 *
 * It advances on its own and offers no controls. The artwork beside a sign-in
 * form is atmosphere, not content — a visitor is there to get in, and giving
 * them arrows to click is inviting them away from the thing they came to do.
 * Honouring `prefers-reduced-motion` means holding on the first slide.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface AuthMediaSlide {
  src: string;
  /** Decorative by default: the artwork carries no information the form needs. */
  alt?: string;
}

export function AuthMediaCarousel({
  slides,
  interval = 3200,
  className,
}: {
  slides: AuthMediaSlide[];
  /** Milliseconds each slide rests before the next is drawn over it. */
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const timer = window.setTimeout(() => {
      setPrevious(index);
      setIndex((index + 1) % count);
    }, interval);
    return () => window.clearTimeout(timer);
  }, [index, count, interval]);

  return (
    <div className={cx("absolute inset-0 overflow-hidden", className)}>
      {slides.map((slide, slideIndex) => {
        const current = slideIndex === index;
        // The outgoing plate stays beneath until the wipe has covered it.
        const underneath = slideIndex === previous;
        return (
          // Deliberate: this file installs into other projects and should not
          // require next/image. Swap it for your own loader if you have one.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt ?? ""}
            aria-hidden={slide.alt ? undefined : true}
            loading={slideIndex === 0 ? "eager" : "lazy"}
            className={cx(
              "absolute inset-0 size-full object-cover",
              current ? "z-10" : underneath ? "z-0" : "invisible",
              // The first slide is simply there; every later one is drawn in.
              current && previous !== null && "animate-plate-in",
            )}
          />
        );
      })}

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-1">
          {slides.map((slide, slideIndex) => (
            <span
              key={slide.src}
              aria-hidden
              className={cx(
                "h-0.5 rounded-full bg-white transition-[width,opacity] duration-(--ds-motion-duration-slow) ease-out",
                slideIndex === index ? "w-6 opacity-90" : "w-3 opacity-50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
