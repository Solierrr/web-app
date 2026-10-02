import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

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
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const [statusFilter, setStatusFilter] = useState<"ALL" | `${CompanyStatus}`>(CompanyStatus.UNDERANALYSIS);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SUPPLIER" | "DEMANDANT" | "PROFESSIONAL">("ALL");

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
      companies: allCompanies,
      models: pendingModels,
      professionals: allProfessionals,
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

  const matchesStatus = (status: string) => statusFilter === "ALL" || status === statusFilter;
  const visibleProfessionals =
    typeFilter === "ALL" || typeFilter === "PROFESSIONAL" ? professionals.filter((item) => matchesStatus(item.status)) : [];
  const visibleCompanies = companies.filter(
    (company) => matchesStatus(company.status) && (typeFilter === "ALL" || (typeFilter !== "PROFESSIONAL" && company.type === typeFilter)),
  );

  return (
    <OperationalPage title={t("title")}>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm">
          {t("statusFilter")}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-small border border-operational-border p-2">
            <option value="ALL">{t("all")}</option>
            {Object.values(CompanyStatus).map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("typeFilter")}
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
            className="rounded-small border border-operational-border p-2">
            <option value="ALL">{t("all")}</option>
            {(["SUPPLIER", "DEMANDANT", "PROFESSIONAL"] as const).map((type) => (
              <option key={type} value={type}>
                {t(type)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("professionalsTitle")}</h2>
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {visibleProfessionals.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link to={routePaths.registrationDetail(lang, "professional", item.id)} className="font-medium hover:underline">
                  {item.person.name}
                </Link>
                <p className="text-sm text-operational-muted">
                  {item.crea} · {t(`status.${item.status}`)}
                </p>
              </div>
              {item.status === "UNDER_ANALYSIS" ? (
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
              ) : null}
            </li>
          ))}
          {!visibleProfessionals.length && <li className="p-4 text-operational-muted">{t("noProfessionals")}</li>}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("companiesTitle")}</h2>
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {visibleCompanies.map((company) => (
            <li key={company.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link to={routePaths.registrationDetail(lang, "company", company.id)} className="font-medium hover:underline">
                  {company.tradeName}
                </Link>
                <p className="text-sm text-gray-600">
                  {company.cnpj} · {t(`status.${company.status}`)}
                </p>
              </div>
              {company.status === CompanyStatus.UNDERANALYSIS ? (
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
              ) : null}
            </li>
          ))}
          {visibleCompanies.length === 0 ? <li className="p-4 text-gray-600">{t("noCompanies")}</li> : null}
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
