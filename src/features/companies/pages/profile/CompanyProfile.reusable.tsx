import { useTranslation } from "react-i18next";
import StatusField from "@@/ui/status-field/StatusField";
import type { CatalogCompany } from "@/features/companies/company.service";

export function CompanyBadges({ company }: { company: Pick<CatalogCompany, "activities" | "hasTechnicalTeam"> }) {
  const { t: tFeed } = useTranslation("feed");
  const { t } = useTranslation("profile", { keyPrefix: "public" });
  return (
    <>
      {company.activities?.map((activity) => (
        <StatusField key={activity} state="highlight" pill icon="panels" label={tFeed(`company.activities.${activity}`)} />
      ))}
      {company.hasTechnicalTeam && <StatusField state="approved" pill icon="users" label={t("technicalTeam")} />}
    </>
  );
}
