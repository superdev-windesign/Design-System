import { useId } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

/**
 * CurvedText: text set around a circle, like a badge or a stamp, that can turn
 * slowly. Put an icon or logo in the middle with `children`. The text is the
 * figure's accessible name; with reduced motion it stands still.
 */

export type CurvedTextSize = "sm" | "md" | "lg";

export interface CurvedTextProps {
  text: string;
  /** Turn slowly. */
  spin?: boolean;
  size?: CurvedTextSize;
  /** Content for the centre. */
  children?: ReactNode;
  className?: string;
}

const SIZE: Record<CurvedTextSize, string> = { sm: "size-24", md: "size-36", lg: "size-48" };

export function CurvedText({ text, spin = true, size = "md", children, className }: CurvedTextProps) {
  const id = useId().replace(/:/g, "");
  return (
    <span role="img" aria-label={text} className={cx("relative inline-flex items-center justify-center uppercase", SIZE[size], className)}>
      <svg viewBox="0 0 100 100" aria-hidden className={cx("absolute inset-0 size-full overflow-visible fill-current font-sans font-semibold", spin && "animate-turn")}>
        <path id={`curve-${id}`} d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
        {/* Sized in the drawing's own units, so the text scales with the badge. */}
        <text fontSize={10}>
          {/* The circle's circumference is about 251 units; spread the text round all of it. */}
          <textPath href={`#curve-${id}`} textLength={248} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      {children && <span className="relative flex items-center justify-center">{children}</span>}
    </span>
  );
}
