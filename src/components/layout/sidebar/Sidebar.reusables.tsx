import { Link, useLocation } from "react-router-dom";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import Colors from "@/shared/styles/colors/colors.enum";
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
        className={`flex items-center-safe gap-3 px-3 py-2 rounded-medium *:font-semibold! ${active ? "bg-input-bg" : "hover:bg-input-bg"}`}>
        <Icon name={icon} color={active ? Colors.ORANGE : Colors.BLACK} />
        {!collapsed && <span className={active ? "text-orange" : ""}>{content}</span>}
      </Link>
    </li>
  );
}
