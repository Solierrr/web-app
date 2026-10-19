import { useEffect, useRef, type ReactNode } from "react";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { SIDEBAR_ICON_SIZE } from "@@/layout/sidebar/Sidebar.styles";
interface SidePanelProps {
  open: boolean;
  wide?: boolean;
  title: string;
  closeLabel: string;
  closeDisabled?: boolean;
  onClose: () => void;
  trigger?: HTMLElement | null;
  children: ReactNode;
}
export default function SidePanel({ open, wide = false, title, closeLabel, onClose, trigger, children, closeDisabled }: SidePanelProps) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const origin = trigger ?? (document.activeElement as HTMLElement);
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function keydown(event: KeyboardEvent) {
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Tab" && window.matchMedia("(max-width: 1023px)").matches && wide) {
        const controls = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe",
          ) ?? [],
        ).filter((node) => node.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === "Escape" && ref.current?.contains(event.target as Node)) {
        event.preventDefault();
        close.current();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      if (origin?.isConnected) origin.focus();
    };
  }, [open, trigger, wide]);
  return (
    <aside
      ref={ref}
      aria-label={title}
      aria-hidden={!open}
      inert={!open}
      className={`flex min-h-0 shrink-0 flex-col overflow-hidden bg-operational-shell transition-[width] duration-250 motion-reduce:transition-none ${open ? (wide ? "fixed inset-y-0 right-0 z-30 w-full shadow-surface lg:static lg:z-auto lg:w-[45%] lg:max-w-160" : "h-1/2 w-full lg:h-full lg:w-96") : "h-0 w-0 pointer-events-none lg:h-full"}`}>
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 px-4 py-3">
        <h2 className="min-w-0 text-body font-semi-bold">{title}</h2>
        <ToolbarAction icon="x" iconSize={SIDEBAR_ICON_SIZE} label={closeLabel} disabled={closeDisabled} onClick={onClose} />
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </aside>
  );
}
