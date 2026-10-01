import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

export default function AccountSetupPage() {
  const { t } = useTranslation("commons", { keyPrefix: "accountSetup" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  const options = [
    { to: routePaths.profileOnboardingCompany(lang), title: t("company.title"), description: t("company.description") },
    { to: routePaths.profileOnboardingProfessional(lang), title: t("professional.title"), description: t("professional.description") },
    { to: routePaths.profileOnboardingAccess(lang), title: t("access.title"), description: t("access.description") },
  ];

  return (
    <OperationalPage title={t("title")} description={t("description")} compact>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <Link key={option.to} to={option.to} className="rounded-small border border-operational-border p-4 hover:border-orange hover:bg-orange/5">
            <h2 className="font-medium">{option.title}</h2>
            <p className="text-sm text-gray-600">{option.description}</p>
          </Link>
        ))}
      </div>
    </OperationalPage>
  );
}
