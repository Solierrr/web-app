import { Link, useLocation } from "react-router-dom";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import { SIDEBAR_ICON_SIZE, sidebarItemClass, sidebarLabelClass } from "./Sidebar.styles";
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
        aria-current={active ? "page" : undefined}
        className={`${sidebarItemClass(collapsed)} text-operational-ink ${active ? "bg-input-bg" : "hover:bg-input-bg"}`}>
        <Icon name={icon} motion={icon === "folder" ? "folder" : undefined} size={SIDEBAR_ICON_SIZE} className="shrink-0" />
        <span aria-hidden={collapsed} className={sidebarLabelClass(collapsed)}>
          {content}
        </span>
      </Link>
    </li>
  );
}
