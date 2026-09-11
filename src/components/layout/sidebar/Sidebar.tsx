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
}

export default function Sidebar({ children, defaultCollapsed = false, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <SidebarContext.Provider value={collapsed}>
      <aside className={`flex flex-col h-full bg-white transition-all duration-350 ${collapsed ? "w-16" : "w-64"} ${className ?? ""}`}>
        <nav className="flex-1">
          <ul className="flex flex-col gap-1 p-2">{children}</ul>
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="flex items-center-safe justify-center p-2 m-2 rounded-medium cursor-pointer hover:bg-input-bg">
          <Icon name="chevronLeft" className={`transition-transform duration-350 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>
    </SidebarContext.Provider>
  );
}
