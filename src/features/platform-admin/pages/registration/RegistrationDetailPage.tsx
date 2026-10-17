import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import StatusField from "@@/ui/status-field/StatusField";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import RegistrationDecision from "../decision/Decision";
import { useTranslation } from "react-i18next";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import type { Company } from "@/features/companies/company";
import { approveCompany, getCompany, rejectCompany } from "@/features/companies/company.service";
import { decideProfessional, listProfessionalReviews } from "@/features/professionals/review/review.service";
import type { ProfessionalReview } from "@/features/professionals/review/review.d";

import Review from "@/features/professionals/review/Review";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

export default function RegistrationDetailPage() {
  const { kind = "", id = "" } = useParams<{ kind: string; id: string }>();
  if (kind === "professional" && !isAlwaysMockMode()) return <Review key={id} id={id} />;
  return <RegistrationDetail key={`${kind}:${id}`} kind={kind} id={id} />;
}

function RegistrationDetail({ kind, id }: { kind: string; id: string }) {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [professional, setProfessional] = useState<ProfessionalReview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound" | "error">("loading");

  useEffect(() => {
    let active = true;
    const request =
      kind === "professional"
        ? listProfessionalReviews().then((items) => items.find((item) => item.id === id) ?? null)
        : kind === "company"
          ? getCompany(id)
          : Promise.resolve(null);
    request
      .then((item) => {
        if (!active) return;
        if (kind === "professional") setProfessional(item as ProfessionalReview | null);
        else setCompany(item as Company | null);
        setState(item ? "ready" : "notFound");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [kind, id]);

  async function decide(approve: boolean) {
    if (kind === "professional") await decideProfessional(id, approve);
    else await (approve ? approveCompany(id) : rejectCompany(id));
    navigate(`${routePaths.registrationsManagement(lang)}?tab=${kind === "professional" ? "professionals" : "companies"}`);
  }

  if (state === "loading") {
    return (
      <main aria-busy="true" className="flex min-h-full w-full items-center justify-center">
        <LogoLoader />
      </main>
    );
  }

  const status = company?.status ?? professional?.status;
  const rows: [string, string | undefined][] = company
    ? [
        [t("tradeName"), company.tradeName],
        [t("corporateName"), company.corporateName],
        [t("cnpj"), company.cnpj],
        [t("type"), company.type ? t(company.type) : undefined],
      ]
    : [
        [t("name"), professional?.person.name],
        [t("crea"), professional?.crea],
        [t("type"), t("PROFESSIONAL")],
      ];

  const name = company?.tradeName ?? professional?.person.name ?? t("detailTitle");
  const documents = professional
    ? [
        { label: "NR-10", url: professional.certNr10Url },
        { label: "NR-35", url: professional.certNr35Url },
      ].filter((item): item is { label: string; url: string } => !!item.url && isDocumentUrl(item.url))
    : [];

  return (
    <OperationalPage
      title={name}
      description={t("detailTitle")}
      centered
      sideBackground
      actions={
        <ToolbarAction
          icon="chevronLeft"
          content={t("back")}
          label={t("back")}
          to={`${routePaths.registrationsManagement(lang)}?tab=${kind === "professional" ? "professionals" : "companies"}`}
        />
      }>
      {state === "notFound" && <p role="alert">{t("notFound")}</p>}
      {state === "error" && <p role="alert">{t("detailError")}</p>}
      {state === "ready" && status && (
        <div className="mx-auto grid w-full max-w-operational-form gap-6 lg:grid-cols-2">
          <section className="flex min-w-0 flex-col gap-6 rounded-surface border-ui bg-white shadow-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-body font-semi-bold leading-6">{t("information")}</h2>
              <StatusField
                state={status === "APPROVED" ? "approved" : status === "REJECTED" ? "rejected" : "pending"}
                label={t(`status.${status}`)}
              />
            </div>
            <dl className="flex flex-col gap-5">
              {rows.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="mb-1 text-body text-operational-muted">{label}</dt>
                  <dd className="break-words font-medium">{value || "\u2014"}</dd>
                </div>
              ))}
            </dl>
            {status === "UNDER_ANALYSIS" && (
              <div className="border-t border-operational-border pt-5">
                <RegistrationDecision name={name} onDecision={decide} />
              </div>
            )}
          </section>
          <section className="flex min-w-0 flex-col gap-4 rounded-surface border-ui bg-white shadow-surface p-6">
            <h2 className="text-body font-semi-bold leading-6">{t("certificates")}</h2>
            {documents.length ? (
              documents.map((document) => <Certificate key={document.label} label={document.label} url={document.url} />)
            ) : (
              <p className="text-body text-operational-muted leading-6">{t("noCertificates")}</p>
            )}
          </section>
        </div>
      )}
    </OperationalPage>
  );
}

function isDocumentUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value, window.location.origin).protocol);
  } catch {
    return false;
  }
}

function Certificate({ label, url }: { label: string; url: string }) {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const [failed, setFailed] = useState(false);
  return (
    <figure className="overflow-hidden rounded-medium border border-operational-border">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t("openCertificate")}: ${label}`}
        className="block bg-operational-surface p-3">
        {failed ? (
          <p className="text-body text-operational-muted leading-6">{t("certificateError")}</p>
        ) : (
          <img src={url} alt={label} onError={() => setFailed(true)} className="max-h-80 w-full object-contain" />
        )}
      </a>
      <figcaption className="border-t border-operational-border px-4 py-3 text-body font-medium">{label}</figcaption>
    </figure>
  );
}
