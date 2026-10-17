import ReviewPanel, { type ReviewQueueItem } from "@/features/professionals/review/ReviewPanel";
import { useSidePanel } from "@@/layout/side-panel/SidePanel.context";
import BrandRequestsTable from "@/features/brands/requests/BrandRequestsTable";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, useRef, useCallback } from "react";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import StatusField from "@@/ui/status-field/StatusField";
import RegistrationDecision from "../decision/Decision";
import Switcher from "@@/ui/switcher/Switcher";
import RegistrationsFilters, { type RegistrationStatusFilter, type RegistrationTypeFilter } from "./RegistrationsFilters";
import { Link, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";
import { approveCompany, listAllCompanies, rejectCompany } from "@/features/companies/company.service";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { approveSolarPanel, listSolarPanelModelsByStatus, rejectSolarPanel } from "@/features/solar-panel/solarPanel.service";
import { listProfessionalReviews, decideProfessional } from "@/features/professionals/review/review.service";
import type { ProfessionalReview } from "@/features/professionals/review/review.d";

interface RegistrationRow {
  id: string;
  name: string;
  reference: string;
  status: string;
  href?: string;
}

function RegistrationTable({
  title,
  referenceLabel,
  rows,
  empty,
  loading,
  onDecision,
  onRefresh,
  documents = false,
}: {
  documents?: boolean;
  title: string;
  referenceLabel: string;
  rows: RegistrationRow[];
  empty: string;
  loading: boolean;
  onDecision?: (id: string, approve: boolean) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const { t: reviewT } = useTranslation("reviewPanel");
  const { openPanel } = useSidePanel();
  const order = useRef<readonly RegistrationRow[]>(rows);
  const sorting = useRef<{ key: string; direction: "asc" | "desc" } | null>(null);
  const rememberOrder = useCallback((items: readonly RegistrationRow[], sort: typeof sorting.current) => {
    order.current = items;
    sorting.current = sort;
  }, []);
  const toQueue = (items: readonly RegistrationRow[]): ReviewQueueItem[] =>
    items.filter((item) => item.status === "UNDER_ANALYSIS").map((item) => ({ id: item.id, name: item.name }));
  return (
    <OperationalTable
      onRefresh={onRefresh}
      onOrderedItemsChange={documents ? rememberOrder : undefined}
      rowAction={
        documents
          ? (row) => (
              <ToolbarAction
                icon="document"
                label={reviewT("openDocuments", { name: row.name })}
                className="h-8! w-10!"
                onClick={() =>
                  openPanel({
                    title: reviewT("title"),
                    content: (
                      <ReviewPanel
                        key={row.id}
                        initialId={row.id}
                        order={toQueue(order.current)}
                        onDecided={onRefresh}
                        reloadQueue={async () => {
                          await onRefresh();
                          const fresh = await listProfessionalReviews();
                          const pending = fresh.filter((item) => item.status === "UNDER_ANALYSIS");
                          const sort = sorting.current;
                          if (sort)
                            pending.sort((a, b) => {
                              const value = (item: ProfessionalReview) =>
                                sort.key === "name" ? item.person.name : sort.key === "reference" ? item.crea : t(`status.${item.status}`);
                              return value(a).localeCompare(value(b), undefined, { numeric: true }) * (sort.direction === "asc" ? 1 : -1);
                            });
                          return pending.map((item) => ({ id: item.id, name: item.person.name }));
                        }}
                      />
                    ),
                  })
                }
              />
            )
          : undefined
      }
      label={title}
      items={loading ? null : rows}
      getKey={(row) => row.id}
      empty={empty}
      columns={[
        {
          key: "name",
          label: t("table.name"),
          value: (row) => row.name,
          render: (row) =>
            row.href ? (
              <Link to={row.href} className="font-medium hover:underline underline-offset-4">
                {row.name}
              </Link>
            ) : (
              row.name
            ),
        },
        { key: "reference", label: referenceLabel, value: (row) => row.reference, render: (row) => row.reference },
        {
          key: "status",
          label: t("statusFilter"),
          value: (row) => t(`status.${row.status}`),
          render: (row) => (
            <StatusField
              state={row.status === "APPROVED" ? "approved" : row.status === "REJECTED" ? "rejected" : "pending"}
              label={t(`status.${row.status}`)}
            />
          ),
        },
        {
          key: "actions",
          label: "",
          render: (row) => (
            <div className="flex gap-2">
              {row.href && <ToolbarAction icon="eye" label={t("table.view")} to={row.href} className="h-8! w-10!" />}
              {row.status === "UNDER_ANALYSIS" && onDecision && (
                <RegistrationDecision compact name={row.name} onDecision={(approved) => onDecision(row.id, approved)} />
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

export default function RegistrationsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabParameter = searchParams.get("tab");
  const tab = tabParameter === "professionals" || tabParameter === "models" || tabParameter === "brands" ? tabParameter : "companies";
  const tabUrl = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    return `${location.pathname}?${params}${location.hash}`;
  };
  const [statusFilter, setStatusFilter] = useState<RegistrationStatusFilter>(CompanyStatus.UNDERANALYSIS);
  const [typeFilter, setTypeFilter] = useState<RegistrationTypeFilter>("ALL");

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

  const reviewingBrands = tab === "brands";
  useEffect(() => {
    if (reviewingBrands) return;
    let active = true;
    load()
      .then((data) => {
        if (active) {
          setCompanies(data.companies);
          setModels(data.models);
          setProfessionals(data.professionals);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [reviewingBrands]);

  async function handleCompanyDecision(id: string, approve: boolean) {
    await (approve ? approveCompany(id) : rejectCompany(id));
    await reload();
  }

  async function handleModelDecision(id: string, approve: boolean) {
    await (approve ? approveSolarPanel(id) : rejectSolarPanel(id));
    await reload();
  }

  async function handleProfessionalDecision(id: string, approved: boolean) {
    await decideProfessional(id, approved);
    await reload();
  }

  const loading = !companies || !models || !professionals;
  const matchesStatus = (status: string) => statusFilter === "ALL" || status === statusFilter;
  const visibleProfessionals = (professionals ?? []).filter((item) => matchesStatus(item.status));
  const visibleCompanies = (companies ?? []).filter(
    (company) => matchesStatus(company.status) && (typeFilter === "ALL" || company.type === typeFilter),
  );

  return (
    <OperationalPage
      title={t("title")}
      description={t("description")}
      centered
      sideBackground
      actions={
        <Switcher
          label={t("tabs.label")}
          activeUrl={tabUrl(tab)}
          options={(["companies", "professionals", "models", "brands"] as const).map((value) => ({
            url: tabUrl(value),
            content: t(`tabs.${value}`),
          }))}
        />
      }>
      <div className="mx-auto flex w-full min-w-0 flex-col gap-8">
        {tab === "brands" ? (
          <BrandRequestsTable admin />
        ) : error ? (
          <p role="alert">{t("loadError")}</p>
        ) : (
          <>
            <RegistrationsFilters
              key={tab}
              status={statusFilter}
              type={typeFilter}
              showType={tab === "companies"}
              disabled={loading}
              onStatusChange={setStatusFilter}
              onTypeChange={setTypeFilter}
            />
            {tab === "professionals" && (
              <RegistrationTable
                documents
                key={`professionals-${statusFilter}-${typeFilter}`}
                title={t("professionalsTitle")}
                referenceLabel="CREA"
                loading={loading}
                onRefresh={async () => {
                  apply(await load());
                  setError(false);
                }}
                empty={t("noProfessionals")}
                onDecision={isAlwaysMockMode() ? handleProfessionalDecision : undefined}
                rows={visibleProfessionals.map((item) => ({
                  id: item.id,
                  name: item.person.name,
                  reference: item.crea,
                  status: item.status,
                  href: routePaths.registrationDetail(lang, "professional", item.id),
                }))}
              />
            )}
            {tab === "companies" && (
              <RegistrationTable
                key={`companies-${statusFilter}-${typeFilter}`}
                title={t("companiesTitle")}
                referenceLabel="CNPJ"
                loading={loading}
                onRefresh={async () => {
                  apply(await load());
                  setError(false);
                }}
                empty={t("noCompanies")}
                onDecision={handleCompanyDecision}
                rows={visibleCompanies.map((company) => ({
                  id: company.id,
                  name: company.tradeName,
                  reference: company.cnpj,
                  status: company.status,
                  href: routePaths.registrationDetail(lang, "company", company.id),
                }))}
              />
            )}
            {tab === "models" && (
              <RegistrationTable
                key={`models-${statusFilter}`}
                title={t("modelsTitle")}
                referenceLabel={t("table.power")}
                loading={loading}
                onRefresh={async () => {
                  apply(await load());
                  setError(false);
                }}
                empty={t("noModels")}
                onDecision={handleModelDecision}
                rows={(models ?? [])
                  .filter((model) => matchesStatus(model.status))
                  .map((model) => ({
                    id: model.id,
                    name: [model.brand, model.model].filter(Boolean).join(" "),
                    reference: model.powerOutput == null ? "\u2014" : `${new Intl.NumberFormat(lang).format(model.powerOutput)} Wp`,
                    status: model.status,
                  }))}
              />
            )}
          </>
        )}
      </div>
    </OperationalPage>
  );
}
