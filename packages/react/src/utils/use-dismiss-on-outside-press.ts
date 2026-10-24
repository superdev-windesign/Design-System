// Adapted from BoardUI (MIT) — utils/use-dismiss-on-outside-press.ts. See THIRD_PARTY_NOTICES.md.
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * React Aria couples a non-modal popover (`isNonModal`, chosen to avoid the
 * modal scroll lock) with "not dismissable on outside press". This restores
 * only the outside-press dismissal: a pointerdown outside every given ref
 * (usually the trigger and the popover) closes it.
 */
export function useDismissOnOutsidePress(
  isOpen: boolean,
  onDismiss: () => void,
  refs: RefObject<HTMLElement | null>[],
) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isOpen, onDismiss, refs]);
}

/**
 * Companion fix for the same non-modal popovers: pressing the trigger while
 * open should close the popover, but React Aria fires `onOpenChange(false)`
 * and then `onOpenChange(true)` within one press. This swallows that reopen.
 *
 *   const allowOpenChange = useTriggerToggle(isOpen, triggerRef);
 *   <AriaSelect onOpenChange={(o) => allowOpenChange(o) && setIsOpen(o)} …
 */
export function useTriggerToggle(isOpen: boolean, triggerRef: RefObject<HTMLElement | null>) {
  const suppressReopenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node)) return;
      suppressReopenRef.current = true;
      // Only the very next open within this click may be swallowed.
      setTimeout(() => {
        suppressReopenRef.current = false;
      }, 400);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isOpen, triggerRef]);

  return (next: boolean) => {
    if (next && suppressReopenRef.current) {
      suppressReopenRef.current = false;
      return false;
    }
    return true;
  };
}
