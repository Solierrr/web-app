import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { createDirectConversation } from "@/features/messages/messages.messenger.api";
import { getMyCompany } from "@/features/companies/company.service";
import { httpJson } from "@/shared/http/http.service";

export default function ContactCompany() {
  const { companyId = "", lang: langParam } = useParams<{ companyId: string; lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [searchParams] = useSearchParams();
  const product = searchParams.get("product");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("chat");
  const [requestError, setError] = useState<"api" | "role" | null>(null);
  const invalidCompany = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId);
  const error = invalidCompany ? "mock" : requestError;

  useEffect(() => {
    let active = true;
    if (invalidCompany) return;
    getMyCompany()
      .then((myCompany) => {
        if (!active) return null;
        if (!myCompany) {
          navigate(routePaths.profileOnboardingCompany(lang), {
            replace: true,
            state: { returnTo: `${location.pathname}${location.search}`, suggestedType: "DEMANDANT" },
          });
          return null;
        }
        if (myCompany.type !== "DEMANDANT") {
          setError("role");
          return null;
        }
        return httpJson<{ recipientAuthId: string }>(`${import.meta.env.VITE_API_CORE}/api/companies/${encodeURIComponent(companyId)}/contact-user`, {
          service: "company",
          operation: "findContactUser",
          errorMessage: "Não foi possível encontrar um responsável pela empresa",
        });
      })
      .then((contact) => (contact ? createDirectConversation(contact.recipientAuthId) : null))
      .then((conversation) => {
        if (active && conversation) navigate(routePaths.chat(lang, conversation.id), { replace: true, state: { product } });
      })
      .catch(() => {
        if (active) setError("api");
      });
    return () => {
      active = false;
    };
  }, [companyId, invalidCompany, lang, location.pathname, location.search, navigate, product]);

  if (error) {
    return (
      <OperationalPage title={t("conversation")}>
        <p role="alert">{t(error === "mock" ? "mockContactUnavailable" : error === "role" ? "demandantOnly" : "contactError")}</p>
        <Link to={routePaths.companiesFeed(lang)} className="text-orange">
          {t("backToCompanies")}
        </Link>
      </OperationalPage>
    );
  }
  return <OperationalPage title={t("openingConversation")} loading />;
}
