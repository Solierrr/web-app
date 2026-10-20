import { useEffect, useRef, useState, type RefObject } from "react";
const bodyLocks = new WeakMap<HTMLElement, { count: number; originalOverflow: string }>();
function lockBody(body: HTMLElement) {
  let lock = bodyLocks.get(body);
  if (!lock) {
    lock = { count: 0, originalOverflow: body.style.overflow };
    bodyLocks.set(body, lock);
  }
  if (lock.count++ === 0) body.style.overflow = "hidden";
  return () => {
    lock!.count--;
    if (lock!.count === 0) {
      body.style.overflow = lock!.originalOverflow;
      bodyLocks.delete(body);
    }
  };
}
export function useDialog(ref: RefObject<HTMLDialogElement | null>) {
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const unlockBody = lockBody(dialog.ownerDocument.body);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    return () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      dialog.close?.();
      unlockBody();
      previous?.focus();
    };
  }, [ref]);
  function close(onClose: () => void) {
    if (closeTimer.current !== null) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
    const duration = Number.parseFloat(getComputedStyle(ref.current!).getPropertyValue("--duration-dialog")) || 180;
    closeTimer.current = setTimeout(onClose, duration);
  }
  return { closing, close };
}
