import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";
import { approveCompany, listAllCompanies, rejectCompany } from "@/features/companies/company.service";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { approveSolarPanel, listSolarPanelModelsByStatus, rejectSolarPanel } from "@/features/solar-panel/solarPanel.service";

export default function RegistrationsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });

  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [models, setModels] = useState<SolarPanel[] | null>(null);
  const [error, setError] = useState(false);

  async function reload() {
    try {
      const [allCompanies, pendingModels] = await Promise.all([
        listAllCompanies(),
        listSolarPanelModelsByStatus(SolarPanelModelStatus.UNDERANALYSIS),
      ]);
      setCompanies(allCompanies.filter((company) => company.status === CompanyStatus.UNDERANALYSIS));
      setModels(pendingModels);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleCompanyDecision(id: string, approve: boolean) {
    try {
      await (approve ? approveCompany(id) : rejectCompany(id));
      await reload();
    } catch {
      setError(true);
    }
  }

  async function handleModelDecision(id: string, approve: boolean) {
    try {
      await (approve ? approveSolarPanel(id) : rejectSolarPanel(id));
      await reload();
    } catch {
      setError(true);
    }
  }

  if (error) return <main className="p-6"><p role="alert">{t("loadError")}</p></main>;
  if (!companies || !models) return <main className="p-6">{t("loading")}</main>;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("companiesTitle")}</h2>
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {companies.map((company) => (
            <li key={company.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{company.tradeName}</p>
                <p className="text-sm text-gray-600">{company.cnpj}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => void handleCompanyDecision(company.id, true)} className="rounded-lg bg-orange px-3 py-1 text-sm text-white">
                  {t("approve")}
                </button>
                <button type="button" onClick={() => void handleCompanyDecision(company.id, false)} className="text-sm text-red-700">
                  {t("reject")}
                </button>
              </div>
            </li>
          ))}
          {companies.length === 0 ? <li className="p-4 text-gray-600">{t("noCompanies")}</li> : null}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("modelsTitle")}</h2>
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {models.map((model) => (
            <li key={model.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{model.brand} {model.model}</p>
                <p className="text-sm text-gray-600">{model.powerOutput} Wp</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => void handleModelDecision(model.id, true)} className="rounded-lg bg-orange px-3 py-1 text-sm text-white">
                  {t("approve")}
                </button>
                <button type="button" onClick={() => void handleModelDecision(model.id, false)} className="text-sm text-red-700">
                  {t("reject")}
                </button>
              </div>
            </li>
          ))}
          {models.length === 0 ? <li className="p-4 text-gray-600">{t("noModels")}</li> : null}
        </ul>
      </section>
    </main>
  );
}
