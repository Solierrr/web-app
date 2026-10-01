import { useTranslation } from "react-i18next";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

export default function SaaSContextIndicator() {
  const { t } = useTranslation("saas", { keyPrefix: "shell.scope" });
  const { kind, company, isAdmin, isPlatformAdmin } = useActiveContext();

  if (kind === "company" && company) {
    const type = company.type ? t(company.type) : null;
    return (
      <span className="min-w-0 truncate text-lower text-operational-muted">
        {[type, company.tradeName, isAdmin ? t("admin") : t("member")].filter(Boolean).join(" · ")}
      </span>
    );
  }

  return <span className="text-lower text-operational-muted">{isPlatformAdmin ? t("platformAdmin") : t("personal")}</span>;
}
