import { createContext } from "react";
import type { ContextMenuItem } from "@/config/interface/ContextMenu";

export interface ContextMenuContextValue {
  open:  (items: ContextMenuItem[], x: number, y: number) => void;
  close: () => void;
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);
