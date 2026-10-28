import OrganicLogo from "@@/brand/logo/OrganicLogo";
import Icon from "@@/ui/icon/Icon";
import Select from "@@/ui/select/Select";
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
      <div className={`flex min-h-16 items-center gap-2 ${collapsed ? "flex-col px-2 py-3" : "px-3"}`}>
        <OrganicLogo width={2.5} holdMs={5000} transitionMs={500} label="Elos" />
        {!collapsed && <span className="min-w-0 flex-1" />}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={t(collapsed ? "shell.expandSidebar" : "shell.collapseSidebar")}
            title={t(collapsed ? "shell.expandSidebar" : "shell.collapseSidebar")}
            aria-expanded={!collapsed}
            className={`flex h-11 lg:h-9 shrink-0 cursor-pointer items-center justify-center rounded-small text-operational-muted ${collapsed ? "w-full" : "w-9"} hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:outline-operational-ink`}>
            <Icon name={collapsed ? "panelLeftOpen" : "panelLeftClose"} size={SIDEBAR_ICON_SIZE} />
          </button>
        )}
      </div>
      <div className={`mx-3 min-w-0 ${collapsed ? "hidden" : ""}`}>
        <Select<string>
          variant="plain"
          name={t("shell.context")}
          icon={kind === "personal" ? "user" : "building"}
          clearable={false}
          disabled={collapsed}
          value={kind === "personal" ? "personal" : (company?.id ?? "personal")}
          options={[
            ...(managedByCompanyId ? [] : [[t("shell.personal"), "personal"] as const]),
            ...companies.map((item) => [item.name, item.id] as const),
          ]}
          onChange={(value) => {
            if (value === "personal") setKind("personal");
            else if (value) selectCompany?.(value);
          }}
        />
      </div>
    </div>
  );
}
