import { useTranslation } from "react-i18next";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

export default function SaaSContextIndicator() {
  const { t } = useTranslation("saas", { keyPrefix: "shell.scope" });
  const { kind, company, isAdmin, isPlatformAdmin } = useActiveContext();

  if (kind === "company" && company) {
    const type = company.type ? t(company.type, { defaultValue: "" }) : "";
    return (
      <span className="flex min-w-0 items-center text-lower text-operational-muted">
        {type ? <span className="shrink-0">{type} ·&nbsp;</span> : null}
        <span className="truncate">{company.tradeName}</span>
        <span className="shrink-0">&nbsp;· {isAdmin ? t("admin") : t("member")}</span>
      </span>
    );
  }

  return <span className="text-lower text-operational-muted">{isPlatformAdmin ? t("platformAdmin") : t("personal")}</span>;
}
