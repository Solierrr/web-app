import OrganicLogo from "@@/brand/logo/OrganicLogo";
import Icon from "@@/ui/icon/Icon";
import { SIDEBAR_ICON_SIZE } from "@@/layout/sidebar/Sidebar.styles";
import { useTranslation } from "react-i18next";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

interface SaaSContextProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function SaaSContext({ collapsed = false, onToggle }: SaaSContextProps) {
  const { t } = useTranslation("saas");
  const { kind, company, memberships = [], selectCompany, setKind, managedByCompanyId } = useActiveContext();
  const companies = memberships.length ? memberships : company ? [{ id: company.id, name: company.tradeName }] : [];

  return (
    <div className="shrink-0 pb-3">
      <div className={`flex min-h-16 items-center gap-2 px-3 ${collapsed ? "flex-col py-3" : ""}`}>
        <OrganicLogo width={2.5} holdMs={5000} transitionMs={500} label="Elos" />
        {!collapsed && <span className="min-w-0 flex-1 text-body font-semi-bold text-operational-ink">Elos</span>}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={t(collapsed ? "shell.expandSidebar" : "shell.collapseSidebar")}
            title={t(collapsed ? "shell.expandSidebar" : "shell.collapseSidebar")}
            aria-expanded={!collapsed}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-small text-operational-muted hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:outline-operational-ink">
            <Icon name={collapsed ? "panelLeftOpen" : "panelLeftClose"} size={SIDEBAR_ICON_SIZE} />
          </button>
        )}
      </div>
      <div className={`relative mx-3 min-w-0 ${collapsed ? "hidden" : ""}`}>
        <Icon
          name={kind === "personal" ? "user" : "building"}
          size={SIDEBAR_ICON_SIZE}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-operational-muted"
        />
        <select
          disabled={collapsed}
          aria-hidden={collapsed}
          tabIndex={collapsed ? -1 : undefined}
          aria-label={t("shell.context")}
          value={kind === "personal" ? "personal" : (company?.id ?? "personal")}
          onChange={(event) => {
            if (event.target.value === "personal") setKind("personal");
            else selectCompany?.(event.target.value);
          }}
          className="h-11 lg:h-9 w-full min-w-0 appearance-none cursor-pointer truncate rounded-small bg-transparent pl-9 pr-7 text-sidebar font-medium text-operational-ink hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:outline-operational-ink">
          {!managedByCompanyId && <option value="personal">{t("shell.personal")}</option>}
          {companies.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={SIDEBAR_ICON_SIZE}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-operational-muted"
        />
      </div>
    </div>
  );
}
