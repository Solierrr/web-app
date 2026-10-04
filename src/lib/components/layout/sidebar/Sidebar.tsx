import { createContext, useContext, useState } from "react";
import Icon from "@@/ui/icon/Icon";

const SidebarContext = createContext(false);

export function useSidebarCollapsed(): boolean {
  return useContext(SidebarContext);
}

interface SidebarProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  navigation?: React.ReactNode;
  collapseLabel?: string;
  expandLabel?: string;
}

export default function Sidebar({
  children,
  defaultCollapsed = false,
  className,
  header,
  footer,
  navigation,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  collapseLabel = "Recolher menu",
  expandLabel = "Expandir menu",
}: SidebarProps) {
  const [internalCollapsed, setCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  return (
    <SidebarContext.Provider value={collapsed}>
      <aside
        className={`flex shrink-0 flex-col h-full overflow-hidden bg-white transition-[width] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "w-16" : "w-64"} ${className ?? ""}`}>
        {header}
        {navigation ?? (
          <nav className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-1 p-2">{children}</ul>
          </nav>
        )}
        {footer}

        <button
          type="button"
          onClick={() => {
            setCollapsed(!collapsed);
            onCollapsedChange?.(!collapsed);
          }}
          aria-label={collapsed ? expandLabel : collapseLabel}
          aria-expanded={!collapsed}
          className={`${controlledCollapsed === undefined ? "flex" : "hidden lg:flex"} min-h-12 items-center justify-center p-2 cursor-pointer hover:bg-operational-hover`}>
          <Icon name={collapsed ? "panelLeftOpen" : "panelLeftClose"} size={20} className="shrink-0" />
        </button>
      </aside>
    </SidebarContext.Provider>
  );
}
