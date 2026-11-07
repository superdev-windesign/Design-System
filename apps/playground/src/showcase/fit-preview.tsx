import { createContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** True inside a card, so a demo can drop the room it only needs on its own page. */
export const InPreview = createContext(false);

/**
 * Shrinks a preview to fit its card, so a tall component shows whole rather than
 * cropped to its middle. It never enlarges, and it measures the component at
 * its real width, so the component lays out as it would on its own page.
 */
export function FitPreview({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = box.current;
    const inner = content.current;
    if (!outer || !inner) return;
    // offsetHeight ignores the scale, so measuring can't feed back into itself.
    const measure = () => setScale(Math.min(1, outer.clientHeight / Math.max(1, inner.offsetHeight)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="flex size-full items-center justify-center overflow-hidden">
      <div ref={content} className="flex w-full shrink-0 justify-center" style={{ scale }}>
        <InPreview.Provider value>{children}</InPreview.Provider>
      </div>
    </div>
  );
}
