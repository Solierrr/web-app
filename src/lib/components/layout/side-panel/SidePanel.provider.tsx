import { useLocation } from "react-router-dom";
import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { SidePanelContext, type PanelContent } from "./SidePanel.context";
export function SidePanelProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [panel, setPanel] = useState<PanelContent | null>(null);
  const busy = useRef(false);
  const [busyState, setBusyState] = useState(false);
  const setPanelBusy = useCallback((value: boolean) => {
    busy.current = value;
    setBusyState(value);
  }, []);
  const closePanel = useCallback(() => {
    if (!busy.current) setPanel(null);
  }, []);
  const route = `${location.pathname}${location.search}`;
  const lastRoute = useRef(route);
  useEffect(() => {
    if (!busyState && lastRoute.current !== route) {
      closePanel();
      lastRoute.current = route;
    }
  }, [route, busyState, closePanel]);
  const openPanel = useCallback((value: Omit<PanelContent, "trigger">) => {
    if (!busy.current) setPanel({ ...value, trigger: document.activeElement as HTMLElement });
  }, []);
  return <SidePanelContext.Provider value={{ panel, busy: busyState, openPanel, closePanel, setPanelBusy }}>{children}</SidePanelContext.Provider>;
}
