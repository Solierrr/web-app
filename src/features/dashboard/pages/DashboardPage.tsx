import SearchBar, { SearchBarAction } from "@@/ui/search-bar/SearchBar";
import Surface from "@@/ui/surface/Surface";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import Icon from "@@/ui/icon/Icon";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { routePaths } from "@/config/i18n/paths";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { CompanyStatus } from "@/features/companies/company.enum";
import { getOperationalNavigation } from "@@/layout/saas/SaaSLayout.presets";
import { filterPages } from "../dashboard.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import DashboardAnalytics from "./DashboardPage.analytics";

export default function DashboardPage() {
  const { t } = useTranslation("saas");
  const { t: tSetup } = useTranslation("commons", { keyPrefix: "accountSetup" });
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { kind, company, loading, isPlatformAdmin, can } = useActiveContext();
  const [search, setSearch] = useState("");
  const companyContext = kind === "company" && company !== null;
  const groups = getOperationalNavigation({
    company: companyContext,
    companyType: companyContext && company.status === CompanyStatus.APPROVED ? (company.type ?? null) : null,
    platformAdmin: isPlatformAdmin,
    pendingRegistration: companyContext && company.status !== CompanyStatus.APPROVED,
    can,
  }).map((group) => ({ ...group, items: group.items.filter((item) => item.key !== "dashboard") }));
  const query = search.trim().toLocaleLowerCase(lang);
  const filtered = filterPages(groups, query, lang, t);
  const shortcutGroups = filtered.filter((group) => group.items.length > 0);
  const companyGroup = shortcutGroups.find((group) => group.key === "company");
  const shortcutColumns = companyGroup
    ? [shortcutGroups.filter((group) => group.key !== "company"), [companyGroup]].filter((column) => column.length > 0)
    : shortcutGroups.map((group) => [group]);

  return (
    <OperationalPage title={t("home.title")} description={t("home.description")} loading={loading} centered sideBackground>
      <section aria-label={t("home.search")} className="w-full">
        <SearchBar
          name="page-search"
          aria-label={t("home.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("home.search")}
          actions={search ? <SearchBarAction icon="x" label={t("home.clearSearch")} onClick={() => setSearch("")} /> : undefined}
        />
      </section>
      <section aria-label={t("home.shortcuts")} className={`grid gap-4 ${shortcutColumns.length > 1 ? "md:grid-cols-2" : ""}`}>
        {shortcutColumns.map((column) => (
          <Surface key={column[0].key} className="min-w-0 [&>div]:h-full">
            <div className="flex flex-col gap-6 p-5">
              {column.map((group) => (
                <section key={group.key} className="flex flex-col gap-3">
                  <h2 className="text-body font-semi-bold">{t(group.label)}</h2>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item) => (
                      <li key={item.key}>
                        <Link
                          to={item.to(lang)}
                          className="flex min-w-0 items-center gap-3 rounded-medium py-2 text-body transition-colors hover:bg-operational-hover focus-visible:outline-2 focus-visible:outline-operational-ink">
                          <span
                            aria-hidden="true"
                            className="flex size-9 shrink-0 items-center justify-center rounded-medium bg-white text-operational-muted">
                            <Icon name={item.icon} size={18} color="currentColor" />
                          </span>
                          <span className="min-w-0 flex-1">{t(item.label)}</span>
                          <span aria-hidden="true" className="pr-2 text-operational-muted">
                            <Icon name="chevronRight" size={16} color="currentColor" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </Surface>
        ))}
      </section>
      {filtered.every((group) => group.items.length === 0) && (
        <Surface className="w-full">
          <p role="status" className="px-5 py-8 text-center text-operational-muted">
            {t("home.noResults")}
          </p>
        </Surface>
      )}
      {isAlwaysMockMode() && <DashboardAnalytics />}
      <section aria-label={tSetup("title")} className="flex flex-col gap-4">
        <h2 className="text-label font-semi-bold">{tSetup("title")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: routePaths.profileOnboardingCompany(lang), key: "company", icon: "building" as const },
            { to: routePaths.profileOnboardingProfessional(lang), key: "professional", icon: "user" as const },
            { to: routePaths.profileOnboardingAccess(lang), key: "access", icon: "users" as const },
          ].map((option) => (
            <Surface key={option.key} className="min-w-0 [&>div]:h-full">
              <Link
                to={option.to}
                className="flex h-full flex-col gap-3 p-5 transition-colors hover:bg-operational-hover focus-visible:outline-2 focus-visible:outline-operational-ink">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-medium bg-white text-orange">
                  <Icon name={option.icon} size={20} color="currentColor" />
                </span>
                <h3 className="text-body font-semi-bold">{tSetup(option.key + ".title")}</h3>
                <p className="text-body text-operational-muted">{tSetup(option.key + ".description")}</p>
              </Link>
            </Surface>
          ))}
        </div>
      </section>
    </OperationalPage>
  );
}
