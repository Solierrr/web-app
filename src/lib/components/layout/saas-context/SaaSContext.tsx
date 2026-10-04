import { useTranslation } from "react-i18next";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

interface SaaSContextProps {
  collapsed?: boolean;
}

export default function SaaSContext({ collapsed = false }: SaaSContextProps) {
  const { t } = useTranslation("saas");
  const { kind, company, memberships = [], selectCompany, setKind } = useActiveContext();
  const companies = memberships.length ? memberships : company ? [{ id: company.id, name: company.tradeName }] : [];

  return (
    <div className="flex h-16 shrink-0 items-center gap-2 px-4">
      <div
        aria-label={t("shell.brandPlaceholder")}
        title={t("shell.brandPlaceholder")}
        className="h-6 w-6 shrink-0 rounded-small bg-input-bg"
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
        className={`min-w-0 cursor-pointer bg-transparent py-2 text-lower font-medium transition-[width,opacity] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "w-0 opacity-0 pointer-events-none" : "w-full opacity-100"}`}>
        <option value="personal">{t("shell.personal")}</option>
        {companies.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
