import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import Icon from "@@/ui/icon/Icon";
import { useActiveContext } from "@/shared/context/ActiveContext";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { CompanyStatus } from "@/features/companies/company.enum";
import { getOperationalNavigation } from "@@/layout/saas/SaaSLayout.presets";
import { getRecentPages } from "../dashboard.utils";

export default function DashboardPage() {
  const { t } = useTranslation("saas");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { kind, company, loading, isPlatformAdmin, can } = useActiveContext();
  const [search, setSearch] = useState("");
  const companyContext = kind === "company" && company !== null;
  const groups = getOperationalNavigation({
    company: companyContext,
    companyType: companyContext && company.status === CompanyStatus.APPROVED ? (company.type ?? null) : null,
    platformAdmin: isPlatformAdmin,
    can,
  }).map((group) => ({ ...group, items: group.items.filter((item) => item.key !== "dashboard") }));
  const items = groups.flatMap((group) => group.items);
  const recentKeys = getRecentPages(companyContext ? company.id : "personal");
  const recent = recentKeys.flatMap((key) => items.filter((item) => item.key === key));
  const query = search.trim().toLocaleLowerCase(lang);
  const filtered = groups.map((group) => ({ ...group, items: group.items.filter((item) => t(item.label).toLocaleLowerCase(lang).includes(query)) }));

  return (
    <OperationalPage title={t("navigation.items.dashboard")} loading={loading}>
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 pb-8 pt-8">
        <h2 className="text-center text-2xl font-semi-bold">{t("home.title")}</h2>
        <label className="flex w-full items-center gap-3 rounded-small border border-operational-border bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-operational-border">
          <Icon name="search" size={18} />
          <span className="sr-only">{t("home.search")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("home.search")}
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
      </section>
      <section aria-label={t("home.shortcuts")} className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {filtered
          .filter((group) => group.items.length > 0)
          .map((group) => (
            <div key={group.key}>
              <h2 className="mb-3 font-semi-bold">{t(group.label)}</h2>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link to={item.to(lang)} className="flex items-center gap-3 rounded-small px-3 py-3 text-sm hover:bg-operational-hover">
                      <Icon name={item.icon} size={18} />
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </section>
      {filtered.every((group) => group.items.length === 0) && (
        <p role="status" className="text-operational-muted">
          {t("home.noResults")}
        </p>
      )}
      {!query && (
        <section className="mt-6 border-t border-operational-border pt-6">
          <h2 className="mb-3 font-semi-bold">{t("home.recent")}</h2>
          {recent.length ? (
            <ul className="flex flex-wrap gap-3">
              {recent.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.to(lang)}
                    className="inline-flex rounded-small border border-operational-border px-4 py-3 text-sm hover:bg-operational-hover">
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-operational-muted">{t("home.noRecent")}</p>
          )}
        </section>
      )}
    </OperationalPage>
  );
}
