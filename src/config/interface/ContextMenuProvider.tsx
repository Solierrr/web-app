import { useMemo, useRef } from "react";
import { ContextMenu, type ContextMenuHandle } from "@/config/interface/ContextMenu";
import { ContextMenuContext, type ContextMenuContextValue } from "@/config/interface/ContextMenuContext";

interface ContextMenuProviderProps {
  children: React.ReactNode;
}

/**
 * ContextMenuProvider
 *
 * Monta uma única instância global de `ContextMenu` e a disponibiliza via
 * `useContextMenu()` para qualquer componente da árvore, sem que cada tela
 * precise gerenciar seu próprio `ref` ou renderizar o menu.
 *
 * @param props - Propriedades do componente.
 * @param props.children - Árvore que terá acesso ao menu de contexto global.
 *
 * @returns O provider envolvendo `children`, com a instância do `ContextMenu` montada.
 */
export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const menuRef = useRef<ContextMenuHandle>(null);

  const value = useMemo<ContextMenuContextValue>(() => ({
    open: (items, x, y) => menuRef.current?.open(items, x, y),
    close: () => menuRef.current?.close(),
  }), []);

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
      <ContextMenu ref={menuRef} />
    </ContextMenuContext.Provider>
  );
}
