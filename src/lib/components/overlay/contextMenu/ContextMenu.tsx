import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import { MenuList, MenuItem } from "@@/overlay/Menu";

export interface ContextMenuItem {
  label: string;
  icon?: IconName;
  onClick: () => void;
  disabled?: boolean;
}

export interface ContextMenuHandle {
  open: (items: ContextMenuItem[], x: number, y: number) => void;
  close: () => void;
}

interface ContextMenuProps {
  className?: string;
  header?: ReactNode;
  id?: string;
  label?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
  align?: "start" | "end";
  portalWithinDialog?: boolean;
}

interface Position {
  x: number;
  y: number;
}

/**
 * ContextMenu
 *
 * Menu de contexto customizado, aberto de forma imperativa via `ref` (ex.: a
 * partir de um `onContextMenu` ou do clique num botão "⋮"), em vez de embrulhar
 * um trigger fixo. Os itens são passados a cada chamada de `open`, então uma
 * única instância pode ser reaproveitada por qualquer trigger (ver
 * `ContextMenuProvider` para uma instância global compartilhada). Renderizado
 * em portal (`document.body`) para não ser cortado por containers com
 * `overflow-hidden`, e reposicionado para não ultrapassar a viewport.
 *
 * @param props - Propriedades do componente.
 *
 * @returns O componente de menu de contexto renderizado (via portal).
 */
export const ContextMenu = forwardRef<ContextMenuHandle, ContextMenuProps>(function ContextMenu(
  { className, header, id, label, onClose, autoFocus = false, triggerRef, align = "start", portalWithinDialog = false },
  ref,
) {
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const menuRef = useRef<HTMLUListElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (items, x, y) => {
        setPortalRoot(portalWithinDialog ? (triggerRef?.current?.closest('[role="dialog"]') ?? null) : null);
        setItems(items);
        setPosition({ x, y });
      },
      close: () => {
        setPosition(null);
        onClose?.();
      },
    }),
    [onClose, portalWithinDialog, triggerRef],
  );

  useEffect(() => {
    if (!position) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !triggerRef?.current?.contains(event.target as Node)) {
        setPosition(null);
        onClose?.();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPosition(null);
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [position, onClose, triggerRef]);

  useLayoutEffect(() => {
    if (!position || !menuRef.current) return;

    const menu = menuRef.current;
    function updatePosition() {
      const viewport = window.visualViewport;
      const left = (viewport?.offsetLeft ?? 0) + 8;
      const top = (viewport?.offsetTop ?? 0) + 8;
      const right = left + (viewport?.width ?? window.innerWidth) - 16;
      const bottom = top + (viewport?.height ?? window.innerHeight) - 16;
      menu.style.minWidth = `${Math.min(160, Math.max(0, right - left))}px`;
      menu.style.maxWidth = `${Math.max(0, right - left)}px`;
      const anchor = triggerRef?.current?.getBoundingClientRect();
      const below = Math.max(top, Math.min(anchor ? anchor.bottom + 8 : position!.y, bottom));
      const above = Math.max(top, Math.min(anchor ? anchor.top - 8 : position!.y, bottom));
      const belowSpace = Math.max(0, bottom - below);
      const aboveSpace = Math.max(0, above - top);
      const upwards = menu.scrollHeight > belowSpace && aboveSpace > belowSpace;
      menu.style.maxHeight = `${upwards ? aboveSpace : belowSpace}px`;
      const { width, height } = menu.getBoundingClientRect();
      const anchorX = anchor ? (align === "end" ? anchor.right : anchor.left) : position!.x;
      const x = align === "end" ? anchorX - width : anchorX;
      menu.style.left = `${Math.max(left, Math.min(x, right - width))}px`;
      menu.style.top = `${Math.max(top, Math.min(upwards ? above - height : below, bottom - height))}px`;
    }
    updatePosition();
    if (autoFocus) menu.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus({ preventScroll: true });
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updatePosition);
    observer?.observe(menu);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [position, autoFocus, align, triggerRef]);

  function handleSelect(item: ContextMenuItem) {
    item.onClick();
    setPosition(null);
    onClose?.();
  }

  if (!position) return null;

  return createPortal(
    <MenuList
      ref={menuRef}
      id={id}
      aria-label={label}
      role="menu"
      onKeyDown={(event) => {
        if (!autoFocus) return;
        if (event.key === "Tab") {
          setPosition(null);
          onClose?.();
          return;
        }
        const entries = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
        const index = entries.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === "ArrowDown"
            ? (index + 1) % entries.length
            : event.key === "ArrowUp"
              ? (index - 1 + entries.length) % entries.length
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? entries.length - 1
                  : -1;
        if (next >= 0) {
          event.preventDefault();
          entries[next]?.focus();
        }
      }}
      className={`fixed z-50 min-w-40 py-1 animate-fade-in ${className ?? ""}`}
      style={{ left: position.x, top: position.y, overflowY: "auto", overflowWrap: "anywhere" }}>
      {header && (
        <li role="presentation" className="px-4 py-3">
          {header}
        </li>
      )}
      {items.map((item, index) => (
        <MenuItem key={index} role="menuitem" disabled={item.disabled} onSelect={() => handleSelect(item)}>
          {item.icon && <Icon name={item.icon} size={18} color={item.disabled ? Colors.INPUTICON : Colors.BLACK} />}
          {item.label}
        </MenuItem>
      ))}
    </MenuList>,
    portalRoot ?? document.body,
  );
});
