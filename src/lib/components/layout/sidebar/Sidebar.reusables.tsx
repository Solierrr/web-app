import { Link, useLocation } from "react-router-dom";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import { useSidebarCollapsed } from "./Sidebar";

interface SidebarOptionProps {
  to: string;
  content: string;
  icon: IconName;
}

export function SidebarOption({ to, content, icon }: SidebarOptionProps) {
  const { pathname } = useLocation();
  const collapsed = useSidebarCollapsed();
  const active = pathname === to;

  return (
    <li>
      <Link
        to={to}
        title={content}
        aria-label={content}
        className={`flex items-center-safe overflow-hidden px-3 py-2 rounded-medium *:font-semibold! transition-[gap,background-color] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "justify-center gap-0" : "gap-3"} ${active ? "bg-input-bg" : "hover:bg-input-bg"}`}>
        <Icon name={icon} size={20} color={active ? Colors.ORANGE : Colors.BLACK} className="shrink-0" />
        <span
          aria-hidden={collapsed}
          className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"} ${active ? "text-orange" : ""}`}>
          {content}
        </span>
      </Link>
    </li>
  );
}
