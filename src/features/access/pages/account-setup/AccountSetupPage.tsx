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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-gray-600">{t("description")}</p>
      </div>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            className="rounded-xl border border-gray-200 p-4 hover:border-orange hover:bg-orange/5"
          >
            <h2 className="font-medium">{option.title}</h2>
            <p className="text-sm text-gray-600">{option.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
