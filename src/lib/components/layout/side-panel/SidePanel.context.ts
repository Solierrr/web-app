import { createContext, useContext, type ReactNode } from "react";
export interface PanelContent {
  title: string;
  content: ReactNode;
  trigger?: HTMLElement | null;
}
interface SidePanelContextValue {
  panel: PanelContent | null;
  busy: boolean;
  openPanel: (panel: Omit<PanelContent, "trigger">) => void;
  closePanel: () => void;
  setPanelBusy: (busy: boolean) => void;
}
export const SidePanelContext = createContext<SidePanelContextValue | null>(null);
export function useSidePanel() {
  const context = useContext(SidePanelContext);
  if (!context) throw new Error("SidePanelProvider is required");
  return context;
}
