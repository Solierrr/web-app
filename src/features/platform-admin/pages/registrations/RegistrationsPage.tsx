import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";
import { approveCompany, listAllCompanies, rejectCompany } from "@/features/companies/company.service";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { approveSolarPanel, listSolarPanelModelsByStatus, rejectSolarPanel } from "@/features/solar-panel/solarPanel.service";
import { listProfessionalReviews, decideProfessional } from "@/features/professionals/review/review.service";
import type { ProfessionalReview } from "@/features/professionals/review/review.d";

export default function RegistrationsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });

  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [models, setModels] = useState<SolarPanel[] | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalReview[] | null>(null);
  const [error, setError] = useState(false);

  async function load() {
    const [allCompanies, pendingModels, allProfessionals] = await Promise.all([
      listAllCompanies(),
      listSolarPanelModelsByStatus(SolarPanelModelStatus.UNDERANALYSIS),
      listProfessionalReviews(),
    ]);
    return {
      companies: allCompanies.filter((company) => company.status === CompanyStatus.UNDERANALYSIS),
      models: pendingModels,
      professionals: allProfessionals.filter((item) => item.status === "UNDER_ANALYSIS"),
    };
  }

  function apply(data: Awaited<ReturnType<typeof load>>) {
    setCompanies(data.companies);
    setModels(data.models);
    setProfessionals(data.professionals);
  }

  async function reload() {
    try {
      apply(await load());
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) apply(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
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

  async function handleProfessionalDecision(id: string, approved: boolean) {
    try {
      await decideProfessional(id, approved);
      await reload();
    } catch {
      setError(true);
    }
  }

  if (error)
    return (
      <OperationalPage title={t("title")}>
        <p role="alert">{t("loadError")}</p>
      </OperationalPage>
    );
  if (!companies || !models || !professionals) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage title={t("title")}>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("professionalsTitle")}</h2>
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {professionals.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{item.person.name}</p>
                <p className="text-sm text-operational-muted">{item.crea}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void handleProfessionalDecision(item.id, true)}
                  className="rounded-small border border-operational-border px-3 py-1 text-sm">
                  {t("approve")}
                </button>
                <button type="button" onClick={() => void handleProfessionalDecision(item.id, false)} className="text-sm text-red-700">
                  {t("reject")}
                </button>
              </div>
            </li>
          ))}
          {!professionals.length && <li className="p-4 text-operational-muted">{t("noProfessionals")}</li>}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("companiesTitle")}</h2>
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {companies.map((company) => (
            <li key={company.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{company.tradeName}</p>
                <p className="text-sm text-gray-600">{company.cnpj}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleCompanyDecision(company.id, true)}
                  className="rounded-small bg-orange px-3 py-1 text-sm text-white">
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
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {models.map((model) => (
            <li key={model.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {model.brand} {model.model}
                </p>
                <p className="text-sm text-gray-600">{model.powerOutput} Wp</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleModelDecision(model.id, true)}
                  className="rounded-small bg-orange px-3 py-1 text-sm text-white">
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
    </OperationalPage>
  );
}
