import { useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  label: string;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  placement?: "top" | "bottom";
  autoFocus?: boolean;
}

export default function Popover({ label, anchorRef, onClose, children, className = "", placement = "bottom", autoFocus = true }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const popup = ref.current;
    const anchor = anchorRef.current;
    if (!popup || !anchor) return;
    const previous = document.activeElement as HTMLElement | null;
    function position() {
      if (!popup || !anchor) return;
      const bounds = anchor.getBoundingClientRect();
      const margin = 16;
      popup.style.left = `${Math.max(margin, Math.min(bounds.right - popup.offsetWidth, window.innerWidth - popup.offsetWidth - margin))}px`;
      popup.style.top = `${Math.max(margin, Math.min(placement === "top" ? bounds.top - popup.offsetHeight - 8 : bounds.bottom + 8, window.innerHeight - popup.offsetHeight - margin))}px`;
    }
    function outside(event: PointerEvent) {
      if (document.querySelector("dialog[open]")) return;
      if (!popup?.contains(event.target as Node) && !anchor?.contains(event.target as Node)) onClose();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
    position();
    if (autoFocus) popup.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]')?.focus();
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      if (previous?.isConnected) previous.focus();
    };
  }, [anchorRef, onClose, placement, autoFocus]);
  return createPortal(
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={label}
      className={`fixed z-50 w-[calc(100vw-2rem)] max-w-xl rounded-medium bg-white p-4 text-body text-operational-ink shadow-overlay animate-fade-in ${className}`}>
      {children}
    </div>,
    document.body,
  );
}
