import { useEffect, useRef, useState, type RefObject } from "react";
let openDialogs = 0;
let originalOverflow = "";
export function useDialog(ref: RefObject<HTMLDialogElement | null>) {
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    if (openDialogs++ === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    return () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      dialog.close?.();
      if (--openDialogs === 0) document.body.style.overflow = originalOverflow;
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
