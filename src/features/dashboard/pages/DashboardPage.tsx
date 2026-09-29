import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useActiveContext } from "@/shared/context/ActiveContext";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import { DEFAULT as DEFAULT_LANGUAGE } from "@/config/inter/browser/languages";
import { CompanyStatus } from "@/features/companies/company.enum";
import { listAllCompanies } from "@/features/companies/company.service";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import { listSolarPanelModels } from "@/features/solar-panel/solarPanel.service";

interface PlatformStats {
  approvedCompanies: number;
  pendingCompanies: number;
  approvedModels: number;
  pendingModels: number;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 p-4">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation("commons", { keyPrefix: "dashboard" });
  const { kind, company, loading, isPlatformAdmin } = useActiveContext();
  const [offerCount, setOfferCount] = useState<number | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    if (kind !== "company" || company?.type !== "SUPPLIER") return;
    let active = true;
    getCatalogSolarPanels(DEFAULT_LANGUAGE).then((offers) => {
      if (active) setOfferCount(offers.filter((offer) => offer.companySlug === company.slug).length);
    }).catch(() => {
      if (active) setOfferCount(0);
    });
    return () => { active = false; };
  }, [kind, company]);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    let active = true;
    Promise.all([listAllCompanies(), listSolarPanelModels()]).then(([companies, models]) => {
      if (!active) return;
      setPlatformStats({
        approvedCompanies: companies.filter((item) => item.status === CompanyStatus.APPROVED).length,
        pendingCompanies: companies.filter((item) => item.status === CompanyStatus.UNDERANALYSIS).length,
        approvedModels: models.filter((item) => item.status === SolarPanelModelStatus.APPROVED).length,
        pendingModels: models.filter((item) => item.status === SolarPanelModelStatus.UNDERANALYSIS).length,
      });
    }).catch(() => {
      if (active) setPlatformStats(null);
    });
    return () => { active = false; };
  }, [isPlatformAdmin]);

  if (loading) return <main className="p-6">{t("loading")}</main>;

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">
        {isPlatformAdmin
          ? t("greetingPlatformAdmin")
          : kind === "company" && company ? t("greetingCompany", { name: company.tradeName }) : t("greetingPersonal")}
      </h1>

      {isPlatformAdmin ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label={t("approvedCompanies")} value={platformStats?.approvedCompanies ?? "…"} />
          <StatCard label={t("pendingCompanies")} value={platformStats?.pendingCompanies ?? "…"} />
          <StatCard label={t("approvedModels")} value={platformStats?.approvedModels ?? "…"} />
          <StatCard label={t("pendingModels")} value={platformStats?.pendingModels ?? "…"} />
        </div>
      ) : kind === "company" && company?.type === "SUPPLIER" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label={t("offers")} value={offerCount ?? "…"} />
        </div>
      ) : kind === "company" ? (
        <p className="text-gray-600">{t("moreMetricsSoon")}</p>
      ) : (
        <p className="text-gray-600">{t("personalHint")}</p>
      )}
    </main>
  );
}
