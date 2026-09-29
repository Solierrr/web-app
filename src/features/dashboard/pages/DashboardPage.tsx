import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useActiveContext } from "@/shared/context/ActiveContext";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import { DEFAULT as DEFAULT_LANGUAGE } from "@/config/inter/browser/languages";

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
  const { kind, company, loading } = useActiveContext();
  const [offerCount, setOfferCount] = useState<number | null>(null);

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

  if (loading) return <main className="p-6">{t("loading")}</main>;

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">
        {kind === "company" && company ? t("greetingCompany", { name: company.tradeName }) : t("greetingPersonal")}
      </h1>

      {kind === "company" && company?.type === "SUPPLIER" ? (
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
