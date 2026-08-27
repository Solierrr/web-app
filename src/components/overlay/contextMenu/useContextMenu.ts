import { useContext } from "react";
import { ContextMenuContext, type ContextMenuContextValue } from "@@/overlay/contextMenu/ContextMenuContext";

/**
 * useContextMenu
 *
 * Hook para abrir/fechar o menu de contexto global montado pelo `ContextMenuProvider`.
 *
 * @returns `open(items, x, y)` para abrir o menu com os itens dados na posição informada, e `close()` para fechá-lo.
 */
export function useContextMenu(): ContextMenuContextValue {
  const context = useContext(ContextMenuContext);
  if (!context) throw new Error("useContextMenu: deve ser usado dentro de um ContextMenuProvider.");

  return context;
}
