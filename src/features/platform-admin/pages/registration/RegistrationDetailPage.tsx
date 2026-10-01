import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import type { Company } from "@/features/companies/company";
import { approveCompany, getCompany, rejectCompany } from "@/features/companies/company.service";
import { decideProfessional, listProfessionalReviews } from "@/features/professionals/review/review.service";
import type { ProfessionalReview } from "@/features/professionals/review/review.d";

export default function RegistrationDetailPage() {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const { lang: langParam, kind, id = "" } = useParams<{ lang: string; kind: string; id: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [professional, setProfessional] = useState<ProfessionalReview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound">("loading");
  const [failed, setFailed] = useState(false);

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
        if (active) setState("notFound");
      });
    return () => {
      active = false;
    };
  }, [kind, id]);

  async function decide(approve: boolean) {
    try {
      if (kind === "professional") await decideProfessional(id, approve);
      else await (approve ? approveCompany(id) : rejectCompany(id));
      navigate(routePaths.registrationsManagement(lang));
    } catch {
      setFailed(true);
    }
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

  return (
    <OperationalPage
      title={t("detailTitle")}
      loading={state === "loading"}
      compact
      actions={<Link to={routePaths.registrationsManagement(lang)}>{t("back")}</Link>}>
      {state === "notFound" ? <p role="alert">{t("notFound")}</p> : null}
      {state === "ready" && status ? (
        <>
          <dl className="grid gap-4 rounded-small border border-operational-border p-4">
            {[...rows, [t("statusLabel"), t(`status.${status}`)] as [string, string]].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-operational-muted">{label}</dt>
                <dd>{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          {status === "UNDER_ANALYSIS" ? (
            <div className="flex gap-3">
              <button type="button" onClick={() => void decide(true)} className="rounded-small bg-orange px-4 py-2 text-white">
                {t("approve")}
              </button>
              <button type="button" onClick={() => void decide(false)} className="rounded-small border border-operational-border px-4 py-2 text-red-700">
                {t("reject")}
              </button>
            </div>
          ) : null}
          {failed ? <p role="alert">{t("decisionError")}</p> : null}
        </>
      ) : null}
    </OperationalPage>
  );
}
