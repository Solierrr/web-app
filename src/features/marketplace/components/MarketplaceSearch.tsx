import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "@@/ui/search-bar/SearchBar";
import Switcher from "@@/ui/switcher/Switcher";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";

export default function MarketplaceSearch({
  domain,
  lang,
  query,
  onQueryChange,
  children,
}: {
  domain: "products" | "services" | "companies";
  lang: SupportedLanguage;
  query: string;
  onQueryChange: (value: string) => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation("marketplace");
  const routes = {
    products: routePaths.searchSolarPanels(lang),
    services: routePaths.searchProfessionals(lang),
    companies: routePaths.searchCompanies(lang),
  };
  return (
    <section className="flex min-w-0 flex-col gap-6" aria-label={t(`search${domain[0].toUpperCase()}${domain.slice(1)}`)}>
      <SearchBar
        name={t(`search${domain[0].toUpperCase()}${domain.slice(1)}`)}
        type="search"
        placeholder={t(`${domain}Placeholder`)}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center justify-between gap-5">
        <Switcher
          label={t("searchScopes")}
          activeUrl={routes[domain]}
          options={Object.entries(routes).map(([key, url]) => ({ url, content: t(key) }))}
        />
        {children}
      </div>
    </section>
  );
}
