import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/styles/colors/colors.enum";
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
export const ContextMenu = forwardRef<ContextMenuHandle, ContextMenuProps>(
  function ContextMenu({ className }, ref) {
    const [position, setPosition] = useState<Position | null>(null);
    const [items, setItems] = useState<ContextMenuItem[]>([]);
    const menuRef = useRef<HTMLUListElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        open: (items, x, y) => {
          setItems(items);
          setPosition({ x, y });
        },
        close: () => setPosition(null),
      }),
      [],
    );

    useEffect(() => {
      if (!position) return;

      function handlePointerDown(event: MouseEvent) {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setPosition(null);
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") setPosition(null);
      }

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [position]);

    useLayoutEffect(() => {
      if (!position || !menuRef.current) return;

      const { innerWidth, innerHeight } = window;
      const { width, height } = menuRef.current.getBoundingClientRect();

      const x = Math.min(position.x, innerWidth - width);
      const y = Math.min(position.y, innerHeight - height);

      menuRef.current.style.left = `${Math.max(x, 0)}px`;
      menuRef.current.style.top = `${Math.max(y, 0)}px`;
    }, [position]);

    function handleSelect(item: ContextMenuItem) {
      item.onClick();
      setPosition(null);
    }

    if (!position) return null;

    return createPortal(
      <MenuList
        ref={menuRef}
        role="menu"
        className={`fixed z-50 min-w-40 py-1 animate-fade-in ${className ?? ""}`}
        style={{ left: position.x, top: position.y }}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            role="menuitem"
            disabled={item.disabled}
            onSelect={() => handleSelect(item)}
          >
            {item.icon && (
              <Icon
                name={item.icon}
                size={18}
                color={item.disabled ? Colors.INPUTICON : Colors.BLACK}
              />
            )}
            {item.label}
          </MenuItem>
        ))}
      </MenuList>,
      document.body,
    );
  },
);
