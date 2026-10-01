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
    <div className="flex h-16 shrink-0 items-center gap-2 border-b border-operational-border px-4">
      <div
        aria-label={t("shell.brandPlaceholder")}
        title={t("shell.brandPlaceholder")}
        className="h-6 w-6 shrink-0 rounded-small border border-dashed border-operational-border"
      />
      {!collapsed && (
        <select
          aria-label={t("shell.context")}
          value={kind === "personal" ? "personal" : (company?.id ?? "personal")}
          onChange={(event) => {
            if (event.target.value === "personal") setKind("personal");
            else selectCompany?.(event.target.value);
          }}
          className="w-full min-w-0 cursor-pointer bg-transparent py-2 text-lower font-medium">
          <option value="personal">{t("shell.personal")}</option>
          {companies.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
